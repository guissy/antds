import { onCleanup } from "solid-js";
import raf from 'rc-util-solid/lib/raf';

export default (): [
  (callback: (info: { isCanceled: () => boolean }) => void) => void,
  () => void,
] => {
  let nextFrameRef  = null as number;

  function cancelNextFrame() {
    raf.cancel(nextFrameRef);
  }

  function nextFrame(
    callback: (info: { isCanceled: () => boolean }) => void,
    delay = 2,
  ) {
    cancelNextFrame();

    const nextFrameId = raf(() => {
      if (delay <= 1) {
        callback({ isCanceled: () => nextFrameId !== nextFrameRef });
      } else {
        nextFrame(callback, delay - 1);
      }
    });

    nextFrameRef = nextFrameId;
  }

  onCleanup(() => {
    cancelNextFrame();
  })

  return [nextFrame, cancelNextFrame];
};
