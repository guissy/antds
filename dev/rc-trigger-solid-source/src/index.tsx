import { type Component, type JSX, mergeProps, createEffect, createSignal, createContext, createMemo, useContext, children as Children, onCleanup, Show, on, } from "solid-js";
import raf from 'rc-util-solid/lib/raf';
import contains from 'rc-util-solid/lib/Dom/contains';
import findDOMNode from 'rc-util-solid/lib/Dom/findDOMNode';
import type { CSSMotionProps } from 'rc-motion-solid';
import addEventListener from 'rc-util-solid/lib/Dom/addEventListener';
import Portal from 'rc-util-solid/lib/Portal';
import classNames from 'classnames';

import {
  getAlignFromPlacement,
  getAlignPopupClassName,
} from './utils/alignUtil';
import Popup from './Popup';
import type { PopupInnerRef } from './Popup/PopupInner';
import TriggerContext from './context';
import type {
  ActionType,
  AlignType,
  TransitionNameType,
  AnimationType,
  Point,
  CommonEventHandler,
  MobileConfig,
} from './interface';
import type { BuildInPlacements } from './interface';
import { spread } from "solid-js/web";

function noop() { }

function returnEmptyString() {
  return '';
}

function returnDocument(element?: HTMLElement) {
  if (element) {
    return element.ownerDocument;
  }
  return window.document;
}

const ALL_HANDLERS = [
  'onClick',
  'onMouseDown',
  'onTouchStart',
  'onMouseEnter',
  'onMouseLeave',
  'onFocus',
  'onBlur',
  'onContextMenu',
];

export interface TriggerProps {
  children: JSX.Element;
  action?: ActionType | ActionType[];
  showAction?: ActionType[];
  hideAction?: ActionType[];
  getPopupClassNameFromAlign?: (align: AlignType) => string;
  onPopupVisibleChange?: (visible: boolean) => void;
  onPopupClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  afterPopupVisibleChange?: (visible: boolean) => void;
  popup: JSX.Element | (() => JSX.Element);
  popupStyle?: JSX.CSSProperties;
  prefixCls?: string;
  popupClassName?: string;
  className?: string;
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  focusDelay?: number;
  blurDelay?: number;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
  getDocument?: (element?: HTMLElement) => HTMLDocument;
  forceRender?: boolean;
  destroyPopupOnHide?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  onPopupAlign?: (element: HTMLElement, align: AlignType) => void;
  popupAlign?: AlignType;
  popupVisible?: boolean;
  defaultPopupVisible?: boolean;
  autoDestroy?: boolean;

  stretch?: string;
  alignPoint?: boolean; // Maybe we can support user pass position in the future

  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps;
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps;

  /** @deprecated Please us `popupMotion` instead. */
  popupTransitionName?: TransitionNameType;
  /** @deprecated Please us `popupMotion` instead. */
  popupAnimation?: AnimationType;
  /** @deprecated Please us `maskMotion` instead. */
  maskTransitionName?: TransitionNameType;
  /** @deprecated Please us `maskMotion` instead. */
  maskAnimation?: string;

  /**
   * @private Get trigger DOM node.
   * Used for some component is function component which can not access by `findDOMNode`
   */
  getTriggerDOMNode?: (node: JSX.Element) => HTMLElement;

  // ========================== Mobile ==========================
  /** @private Bump fixed position at bottom in mobile.
   * This is internal usage currently, do not use in your prod */
  mobile?: MobileConfig;
}

interface TriggerState {
  prevPopupVisible: boolean;
  popupVisible: boolean;
  point?: Point;
}

/**
 * Internal usage. Do not use in your code since this will be removed.
 */
export function generateTrigger(
  PortalComponent: any,
): Component<TriggerProps> {
  // class Trigger extends React.Component<TriggerProps, TriggerState> {
  const Trigger: Component<TriggerProps> = (props_) => {
    // static contextType = TriggerContext;

    const defaultProps = {
      prefixCls: 'rc-trigger-popup',
      getPopupClassNameFromAlign: returnEmptyString,
      getDocument: returnDocument,
      onPopupVisibleChange: noop,
      afterPopupVisibleChange: noop,
      onPopupAlign: noop,
      popupClassName: '',
      mouseEnterDelay: 0,
      mouseLeaveDelay: 0.1,
      focusDelay: 0,
      blurDelay: 0.15,
      popupStyle: {},
      destroyPopupOnHide: false,
      popupAlign: {},
      defaultPopupVisible: false,
      mask: false,
      maskClosable: true,
      action: [],
      showAction: [],
      hideAction: [],
      autoDestroy: false,
    };
    const props = mergeProps(defaultProps, props_)

    let popupRef: PopupInnerRef;

    let triggerRef: JSX.Element;

    // ensure `getContainer` will be called only once
    let portalContainer: HTMLElement;

    let attachId: number;

    let clickOutsideHandler: CommonEventHandler;

    let touchOutsideHandler: CommonEventHandler;

    let contextMenuOutsideHandler1: CommonEventHandler;

    let contextMenuOutsideHandler2: CommonEventHandler;

    let mouseDownTimeout: number;

    let focusTime: number;

    let preClickTime: number;

    let preTouchTime: number;

    let delayTimer: number;

    let hasPopupMouseDown: boolean;


    let popupVisibleInit: boolean;
    if (props.popupVisible !== undefined) {
      popupVisibleInit = !!props.popupVisible;
    } else {
      popupVisibleInit = !!props.defaultPopupVisible;
    }
    // TODO: solid
    // popupVisibleInit = true;
    const [prevPopupVisible, setPrevPopupVisible] = createSignal(popupVisibleInit);
    const [popupVisible, setPopupVisibleRaw] = createSignal(popupVisibleInit);
    const [point, setPointRaw] = createSignal({ pageX: 0, pageY: 0 });


    const onMouseEnter = (e) => {
      // const { mouseEnterDelay } = props;
      fireEvents('onMouseEnter', e);
      delaySetPopupVisible(
        true,
        props.mouseEnterDelay,
        props.mouseEnterDelay ? null : e,
      );
    };

    const onMouseMove = (e) => {
      fireEvents('onMouseMove', e);
      setPoint(e);
    };

    const onMouseLeave = (e) => {
      fireEvents('onMouseLeave', e);
      delaySetPopupVisible(false, props.mouseLeaveDelay);
    };

    const onPopupMouseEnter = () => {
      clearDelayTimer();
    };

    const onPopupMouseLeave = (e) => {
      // https://github.com/react-component/trigger/pull/13
      // react bug?
      if (
        e.relatedTarget &&
        !e.relatedTarget.setTimeout &&
        contains(popupRef?.getElement(), e.relatedTarget)
      ) {
        return;
      }
      delaySetPopupVisible(false, props.mouseLeaveDelay);
    };

    const onFocus = (e) => {
      fireEvents('onFocus', e);
      // incase focusin and focusout
      clearDelayTimer();
      if (isFocusToShow()) {
        focusTime = Date.now();
        delaySetPopupVisible(true, props.focusDelay);
      }
    };

    const onMouseDown = (e) => {
      fireEvents('onMouseDown', e);
      preClickTime = Date.now();
    };

    const onTouchStart = (e) => {
      fireEvents('onTouchStart', e);
      preTouchTime = Date.now();
    };

    const onBlur = (e) => {
      fireEvents('onBlur', e);
      clearDelayTimer();
      if (isBlurToHide()) {
        delaySetPopupVisible(false, props.blurDelay);
      }
    };

    const onContextMenu = (e) => {
      e.preventDefault();
      fireEvents('onContextMenu', e);
      setPopupVisible(true, e);
    };

    const onContextMenuClose = () => {
      if (isContextMenuToShow()) {
        close();
      }
    };

    const onClick = (event) => {
      fireEvents('onClick', event);
      // focus will trigger click
      if (focusTime) {
        let preTime;
        if (preClickTime && preTouchTime) {
          preTime = Math.min(preClickTime, preTouchTime);
        } else if (preClickTime) {
          preTime = preClickTime;
        } else if (preTouchTime) {
          preTime = preTouchTime;
        }
        if (Math.abs(preTime - focusTime) < 20) {
          return;
        }
        focusTime = 0;
      }
      preClickTime = 0;
      preTouchTime = 0;

      // Only prevent default when all the action is click.
      // https://github.com/ant-design/ant-design/issues/17043
      // https://github.com/ant-design/ant-design/issues/17291
      if (
        isClickToShow() &&
        (isClickToHide() || isBlurToHide()) &&
        event &&
        event.preventDefault
      ) {
        event.preventDefault();
      }
      const nextVisible = !popupVisible();
      if (
        (isClickToHide() && !nextVisible) ||
        (nextVisible && isClickToShow())
      ) {
        setPopupVisible(!popupVisible(), event);
      }
    };

    const onPopupMouseDown = (...args) => {
      hasPopupMouseDown = true;

      clearTimeout(mouseDownTimeout);
      mouseDownTimeout = window.setTimeout(() => {
        hasPopupMouseDown = false;
      }, 0);

      // TODO: context.onPopupMouseDown
      // if (context) {
      //   context.onPopupMouseDown(...args);
      // }
    };

    const onDocumentClick = (event) => {
      if (props.mask && !props.maskClosable) {
        return;
      }

      const { target } = event;
      const root = getRootDomNode();
      const popupNode = getPopupDomNode();
      if (
        // mousedown on the target should also close popup when action is contextMenu.
        // https://github.com/ant-design/ant-design/issues/29853
        (!contains(root, target) || isContextMenuOnly()) &&
        !contains(popupNode, target) &&
        !hasPopupMouseDown
      ) {
        close();
      }
    };

    const fireObj = {} as { [k: string]: (e) => void }
    ALL_HANDLERS.forEach((h) => {
      fireObj[`fire${h}`] = (e) => {
        fireEvents(h, e);
      };
    });

    // nextProps, preState
    // static getDerivedStateFromProps({ popupVisible }: TriggerProps, prevState: TriggerState) {
    //   const newState: Partial<TriggerState> = {};
    //   if (
    //     popupVisible !== undefined &&
    //     prevState.popupVisible !== popupVisible
    //   ) {
    //     newState.popupVisible = popupVisible;
    //     newState.prevPopupVisible = prevState.popupVisible;
    //   }
    //   return newState;
    // }
    createEffect(on(() => props.popupVisible, () => {
      setPopupVisibleRaw(popupVisiblePrev => {
        const shouldUpdate = props.popupVisible !== undefined && popupVisiblePrev !== props.popupVisible;
        if (shouldUpdate) {
          setPrevPopupVisible(popupVisiblePrev);
        }
        return shouldUpdate ? props.popupVisible! : popupVisiblePrev
      });
    }))

    const getPopupDomNode = () => {
      // for test
      return popupRef?.getElement() || null;
    }

    const getRootDomNode = (): HTMLElement => {
      // const { getTriggerDOMNode } = props;
      if (props.getTriggerDOMNode) {
        return props.getTriggerDOMNode(triggerRef);
      }

      try {
        const domNode = findDOMNode<HTMLElement>(triggerRef);
        if (domNode) {
          return domNode;
        }
      } catch (err) {
        // Do nothing
      }

      // return ReactDOM.findDOMNode(this) as HTMLElement;
      // TODO: Children(() => props.children)
      return window.document.documentElement;
    };

    const getPopupClassNameFromAlign = (align) => {
      const className = [];
      // const {
      //   popupPlacement,
      //   builtinPlacements,
      //   prefixCls,
      //   alignPoint,
      //   getPopupClassNameFromAlign,
      // } = props;
      if (props.popupPlacement && props.builtinPlacements) {
        className.push(
          getAlignPopupClassName(
            props.builtinPlacements,
            props.prefixCls,
            align,
            props.alignPoint,
          ),
        );
      }
      if (props.getPopupClassNameFromAlign) {
        className.push(props.getPopupClassNameFromAlign(align));
      }
      return className.join(' ');
    };

    const getPopupAlign = () => {
      // const { props } = this;
      // const { popupPlacement, popupAlign, builtinPlacements } = props;
      if (props.popupPlacement && props.builtinPlacements) {
        return getAlignFromPlacement(
          props.builtinPlacements,
          props.popupPlacement,
          props.popupAlign,
        );
      }
      return props.popupAlign;
    }

    const attachParent = (popupContainer: HTMLElement) => {
      raf.cancel(attachId);

      // const { getPopupContainer, getDocument } = props;
      const domNode = getRootDomNode();

      let mountNode: HTMLElement;
      if (!props.getPopupContainer) {
        mountNode = props.getDocument(getRootDomNode()).body;
      } else if (domNode || props.getPopupContainer.length === 0) {
        // Compatible for legacy getPopupContainer with domNode argument.
        // If no need `domNode` argument, will call directly.
        // https://codesandbox.io/s/eloquent-mclean-ss93m?file=/src/App.js
        mountNode = props.getPopupContainer(domNode);
      }

      if (mountNode) {
        mountNode.appendChild(popupContainer);
      } else {
        // Retry after frame render in case parent not ready
        attachId = raf(() => {
          attachParent(popupContainer);
        });
      }
    };

    const getContainer = () => {
      if (!portalContainer) {
        // In React.StrictMode component will call render multiple time in first mount.
        // When you want to refactor with FC, useRef will also init multiple time and
        // point to different useRef instance which will create multiple element
        // (This multiple render will not trigger effect so you can not clean up this
        // in effect). But this is safe with class component since it always point to same class instance.
        // const { getDocument } = props;
        const popupContainer = props.getDocument(getRootDomNode()).createElement(
          'div',
        );
        // Make sure default popup container will never cause scrollbar appearing
        // https://github.com/react-component/trigger/issues/41
        popupContainer.style.position = 'absolute';
        popupContainer.style.top = '0';
        popupContainer.style.left = '0';
        popupContainer.style.width = '100%';

        portalContainer = popupContainer;
      }

      attachParent(portalContainer);
      return portalContainer;
    };

    /**
     * @param popupVisible    Show or not the popup element
     * @param event           SyntheticEvent, used for `pointAlign`
     */
    const setPopupVisible = (
      popupVisible: boolean,
      event?: { pageX: number; pageY: number },
    ) => {
      // const { alignPoint } = props;
      // const { popupVisible: prevPopupVisible } = state;

      clearDelayTimer();

      setPopupVisibleRaw((prevPopupVisible) => {
        let visible = prevPopupVisible;
        if (prevPopupVisible !== popupVisible) {
          // if (props.popupVisible === undefined) {
            // setState({ popupVisible, prevPopupVisible });
            setPrevPopupVisible(prevPopupVisible);
            visible = popupVisible;
          // }
          props.onPopupVisibleChange(popupVisible);
        }

        return visible;
      })

      // Always record the point position since mouseEnterDelay will delay the show
      if (props.alignPoint && event && popupVisible) {
        setPoint(event);
      }
    }

    const setPoint = (point) => {
      // const { alignPoint } = props;
      if (!props.alignPoint || !point) return;

      setPointRaw({
        pageX: point.pageX,
        pageY: point.pageY
      });
    };

    createEffect(() => {
      if (prevPopupVisible() !== popupVisible()) {
        props.afterPopupVisibleChange(popupVisible());
      }
    });

    const delaySetPopupVisible = (visible: boolean, delayS: number, event?: MouseEvent) => {
      const delay = delayS * 1000;
      clearDelayTimer();
      if (delay) {
        const point = event ? { pageX: event.pageX, pageY: event.pageY } : null;
        delayTimer = window.setTimeout(() => {
          setPopupVisible(visible, point);
          clearDelayTimer();
        }, delay);
      } else {
        setPopupVisible(visible, event);
      }
    }

    const clearDelayTimer = () => {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
    }

    const clearOutsideHandler = () => {
      if (clickOutsideHandler) {
        clickOutsideHandler.remove();
        clickOutsideHandler = null;
      }

      if (contextMenuOutsideHandler1) {
        contextMenuOutsideHandler1.remove();
        contextMenuOutsideHandler1 = null;
      }

      if (contextMenuOutsideHandler2) {
        contextMenuOutsideHandler2.remove();
        contextMenuOutsideHandler2 = null;
      }

      if (touchOutsideHandler) {
        touchOutsideHandler.remove();
        touchOutsideHandler = null;
      }
    }

    const createTwoChains = (event: string) => {
      const childPros = props;
      // const childPros = props.children.props;
      // const { props } = this;
      if (childPros[event] && props[event]) {
        return fireObj[`fire${event}`];
      }
      return childPros[event] || props[event];
    }

    const isClickToShow = () => {
      // const { action, showAction } = props;
      return (
        props.action.indexOf('click') !== -1 || props.showAction.indexOf('click') !== -1
      );
    }

    const isContextMenuOnly = () => {
      // const { action } = props;
      return (
        props.action === 'contextMenu' ||
        (props.action.length === 1 && props.action[0] === 'contextMenu')
      );
    }

    const isContextMenuToShow = () => {
      // const { action, showAction } = props;
      return (
        props.action.indexOf('contextMenu') !== -1 ||
        props.showAction.indexOf('contextMenu') !== -1
      );
    }

    const isClickToHide = () => {
      // const { action, hideAction } = props;
      return (
        props.action.indexOf('click') !== -1 || props.hideAction.indexOf('click') !== -1
      );
    }

    const isMouseEnterToShow = () => {
      // const { action, showAction } = props;
      return (
        props.action.indexOf('hover') !== -1 ||
        props.showAction.indexOf('mouseEnter') !== -1
      );
    }

    const isMouseLeaveToHide = () => {
      // const { action, hideAction } = props;
      return (
        props.action.indexOf('hover') !== -1 ||
        props.hideAction.indexOf('mouseLeave') !== -1
      );
    }

    const isFocusToShow = () => {
      // const { action, showAction } = props;
      return (
        props.action.indexOf('focus') !== -1 || props.showAction.indexOf('focus') !== -1
      );
    }

    const isBlurToHide = () => {
      // const { action, hideAction } = props;
      return (
        props.action.indexOf('focus') !== -1 || props.hideAction.indexOf('blur') !== -1
      );
    }

    const forcePopupAlign = () => {
      if (popupVisible()) {
        popupRef?.forceAlign();
      }
    }

    const fireEvents = (type: string, e: Event) => {
      // TODO: child callback
      // const childCallback = (props.children as JSX.Element).props[
      //   type
      // ];
      // if (childCallback) {
      //   childCallback(e);
      // }
      const callback = props[type];
      if (callback) {
        callback(e);
      }
    }

    const close = () => {
      setPopupVisible(false);
    }
   
    // componentDidUpdate
    createEffect(() => {
      // const { props } = this;
      // const { state } = this;

      // We must listen to `mousedown` or `touchstart`, edge case:
      // https://github.com/ant-design/ant-design/issues/5804
      // https://github.com/react-component/calendar/issues/250
      // https://github.com/react-component/trigger/issues/50
      if (popupVisible()) {
        let currentDocument;
        if (
          !clickOutsideHandler &&
          (isClickToHide() || isContextMenuToShow())
        ) {
          currentDocument = props.getDocument(getRootDomNode());
          clickOutsideHandler = addEventListener(
            currentDocument,
            'mousedown',
            onDocumentClick,
          );
        }
        // always hide on mobile
        if (!touchOutsideHandler) {
          currentDocument =
            currentDocument || props.getDocument(getRootDomNode());
          touchOutsideHandler = addEventListener(
            currentDocument,
            'touchstart',
            onDocumentClick,
          );
        }
        // close popup when trigger type contains 'onContextMenu' and document is scrolling.
        if (!contextMenuOutsideHandler1 && isContextMenuToShow()) {
          currentDocument =
            currentDocument || props.getDocument(getRootDomNode());
          contextMenuOutsideHandler1 = addEventListener(
            currentDocument,
            'scroll',
            onContextMenuClose,
          );
        }
        // close popup when trigger type contains 'onContextMenu' and window is blur.
        if (!contextMenuOutsideHandler2 && isContextMenuToShow()) {
          contextMenuOutsideHandler2 = addEventListener(
            window,
            'blur',
            onContextMenuClose,
          );
        }
        return;
      }

      clearOutsideHandler();
    });

    onCleanup(() => {
      clearDelayTimer();
      clearOutsideHandler();
      clearTimeout(mouseDownTimeout);
      raf.cancel(attachId);
    })

    const triggerContextValue = { onPopupMouseDown };
    props.ref?.({
      getPopupDomNode,
      getRootDomNode,
      onDocumentClick,
      props // TODO: solid jest
    });
    // ======================== Render ========================

    // const { popupVisible } = state;
    // const { children, forceRender, alignPoint, className, autoDestroy } =
    //   props;
    // const child = React.Children.only(children) as JSX.Element;

    // const trigger = child; //React.cloneElement(child, cloneProps);
    let portal = createMemo((lastPortal: boolean) => {
      // prevent unmounting after it's rendered
      let portal: boolean = lastPortal;
      if (popupVisible() || popupRef || props.forceRender) {
        portal = true;
      }

      if (!popupVisible() && props.autoDestroy) {
        portal = false;
      }
      return portal;
    });

    const mouseProps = () => {
      const mouseProps: JSX.HTMLAttributes<HTMLElement> = {};
      if (isMouseEnterToShow()) {
        mouseProps.onMouseEnter = onPopupMouseEnter;
      }
      if (isMouseLeaveToHide()) {
        mouseProps.onMouseLeave = onPopupMouseLeave;
      }

      mouseProps.onMouseDown = onPopupMouseDown;
      mouseProps.onTouchStart = onPopupMouseDown;
      return mouseProps;
    }
    return (
      <TriggerContext.Provider value={triggerContextValue}>
        {() => {
          const newChildProps: JSX.HTMLAttributes<HTMLElement> & { key?: string } = {
            // key: 'trigger',
          };

          // ============================== Visible Handlers ==============================
          // >>> ContextMenu
          if (isContextMenuToShow()) {
            newChildProps.onContextMenu = onContextMenu;
          } else {
            newChildProps.onContextMenu = createTwoChains('onContextMenu');
          }

          // >>> Click
          if (isClickToHide() || isClickToShow()) {
            newChildProps.onClick = onClick;
            newChildProps.onMouseDown = onMouseDown;
            newChildProps.onTouchStart = onTouchStart;
          } else {
            newChildProps.onClick = createTwoChains('onClick');
            newChildProps.onMouseDown = createTwoChains('onMouseDown');
            newChildProps.onTouchStart = createTwoChains('onTouchStart');
          }

          // >>> Hover(enter)
          if (isMouseEnterToShow()) {
            newChildProps.onMouseEnter = onMouseEnter;

            // Point align
            if (props.alignPoint) {
              newChildProps.onMouseMove = onMouseMove;
            }
          } else {
            newChildProps.onMouseEnter = createTwoChains('onMouseEnter');
          }

          // >>> Hover(leave)
          if (isMouseLeaveToHide()) {
            newChildProps.onMouseLeave = onMouseLeave;
          } else {
            newChildProps.onMouseLeave = createTwoChains('onMouseLeave');
          }

          // >>> Focus
          if (isFocusToShow() || isBlurToHide()) {
            newChildProps.onFocus = onFocus;
            newChildProps.onBlur = onBlur;
          } else {
            newChildProps.onFocus = createTwoChains('onFocus');
            newChildProps.onBlur = createTwoChains('onBlur');
          }

          // =================================== Render ===================================
          const trigger: HTMLElement = Children(() => props.children)() as HTMLElement;
          const childrenClassName = classNames(
            trigger.className,
            props.className,
          );
          if (childrenClassName) {
            newChildProps['class'] = childrenClassName;
          }

          // const clonedProps: any = {
          //   ...newChildProps,
          // };
          // if (supportRef(props.children)) {
          //   cloneProps.ref = composeRef(triggerRef, (child as any).ref);
          // }
          triggerRef = trigger;
          if (Array.isArray(trigger)) {
            // TODO: solid
            spread(trigger.filter(Boolean)[0], newChildProps);
          } else {
            spread(trigger, newChildProps);
          }
          return trigger;
        }}
        <Show when={portal()}>
          <Portal getContainer={getContainer}>
            <Popup
              prefixCls={props.prefixCls}
              destroyPopupOnHide={props.destroyPopupOnHide}
              visible={popupVisible()}
              point={props.alignPoint && point()}
              className={props.popupClassName}
              align={getPopupAlign()}
              onAlign={props.onPopupAlign}
              animation={props.popupAnimation}
              getClassNameFromAlign={getPopupClassNameFromAlign}
              {...mouseProps()}
              stretch={props.stretch}
              getRootDomNode={getRootDomNode}
              style={props.popupStyle}
              mask={props.mask}
              zIndex={props.zIndex}
              transitionName={props.popupTransitionName}
              maskAnimation={props.maskAnimation}
              maskTransitionName={props.maskTransitionName}
              maskMotion={props.maskMotion}
              ref={popupRef}
              motion={props.popupMotion}
              mobile={props.mobile}
              forceRender={props.forceRender}
              onClick={props.onPopupClick}
            >
              {props.popup}
            </Popup>
          </Portal>
        </Show>
      </TriggerContext.Provider>
    );
  }


  return Trigger;
}

export { BuildInPlacements };

export default generateTrigger(Portal);
