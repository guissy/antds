import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, Accessor} from "solid-js";
import type { StretchType } from '../interface';

export default (
  stretch?: StretchType,
): [Accessor<JSX.CSSProperties>, (element: HTMLElement) => void] => {
  const [targetSize, setTargetSize] = createSignal({ width: 0, height: 0 });

  function measureStretch(element: HTMLElement) {
    setTargetSize({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }

  // Merge stretch style
  const style = createMemo<JSX.CSSProperties>(() => {
    const sizeStyle: JSX.CSSProperties = {};

    if (stretch) {
      const { width, height } = targetSize();

      // Stretch with target
      if (stretch.indexOf('height') !== -1 && height) {
        (sizeStyle as unknown as { height: typeof height }).height = height;
      } else if (stretch.indexOf('minHeight') !== -1 && height) {
        sizeStyle['min-height'] = height + 'px';
      }
      if (stretch.indexOf('width') !== -1 && width) {
        (sizeStyle as unknown as { width: typeof width }).width = width;
      } else if (stretch.indexOf('minWidth') !== -1 && width) {
        sizeStyle['min-width'] = width + 'px';
      }
    }

    return sizeStyle;
  }, [stretch, targetSize]);

  return [style, measureStretch];
};
