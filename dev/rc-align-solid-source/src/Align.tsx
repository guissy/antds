/**
 * Removed props:
 *  - childrenProps
 */

import {type Component, type JSX, createEffect, onCleanup, Ref, children as Children} from "solid-js";
// import { composeRef } from 'rc-util-solid/lib/ref';
import isVisible from 'rc-util-solid/lib/Dom/isVisible';
import { alignElement, alignPoint } from 'dom-align';
import addEventListener from 'rc-util-solid/lib/Dom/addEventListener';
import isEqual from 'lodash/isEqual';

import { isSamePoint, restoreFocus, monitorResize } from './util';
import type { AlignType, AlignResult, TargetType, TargetPoint } from './interface';
import useBuffer from './hooks/useBuffer';

type OnAlign = (source: HTMLElement, result: AlignResult) => void;

export interface AlignProps {
  ref?: Ref<HTMLDivElement>;
  align: AlignType;
  target: TargetType;
  onAlign?: OnAlign;
  monitorBufferTime?: number;
  monitorWindowResize?: boolean;
  disabled?: boolean;
  children: JSX.Element;
}

interface MonitorRef {
  element?: HTMLElement;
  cancel: () => void;
}

export interface RefAlign {
  forceAlign: () => void;
}

function getElement(func: TargetType) {
  if (typeof func !== 'function') return null;
  return func();
}

function getPoint(point: TargetType) {
  if (typeof point !== 'object' || !point) return null;
  return point;
}

const Align: Component<AlignProps> = (props) => {
  let cacheRef  = {} as { element?: HTMLElement; point?: TargetPoint; align?: AlignType };
  let nodeRef: HTMLElement | null = null;
  // let childNode = props.children;
  // { children, disabled, target, align, onAlign, monitorWindowResize, monitorBufferTime = 0 }

  // ===================== Align ======================
  // We save the props here to avoid closure makes props ood
  // let forceAlignPropsRef: {
  //   disabled?: boolean;
  //   target?: TargetType;
  //   align?: AlignType;
  //   onAlign?: OnAlign;
  // } = {
  //   disabled: props.disabled,
  //   target: props.target,
  //   align: props.align,
  //   onAlign: props.onAlign
  // }

  const [forceAlign, cancelForceAlign] = useBuffer(() => {
    const latestDisabled = props.disabled;
    const latestTarget = props.target;
    const latestAlign = props.align;
    const latestOnAlign = props.onAlign;
    if (!latestDisabled && latestTarget) {
      const source = nodeRef;

      let result: AlignResult;
      const element = getElement(latestTarget);
      const point = getPoint(latestTarget);

      cacheRef.element = element;
      cacheRef.point = point;
      cacheRef.align = latestAlign;

      // IE lose focus after element realign
      // We should record activeElement and restore later
      const { activeElement } = document;
      // We only align when element is visible
      if (element && isVisible(element)) {
        result = alignElement(source, element, latestAlign);
      } else if (point) {
        result = alignPoint(source, point, latestAlign);
      }

      restoreFocus(activeElement, source);

      if (latestOnAlign && result) {
        latestOnAlign(source, result);
      }
      
      return true;
    }

    return false;
  }, props.monitorBufferTime || 0);

  // ===================== Effect =====================
  // Listen for target updated
  const resizeMonitor: MonitorRef = {
    cancel: () => {},
  };
  // Listen for source updated
  const sourceResizeMonitor: MonitorRef = {
    cancel: () => {},
  };
  createEffect(() => {

    const element = getElement(props.target);
    const point = getPoint(props.target);

    if (nodeRef !== sourceResizeMonitor.element) {
      sourceResizeMonitor.cancel();
      sourceResizeMonitor.element = nodeRef;
      sourceResizeMonitor.cancel = monitorResize(nodeRef, forceAlign);
    }

    if (
      cacheRef.element !== element ||
      !isSamePoint(cacheRef.point, point) ||
      !isEqual(cacheRef.align, props.align)
    ) {
      forceAlign();

      // Add resize observer
      if (resizeMonitor.element !== element) {
        resizeMonitor.cancel();
        resizeMonitor.element = element;
        resizeMonitor.cancel = monitorResize(element, forceAlign);
      }
    }
  });

  // Listen for disabled change
  createEffect(() => {
    if (!props.disabled) {
      forceAlign();
    } else {
      cancelForceAlign();
    }
  });

  // Listen for window resize
  let winResizeRef  = null as { remove: Function };
  createEffect(() => {
    if (props.monitorWindowResize) {
      if (!winResizeRef) {
        winResizeRef = addEventListener(window, 'resize', () => forceAlign(true));
      }
    } else if (winResizeRef) {
      winResizeRef.remove();
      winResizeRef = null;
    }
  });

  // Clear all if unmount
  onCleanup(
    () => {
      resizeMonitor.cancel();
      sourceResizeMonitor.cancel();
      if (winResizeRef) winResizeRef.remove();
      cancelForceAlign();
    }
  );

  // ====================== Ref =======================
  props.ref?.({
    forceAlign: () => forceAlign(true),
  });

  // ===================== Render =====================
  // if (React.isValidElement(childNode)) {
  //   childNode = (spread(childNode,  {
  //     ref: composeRef((childNode as any).ref), childNode nodeRef),
  //   });
  // }
  const childNode = Children(() => props.children)() as HTMLElement;
  nodeRef = childNode;
  // return <div data-id="align" ref={nodeRef as unknown as HTMLDivElement}>{props.children}</div>;
  return childNode;
};

// const RcAlign = Align;
;(Align as unknown as { displayName: string }).displayName = 'Align';

export default Align;
