import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, Show } from "solid-js";
// import { createPortal } from 'react-dom';
import { Portal as PortalSolid } from 'solid-js/web';
import canUseDom from 'rc-util-solid/lib/Dom/canUseDom';
import OrderContext from './Context';
import useDom from './useDom';
import useScrollLocker from './useScrollLocker';
import { inlineMock } from './mock';

export type ContainerType = Element | DocumentFragment;

export type GetContainer =
  | string
  | ContainerType
  | (() => ContainerType)
  | false;

export interface PortalProps {
  /** Customize container element. Default will create a div in document.body when `open` */
  getContainer?: GetContainer;
  children?: JSX.Element;
  /** Show the portal children */
  open?: boolean;
  /** Remove `children` when `open` is `false`. Set `false` will not handle remove process */
  autoDestroy?: boolean;
  /** Lock screen scroll when open */
  autoLock?: boolean;

  /** @private debug name. Do not use in prod */
  debug?: string;
}

const getPortalContainer = (getContainer: GetContainer) => {
  if (getContainer === false) {
    return false;
  }

  if (!canUseDom() || !getContainer) {
    return null;
  }

  if (typeof getContainer === 'string') {
    return document.querySelector(getContainer);
  }
  if (typeof getContainer === 'function') {
    return getContainer();
  }
  return getContainer;
};

export default function Portal(props_: PortalProps) {
  // const {
  //   open,
  //   autoLock,
  //   getContainer,
  //   debug,
  //   autoDestroy = true,
  //   children,
  // } = props;
  const defaultProps = { autoDestroy: true };
  const props = mergeProps(defaultProps, props_);

  const [mergedRender, setMergedRender] = createSignal(props.open);

  // ====================== Should Render ======================
  createEffect(() => {
    
    if (props.autoDestroy || props.open) {
      setMergedRender(props.open);
    }

  }, [props.open, props.autoDestroy]);

  // ======================== Container ========================
  const [innerContainer, setInnerContainer] = createSignal<
    ContainerType | false
  >(getPortalContainer(props.getContainer));

  createEffect(() => {
    const customizeContainer = getPortalContainer(props.getContainer);

    // Tell component that we check this in effect which is safe to be `null`
    setInnerContainer(customizeContainer ?? null);
  });

  const [defaultContainer, queueCreate] = useDom(
    createMemo(() => mergedRender() && !innerContainer()),
    props.debug,
  );
  const mergedContainer = createMemo(() => innerContainer() ?? defaultContainer());

  // ========================= Locker ==========================
  useScrollLocker(createMemo(() => 
    props.autoLock &&
    props.open &&
    canUseDom() &&
    (mergedContainer() === defaultContainer() ||
      mergedContainer() === document.body),
  ));

  // ========================= Render ==========================
  // Do not render when nothing need render
  // When innerContainer is `undefined`, it may not ready since user use ref in the same render
  // if (!mergedRender || !canUseDom() || innerContainer === undefined) {
  //   return null;
  // }

  // Render inline
  // const renderInline = mergedContainer() === false || inlineMock();

  return (
    <Show when={mergedRender() && canUseDom() && innerContainer !== undefined}>
      <OrderContext.Provider value={queueCreate}>
        {mergedContainer() === false || inlineMock()
          ? props.children
          : <PortalSolid mount={mergedContainer() || null}>{props.children}</PortalSolid>}
      </OrderContext.Provider>
    </Show>
  );
}
