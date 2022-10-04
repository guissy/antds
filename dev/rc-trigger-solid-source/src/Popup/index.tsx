import { type ParentComponent, type JSX, createEffect, createSignal, createMemo, children as Children, splitProps, mergeProps, Ref, onCleanup } from "solid-js";
import type { CSSMotionProps } from 'rc-motion-solid';
import isMobile from 'rc-util-solid/lib/isMobile';
import type {
  StretchType,
  AlignType,
  TransitionNameType,
  AnimationType,
  Point,
  MobileConfig,
} from '../interface';
import Mask from './Mask';
import type { PopupInnerRef } from './PopupInner';
import PopupInner from './PopupInner';
import MobilePopupInner from './MobilePopupInner';

export interface PopupProps {
  ref?: PopupInnerRef;
  visible?: boolean;
  style?: JSX.CSSProperties;
  getClassNameFromAlign?: (align: AlignType) => string;
  onAlign?: (element: HTMLElement, align: AlignType) => void;
  getRootDomNode?: () => HTMLElement;
  align?: AlignType;
  destroyPopupOnHide?: boolean;
  className?: string;
  prefixCls: string;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  onMouseDown?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  onTouchStart?: JSX.EventHandlerUnion<HTMLElement, TouchEvent>;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  stretch?: StretchType;
  children?: JSX.Element;
  point?: Point;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion: CSSMotionProps;
  maskMotion: CSSMotionProps;
  forceRender?: boolean;

  // Legacy
  animation: AnimationType;
  transitionName: TransitionNameType;
  maskAnimation: AnimationType;
  maskTransitionName: TransitionNameType;

  // Mobile
  mobile?: MobileConfig;
}

const Popup: ParentComponent<PopupProps> = (props) => {
  const [_, restProps] = splitProps(props, ['visible', 'mobile']);
  const [innerVisible, serInnerVisible] = createSignal(props.visible);
  const [inMobile, setInMobile] = createSignal(false);
  // const cloneProps = createMemo(() => mergeProps(restProps, { visible: innerVisible() }));
  onCleanup(() => {
    console.log("popup", "㊁㊁㊁㊇㊇㊇")
  })
  // We check mobile in visible changed here.
  // And this also delay set `innerVisible` to avoid popup component render flash
  createEffect(() => {
    serInnerVisible(props.visible);
    if (props.visible && props.mobile) {
      setInMobile(isMobile());
    }
  });
  
  const popupNode: JSX.Element = createMemo(() => inMobile() ? (
    <MobilePopupInner {...restProps} visible={innerVisible()} mobile={props.mobile} ref={props.ref}>
      {props.children}
    </MobilePopupInner>
  ) : (
    <PopupInner {...restProps} visible={innerVisible()} ref={props.ref}>
      {props.children}
    </PopupInner>
  ));

  // We can use fragment directly but this may failed some selector usage. Keep as origin logic
  return (
    <div>
      <Mask {...restProps} visible={innerVisible()} />
      {popupNode()}
    </div>
  );
};

; (Popup as unknown as { displayName: string }).displayName = 'Popup';

export default Popup;
