import { createEffect, createSignal, onCleanup, Accessor, Setter} from "solid-js";

type Updater<T> = Parameters<Setter<T>>[0];

export type SetState<T> = (
  nextValue: Updater<T>,
  /**
   * Will not update state when destroyed.
   * Developer should make sure this is safe to ignore.
   */
  ignoreDestroy?: boolean,
) => void;

/**
 * Same as createState but `setState` accept `ignoreDestroy` param to not to setState after destroyed.
 * We do not make this auto is to avoid real memory leak.
 * Developer should confirm it's safe to ignore themselves.
 */
export default function useSafeState<T>(
  defaultValue?: T | (() => T),
): [Accessor<T>, SetState<T>] {
  let destroyRef = false;
  const [value, setValue] = createSignal(defaultValue);

  createEffect(() => {
    destroyRef = false;
  }, []);

  onCleanup(() => {
    destroyRef = true;
  });


  function safeSetState(updater: Updater<T>, ignoreDestroy?: boolean) {
    if (ignoreDestroy && destroyRef) {
      return;
    }

    setValue(updater);
  }

  return [value, safeSetState];
}
