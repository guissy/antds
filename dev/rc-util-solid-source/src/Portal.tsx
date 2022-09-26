
import {type ParentComponent, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { Portal as PortalSolid } from "solid-js/web";
import canUseDom from './Dom/canUseDom';

export type PortalRef = {};

export interface PortalProps {
  didUpdate?: (prevProps: PortalProps) => void;
  getContainer: () => HTMLElement | null;
  children?: JSX.Element;
}

const Portal: ParentComponent<PortalProps> = ((props) => {
  // const { didUpdate, getContainer, children } = props;

  let parentRef = null as (ParentNode | null);
  let containerRef = null as (HTMLElement | null);

  // Ref return nothing, only for wrapper check exist
  // useImperativeHandle(ref, () => ({}));

  // Create container in client side with sync to avoid createEffect not get ref
  let initRef = false;
  if (!initRef && canUseDom()) {
    containerRef = props.getContainer();
    if (containerRef) {
      parentRef = containerRef.parentNode;
    }
    initRef = true;
  }

  // [Legacy] Used by `rc-trigger`
  createEffect(() => {
    props.didUpdate?.(props);
  }, []);

  createEffect(() => {
    // Restore container to original place
    // React 18 StrictMode will unmount first and mount back for effect test:
    // https://reactjs.org/blog/2022/03/29/react-v18.html#new-strict-mode-behaviors
    if (
      containerRef?.parentNode === null &&
      parentRef !== null
    ) {
      parentRef.appendChild(containerRef);
    }
    return () => {
      // [Legacy] This should not be handle by Portal but parent PortalWrapper instead.
      // Since some component use `Portal` directly, we have to keep the logic here.
      containerRef?.parentNode?.removeChild(containerRef);
    };
  }, []);

  return containerRef
    ? <PortalSolid mount={containerRef}>{props.children}</PortalSolid>
    : null;
});

export default Portal;
