import { type Component, type JSX, createEffect, createSignal, createMemo, children as Children, mergeProps, Show } from "solid-js";
import { spread } from 'solid-js/web'
import { fillRef } from 'rc-util-solid/lib/ref';
import classNames from 'classnames';
import { getTransitionName, supportTransition } from './util/motion';
import {
  MotionStatus,
  MotionEventHandler,
  MotionEndEventHandler,
  MotionPrepareEventHandler,
  STATUS_APPEAR,
  STATUS_LEAVE,
} from './interface';
import { STATUS_NONE, STEP_PREPARE, STEP_START } from './interface';
import useStatus from './hooks/useStatus';
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
  key?: number | string;
  className?: string;
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

  // internalRef?: Ref<any>;

  children?: (
    props: {
      key?: string | number;
      visible?: boolean;
      className?: string;
      style?: JSX.CSSProperties;
      [key: string]: any;
    },
    ref?: (node: any) => void,
  ) => JSX.Element;
}

export interface CSSMotionState {
  status?: MotionStatus;
  statusActive?: boolean;
  newStatus?: boolean;
  statusStyle?: JSX.CSSProperties;
  prevProps?: CSSMotionProps;
}

export const toStyleObject = (style: string | JSX.CSSProperties) => {
  if (typeof style === "object") {
    return style;
  }
  const styleObject: JSX.CSSProperties = {};
  (style || "").replace(/([\w-]+)\s*:\s*([^;]+)/g, (_, prop, value) => {
    styleObject[prop] = value;
    return "";
  });
  return styleObject;
};

/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(
  config: CSSMotionConfig,
): Component<CSSMotionProps & JSX.CustomAttributes<HTMLDivElement>> {
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
    let parentRef = null;
    // const child = Children(() => props.children(props))() as Element;
    // ===================== Render =====================
    const mergedProps = mergeProps(props.eventProps, { visible: visible() });
    let motionChildren = Children(() =>
      typeof props.children === 'function'
        ? props.children({ ...mergedProps }, () => { console.warn("setRef is depredated") })
        : null
    )() as HTMLElement;
    setNodeRef(motionChildren)
    let classNameInit = motionChildren?.className;
    const styleInit = toStyleObject(motionChildren?.style?.cssText);
    // const styleInit = motionChildren?.style;
    const [removed, setRemoved] = createSignal(false);
    createEffect(({child, styleKeys}) => {
      setRemoved(false);      
      const styleInitForce = Object.fromEntries(Object.keys(toStyleObject(child?.style?.cssText)).filter(k => styleKeys.includes(k)).map(k => [k, styleInit[k] ?? '']));
      if (child?.className && (status() === STATUS_APPEAR) && statusStep() === STEP_START) {
        classNameInit = child?.className        
      }
      const mergedProps = mergeProps(props.eventProps, { 'class': classNames(classNameInit, props.className), visible: visible() });
      const removeOnLeave = props.removeOnLeave ?? true;
      // TODO: solid notification works, but tooltip not work (it has no key) 
      if (props.key) {
        const childNew = Children(() => props.children({ ...mergedProps }))() as HTMLElement;
        motionChildren.firstChild?.replaceWith(childNew.firstChild);
      }

      if (!motionChildren) {
        // No children
        setRemoved(true)
      } else if (status() === STATUS_NONE || !supportMotion()) {
        // Stable children
        if (mergedVisible()) {    
          // motionChildren = props.children({ ...mergedProps }, setNodeRef);
          spread(motionChildren, { ...mergedProps })
        } else if (!removeOnLeave && !props.forceRender) {
          // motionChildren = props.children(
          //   { ...mergedProps, className: props.leavedClassName },
          //   setNodeRef,
          // );
          // console.debug("createEffect !removeOnLeave && !props.forceRender", props.leavedClassName)
          spread(motionChildren, mergeProps(mergedProps, { style: { ...styleInitForce }, 'class': classNames(classNameInit, props.leavedClassName) }));
        } else if (props.forceRender) {
          // motionChildren = props.children(
          //   { ...mergedProps, style: { display: 'none' } },
          //   setNodeRef,
          // );
          spread(motionChildren, mergeProps(mergedProps, { style: {  display: 'none' } }));
        } else {
          // motionChildren = null;
          if (!props.forceRender && removeOnLeave) {
            setRemoved(true)
          }
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
        const newer = Array.from(new Set(Object.keys(statusStyle() || {}).concat(styleKeys)))
        styleKeys.splice(0, styleKeys.length,  ...newer);
        spread(motionChildren, mergeProps(mergedProps, {
          'class': classNames(classNameInit, getTransitionName(props.motionName, status()), {
            [getTransitionName(props.motionName, `${status()}-${statusSuffix}`)]:
              statusSuffix,
            [props.motionName as string]: typeof props.motionName === 'string',
          }),
          style: {...styleInitForce, ...statusStyle()}
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
      return {child: motionChildren, styleKeys };
    }, {motionChildren, styleKeys: []});


    return <Show when={!removed()}>{motionChildren}</Show>;
  });

  ; (CSSMotion as unknown as { displayName: string }).displayName = 'CSSMotion';

  return CSSMotion;
}

export default genCSSMotion(supportTransition);
