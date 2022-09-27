
import { render as solidRender } from "solid-js/web";
import type { MountableElement } from "solid-js/web";
import type { JSX } from "solid-js";
// import * as ReactDOM from 'react-dom';
// import type { Root } from 'react-dom/client';

// Let compiler not to search module usage
// const fullClone = {
//   ...ReactDOM,
// } as typeof ReactDOM & {
//   __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
//     usingClientEntryPoint?: boolean;
//   };
//   createRoot?: CreateRoot;
// };

// type CreateRoot = (container: ContainerType) => Root;

// const { version, render: reactRender, unmountComponentAtNode } = fullClone;

// let createRoot: CreateRoot;
// try {
//   const mainVersion = Number((version || '').split('.')[0]);
//   if (mainVersion >= 18) {
//     ({ createRoot } = fullClone);
//   }
// } catch (e) {
//   // Do nothing;
// }

// function toggleWarning(skip: boolean) {
//   const { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } = fullClone;

//   if (
//     __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED &&
//     typeof __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED === 'object'
//   ) {
//     __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.usingClientEntryPoint =
//       skip;
//   }
// }

const MARK = '__rc_react_root__';
// ========================== Render ==========================
type ContainerType = (Element | DocumentFragment) & {
  [MARK]?: MountableElement;
};
const rendererMap = new WeakMap<ContainerType>();

function modernRender(node: JSX.Element, container: ContainerType) {
  // toggleWarning(true);
  const root = container[MARK] || container;
  // toggleWarning(false);

  // root.render(node);
  const dispose = solidRender(node, container);
  rendererMap.set(container, dispose);

  container[MARK] = root;
}

// function legacyRender(node: JSX.Element, container: ContainerType) {
//   reactRender(node, container);
// }

/** @private Test usage. Not work in prod */
export function _r(node: JSX.Element, container: ContainerType) {
  if (process.env.NODE_ENV !== 'production') {
    const dispose = solidRender(node, container);
    rendererMap.set(container, dispose);
    return dispose;
  }
}

export function render(node: JSX.Element, container: ContainerType) {
  // if (createRoot) {
  //   modernRender(node, container);
  //   return;
  // }

  modernRender(node, container);
}

// ========================= Unmount ==========================
async function modernUnmount(container: ContainerType) {
  // Delay to unmount to avoid React 18 sync warning
  return Promise.resolve().then(() => {
    // container[MARK]?.unmount();
    rendererMap.get(container)?.();
    delete container[MARK];
  });
}

// function legacyUnmount(container: ContainerType) {
//   unmountComponentAtNode(container);
// }

/** @private Test usage. Not work in prod */
export function _u(container: ContainerType) {
  if (process.env.NODE_ENV !== 'production') {
    rendererMap.get(container)?.();
    // return legacyUnmount(container);
  }
}

export async function unmount(container: ContainerType) {
  // if (createRoot !== undefined) {
  //   // Delay to unmount to avoid React 18 sync warning
  //   return modernUnmount(container);
  // }
  rendererMap.get(container)?.();
  // legacyUnmount(container);
}
