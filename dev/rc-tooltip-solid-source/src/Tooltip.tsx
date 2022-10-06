import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, Ref, mergeProps, splitProps } from "solid-js";
import Trigger from 'rc-trigger-solid';
import type { TriggerProps } from 'rc-trigger-solid';
import type { AlignType, AnimationType, ActionType } from 'rc-trigger-solid/lib/interface';
import { placements } from './placements';
import Popup from './Popup';

export interface TooltipProps extends Partial<Pick<TriggerProps, 'onPopupAlign' | 'builtinPlacements'>> {
  ref?: Ref<unknown>
  trigger?: ActionType | ActionType[];
  defaultVisible?: boolean;
  visible?: boolean;
  placement?: string;
  /** @deprecated Use `motion` instead */
  transitionName?: string;
  /** @deprecated Use `motion` instead */
  animation?: AnimationType;
  /** Config popup motion */
  motion?: TriggerProps['popupMotion'];
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  overlay: (() => JSX.Element) | JSX.Element;
  overlayStyle?: JSX.CSSProperties;
  overlayClassName?: string;
  prefixCls?: string;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  getTooltipContainer?: (node: HTMLElement) => HTMLElement;
  destroyTooltipOnHide?:
  | boolean
  | {
    keepParent?: boolean;
  };
  align?: AlignType;
  showArrow?: boolean;
  arrowContent?: JSX.Element;
  id?: string;
  children?: JSX.Element;
  popupVisible?: boolean;
  overlayInnerStyle?: JSX.CSSProperties;
  zIndex?: number;
}

const Tooltip: Component<TooltipProps> = (props_) => {
  const defaultProps = {
    trigger: ['hover'],
    mouseEnterDelay: 0,
    mouseLeaveDelay: 0.1,
    prefixCls: 'rc-tooltip',
    placement: 'right',
    align: {},
    destroyTooltipOnHide: false,
  } as TooltipProps
  const props = mergeProps(defaultProps, props_);
  const keys = ['overlayClassName', 'overlayStyle', 'onVisibleChange', 'afterVisibleChange', 'transitionName', 'animation', 'motion',
    'defaultVisible', 'getTooltipContainer', 'overlayInnerStyle', 'arrowContent', 'overlay', 'id', 'showArrow'] as (keyof TooltipProps)[];
  const [_, restProps] = splitProps(props, (Object.keys(defaultProps) as (keyof TooltipProps)[]).concat(keys))
  // const {
  //   overlayClassName,
  //   trigger = ['hover'],
  //   mouseEnterDelay = 0,
  //   mouseLeaveDelay = 0.1,
  //   overlayStyle,
  //   prefixCls = 'rc-tooltip',
  //   children,
  //   onVisibleChange,
  //   afterVisibleChange,
  //   transitionName,
  //   animation,
  //   motion,
  //   placement = 'right',
  //   align = {},
  //   destroyTooltipOnHide = false,
  //   defaultVisible,
  //   getTooltipContainer,
  //   overlayInnerStyle,
  //   arrowContent,
  //   overlay,
  //   id,
  //   showArrow,
  //   ...restProps
  // } = props;

  // let domRef = null;
  // props.ref?.(domRef);

  const getPopupElement = () => (
    <Popup
      showArrow={props.showArrow}
      arrowContent={props.arrowContent}
      // key="content"
      prefixCls={props.prefixCls}
      id={props.id}
      overlayInnerStyle={props.overlayInnerStyle}
    >
      {props.overlay}
    </Popup>
  );

  const des = createMemo(() => {
    let destroyTooltip: boolean;
    let autoDestroy: boolean;
    if (typeof props.destroyTooltipOnHide === 'boolean') {
      destroyTooltip = props.destroyTooltipOnHide;
    } else if (props.destroyTooltipOnHide && typeof props.destroyTooltipOnHide === 'object') {
      const { keepParent } = props.destroyTooltipOnHide;
      destroyTooltip = keepParent === true;
      autoDestroy = keepParent === false;
    }
    return {
      destroyTooltip,
      autoDestroy
    }
  }, { destroyTooltip: false, autoDestroy: false })

  return (
    <Trigger
      popupClassName={props.overlayClassName}
      prefixCls={props.prefixCls}
      popup={getPopupElement}
      action={props.trigger}
      builtinPlacements={placements}
      popupPlacement={props.placement}
      ref={props.ref}
      popupAlign={props.align}
      getPopupContainer={props.getTooltipContainer}
      onPopupVisibleChange={props.onVisibleChange}
      afterPopupVisibleChange={props.afterVisibleChange}
      popupTransitionName={props.transitionName}
      popupAnimation={props.animation}
      popupMotion={props.motion}
      defaultPopupVisible={props.defaultVisible}
      destroyPopupOnHide={des().destroyTooltip}
      autoDestroy={des().autoDestroy}
      mouseLeaveDelay={props.mouseLeaveDelay}
      popupStyle={props.overlayStyle}
      mouseEnterDelay={props.mouseEnterDelay}
      popupVisible={props.visible}
      {...restProps}
    >
      {props.children}
    </Trigger>
  );
};

export default Tooltip;
