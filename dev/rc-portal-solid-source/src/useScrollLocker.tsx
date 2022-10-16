import { Accessor, createMemo, createSignal } from "solid-js";
import { updateCSS, removeCSS } from 'rc-util-solid/lib/Dom/dynamicCSS';
import useLayoutEffect from 'rc-util-solid/lib/hooks/useLayoutEffect';
import getScrollBarSize from 'rc-util-solid/lib/getScrollBarSize';
import { isBodyOverflowing } from './util';

const UNIQUE_ID = `rc-util-locker-${Date.now()}`;

let uuid = 0;

export default function useScrollLocker(
  lock?: Accessor<boolean>,
) {
  const mergedLock = createMemo(() => !!lock());
  const [id] = createSignal((() => {
    uuid += 1;
    return `${UNIQUE_ID}_${uuid}`;
  })());

  useLayoutEffect(() => {
    if (mergedLock()) {
      const scrollbarSize = getScrollBarSize();
      const isOverflow = isBodyOverflowing();
      updateCSS(
        `
html body {
  overflow-y: hidden;
  ${isOverflow ? `width: calc(100% - ${scrollbarSize}px);` : ''}
}`,
        id(),
      );
    } else {
      removeCSS(id());
    }

    return () => {
      removeCSS(id());
    };
  }, [mergedLock, id]);
}
