import { createRenderEffect } from "solid-js";
// import canUseDom from 'rc-util/lib/Dom/canUseDom';

// It's safe to use `useLayoutEffect` but the warning is annoying
const useIsomorphicLayoutEffect = createRenderEffect;

export default useIsomorphicLayoutEffect;
