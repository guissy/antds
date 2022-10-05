import { composeRef, supportRef } from 'rc-util-solid/lib/ref';
import { type JSX, createEffect, createMemo, useContext, children as Children, onCleanup } from "solid-js";
import findDOMNode from 'rc-util-solid/lib/Dom/findDOMNode';
import { observe, unobserve } from '../utils/observerUtil';
import type { ResizeObserverProps } from '..';
// import DomWrapper from './DomWrapper';
import { CollectionContext } from '../Collection';

export interface SingleObserverProps extends ResizeObserverProps {
  children: JSX.Element;
}

export default function SingleObserver(props: SingleObserverProps) {
  // const { children, disabled } = props;
  let elementRef  = null as Element;
  let wrapperRef  = null;

  const onCollectionResize = useContext(CollectionContext);

  // =========================== Children ===========================
  // const isRenderProps = typeof props.children === 'function';
  // const mergedChildren = isRenderProps ? (props.children as (e: Element) => JSX.Element)(elementRef) : props.children;

  // ============================= Size =============================
  let sizeRef  = {
    width: -1,
    height: -1,
    offsetWidth: -1,
    offsetHeight: -1,
  };

  // ============================= Ref ==============================
  // let canRef =
  //   !isRenderProps && mergedChildren && supportRef(mergedChildren);
  // let originRef: React.Ref<Element> = canRef ? (mergedChildren as any).ref : null;

  // let mergedRef = createMemo(
  //   () => composeRef<Element>(originRef, elementRef),
  //   [originRef, elementRef],
  // );

  // =========================== Observe ============================
  // let propsRef  = props as SingleObserverProps;
  // propsRef = props;

  // Handler
  const onInternalResize = (target: HTMLElement) => {
    // const { onResize, data } = propsRef;

    const { width, height } = target.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = target;

    /**
     * Resize observer trigger when content size changed.
     * In most case we just care about element size,
     * let's use `boundary` instead of `contentRect` here to avoid shaking.
     */
    const fixedWidth = Math.floor(width);
    const fixedHeight = Math.floor(height);

    if (
      sizeRef.width !== fixedWidth ||
      sizeRef.height !== fixedHeight ||
      sizeRef.offsetWidth !== offsetWidth ||
      sizeRef.offsetHeight !== offsetHeight
    ) {
      const size = { width: fixedWidth, height: fixedHeight, offsetWidth, offsetHeight };
      sizeRef = size;

      // IE is strange, right?
      const mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth;
      const mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight;

      const sizeInfo = {
        ...size,
        offsetWidth: mergedOffsetWidth,
        offsetHeight: mergedOffsetHeight,
      };

      // Let collection know what happened
      onCollectionResize?.(sizeInfo, target, props.data);

      if (props.onResize) {
        // defer the callback but not defer to next frame
        Promise.resolve().then(() => {
          props.onResize(sizeInfo, target);
        });
      }
    }
  };

  // const mergedChildren = Children(() => props.children)() as HTMLElement;
  // elementRef = mergedChildren;
  // Dynamic observe
  createEffect(() => {
    elementRef = wrapperRef.firstChild;
    const currentElement: HTMLElement =
      findDOMNode(elementRef) || findDOMNode(wrapperRef);

      
    if (currentElement && !props.disabled) {
      observe(currentElement, onInternalResize);
    }

    onCleanup(() => {
      unobserve(currentElement, onInternalResize);
    });
    // return () => unobserve(currentElement, onInternalResize);
  }, [elementRef, props.disabled]);

  // ============================ Render ============================
  // TODO: solid mergedRef to children
  return (
    <div ref={wrapperRef}>
      {props.children}
    </div>
  );
}
