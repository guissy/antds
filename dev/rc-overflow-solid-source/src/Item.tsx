import { type Component, type JSX, mergeProps, splitProps, onCleanup, Show, createEffect } from "solid-js";
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer-solid';
import type { ComponentType } from './Overflow';
import { Dynamic } from "solid-js/web";

// Use shared variable to save bundle size
const UNDEFINED = undefined;

export interface ItemProps<ItemType> extends JSX.HTMLAttributes<any> {
  prefixCls: string;
  item?: ItemType;
  className?: string;
  style?: JSX.CSSProperties;
  renderItem?: (item: ItemType) => JSX.Element;
  responsive?: boolean;
  // https://github.com/ant-design/ant-design/issues/35475
  /**
   * @private To make node structure stable. We need keep wrap with ResizeObserver.
   * But disable it when it's no need to real measure.
   */
  responsiveDisabled?: boolean;
  itemKey?: number | string;
  registerSize: (key: number | string, width: number | null) => void;
  children?: JSX.Element;
  display: boolean;
  order: number;
  component?: ComponentType;
  invalidate?: boolean;
}

function InternalItem<ItemType>(props_: ItemProps<ItemType>) {
  const defaultProps = {
    component: 'div'
  }
  const props = mergeProps(defaultProps, props_)
  // const {
  //   prefixCls,
  //   invalidate,
  //   item,
  //   renderItem,
  //   responsive,
  //   responsiveDisabled,
  //   registerSize,
  //   itemKey,
  //   className,
  //   style,
  //   children,
  //   display,
  //   order,
  //   component: Component = 'div',
  //   // ...restProps
  // } = props;
  const [_, restProps] = splitProps(props, ["prefixCls", "invalidate", "item", "renderItem", "responsive",
    "responsiveDisabled", "registerSize", "itemKey", "className", "style", "children", "display", "order", "component"])
  const mergedHidden = () => props.responsive && !props.display;
  // ================================ Effect ================================
  function internalRegisterSize(width: number | null) {
    props.registerSize(props.itemKey!, width);
  }

  // createEffect(() => {

  // })
  onCleanup(() =>
    internalRegisterSize(null)
  );

  // ================================ Render ================================
  const childNode = () =>
    props.renderItem && props.item !== UNDEFINED ? props.renderItem(props.item) : props.children;

  let overflowStyle = (): JSX.CSSProperties | undefined => {
    let overflowStyle;
    if (!props.invalidate) {
      overflowStyle = {
        opacity: mergedHidden() ? 0 : 1,
        height: mergedHidden() ? 0 : UNDEFINED,
        'overflow-y': mergedHidden() ? 'hidden' : UNDEFINED,
        order: props.responsive ? props.order : UNDEFINED,
        'pointer-events': mergedHidden() ? 'none' : UNDEFINED,
        position: mergedHidden() ? 'absolute' : UNDEFINED,
      };
    }
    return overflowStyle;
  }

  const overflowProps: () => JSX.HTMLAttributes<any> = () => {
    let overflowProps = {};
    if (mergedHidden()) {
      overflowProps['aria-hidden'] = true;
    }
    return overflowProps;
  }

  let itemNode = () => (
    <Dynamic
      component={props.component as unknown as string}
      class={classNames(!props.invalidate && props.prefixCls, props.className)}
      style={{
        ...overflowStyle(),
        ...props.style,
      }}
      {...overflowProps()}
      {...restProps}
    // ref={ref}
    >
      {childNode}
    </Dynamic>
  );

  // if (props.responsive) {
  //   itemNode = (
  //     <ResizeObserver
  //       onResize={({ offsetWidth }) => {
  //         internalRegisterSize(offsetWidth);
  //       }}
  //       disabled={props.responsiveDisabled}
  //     >
  //       {itemNode}
  //     </ResizeObserver>
  //   );
  // }

  return (<Show when={props.responsive} fallback={itemNode}>
    <ResizeObserver
      onResize={({ offsetWidth }) => {
        internalRegisterSize(offsetWidth);
      }}
      disabled={props.responsiveDisabled}
    >
      {itemNode}
    </ResizeObserver>
  </Show>);
}

const Item = InternalItem;
; (Item as unknown as { displayName: string }).displayName = 'Item';

export default Item;
