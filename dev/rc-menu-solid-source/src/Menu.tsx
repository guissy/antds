import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, Accessor, splitProps, Show, onMount, Ref } from "solid-js";
import type { CSSMotionProps } from 'rc-motion-solid';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import useMergedState from 'rc-util-solid/lib/hooks/useMergedState';
import warning from 'rc-util-solid/lib/warning';
import Overflow from 'rc-overflow-solid';
import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuInfo,
  MenuMode,
  SelectEventHandler,
  TriggerSubMenuAction,
  SelectInfo,
  RenderIconType,
  ItemType,
  MenuRef,
} from './interface';
import MenuItem from './MenuItem';
import { parseItems } from './utils/nodeUtil';
import MenuContextProvider from './context/MenuContext';
import createMemoCallback from './hooks/useMemoCallback';
import { warnItemProp } from './utils/warnUtil';
import SubMenu from './SubMenu';
import useAccessibility from './hooks/useAccessibility';
import useUUID from './hooks/useUUID';
import { PathRegisterContext, PathUserContext } from './context/PathContext';
import useKeyRecords, { OVERFLOW_KEY } from './hooks/useKeyRecords';
import { getMenuId, IdContext } from './context/IdContext';
import PrivateContext from './context/PrivateContext';

/**
 * Menu modify after refactor:
 * ## Add
 * - disabled
 *
 * ## Remove
 * - openTransitionName
 * - openAnimation
 * - onDestroy
 * - siderCollapsed: Seems antd do not use this prop (Need test in antd)
 * - collapsedWidth: Seems this logic should be handle by antd Layout.Sider
 */

// optimize for render
const EMPTY_LIST: string[] = [];

export interface MenuProps
  extends Omit<
    JSX.HTMLAttributes<HTMLUListElement>,
    'onClick' | 'onSelect' | 'dir'
  > {
  prefixCls?: string;
  rootClassName?: string;
  className?: string;
  items?: ItemType[];
  /** @deprecated Please use `items` instead */
  children?: JSX.Element;

  disabled?: boolean;
  /** @private Disable auto overflow. Pls note the prop name may refactor since we do not final decided. */
  disabledOverflow?: boolean;

  /** direction of menu */
  direction?: 'ltr' | 'rtl';

  // Mode
  mode?: MenuMode;
  inlineCollapsed?: boolean;

  // Open control
  defaultOpenKeys?: string[];
  openKeys?: string[];

  // Active control
  activeKey?: string;
  defaultActiveFirst?: boolean;

  // Selection
  selectable?: boolean;
  multiple?: boolean;

  defaultSelectedKeys?: string[];
  selectedKeys?: string[];

  onSelect?: SelectEventHandler;
  onDeselect?: SelectEventHandler;

  // Level
  inlineIndent?: number;

  // Motion
  /** Menu motion define. Use `defaultMotions` if you need config motion of each mode */
  motion?: CSSMotionProps;
  /** Default menu motion of each mode */
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>;

  // Popup
  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  forceSubMenuRender?: boolean;
  triggerSubMenuAction?: TriggerSubMenuAction;
  builtinPlacements?: BuiltinPlacements;

  // Icon
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;
  overflowedIndicator?: JSX.Element;
  /** @private Internal usage. Do not use in your production. */
  overflowedIndicatorPopupClassName?: string;

  // >>>>> Function
  getPopupContainer?: (node: HTMLElement) => HTMLElement;

  // >>>>> Events
  onClick?: MenuClickEventHandler;
  onOpenChange?: (openKeys: string[]) => void;

  // >>>>> Internal
  /***
   * @private Only used for `pro-layout`. Do not use in your prod directly
   * and we do not promise any compatibility for this.
   */
  _internalRenderMenuItem?: (
    originNode: JSX.Element,
    menuItemProps: any,
    stateProps: {
      selected: boolean;
    },
  ) => JSX.Element;
  /***
   * @private Only used for `pro-layout`. Do not use in your prod directly
   * and we do not promise any compatibility for this.
   */
  _internalRenderSubMenuItem?: (
    originNode: JSX.Element,
    subMenuItemProps: any,
    stateProps: {
      selected: boolean;
      open: boolean;
      active: boolean;
      disabled: boolean;
    },
  ) => JSX.Element;
}

interface LegacyMenuProps extends MenuProps {
  openTransitionName?: string;
  openAnimation?: string;
}

const Menu: Component<MenuProps & JSX.CustomAttributes<HTMLDivElement>> = ((props_) => {
  const defaultProps = {
    prefixCls: 'rc-menu',
    tabIndex: 0,
    mode: 'vertical',
    subMenuOpenDelay: 0.1,
    subMenuCloseDelay: 0.1,
    selectable: true,
    multiple: false,
    inlineIndent: 24,
    triggerSubMenuAction: 'hover',
    overflowedIndicator: '...',
  }
  const props = mergeProps(defaultProps, props_)
  const [_, restProps] = splitProps(props, ["prefixCls", "rootClassName", "style", "className", "tabIndex",
    "items", "children", "direction", "id", "mode", "inlineCollapsed", "disabled", "disabledOverflow",
    "subMenuOpenDelay", "subMenuCloseDelay", "forceSubMenuRender", "defaultOpenKeys", "openKeys",
    "activeKey", "defaultActiveFirst", "selectable", "multiple", "defaultSelectedKeys", "selectedKeys",
    "onSelect", "onDeselect", "inlineIndent", "motion", "defaultMotions", "triggerSubMenuAction",
    "builtinPlacements", "itemIcon", "expandIcon", "overflowedIndicator", "overflowedIndicatorPopupClassName",
    "getPopupContainer", "onClick", "onOpenChange", "onKeyDown", "openAnimation", "openTransitionName",
    "_internalRenderMenuItem", "_internalRenderSubMenuItem"]);

  const [mounted, setMounted] = createSignal(false);
  const childList: Accessor<JSX.Element[]> = createMemo(
    () => {
      if (!mounted) return [];
      return parseItems(props.children, props.items, EMPTY_LIST)
    },
    [props.children, props.items],
  );

  let containerRef: HTMLUListElement = null;

  const uuid = useUUID(props.id);

  const isRtl = props.direction === 'rtl';

  // ========================= Warn =========================
  if (process.env.NODE_ENV !== 'production') {
    warning(
      !props.openAnimation && !props.openTransitionName,
      '`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.',
    );
  }

  // ========================= Mode =========================
  // const [mergedMode, mergedInlineCollapsed] = createMemo<
  const menuMode = createMemo(() => {
    if ((props.mode === 'inline' || props.mode === 'vertical') && props.inlineCollapsed) {
      return { mergedMode: 'vertical' as const, mergedInlineCollapsed: props.inlineCollapsed };
    }
    return { mergedMode: props.mode, mergedInlineCollapsed: false };
  }, { menuMode: props.mode, mergedInlineCollapsed: props.inlineCollapsed });

  // ====================== Responsive ======================
  const [lastVisibleIndex, setLastVisibleIndex] = createSignal(0);
  const allVisible = createMemo(() =>
    lastVisibleIndex() >= childList().length - 1 ||
    menuMode().mergedMode !== 'horizontal' ||
    props.disabledOverflow);

  // ========================= Open =========================
  const [mergedOpenKeys, setMergedOpenKeys] = useMergedState(props.defaultOpenKeys, {
    value: props.openKeys,
    postState: keys => keys || EMPTY_LIST,
  });

  const triggerOpenKeys = (keys: string[]) => {
    setMergedOpenKeys(keys);
    props.onOpenChange?.(keys);
  };

  // >>>>> Cache & Reset open keys when inlineCollapsed changed
  const [inlineCacheOpenKeys, setInlineCacheOpenKeys] =
    createSignal(mergedOpenKeys());

  const isInlineMode = () => menuMode().mergedMode === 'inline';

  let mountRef = false;

  // Cache
  createEffect(() => {
    if (isInlineMode()) {
      setInlineCacheOpenKeys(mergedOpenKeys());
    }
  }, [mergedOpenKeys]);

  // Restore
  createEffect(() => {
    if (!mountRef) {
      return;
    }

    if (isInlineMode()) {
      setMergedOpenKeys(inlineCacheOpenKeys());
    } else {
      // Trigger open event in case its in control
      triggerOpenKeys(EMPTY_LIST);
    }
  }, [isInlineMode()]);

  createEffect(() => {
    mountRef = true;

    return () => {
      mountRef = false;
    };
  }, []);

  // ========================= Path =========================
  const {
    registerPath,
    unregisterPath,
    refreshOverflowKeys,

    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys,
  } = useKeyRecords();

  const registerPathContext = createMemo(
    () => ({ registerPath, unregisterPath }),
    [registerPath, unregisterPath],
  );

  const pathUserContext = createMemo(
    () => ({ isSubPathKey }),
    [isSubPathKey],
  );

  createEffect(() => {
    refreshOverflowKeys(
      allVisible()
        ? EMPTY_LIST
        : childList()
          .slice(lastVisibleIndex() + 1)
          .map(child => child.key as string),
    );
  }, [lastVisibleIndex(), allVisible]);

  // ======================== Active ========================
  const [mergedActiveKey, setMergedActiveKey] = useMergedState(
    props.activeKey || ((props.defaultActiveFirst && childList()?.[0]?.key) as string),
    {
      value: props.activeKey,
    },
  );

  const onActive = createMemoCallback((key: string) => {
    setMergedActiveKey(key);
  });

  const onInactive = createMemoCallback(() => {
    setMergedActiveKey(undefined);
  });

  props.ref?.({
    list: containerRef,
    focus: options => {
      const shouldFocusKey =
        mergedActiveKey() ?? childList().find(node => !node.disabled)?.key;
      if (shouldFocusKey) {
        const elm = containerRef
          ?.querySelector<HTMLLIElement>(
            `li[data-menu-id='${getMenuId(uuid(), shouldFocusKey as string)}']`
          );
        elm?.focus?.(options);
      }
    }
  });

  // ======================== Select ========================
  // >>>>> Select keys
  const [mergedSelectKeys, setMergedSelectKeys] = useMergedState(
    props.defaultSelectedKeys || [],
    {
      value: props.selectedKeys,

      // Legacy convert key to array
      postState: keys => {
        if (Array.isArray(keys)) {
          return keys;
        }

        if (keys === null || keys === undefined) {
          return EMPTY_LIST;
        }

        return [keys];
      },
    },
  );

  // >>>>> Trigger select
  const triggerSelection = (info: MenuInfo) => {
    if (props.selectable) {
      // Insert or Remove
      const { key: targetKey } = info;
      const exist = mergedSelectKeys().includes(targetKey);
      let newSelectKeys: string[];

      if (props.multiple) {
        if (exist) {
          newSelectKeys = mergedSelectKeys().filter(key => key !== targetKey);
        } else {
          newSelectKeys = [...mergedSelectKeys(), targetKey];
        }
      } else {
        newSelectKeys = [targetKey];
      }

      setMergedSelectKeys(newSelectKeys);

      // Trigger event
      const selectInfo: SelectInfo = {
        ...info,
        selectedKeys: newSelectKeys,
      };

      if (exist) {
        props.onDeselect?.(selectInfo);
      } else {
        props.onSelect?.(selectInfo);
      }
    }

    // Whatever selectable, always close it
    if (!props.multiple && mergedOpenKeys().length && menuMode().mergedMode !== 'inline') {
      triggerOpenKeys(EMPTY_LIST);
    }
  };

  // ========================= Open =========================
  /**
   * Click for item. SubMenu do not have selection status
   */
  const onInternalClick = createMemoCallback((info: MenuInfo) => {
    props.onClick?.(warnItemProp(info));
    triggerSelection(info);
  });

  const onInternalOpenChange = createMemoCallback((key: string, open: boolean) => {
    let newOpenKeys = mergedOpenKeys().filter(k => k !== key);

    if (open) {
      newOpenKeys.push(key);
    } else if (menuMode().mergedMode !== 'inline') {
      // We need find all related popup to close
      const subPathKeys = getSubPathKeys(key);
      newOpenKeys = newOpenKeys.filter(k => !subPathKeys.has(k));
    }

    if (!shallowEqual(mergedOpenKeys(), newOpenKeys)) {
      triggerOpenKeys(newOpenKeys);
    }
  });

  const getInternalPopupContainer = createMemoCallback(props.getPopupContainer);

  // ==================== Accessibility =====================
  const triggerAccessibilityOpen = (key: string, open?: boolean) => {
    const nextOpen = open ?? !mergedOpenKeys().includes(key);

    onInternalOpenChange(key, nextOpen);
  };

  const onInternalKeyDown = (e) => useAccessibility(
    menuMode().mergedMode,
    mergedActiveKey(),
    isRtl,
    uuid(),

    containerRef,
    getKeys,
    getKeyPath,

    setMergedActiveKey,
    triggerAccessibilityOpen,

    props.onKeyDown,
  )(e);

  // ======================== Effect ========================
  onMount(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  });

  // ======================= Context ========================
  const privateContext = createMemo(
    () => ({
      _internalRenderMenuItem: props._internalRenderMenuItem,
      _internalRenderSubMenuItem: props._internalRenderSubMenuItem,
    }),
    // [_internalRenderMenuItem, _internalRenderSubMenuItem],
  );

  // ======================== Render ========================

  // >>>>> Children
  const wrappedChildList = createMemo(() => {
    if (!mounted) return [];
    return menuMode().mergedMode !== 'horizontal' || props.disabledOverflow
      ? childList()
      : // Need wrap for overflow dropdown that do not response for open
      childList().map((child, index) => (
        // Always wrap provider to avoid sub node re-mount
        <MenuContextProvider
          key={child.key}
          overflowDisabled={index > lastVisibleIndex()}
        >
          {child}
        </MenuContextProvider>
      ));
  })

  // >>>>> Container
  const container = () =>(
    <Overflow
      id={props.id}
      ref={containerRef as any}
      prefixCls={`${props.prefixCls}-overflow`}
      component="ul"
      itemComponent={MenuItem}
      class={classNames(
        props.prefixCls,
        `${props.prefixCls}-root`,
        `${props.prefixCls}-${menuMode().mergedMode}`,
        props.className,
        {
          [`${props.prefixCls}-inline-collapsed`]: menuMode().mergedInlineCollapsed,
          [`${props.prefixCls}-rtl`]: isRtl,
        },
        props.rootClassName,
      )}
      dir={props.direction}
      style={props.style}
      role="menu"
      tabIndex={props.tabIndex}
      // data={props.children} // wrappedChildList
      data={(
        parseItems(props.children, props.items, EMPTY_LIST).map((child, index) => (
          // Always wrap provider to avoid sub node re-mount
          <MenuContextProvider
            key={child?.key}
            overflowDisabled={(menuMode().mergedMode !== 'horizontal' || props.disabledOverflow) ? undefined : index > lastVisibleIndex()}
          >
            {child}
          </MenuContextProvider>
        ))
      )} // wrappedChildList
      renderRawItem={node => node}
      renderRawRest={omitItems => {
        // We use origin list since wrapped list use context to prevent open
        const len = omitItems.length;

        const originOmitItems = len ? childList().slice(-len) : null;

        return (
          <SubMenu
            eventKey={OVERFLOW_KEY}
            title={props.overflowedIndicator}
            disabled={allVisible()}
            internalPopupClose={len === 0}
            popupClassName={props.overflowedIndicatorPopupClassName}
          >
            {originOmitItems}
          </SubMenu>
        );
      }}
      maxCount={
        menuMode().mergedMode !== 'horizontal' || props.disabledOverflow
          ? Overflow.INVALIDATE
          : Overflow.RESPONSIVE
      }
      ssr="full"
      data-menu-list
      onVisibleChange={newLastIndex => {
        setLastVisibleIndex(newLastIndex);
      }}
      onKeyDown={onInternalKeyDown}
      {...restProps}
    />
  );

  // >>>>> Render
  // return <div></div>
  return (
    <PrivateContext.Provider value={privateContext()}>
      <IdContext.Provider value={uuid()}>
        <MenuContextProvider
          prefixCls={props.prefixCls}
          rootClassName={props.rootClassName}
          mode={menuMode().mergedMode}
          openKeys={mergedOpenKeys()}
          rtl={isRtl}
          // Disabled
          disabled={props.disabled}
          // Motion
          motion={mounted() ? props.motion : null}
          defaultMotions={mounted() ? props.defaultMotions : null}
          // Active
          activeKey={mergedActiveKey()}
          onActive={onActive}
          onInactive={onInactive}
          // Selection
          selectedKeys={mergedSelectKeys()}
          // Level
          inlineIndent={props.inlineIndent}
          // Popup
          subMenuOpenDelay={props.subMenuOpenDelay}
          subMenuCloseDelay={props.subMenuCloseDelay}
          forceSubMenuRender={props.forceSubMenuRender}
          builtinPlacements={props.builtinPlacements}
          triggerSubMenuAction={props.triggerSubMenuAction}
          getPopupContainer={props.getPopupContainer}
          // Icon
          itemIcon={props.itemIcon}
          expandIcon={props.expandIcon}
          // Events
          onItemClick={onInternalClick}
          onOpenChange={onInternalOpenChange}
        >
          <PathUserContext.Provider value={pathUserContext()}>
            <Show when={mounted}>
              {container()}
            </Show>
          </PathUserContext.Provider>

          {/* Measure menu keys. Add `display: none` to avoid some developer miss use the Menu */}
          <div style={{ display: 'none' }} aria-hidden>
            <PathRegisterContext.Provider value={registerPathContext()}>
              {(
                parseItems(props.children, props.items, EMPTY_LIST).map((child, index) => (
                  // Always wrap provider to avoid sub node re-mount
                  <MenuContextProvider
                    key={child?.key}
                    overflowDisabled={(menuMode().mergedMode !== 'horizontal' || props.disabledOverflow) ? undefined : index > lastVisibleIndex()}
                  >
                    {child}
                  </MenuContextProvider>
                ))
              )}
              {/* {console.log(childList())} */}
            </PathRegisterContext.Provider>
          </div>
        </MenuContextProvider>
      </IdContext.Provider>
    </PrivateContext.Provider>
  );
});

export default Menu;
