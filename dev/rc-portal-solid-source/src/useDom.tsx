import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, Accessor, onCleanup, on } from "solid-js";
import useLayoutEffect from 'rc-util-solid/lib/hooks/useLayoutEffect';
import canUseDom from 'rc-util-solid/lib/Dom/canUseDom';
import OrderContext from './Context';
import type { QueueCreate } from './Context';

const EMPTY_LIST = [];

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 */
export default function useDom(
  render: Accessor<boolean>,
  debug?: string,
): [Accessor<HTMLDivElement>, QueueCreate] {
  const [ele] = createSignal((() => {
    if (!canUseDom()) {
      return null;
    }

    const defaultEle = document.createElement('div');

    if (process.env.NODE_ENV !== 'production' && debug) {
      defaultEle.setAttribute('data-debug', debug);
    }

    return defaultEle;
  })());

  // ========================== Order ==========================
  const queueCreate = useContext(OrderContext);
  const [queue, setQueue] = createSignal<VoidFunction[]>(EMPTY_LIST);

  const mergedQueueCreate = 
    queueCreate ||
    ((appendFn: VoidFunction) => {
      setQueue(origin => {
        const newQueue = [appendFn, ...origin];
        return newQueue;
      });
    });

  // =========================== DOM ===========================
  function append() {
    if (!ele().parentElement) {
      document.body.appendChild(ele());
    }
  }

  function cleanup() {
    ele().parentElement?.removeChild(ele());
  }

  useLayoutEffect(on(render, (render) => {
    if (render) {
      if (queueCreate) {
        queueCreate(append);
      } else {
        append();
      }
    } else {
      cleanup();
    }
    onCleanup(cleanup);
    // return cleanup;
  }));

  useLayoutEffect(on(queue, () => {
    if (queue().length) {
      // TODO: solid
      queue().reverse().forEach(appendFn => appendFn());
      setQueue(EMPTY_LIST);
    }
  }));

  return [ele, mergedQueueCreate];
}
