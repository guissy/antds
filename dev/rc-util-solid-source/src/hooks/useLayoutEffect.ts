import { createEffect, onMount, onCleanup} from "solid-js";


/**
 * Wrap `useLayoutEffect` which will not throw warning message in test env
 */
const useLayoutEffect = createEffect;

export default useLayoutEffect;

export const useLayoutUpdateEffect: typeof createEffect = (
  callback,
  init,
) => {
  let firstMountRef = true;
  let dispose = null;

  // We tell react that first mount has passed
  onMount(() => {
    firstMountRef = false;
  });

  onCleanup(() => {
    dispose?.();
    firstMountRef = true;
  })

  createEffect((next: typeof init) => {
    let next1;
    if (!firstMountRef) {
      next1 = callback(next);
    }
    firstMountRef = true;
    return next1
  }, init);
};
