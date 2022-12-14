// import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { Accessor, on, createRenderEffect, createEffect } from 'solid-js';
import useLayoutEffect, { useLayoutUpdateEffect } from './useLayoutEffect';
import createSignal from './useState';

type Updater<T> = (
  updater: T | ((origin: T) => T),
  ignoreDestroy?: boolean,
) => void;

enum Source {
  INNER,
  PROP,
}

type ValueRecord<T> = [T, Source, T];

/** We only think `undefined` is empty */
function hasValue(value: any) {
  return value !== undefined;
}

/**
 * Similar to `createSignal` but will use props value if provided.
 * Note that internal use rc-util `createSignal` hook.
 */
export default function useMergedState<T, R = T>(
  defaultStateValue: T | (() => T),
  option?: {
    defaultValue?: T | (() => T);
    value?: Accessor<T>;
    onChange?: (value: T, prevValue: T) => void;
    postState?: (value: T) => T;
  },
): [Accessor<R>, Updater<T>] {
  const { defaultValue, onChange, postState } = option || {};
  const value: Accessor<T> = typeof option.value === 'function' ? option.value : (() => option.value) as Accessor<T>;
  // ======================= Init =======================
  const [mergedValue, setMergedValue] = createSignal<ValueRecord<T>>((() => {
    let finalValue: T = undefined;
    let source: Source;
    if (hasValue(value())) {
      finalValue = value();
      source = Source.PROP;
    } else if (hasValue(defaultValue)) {
      finalValue =
        typeof defaultValue === 'function'
          ? (defaultValue as any)()
          : defaultValue;
      source = Source.PROP;
    } else {
      finalValue =
        typeof defaultStateValue === 'function'
          ? (defaultStateValue as any)()
          : defaultStateValue;
      source = Source.INNER;
    }

    return [finalValue, source, finalValue];
  })());

  const postMergedValue = () => {
    const chosenValue = hasValue(value()) ? value() : mergedValue()[0];
    return postState ? postState(chosenValue) : chosenValue;
  };

  // ======================= Sync =======================
  createEffect(on(value, () => {
    setMergedValue(([prevValue]) => {
      return [value(), Source.PROP, prevValue]
    });
  },  {defer: true}));
  

  // ====================== Update ======================
  let changeEventPrevRef  = null as (T | null);

  const triggerChange: Updater<T> = (updater, ignoreDestroy) => {
    
    setMergedValue(prev => {
      const [prevValue, prevSource, prevPrevValue] = prev || [];

      const nextValue: T =
        typeof updater === 'function' ? (updater as any)(prevValue) : updater;

      // Do nothing if value not change
      if (nextValue === prevValue) {
        return prev;
      }

      // Use prev prev value if is in a batch update to avoid missing data
      const overridePrevValue =
        prevSource === Source.INNER &&
        changeEventPrevRef !== prevPrevValue
          ? prevPrevValue
          : prevValue;

      return [nextValue, Source.INNER, overridePrevValue];
    }, ignoreDestroy);
  };

  // ====================== Change ======================
  // const onChangeFn = useEvent(onChange);

  useLayoutEffect(() => {
    const [current, source, prev] = mergedValue();
    if (current !== prev && source === Source.INNER) {
      onChange?.(current, prev);
      changeEventPrevRef = prev;
    }
  }, [mergedValue]);

  return [postMergedValue as unknown as Accessor<R>, triggerChange];
}
