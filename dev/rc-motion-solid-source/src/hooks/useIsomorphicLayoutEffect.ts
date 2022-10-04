import { createRenderEffect } from "solid-js";

// It's safe to use `useLayoutEffect` but the warning is annoying
const useIsomorphicLayoutEffect = createRenderEffect;

export default useIsomorphicLayoutEffect;
