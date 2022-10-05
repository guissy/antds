import {type Component, type JSX, createContext, useContext, children as Children} from "solid-js";
import type { SizeInfo } from '.';

type onCollectionResize = (size: SizeInfo, element: HTMLElement, data: any) => void;

export const CollectionContext = createContext<onCollectionResize>(null);

export interface ResizeInfo {
  size: SizeInfo;
  data: any;
  element: HTMLElement;
}

export interface CollectionProps {
  /** Trigger when some children ResizeObserver changed. Collect by frame render level */
  onBatchResize?: (resizeInfo: ResizeInfo[]) => void;
  children?: JSX.Element;
}

/**
 * Collect all the resize event from children ResizeObserver
 */
export function Collection(props: CollectionProps) {
  let resizeIdRef  = 0;
  let resizeInfosRef  = [] as ResizeInfo[];

  const onCollectionResize = useContext(CollectionContext);

  const onResize = (size, element, data) => {
      resizeIdRef += 1;
      const currentId = resizeIdRef;

      resizeInfosRef.push({
        size,
        element,
        data,
      });

      Promise.resolve().then(() => {
        if (currentId === resizeIdRef) {
          props.onBatchResize?.(resizeInfosRef);
          resizeInfosRef = [];
        }
      });

      // Continue bubbling if parent exist
      onCollectionResize?.(size, element, data);
    };
    // [onBatchResize, onCollectionResize],

  return <CollectionContext.Provider value={onResize}>{props.children}</CollectionContext.Provider>;
}
