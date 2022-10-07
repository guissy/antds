import raf from 'rc-util-solid/lib/raf';
import createSignal from 'rc-util-solid/lib/hooks/useState';

/**
 * State generate. Return a `setState` but it will flush all state with one render to save perf.
 * This is not a realization of `unstable_batchedUpdates`.
 */
export function useBatchFrameState() {
  const [dep, forceUpdate] = createSignal(Date.now().toFixed());
  let statesRef  = [] as any[];
  let walkingIndex = 0;
  let beforeFrameId: number = 0;
  let updateQueue = [0,0,0,0,0,0,0,0,0,0];
  function createState<T>(
    defaultValue: T,
  ): [() => T, (value: T | ((origin: T) => T)) => void] {
    const myIndex = walkingIndex;
    walkingIndex += 1;

    // Fill value if not exist yet
    if (statesRef.length < myIndex + 1) {
      statesRef[myIndex] = defaultValue;
    }

    // Return filled as `setState`
    const value = () => statesRef[myIndex] as T;

    function setValue(val: ((origin: T) => T)) {
      statesRef[myIndex] =
        typeof val === 'function' ? val(statesRef[myIndex] as T) : val;

      raf.cancel(beforeFrameId);

      // Flush with batch
      beforeFrameId = raf(() => {
        const last = updateQueue[updateQueue?.length - 1] - updateQueue[updateQueue?.length - 5];
        // TODO: solid for blink.tsx
        if (last === 0 || last > 100) {
          updateQueue.push(Date.now())
          forceUpdate(Date.now().toFixed());
        }
      });
    }

    return [value, setValue];
  }

  return [dep, createState] as const;
}


