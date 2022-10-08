import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps, Ref } from "solid-js";
import classNames from 'classnames';
import Overflow from 'rc-overflow-solid';
import warning from 'rc-util-solid/lib/warning';
import KeyCode from 'rc-util-solid/lib/KeyCode';
import omit from 'rc-util-solid/lib/omit';
import type { MenuInfo, MenuItemType } from './interface';
import { MenuContext, MenuContextProps } from './context/MenuContext';
import useActive from './hooks/useActive';
import { warnItemProp } from './utils/warnUtil';
import Icon from './Icon';
import useDirectionStyle from './hooks/useDirectionStyle';
import { useFullPath, useMeasure } from './context/PathContext';
import { useMenuId } from './context/IdContext';
import PrivateContext from './context/PrivateContext';

export interface MenuItemProps
  extends Omit<MenuItemType, 'label' | 'key'>,
  Omit<
    JSX.HTMLAttributes<HTMLLIElement>,
    'onClick' | 'onMouseEnter' | 'onMouseLeave' | 'onSelect'
  > {
  children?: JSX.Element;

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;

  /** @deprecated No place to use this. Should remove */
  attribute?: Record<string, string>;
}

// Since Menu event provide the `info.item` which point to the MenuItem node instance.
// We have to use class component here.
// This should be removed from doc & api in future.
const LegacyMenuItem: Component<{title: string, attribute: {}, elementRef: Ref<HTMLElement>, eventKey: string }> = (props) => {

  // const { title, attribute, elementRef, ...restProps } = this.props;
  const [_, passedProps] = splitProps(props, ['title', 'attribute', 'elementRef', 'eventKey']);
  // const passedProps = omit(restProps, ['eventKey']);
  warning(
    !props.attribute,
    '`attribute` of Menu.Item is deprecated. Please pass attribute directly.',
  );

  return (
    <Overflow.Item
      {...props.attribute}
      title={typeof props.title === 'string' ? props.title : undefined}
      {...passedProps}
      ref={props.elementRef}
    />
  );

}

/**
 * Real Menu Item component
 */
const InternalMenuItem = (props: MenuItemProps) => {
  // const {
  //   style,
  //   className,

  //   eventKey,
  //   warnKey,
  //   disabled,
  //   itemIcon,
  //   children,

  //   // Aria
  //   role,

  //   // Active
  //   onMouseEnter,
  //   onMouseLeave,

  //   onClick,
  //   onKeyDown,

  //   onFocus,

  //   ...restProps
  // } = props;

  const domDataId = createMemo(() => {
    console.log("eventKey", props.eventKey)
    return useMenuId(props.eventKey);
  });
  const [_, restProps] = splitProps(props, [ 'style', 'className', 'eventKey', 'warnKey', 'disabled', 'itemIcon', 'children', 'role', 'onMouseEnter',
  'onMouseLeave','onClick','onKeyDown','onFocus' ]);
  // const {
  //   prefixCls,
  //   onItemClick,

  //   disabled: contextDisabled,
  //   overflowDisabled,

  //   // Icon
  //   itemIcon: contextItemIcon,

  //   // Select
  //   selectedKeys,

  //   // Active
  //   onActive,
  // }
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  const { _internalRenderMenuItem } = useContext(PrivateContext);

  // const itemCls = `${context.prefixCls}-item`;

  let legacyMenuItemRef = null as (any | null);
  let elementRef = null as (HTMLLIElement | null);
  const mergedDisabled = () => context.disabled || props.disabled;

  const connectedKeys = useFullPath(props.eventKey);

  // ================================ Warn ================================
  if (process.env.NODE_ENV !== 'production' && props.warnKey) {
    warning(false, 'MenuItem should not leave undefined `key`.');
  }

  // ============================= Info =============================
  const getEventInfo = (
    e: MouseEvent | KeyboardEvent,
  ): MenuInfo => {
    return {
      key: props.eventKey,
      // Note: For legacy code is reversed which not like other antd component
      keyPath: [...connectedKeys()].reverse(),
      item: legacyMenuItemRef,
      domEvent: e,
    };
  };

  // ============================= Icon =============================
  // const mergedItemIcon = props.itemIcon || context.itemIcon;

  // ============================ Active ============================
  const { active, ...activeProps } = useActive(
    props.eventKey,
    mergedDisabled(),
    props.onMouseEnter,
    props.onMouseLeave,
  );

  // ============================ Select ============================
  const selected = Array.isArray(context.selectedKeys) ? context.selectedKeys.includes(props.eventKey) : false;

  // ======================== DirectionStyle ========================
  const directionStyle = useDirectionStyle(connectedKeys.length);

  // ============================ Events ============================
  const onInternalClick: JSX.EventHandlerUnion<HTMLLIElement, MouseEvent> = e => {
    if (mergedDisabled()) {
      return;
    }

    const info = getEventInfo(e);

    props.onClick?.(warnItemProp(info));
    context.onItemClick(info);
  };

  const onInternalKeyDown: JSX.EventHandlerUnion<HTMLLIElement, KeyboardEvent> = e => {
    props.onKeyDown?.(e);

    if (e.which === KeyCode.ENTER) {
      const info = getEventInfo(e);

      // Legacy. Key will also trigger click event
      props.onClick?.(warnItemProp(info));
      context.onItemClick(info);
    }
  };

  /**
   * Used for accessibility. Helper will focus element without key board.
   * We should manually trigger an active
   */
  const onInternalFocus: JSX.EventHandlerUnion<HTMLLIElement, FocusEvent> = e => {
    context.onActive(props.eventKey);
    props.onFocus?.(e);
  };

  // ============================ Render ============================
  const optionRoleProps: JSX.HTMLAttributes<HTMLDivElement> = {};

  if (props.role === 'option') {
    optionRoleProps['aria-selected'] = selected;
  }

  let renderNode = (
    <LegacyMenuItem
      ref={legacyMenuItemRef}
      elementRef={elementRef}
      role={props.role === null ? 'none' : props.role || 'menuitem'}
      tabIndex={props.disabled ? null : -1}
      data-menu-id={context.overflowDisabled && domDataId() ? null : domDataId()}
      {...restProps}
      {...activeProps}
      {...optionRoleProps}
      component="li"
      aria-disabled={props.disabled}
      style={{
        ...directionStyle,
        ...props.style,
      }}
      class={classNames(
        `${context.prefixCls}-item`,
        {
          [`${context.prefixCls}-item-active`]: active,
          [`${context.prefixCls}-item-selected`]: selected,
          [`${context.prefixCls}-item-disabled`]: mergedDisabled(),
        },
        props.className,
      )}
      onClick={onInternalClick}
      onKeyDown={onInternalKeyDown}
      onFocus={onInternalFocus}
    >
      {props.children}
      <Icon
        props={{
          ...props,
          isSelected: selected,
        }}
        icon={props.itemIcon || context.itemIcon}
      />
    </LegacyMenuItem>
  );

  if (_internalRenderMenuItem) {
    renderNode = _internalRenderMenuItem(renderNode, props, { selected });
  }

  return renderNode;
};

function MenuItem(props: MenuItemProps): JSX.Element {
  // const { eventKey } = props;

  // ==================== Record KeyPath ====================
  const measure = useMeasure();
  const context = useContext(MenuContext) ?? {} as MenuContextProps;
  const connectedKeyPath = useFullPath(props.eventKey || context.key);

  // eslint-disable-next-line consistent-return
  createEffect(() => {
    // console.log("props.eventKey", props.eventKey)
    if (measure) {
      measure.registerPath(props.eventKey || context.key, connectedKeyPath());

      return () => {
        measure.unregisterPath(props.eventKey || context.key, connectedKeyPath());
      };
    }
  }, [connectedKeyPath]);

  if (measure) {
    return null;
  }

  // ======================== Render ========================
  return <InternalMenuItem {...props} eventKey={props.eventKey || context.key} />;
}

export default MenuItem;
