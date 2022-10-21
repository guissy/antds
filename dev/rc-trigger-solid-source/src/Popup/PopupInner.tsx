import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, Accessor, Ref, on } from "solid-js";
import Align from 'rc-align-solid';
import useLayoutEffect from 'rc-util-solid/lib/hooks/useLayoutEffect';
import type { RefAlign } from 'rc-align/lib/Align';
import type { CSSMotionProps, MotionEndEventHandler } from 'rc-motion-solid';
import CSSMotion from 'rc-motion-solid';
import classNames from 'classnames';
import type {
  Point,
  AlignType,
  StretchType,
  TransitionNameType,
  AnimationType,
} from '../interface';
import useVisibleStatus from './useVisibleStatus';
import { getMotion } from '../utils/legacyUtil';
import useStretchStyle from './useStretchStyle';

export interface PopupInnerProps {
  ref?: Ref<PopupInnerRef>;
  visible?: boolean;

  prefixCls: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
  zIndex?: number;

  // Motion
  motion: CSSMotionProps;
  destroyPopupOnHide?: boolean;
  forceRender?: boolean;

  // Legacy Motion
  animation: AnimationType;
  transitionName: TransitionNameType;

  // Measure
  stretch?: StretchType;

  // Align
  align?: AlignType;
  point?: Point;
  getRootDomNode?: () => HTMLElement;
  getClassNameFromAlign?: (align: AlignType) => string;
  onAlign?: (element: HTMLElement, align: AlignType) => void;

  // Events
  onMouseEnter?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onMouseDown?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onTouchStart?: JSX.EventHandlerUnion<HTMLDivElement, TouchEvent>;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
}

export interface PopupInnerRef {
  forceAlign: () => void;
  getElement: () => HTMLElement;
}

const PopupInner: Component<PopupInnerProps> = (props) => {
  // const {
  //   visible,

  //   prefixCls,
  //   className,
  //   style,
  //   children,
  //   zIndex,

  //   stretch,
  //   destroyPopupOnHide,
  //   forceRender,

  //   align,
  //   point,
  //   getRootDomNode,
  //   getClassNameFromAlign,
  //   onAlign,

  //   onMouseEnter,
  //   onMouseLeave,
  //   onMouseDown,
  //   onTouchStart,
  //   onClick,
  // } = props;

  let alignRef = null as (RefAlign | null);
  let elementRef = null as (HTMLDivElement | null);

  const [alignedClassName, setAlignedClassName] = createSignal<string>();

  // ======================= Measure ========================
  const [stretchStyle, measureStretchStyle] = useStretchStyle(props.stretch);

  function doMeasure() {
    if (props.stretch) {
      measureStretchStyle(props.getRootDomNode());
    }
  }

  // ======================== Status ========================
  const [status, goNextStatus] = useVisibleStatus(() => props.visible, doMeasure);

  // ======================== Aligns ========================
  /**
   * `alignedClassName` may modify `source` size,
   * which means one time align may not move to the correct position at once.
   *
   * We will reset `alignTimes` for each status switch to `alignPre`
   * and let `rc-align` to align for multiple times to ensure get final stable place.
   * Currently we mark `alignTimes < 2` repeat align, it will increase if user report for align issue.
   */
  const [alignTimes, setAlignTimes] = createSignal(0);
  let prepareResolveRef: (value: unknown) => void = null;

  useLayoutEffect(() => {
    if (status() === 'alignPre') {
      setAlignTimes(0);
    }
  });

  // `target` on `rc-align` can accept as a function to get the bind element or a point.
  // ref: https://www.npmjs.com/package/rc-align
  function getAlignTarget() {
    if (props.point) {
      return props.point;
    }
    return props.getRootDomNode;
  }

  function forceAlign() {
    alignRef?.forceAlign();
  }

  function onInternalAlign(popupDomNode: HTMLElement, matchAlign: AlignType) {
    const nextAlignedClassName = props.getClassNameFromAlign(matchAlign);

    if (alignedClassName() !== nextAlignedClassName) {
      setAlignedClassName(nextAlignedClassName);
    }

    // We will retry multi times to make sure that the element has been align in the right position.
    setAlignTimes((val) => val + 1);

    if (status() === 'align') {
      props.onAlign?.(popupDomNode, matchAlign);
    }
  }

  // Delay to go to next status
  useLayoutEffect(on([alignTimes, status], () => {
    if (status() === 'align') {
      // Repeat until not more align needed
      if (alignTimes() < 2) {
        forceAlign();
        // TODO: solid
        // console.log("alignTimes()", alignTimes(), motion())
        if (alignTimes() === 0 && motion().motionName == null) {
          goNextStatus(function () {
            prepareResolveRef?.(undefined);
          });
        }
        if (alignTimes() === 1) {
          goNextStatus(function () {
            prepareResolveRef?.(undefined);
          });
        }
      } else {
        goNextStatus(function () {
          prepareResolveRef?.(undefined);
        });
      }
    }
  }));

  // ======================== Motion ========================
  const motion = createMemo(() => {
    const motion = { ...getMotion(props) };
  
    ['onAppearEnd', 'onEnterEnd', 'onLeaveEnd'].forEach((eventName) => {
      const originHandler: MotionEndEventHandler = motion[eventName];
      motion[eventName] = (element, event) => {
        goNextStatus();
        return originHandler?.(element, event);
      };      
    });
    return motion;
  })

  function onShowPrepare() {
    return new Promise((resolve) => {
      prepareResolveRef = resolve;
    });
  }

  // Go to stable directly when motion not provided
  createEffect(() => {
    if (!motion().motionName && status() === 'motion') {
      goNextStatus();
    }
  }, [motion().motionName, status]);

  // ========================= Refs =========================
  props.ref?.({
    forceAlign,
    getElement: () => elementRef,
  });

  // ======================== Render ========================
  const mergedStyle: Accessor<JSX.CSSProperties> = createMemo(() => {    
    // console.log("mergedStyle:", status(), props.visible, "opacity = ",  (status() === 'motion' || status() === 'stable' || !props.visible) ? undefined : 0)
    return ({
      ...stretchStyle(),
      'z-index': props.zIndex,
      opacity:
        (status() === 'motion' || status() === 'stable' || !props.visible) ? undefined : 0,
      // Cannot interact with disappearing elements
      // https://github.com/ant-design/ant-design/issues/35051#issuecomment-1101340714
      'pointer-events': (!props.visible && status() !== 'stable' ? 'none' : undefined as JSX.CSSProperties['pointer-events']),
      ...props.style,
    })
  });

  // Align status
  let alignDisabled = createMemo(() => {
    let alignDisabled = true;
    if (props.align?.points && (status() === 'align' || status() === 'stable')) {
      alignDisabled = false;
    }
    return alignDisabled;
  })

  let resolved = Children(() => props.children);
  let childNode: HTMLElement | JSX.Element = resolved() as HTMLElement;

  // Wrapper when multiple children
  if (resolved.toArray().length > 1) {
    childNode = <div class={`${props.prefixCls}-content`}>{props.children}</div>;
  }

  return (
    <CSSMotion
      visible={props.visible}
      ref={elementRef}
      leavedClassName={`${props.prefixCls}-hidden`}
      {...motion()}
      onAppearPrepare={onShowPrepare}
      onEnterPrepare={onShowPrepare}
      removeOnLeave={props.destroyPopupOnHide}
      forceRender={props.forceRender}
    >
      {({ className: motionClassName, style: motionStyle }) => {
        return (
          <Align
            target={getAlignTarget()}
            key="popup"
            ref={alignRef}
            monitorWindowResize
            disabled={alignDisabled()}
            align={props.align}
            onAlign={onInternalAlign}
          >
            <div
              data-key="popup-inner"
              // data-date={new Date().toTimeString()}
              class={classNames(
                props.prefixCls,
                props.className,
                alignedClassName(),
                motionClassName,
              )}
              onMouseEnter={props.onMouseEnter}
              onMouseLeave={props.onMouseLeave}
              oncapture:mousedown={props.onMouseDown}
              oncapture:touchstart={props.onTouchStart}
              onClick={props.onClick}
              style={{
                ...motionStyle,
                ...mergedStyle(),
              }}
            >
              {childNode}
            </div>
          </Align>
        );
      }}
    </CSSMotion>
  );
};

; (PopupInner as unknown as { displayName: string }).displayName = 'PopupInner';

export default PopupInner;
