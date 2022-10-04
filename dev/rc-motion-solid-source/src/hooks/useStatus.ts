import { type JSX, createEffect, createMemo, Accessor, onCleanup, on, splitProps, mergeProps } from "solid-js";
import createSignal from 'rc-util-solid/lib/hooks/useState';
import {
  STATUS_APPEAR,
  STATUS_NONE,
  STATUS_LEAVE,
  STATUS_ENTER,
  STEP_PREPARE,
  STEP_START,
  STEP_ACTIVE,
} from '../interface';
import type {
  MotionStatus,
  MotionEventHandler,
  MotionEvent,
  MotionPrepareEventHandler,
  StepStatus,
} from '../interface';
import type { CSSMotionProps } from '../CSSMotion';
import useStepQueue, { DoStep, SkipStep, isActive } from './useStepQueue';
import useDomMotionEvents from './useDomMotionEvents';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export default function useStatus(
  supportMotion: Accessor<boolean>,
  visible: Accessor<boolean>,
  getElement: () => HTMLElement,
  props_: CSSMotionProps,
): [Accessor<MotionStatus>, Accessor<StepStatus>, Accessor<JSX.CSSProperties>, Accessor<boolean>] {
  // Used for outer render usage to avoid `visible: false & status: none` to render nothing
  const [asyncVisible, setAsyncVisible] = createSignal<boolean>();
  const [status, setStatus] = createSignal<MotionStatus>(STATUS_NONE);
  const [style, setStyle] = createSignal<JSX.CSSProperties | undefined>(null);
  // {
  //   motionEnter = true,
  //   motionAppear = true,
  //   motionLeave = true,
  //   motionDeadline,
  //   motionLeaveImmediately,
  //   onAppearPrepare,
  //   onEnterPrepare,
  //   onLeavePrepare,
  //   onAppearStart,
  //   onEnterStart,
  //   onLeaveStart,
  //   onAppearActive,
  //   onEnterActive,
  //   onLeaveActive,
  //   onAppearEnd,
  //   onEnterEnd,
  //   onLeaveEnd,
  //   onVisibleChanged,
  // }
  const props = mergeProps(props_, {
    motionEnter: true,
    motionAppear: true,
    motionLeave: true,
  })
  let mountedRef = false;
  let deadlineRef = null;

  // =========================== Dom Node ===========================
  function getDomElement() {
    return getElement();
  }

  // ========================== Motion End ==========================
  let activeRef: Accessor<boolean> = () => false;

  function onInternalMotionEnd(event: MotionEvent) {
    const element = getDomElement();
    if (event && !event.deadline && event.target !== element) {
      // event exists
      // not initiated by deadline
      // transitionEnd not fired by inner elements
      return;
    }

    const currentActive = activeRef();

    // console.log("status()", status(), currentActive)
    let canEnd: boolean | void;
    if (status() === STATUS_APPEAR && currentActive) {
      canEnd = props.onAppearEnd?.(element, event);
    } else if (status() === STATUS_ENTER && currentActive) {
      canEnd = props.onEnterEnd?.(element, event);
    } else if (status() === STATUS_LEAVE && currentActive) {
      canEnd = props.onLeaveEnd?.(element, event);
    }

    // Only update status when `canEnd` and not destroyed
    // console.log(status(), currentActive, canEnd)
    if (status() !== STATUS_NONE && currentActive && canEnd !== false) {
      setStatus(STATUS_NONE, true);
      setStyle(null, true);
    }
  }

  const [patchMotionEvents] = useDomMotionEvents(onInternalMotionEnd);

  // ============================= Step =============================
  const eventHandlers = createMemo<{
    [STEP_PREPARE]?: MotionPrepareEventHandler;
    [STEP_START]?: MotionEventHandler;
    [STEP_ACTIVE]?: MotionEventHandler;
  }>(() => {
    switch (status()) {
      case STATUS_APPEAR:
        return {
          [STEP_PREPARE]: props.onAppearPrepare,
          [STEP_START]: props.onAppearStart,
          [STEP_ACTIVE]: props.onAppearActive,
        };

      case STATUS_ENTER:
        return {
          [STEP_PREPARE]: props.onEnterPrepare,
          [STEP_START]: props.onEnterStart,
          [STEP_ACTIVE]: props.onEnterActive,
        };

      case STATUS_LEAVE:
        return {
          [STEP_PREPARE]: props.onLeavePrepare,
          [STEP_START]: props.onLeaveStart,
          [STEP_ACTIVE]: props.onLeaveActive,
        };

      default:
        return {};
    }
    return status()
  });

  const [startStep, step] = useStepQueue(status, newStep => {
    // Only prepare step can be skip
    if (newStep === STEP_PREPARE) {
      const onPrepare = eventHandlers()[STEP_PREPARE];
      if (!onPrepare) {
        return SkipStep;
      }

      return onPrepare(getDomElement());
    }

    // Rest step is sync update
    if (step() in eventHandlers()) {
      setStyle(eventHandlers()[step()]?.(getDomElement(), null) || null);
    }

    if (step() === STEP_ACTIVE) {
      // Patch events when motion needed
      patchMotionEvents(getDomElement());

      if (props.motionDeadline > 0) {
        clearTimeout(deadlineRef);
        deadlineRef = setTimeout(() => {
          onInternalMotionEnd({
            deadline: true,
          } as MotionEvent);
        }, props.motionDeadline);
      }
    }

    return DoStep;
  });

  // const active = isActive(step());
  activeRef = createMemo(() => isActive(step()));

  // ============================ Status ============================
  // Update with new status
  useIsomorphicLayoutEffect(on(visible, () => {
    // console.log("useIsomorphicLayoutEffect", asyncVisible(), visible())
    setAsyncVisible(visible());

    const isMounted = mountedRef;
    mountedRef = true;

    if (!supportMotion) {
      return;
    }

    let nextStatus: MotionStatus;

    // Appear
    if (!isMounted && visible() && props.motionAppear) {
      nextStatus = STATUS_APPEAR;
    }

    // Enter
    if (isMounted && visible() && props.motionEnter) {
      nextStatus = STATUS_ENTER;
    }
    // console.log("isMounted, !visible(), motionLeave", isMounted, !visible(), motionLeave);
    // Leave
    if (
      (isMounted && !visible() && props.motionLeave) ||
      (!isMounted && props.motionLeaveImmediately && !visible() && props.motionLeave)
    ) {
      nextStatus = STATUS_LEAVE;
    }

    // Update to next status
    if (nextStatus) {
      setStatus(nextStatus);
      startStep();
    }
  }));

  // ============================ Effect ============================
  // Reset when motion changed
  createEffect(() => {
    if (
      // Cancel appear
      (status() === STATUS_APPEAR && !props.motionAppear) ||
      // Cancel enter
      (status() === STATUS_ENTER && !props.motionEnter) ||
      // Cancel leave
      (status() === STATUS_LEAVE && !props.motionLeave)
    ) {
      setStatus(STATUS_NONE);
    }
  });

  onCleanup(() => {
    mountedRef = false;
    clearTimeout(deadlineRef);
  });

  // Trigger `onVisibleChanged`
  let firstMountChangeRef = false;
  createEffect(() => {
    // [visible & motion not end] => [!visible & motion end] still need trigger onVisibleChanged
    if (asyncVisible()) {
      firstMountChangeRef = true;
    }

    if (asyncVisible() !== undefined && status() === STATUS_NONE) {
      // Skip first render is invisible since it's nothing changed
      if (firstMountChangeRef || asyncVisible()) {
        props.onVisibleChanged?.(asyncVisible());
      }
      firstMountChangeRef = true;
    }
  }, [asyncVisible(), status]);

  // ============================ Styles ============================
  // let mergedStyle = style;
  // if (eventHandlers()[STEP_PREPARE] && step() === STEP_START) {
  //   mergedStyle = {
  //     transition: 'none',
  //     ...mergedStyle(),
  //   };
  // }
  let mergedStyle = createMemo(on([step, style], () => {
    return eventHandlers()[STEP_PREPARE] && step() === STEP_START
      ? {
        transition: 'none',
        ...mergedStyle(),
      } : style()
  }));

  const _visible = createMemo(() => {
    return asyncVisible() == null ? visible() : asyncVisible();
  })
  return [status, step, mergedStyle, _visible];
}
