/* eslint-disable react/default-props-match-prop-types, react/no-multi-comp, react/prop-types */
import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, onMount, onCleanup } from "solid-js";
import { spread } from 'solid-js/web'
// import findDOMNode from 'rc-util/lib/Dom/findDOMNode';
import { fillRef, supportRef } from 'rc-util-solid/lib/ref';
import classNames from 'classnames';
import { getTransitionName, supportTransition } from './util/motion';
import type {
  MotionStatus,
  MotionEventHandler,
  MotionEndEventHandler,
  MotionPrepareEventHandler,
} from './interface';
import { STATUS_NONE, STEP_PREPARE, STEP_START } from './interface';
import useStatus from './hooks/useStatus';
// import DomWrapper from './DomWrapper';
import { isActive } from './hooks/useStepQueue';

export type CSSMotionConfig =
  | boolean
  | {
    transitionSupport?: boolean;
    /** @deprecated, no need this anymore since `rc-motion` only support latest react */
    forwardRef?: boolean;
  };

export type MotionName =
  | string
  | {
    appear?: string;
    enter?: string;
    leave?: string;
    appearActive?: string;
    enterActive?: string;
    leaveActive?: string;
  };

export interface CSSMotionProps {
  motionName?: MotionName;
  visible?: boolean;
  motionAppear?: boolean;
  motionEnter?: boolean;
  motionLeave?: boolean;
  motionLeaveImmediately?: boolean;
  motionDeadline?: number;
  /**
   * Create element in view even the element is invisible.
   * Will patch `display: none` style on it.
   */
  forceRender?: boolean;
  /**
   * Remove element when motion end. This will not work when `forceRender` is set.
   */
  removeOnLeave?: boolean;
  leavedClassName?: string;
  /** @private Used by CSSMotionList. Do not use in your production. */
  eventProps?: object;

  // Prepare groups
  onAppearPrepare?: MotionPrepareEventHandler;
  onEnterPrepare?: MotionPrepareEventHandler;
  onLeavePrepare?: MotionPrepareEventHandler;

  // Normal motion groups
  onAppearStart?: MotionEventHandler;
  onEnterStart?: MotionEventHandler;
  onLeaveStart?: MotionEventHandler;

  onAppearActive?: MotionEventHandler;
  onEnterActive?: MotionEventHandler;
  onLeaveActive?: MotionEventHandler;

  onAppearEnd?: MotionEndEventHandler;
  onEnterEnd?: MotionEndEventHandler;
  onLeaveEnd?: MotionEndEventHandler;

  // Special
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean) => void;

  internalRef?: React.Ref<any>;

  children?: (
    props: {
      visible?: boolean;
      className?: string;
      style?: JSX.CSSProperties;
      [key: string]: any;
    },
    ref: (node: any) => void,
  ) => JSX.Element;
}

export interface CSSMotionState {
  status?: MotionStatus;
  statusActive?: boolean;
  newStatus?: boolean;
  statusStyle?: JSX.CSSProperties;
  prevProps?: CSSMotionProps;
}

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(
  config: CSSMotionConfig,
): JSX.IntrinsicAttributes {
  let transitionSupport = config;

  if (typeof config === 'object') {
    ({ transitionSupport } = config);
  }

  // function isSupportTransition(props: CSSMotionProps) {
  //   return !!(props.motionName && transitionSupport);
  // }

  const CSSMotion: Component<CSSMotionProps & JSX.CustomAttributes<HTMLDivElement>> = ((props) => {
    // const {
    // Default config
    // visible = true,
    // removeOnLeave = true,

    // forceRender,
    // children,
    // motionName,
    // leavedClassName,
    // eventProps,
    // } = props;

    // const supportMotion = isSupportTransition(props);
    const supportMotion = createMemo(() => !!(props.motionName && transitionSupport));

    // Ref to the react node, it may be a HTMLElement
    let nodeRef = null as (any | null);
    // Ref to the dom wrapper in case ref can not pass to HTMLElement
    // let wrapperNodeRef = useRef();

    function getDomElement() {
      try {
        // Here we're avoiding call for findDOMNode since it's deprecated
        // in strict mode. We're calling it only when node ref is not
        // an instance of DOM HTMLElement. Otherwise use
        // findDOMNode as a final resort
        return nodeRef;// instanceof HTMLElement
        // ? nodeRef
        // : findDOMNode<HTMLElement>(wrapperNodeRef);
      } catch (e) {
        // Only happen when `motionDeadline` trigger but element removed.
        return null;
      }
    }

    // isSupportTransition
    const visible = createMemo(() => props.visible ?? true)
    const [status, statusStep, statusStyle, mergedVisible] = useStatus(
      supportMotion,
      visible,
      getDomElement,
      props,
    );

    // Record whether content has rendered
    // Will return null for un-rendered even when `removeOnLeave={false}`
    let renderedRef = mergedVisible();
    // if (mergedVisible) {
    //   renderedRef = true;
    // }

    // ====================== Refs ======================
    let setNodeRef = (node: any) => {
      nodeRef = node;
      fillRef(props.ref, node);
    };

    // const child = Children(() => props.children(props))() as Element;
    // ===================== Render =====================
    const mergedProps = mergeProps(props.eventProps, { visible: visible() });
    let motionChildren = Children(() =>
      typeof props.children === 'function'
        ? props.children({ ...mergedProps }, setNodeRef)
        : null
    )() as HTMLElement;
    const className = motionChildren.className;
    createMemo(([child, styleOld]: [HTMLElement, CSSProperties]) => {
      console.log("status", status(), "visible=", props.visible)
      // const className = child?.classList.toString();
      const style = child?.style;
      const mergedProps = mergeProps(props.eventProps, { visible: visible() });
      const removeOnLeave = props.removeOnLeave || true;
      // let motionChildrenOuter = Children(() =>
      //   typeof props.children === 'function'
      //     ? props.children({ ...mergedProps }, setNodeRef)
      //     : null
      // )() as HTMLElement;
      if (!props.children) {
        // No children
        // motionChildren = null;
      } else if (status() === STATUS_NONE || !supportMotion()) {
        // Stable children
        if (mergedVisible()) {
          // motionChildren = props.children({ ...mergedProps }, setNodeRef);
          spread(motionChildren, { ...mergedProps, className })
        } else if (!removeOnLeave && renderedRef) {
          // motionChildren = props.children(
          //   { ...mergedProps, className: props.leavedClassName },
          //   setNodeRef,
          // );
          spread(motionChildren, mergeProps(mergedProps, { 'class': classNames(className, props.leavedClassName) }));
        } else if (props.forceRender) {
          // motionChildren = props.children(
          //   { ...mergedProps, style: { display: 'none' } },
          //   setNodeRef,
          // );
          spread(motionChildren, mergeProps(mergedProps, { 'style': { display: 'none' } }));
        } else {
          // motionChildren = null;
          spread(motionChildren, mergeProps(mergedProps, { 'style': { display: 'none' } }));
        }
      } else {
        // In motion
        let statusSuffix: string;
        if (statusStep() === STEP_PREPARE) {
          statusSuffix = 'prepare';
        } else if (isActive(statusStep())) {
          statusSuffix = 'active';
        } else if (statusStep() === STEP_START) {
          statusSuffix = 'start';
        }
        const cleanStyle = Object.fromEntries(Object.entries(styleOld || {}).map(([k, v]) => [k, ""]))        
        spread(motionChildren, mergeProps(mergedProps, {
          'class': classNames(className, getTransitionName(props.motionName, status()), {
            [getTransitionName(props.motionName, `${status()}-${statusSuffix}`)]:
              statusSuffix,
            [props.motionName as string]: typeof props.motionName === 'string',
          }),
          style: statusStyle() ?? cleanStyle
        }));

        // motionChildren = props.children(
        //   {
        //     ...mergedProps,
        //     className: classNames(getTransitionName(props.motionName, status()), {
        //       [getTransitionName(props.motionName, `${status()}-${statusSuffix}`)]:
        //         statusSuffix,
        //       [props.motionName as string]: typeof props.motionName === 'string',
        //     }),
        //     style: statusStyle(),
        //   },
        //   setNodeRef,
        // );
      }
      return [motionChildren, statusStyle()]
    }, [motionChildren, statusStyle()]);

    // Auto inject ref if child node not have `ref` props
    // if (React.isValidElement(motionChildren) && supportRef(motionChildren)) {
    //   const { ref: originNodeRef } = motionChildren as any;

    //   if (!originNodeRef) {
    //     motionChildren = React.cloneElement(motionChildren, {
    //       ref: setNodeRef,
    //     });
    //   }
    // }
    return motionChildren;
  });

  ; (CSSMotion as unknown as { displayName: string }).displayName = 'CSSMotion';

  return CSSMotion;
}

export default genCSSMotion(supportTransition);
