import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, onMount, Ref, splitProps, mergeProps, on } from "solid-js";
import Trigger from 'rc-trigger-solid';
import type { TriggerProps } from 'rc-trigger-solid';
import classNames from 'classnames';
import type {
  AnimationType,
  AlignType,
  BuildInPlacements,
  ActionType,
} from 'rc-trigger-solid/lib/interface';
import Placements from './placements';
import useAccessibility from './hooks/useAccessibility';
import raf from "rc-util-solid/lib/raf";

export interface DropdownProps
  extends Partial<Pick<
    TriggerProps,
    | 'getPopupContainer'
    | 'children'
    | 'mouseEnterDelay'
    | 'mouseLeaveDelay'
    | 'onPopupAlign'
    | 'builtinPlacements'
  >> {
  ref?: Ref<HTMLElement>;
  minOverlayWidthMatchTrigger?: boolean;
  arrow?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onOverlayClick?: (e: Event) => void;
  prefixCls?: string;
  transitionName?: string;
  overlayClassName?: string;
  openClassName?: string;
  animation?: AnimationType;
  align?: AlignType;
  overlayStyle?: JSX.CSSProperties;
  placement?: string;
  placements?: BuildInPlacements;
  overlay?: (() => JSX.Element) | JSX.Element;
  trigger?: ActionType | ActionType[];
  alignPoint?: boolean;
  showAction?: ActionType[];
  hideAction?: ActionType[];
  visible?: boolean;
  autoFocus?: boolean;
  className?: string
}

function Dropdown(props_: DropdownProps) {
  const defaultProps = {
    arrow: false,
    prefixCls: 'rc-dropdown',
    placement: 'bottomLeft',
    placements: Placements,
    trigger: ['hover'],
  }
  const props = mergeProps(defaultProps, props_)
  const [_, otherProps] = splitProps(props, ["arrow", "prefixCls", "transitionName", "animation",
    "align", "placement", "placements", "getPopupContainer", "showAction", "hideAction", "overlayClassName",
    "overlayStyle", "visible", "trigger", "autoFocus"]);

  const [triggerVisible, setTriggerVisible] = createSignal<boolean>();
  const mergedVisible = createMemo(() => 'visible' in props ? props.visible : triggerVisible());

  let triggerRef = null;
  // props.ref?.(triggerRef);
  raf(() => {
    if (triggerRef) {
      props.ref?.(triggerRef);
      useAccessibility({
        visible: mergedVisible,
        setTriggerVisible,
        triggerRef,
        onVisibleChange: props.onVisibleChange,
        autoFocus: props.autoFocus,
      });
    }
  })

  const getOverlayElement = (): JSX.Element => {
    // const { overlay } = props;
    let overlayElement: JSX.Element;
    if (typeof props.overlay === 'function') {
      overlayElement = props.overlay();
    } else {
      overlayElement = props.overlay;
    }
    return overlayElement;
  };

  const onClick = (e) => {
    // const { onOverlayClick } = props;
    // e.currentTarget.focus();
    setTriggerVisible(false);

    if (props.onOverlayClick) {
      props.onOverlayClick(e);
    }
  };

  const onVisibleChange = (newVisible: boolean) => {
    const { onVisibleChange: onVisibleChangeProp } = props;
    
    setTriggerVisible(newVisible);
    if (typeof onVisibleChangeProp === 'function') {
      onVisibleChangeProp(newVisible);
    }
  };

  const getMenuElement = () => {
    const overlayElement = getOverlayElement();
    return (
      <>
        {props.arrow && <div class={`${props.prefixCls}-arrow`} />}
        {overlayElement}
      </>
    );
  };

  const getMenuElementOrLambda = () => {
    const { overlay } = props;
    if (typeof overlay === 'function') {
      return getMenuElement;
    }
    return getMenuElement();
  };

  const getMinOverlayWidthMatchTrigger = () => {
    const { minOverlayWidthMatchTrigger, alignPoint } = props;
    if ('minOverlayWidthMatchTrigger' in props) {
      return minOverlayWidthMatchTrigger;
    }

    return !alignPoint;
  };

  const getOpenClassName = () => {
    // const { openClassName } = props;
    if (props.openClassName !== undefined) {
      return props.openClassName;
    }
    return `${props.prefixCls}-open`;
  };

  // createEffect(on(mergedVisible, () => {
  //   // console.log("mergedVisible()", mergedVisible(), triggerRef?.popupRef?.getDocument?.())
  //   if (triggerRef) {
  //     const dom = triggerRef.triggerRef as HTMLElement;
  //     if (dom) {
  //       if (mergedVisible()) {
  //         dom.classList.add(getOpenClassName())
  //       } else {
  //         dom.classList.remove(getOpenClassName())
  //       }
  //     }
  //   }
  // }))

  // const renderChildren = () => {
  // const { children } = props;
  // const childrenProps = children.props ? children.props : {};
  // const childClassName = classNames(childrenProps.className, getOpenClassName());
  // return mergedVisible && props.children
  //   ? React.cloneElement(props.children, {
  //       className: childClassName,
  //     })
  //   : props.children;
  // };

  let triggerHideAction = createMemo(() => {
    let triggerHideAction =  props.hideAction || [];
    if (!triggerHideAction && props.trigger.indexOf('contextMenu') !== -1) {
      triggerHideAction = ['click'];
    }
  })

  return (
    <Trigger
      builtinPlacements={props.placements}
      {...otherProps}
      prefixCls={props.prefixCls}
      ref={(ref) => {
        triggerRef = ref;
        props.ref?.(ref);
      }}
      popupClassName={classNames(props.overlayClassName, {
        [`${props.prefixCls}-show-arrow`]: props.arrow,
      })}
      className={classNames(mergedVisible() ? getOpenClassName() : '', props.className)}
      popupStyle={props.overlayStyle}
      action={props.trigger}
      showAction={props.showAction}
      hideAction={triggerHideAction()}
      popupPlacement={props.placement}
      popupAlign={props.align}
      popupTransitionName={props.transitionName}
      popupAnimation={props.animation}
      popupVisible={mergedVisible()}
      stretch={getMinOverlayWidthMatchTrigger() ? 'minWidth' : ''}
      popup={<>
        {props.arrow && <div class={`${props.prefixCls}-arrow`} />}
        {props.overlay}
      </>}
      onPopupVisibleChange={onVisibleChange}
      onPopupClick={onClick}
      getPopupContainer={props.getPopupContainer}
    >
      {props.children}
    </Trigger>
  );
}

export default Dropdown;
