import {type Component, type ParentComponent, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps, onMount, onCleanup} from "solid-js";
import raf from './raf';
import Portal, { PortalRef } from './Portal';
import canUseDom from './Dom/canUseDom';
import switchScrollingEffectFn from './switchScrollingEffect';
import setStyle from './setStyle';
import ScrollLocker from './Dom/scrollLocker';

let openCount = 0;
const supportDom = canUseDom();

export function getOpenCount() {
  return process.env.NODE_ENV === 'test' ? openCount : 0;
}
let cacheOverflow = {};
export type GetContainer = string | HTMLElement | (() => HTMLElement | null);

export interface PortalWrapperProps {
  visible?: boolean;
  getContainer?: GetContainer;
  wrapperClassName?: string;
  forceRender?: boolean;
  children: (info: {
    getOpenCount: () => number;
    getContainer: () => HTMLElement;
    switchScrollingEffect: () => void;
    scrollLocker: ScrollLocker;
    ref?: (c: any) => void;
  }) => React.ReactNode;
}

const getParent = (getContainer?: GetContainer) => {
  if (!supportDom) {
    return null;
  }

  if (getContainer) {
    if (typeof getContainer === "string") {
      return document.querySelectorAll(getContainer)[0];
    }

    if (typeof getContainer === "function") {
      return getContainer();
    }

    if (typeof getContainer === "object" && getContainer instanceof window.HTMLElement) {
      return getContainer;
    }
  }

  return document.body;
};

const PortalWrapper: ParentComponent<PortalWrapperProps> = (props) => {
  // const {
  //   children,
  //   forceRender,
  //   visible
  // } = this.props;
  let container: HTMLElement;

  let componentRef: PortalRef = null;

  let rafId: number;

  let scrollLocker: ScrollLocker = new ScrollLocker({
    container: getParent(props.getContainer) as HTMLElement,
  });

  let renderComponent: (info: {
    afterClose: Function;
    onClose: Function;
    visible: boolean;
  }) => void;

  const updateScrollLocker = (prevProps?: Partial<PortalWrapperProps>) => {
    // const { visible: prevVisible } = prevProps || {};
    // const { getContainer, visible } = this.props;

    if (
      props.visible &&
      props.visible !== prevProps?.visible &&
      supportDom &&
      getParent(props.getContainer) !== scrollLocker.getContainer()
    ) {
      scrollLocker.reLock({
        container: getParent(props.getContainer) as HTMLElement,
      });
    }
  };

  const updateOpenCount = (prevProps?: Partial<PortalWrapperProps>) => {
    // const { visible: prevVisible, getContainer: prevGetContainer } =
    //   prevProps || {};
    // const { visible, getContainer } = this.props;

    // Update count
    if (
      props.visible !== prevProps?.visible &&
      supportDom &&
      getParent(getContainer) === document.body
    ) {
      if (props.visible && !prevProps?.visible) {
        openCount += 1;
      } else if (prevProps) {
        openCount -= 1;
      }
    }

    // Clean up container if needed
    const getContainerIsFunc =
      typeof props.getContainer === 'function' &&
      typeof prevProps?.getContainer === 'function';
    if (
      getContainerIsFunc
        ? props.getContainer?.toString() !== prevProps?.getContainer?.toString()
        : props.getContainer !== prevProps?.getContainer
    ) {
      removeCurrentContainer();
    }
  };

  const attachToParent = (force = false) => {
    if (force || (container && !container.parentNode)) {
      const parent = getParent(props.getContainer);
      if (parent) {
        parent.appendChild(container);
        return true;
      }

      return false;
    }

    return true;
  };

const getContainer = () => {
    if (!supportDom) {
      return null;
    }
    if (!container) {
      container = document.createElement('div');
      attachToParent(true);
    }
    setWrapperClassName();
    return container;
  };

  const setWrapperClassName = () => {
    // const { wrapperClassName } = this.props;
    if (
      container &&
      props.wrapperClassName &&
      props.wrapperClassName !== container.className
    ) {
      container.className = props.wrapperClassName;
    }
  };

  const removeCurrentContainer = () => {
    // Portal will remove from `parentNode`.
    // Let's handle this again to avoid refactor issue.
    container?.parentNode?.removeChild(container);
  };

  /**
   * Enhance ./switchScrollingEffect
   * 1. Simulate document body scroll bar with
   * 2. Record body has overflow style and recover when all of PortalWrapper invisible
   * 3. Disable body scroll when PortalWrapper has open
   *
   * @memberof PortalWrapper
   */
   const switchScrollingEffect = () => {
    if (openCount === 1 && !Object.keys(cacheOverflow).length) {
      switchScrollingEffectFn();
      // Must be set after switchScrollingEffect
      cacheOverflow = setStyle({
        overflow: 'hidden',
        overflowX: 'hidden',
        overflowY: 'hidden',
      });
    } else if (!openCount) {
      setStyle(cacheOverflow);
      cacheOverflow = {};
      switchScrollingEffectFn(true);
    }
  };

  onMount(() => {
    updateOpenCount();

    if (!attachToParent()) {
      rafId = raf(() => {
        // TODO: forceUpdate
        // forceUpdate();
      });
    }
  });

  onCleanup(() => {
    // const { visible, getContainer } = this.props;
    if (supportDom && getParent(props.getContainer) === document.body) {
      // 离开时不会 render， 导到离开时数值不变，改用 func 。。
      openCount = props.visible && openCount ? openCount - 1 : openCount;
    }
    removeCurrentContainer();
    raf.cancel(rafId);
  })

  createEffect((prevProps) => {
    updateOpenCount(prevProps);
    updateScrollLocker(prevProps);

    setWrapperClassName();
    attachToParent();
  }, [props])

  // const { children, forceRender, visible } = this.props;
  let portal = null;
  const childProps = {
    getOpenCount: () => openCount,
    getContainer,
    switchScrollingEffect,
    scrollLocker,
  };

  if (props.forceRender || props.visible || componentRef) {
    portal = (
      <Portal getContainer={getContainer} ref={componentRef}>
        {props.children(childProps)}
      </Portal>
    );
  }
  return portal;
}

export default PortalWrapper;