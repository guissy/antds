/* eslint-disable no-param-reassign */
import createMemo from './hooks/useMemo';

type RefObject<T> = { current: T | null };
type RefCallback<T> = { bivarianceHack(instance: T | null): void }["bivarianceHack"];
export type Ref<T> = RefCallback<T> | RefObject<T> | null;

export function fillRef<T>(ref: Ref<T>, node: T) {
  if (typeof ref === 'function') {
    (ref as (val: T) => void)(node);
  } else if (typeof ref === 'object' && ref && 'current' in ref) {
    (ref as any).current = node;
  } else {
    (ref as any) = node;
  }
}

/**
 * Merge refs into one ref function to support ref passing.
 */
export function composeRef<T>(...refs: Ref<T>[]): RefCallback<T> {
  const refList = refs.filter(ref => ref);
  
  if (refList.length <= 1) {
    return refList[0] as RefCallback<T>;
  }

  return (node: T) => {
    refs.forEach(ref => {
      fillRef(ref, node);
    });
  };
}

export function useComposeRef<T>(...refs: Ref<T>[]): RefCallback<T> {
  return createMemo(
    () => composeRef(...refs),
    () => refs,
    (prev, next) =>
      prev.length === next.length && prev.every((ref, i) => ref === next[i]),
  );
}

export function supportRef(Component: Function): boolean {
  if (typeof Component === 'function' && /\w+\.ref\b/.test(Component.toString())) {    
    return true;
  }
  // const type = nodeOrComponent.type;
  // Function component node
  // if (typeof type === 'function' && !type.prototype?.render) {
  //   return false;
  // }

  // // Class component
  // if (
  //   typeof nodeOrComponent === 'function' &&
  //   !nodeOrComponent.prototype?.render
  // ) {
  //   return false;
  // }

  return false;
}
/* eslint-enable */
