import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps, Show, onCleanup, onMount } from "solid-js";
import classNames from 'classnames';
import Overflow from 'rc-overflow-solid';
import warning from 'rc-util-solid/lib/warning';
import SubMenuList from './SubMenuList';
import { parseChildren } from '../utils/nodeUtil';
import type { MenuInfo, SubMenuType } from '../interface';
import MenuContextProvider, { MenuContext, MenuContextProps } from '../context/MenuContext';
import createMemoCallback from '../hooks/useMemoCallback';
import PopupTrigger from './PopupTrigger';
import Icon from '../Icon';
import useActive from '../hooks/useActive';
import { warnItemProp } from '../utils/warnUtil';
import useDirectionStyle from '../hooks/useDirectionStyle';
import InlineSubMenuList from './InlineSubMenuList';
import {
  PathTrackerContext,
  PathUserContext,
  PathUserContextProps,
  useFullPath,
  useMeasure,
} from '../context/PathContext';
import { useMenuId } from '../context/IdContext';
import PrivateContext from '../context/PrivateContext';

export interface SubMenuProps
  extends Omit<SubMenuType, 'key' | 'children' | 'label'> {
  title?: JSX.Element;

  children?: JSX.Element;

  /** @private Used for rest popup. Do not use in your prod */
  internalPopupClose?: boolean;

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;

  // >>>>>>>>>>>>>>>>>>>>> Next  Round <<<<<<<<<<<<<<<<<<<<<<<
  // onDestroy?: DestroyEventHandler;
}

const InternalSubMenu = (props: SubMenuProps) => {
  // const {
  //   style,
  //   className,

  //   title,
  //   eventKey,
  //   warnKey,

  //   disabled,
  //   internalPopupClose,

  //   children,

  //   // Icons
  //   itemIcon,
  //   expandIcon,

  //   // Popup
  //   popupClassName,
  //   popupOffset,

  //   // Events
  //   onClick,
  //   onMouseEnter,
  //   onMouseLeave,
  //   onTitleClick,
  //   onTitleMouseEnter,
  //   onTitleMouseLeave,

  //   ...restProps
  // } = props;

  const [_, restProps] = splitProps(props, ["style", "className", "title", "eventKey",
    "warnKey", "disabled", "internalPopupClose", "children", "itemIcon", "expandIcon",
    "popupClassName", "popupOffset", "onClick", "onMouseEnter", "onMouseLeave", "onTitleClick",
    "onTitleMouseEnter", "onTitleMouseLeave"]);

  const domDataId = createMemo(() => useMenuId(props.eventKey));

  // const {
  //   prefixCls,
  //   mode,
  //   openKeys,

  //   // Disabled
  //   disabled: contextDisabled,
  //   overflowDisabled,

  //   // ActiveKey
  //   activeKey,

  //   // SelectKey
  //   selectedKeys,

  //   // Icon
  //   itemIcon: contextItemIcon,
  //   expandIcon: contextExpandIcon,

  //   // Events
  //   onItemClick,
  //   onOpenChange,

  //   onActive,
  // }
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  const { _internalRenderSubMenuItem } = useContext(PrivateContext);

  const pathContext = useContext(PathUserContext) ?? {} as PathUserContextProps;
  const connectedPath = useFullPath();

  const subMenuPrefixCls = `${context.prefixCls}-submenu`;
  const mergedDisabled = createMemo(() => context.disabled || props.disabled);
  let elementRef = null as (HTMLDivElement | null);
  let popupRef = null as (HTMLUListElement | null);
  const [domKey, setDomKey] = createSignal('');

  // ================================ Warn ================================
  if (process.env.NODE_ENV !== 'production' && props.warnKey) {
    warning(false, 'SubMenu should not leave undefined `key`.');
  }

  // ================================ Icon ================================
  const mergedItemIcon = props.itemIcon || context.itemIcon;
  const mergedExpandIcon = props.expandIcon || context.expandIcon;

  // ================================ Open ================================
  const originOpen = createMemo(() => Array.isArray(context.openKeys) ? context.openKeys.includes(props.eventKey) : false);
  const open = createMemo(() => !context.overflowDisabled && originOpen());

  // =============================== Select ===============================
  // const childrenSelected = pathContext.isSubPathKey?.(context.selectedKeys, props.eventKey);

  // =============================== Active ===============================
  const actived = createMemo(() => useActive(
    props.eventKey,
    mergedDisabled(),
    props.onTitleMouseEnter,
    props.onTitleMouseLeave,
  ));

  // Fallback of active check to avoid hover on menu title or disabled item
  const [childrenActive, setChildrenActive] = createSignal(false);

  const triggerChildrenActive = (newActive: boolean) => {
    if (!mergedDisabled()) {
      setChildrenActive(newActive);
    }
  };

  const onInternalMouseEnter: JSX.EventHandlerUnion<HTMLLIElement, MouseEvent> = domEvent => {
    triggerChildrenActive(true);

    props.onMouseEnter?.({
      key: props.eventKey,
      domEvent,
    });
  };

  const onInternalMouseLeave: JSX.EventHandlerUnion<HTMLLIElement, MouseEvent> = domEvent => {
    triggerChildrenActive(false);

    props.onMouseLeave?.({
      key: props.eventKey,
      domEvent,
    });
  };

  const mergedActive = createMemo(() => {

    if (actived().active) {
      return actived().active;
    }

    if (context.mode !== 'inline') {
      return childrenActive() || pathContext.isSubPathKey?.([context.activeKey], props.eventKey);
    }

    return false;
  }, [context.mode, actived().active, context.activeKey, childrenActive(), props.eventKey, pathContext.isSubPathKey]);

  // ========================== DirectionStyle ==========================
  const directionStyle = useDirectionStyle(connectedPath().length);

  // =============================== Events ===============================
  // >>>> Title click
  const onInternalTitleClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = e => {
    // Skip if disabled
    if (mergedDisabled()) {
      return;
    }

    props.onTitleClick?.({
      key: props.eventKey,
      domEvent: e,
    });

    // Trigger open by click when mode is `inline`
    if (context.mode === 'inline') {
      context.onOpenChange(props.eventKey, !originOpen());
    }
  };

  // >>>> Context for children click
  const onMergedItemClick = createMemoCallback((info: MenuInfo) => {
    props.onClick?.(warnItemProp(info));
    context.onItemClick(info);
  });

  // >>>>> Visible change
  const onPopupVisibleChange = (newVisible: boolean) => {
    if (context.mode !== 'inline') {
      context.onOpenChange(props.eventKey || domKey(), newVisible);
    }
  };

  /**
   * Used for accessibility. Helper will focus element without key board.
   * We should manually trigger an active
   */
  const onInternalFocus: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = () => {
    context.onActive(props.eventKey || domKey());
  };

  // =============================== Render ===============================
  const popupId = createMemo(() => {
    return domDataId() && `${domDataId()}-popup`;
  });

  onMount(() => {
    setDomKey(popupRef?.id);
  })

  // >>>>> Title
  let titleNode: JSX.Element = (
    <div
      role="menuitem"
      style={directionStyle}
      class={`${subMenuPrefixCls}-title`}
      tabIndex={mergedDisabled() ? null : -1}
      ref={elementRef}
      title={typeof props.title === 'string' ? props.title : null}
      data-menu-id={context.overflowDisabled && domDataId() ? null : domDataId()}
      aria-expanded={open()}
      aria-haspopup
      aria-controls={popupId()}
      aria-disabled={mergedDisabled()}
      onClick={onInternalTitleClick}
      onFocus={onInternalFocus}
      onMouseEnter={actived().onMouseEnter}
      onMouseLeave={actived().onMouseLeave}
    >
      {props.title}

      {/* Only non-horizontal mode shows the icon */}
      <Icon
        icon={context.mode !== 'horizontal' ? mergedExpandIcon : null}
        props={{
          ...props,
          isOpen: open(),
          // [Legacy] Not sure why need this mark
          isSubMenu: true,
        }}
      >
        <i class={`${subMenuPrefixCls}-arrow`} />
      </Icon>
    </div>
  );

  // Cache mode if it change to `inline` which do not have popup motion
  let triggerModeRef = context.mode;
  if (context.mode !== 'inline') {
    triggerModeRef = connectedPath().length > 1 ? 'vertical' : context.mode;
  }

  // >>>>> Render
  return (
    <MenuContextProvider
      onItemClick={onMergedItemClick}
      mode={context.mode === 'horizontal' ? 'vertical' : context.mode}
      itemIcon={mergedItemIcon}
      expandIcon={mergedExpandIcon}
    >
      <Overflow.Item
        role="none"
        {...restProps}
        component="li"
        style={props.style}
        className={classNames(
          subMenuPrefixCls,
          `${subMenuPrefixCls}-${context.mode}`,
          props.className,
          {
            [`${subMenuPrefixCls}-open`]: open(),
            [`${subMenuPrefixCls}-active`]: mergedActive(),
            [`${subMenuPrefixCls}-selected`]: pathContext.isSubPathKey?.(context.selectedKeys, props.eventKey),
            [`${subMenuPrefixCls}-disabled`]: mergedDisabled(),
          },
        )}
        onMouseEnter={onInternalMouseEnter}
        onMouseLeave={onInternalMouseLeave}
      >
        {/* {titleNode} */}
        <Show when={!context.overflowDisabled} fallback={titleNode}>
          <PopupTrigger
            mode={triggerModeRef}
            prefixCls={subMenuPrefixCls}
            visible={!props.internalPopupClose && open() && context.mode !== 'inline'}
            popupClassName={props.popupClassName}
            popupOffset={props.popupOffset}
            popup={
              <MenuContextProvider
                // Special handle of horizontal mode
                mode={triggerModeRef === 'horizontal' ? 'vertical' : triggerModeRef}
              >
                <SubMenuList id={popupId()} ref={popupRef}>
                  {props.children}
                </SubMenuList>
              </MenuContextProvider>
            }
            disabled={mergedDisabled()}
            onVisibleChange={onPopupVisibleChange}
          >
            {titleNode}
          </PopupTrigger>
        </Show>
        {/* Inline mode */}
        {!context.overflowDisabled && (
          <InlineSubMenuList id={popupId()} open={open()} keyPath={connectedPath()} ref={popupRef}>
            {props.children}
          </InlineSubMenuList>
        )}
      </Overflow.Item>
    </MenuContextProvider>
  );
};

export default function SubMenu(props: SubMenuProps) {
  // const { eventKey, children } = props;
  const context = useContext(MenuContext) ?? {} as MenuContextProps;
  // console.log("submenu props.eventKey", context.key, props.eventKey)
  const connectedKeyPath = useFullPath(() => props.eventKey || context.key || props.key);
  // const childList: JSX.Element[] = parseChildren(
  //   props.children,
  //   connectedKeyPath(),
  // );

  // ==================== Record KeyPath ====================
  // const measure = useMeasure();

  // eslint-disable-next-line consistent-return
  createEffect(() => {
    // console.log("connectedKeyPath()", context.key, props.key)
    const measure = useMeasure();

    if (measure) {
      measure.registerPath(props.eventKey || context.key || props.key, connectedKeyPath());

      onCleanup(() => {
        measure.unregisterPath(props.eventKey || context.key || props.key, connectedKeyPath());
      });
    }
  }, [connectedKeyPath]);

  let renderNode: JSX.Element;

  // ======================== Render ========================

  return (
    <PathTrackerContext.Provider value={connectedKeyPath()}>
      {
        (useMeasure())
          ?
          parseChildren(
            props.children,
            connectedKeyPath(),
          )
          :
          <InternalSubMenu {...props} eventKey={props.eventKey || context.key || props.key} warnKey={props.key == undefined && props.eventKey == undefined}>{parseChildren(
            props.children,
            connectedKeyPath(),
          )}</InternalSubMenu>
      }
    </PathTrackerContext.Provider>
  );
}
