import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, onCleanup } from "solid-js";
import classNames from 'classnames';
import KeyCode from 'rc-util-solid/lib/KeyCode';
import useId from 'rc-util-solid/lib/hooks/useId';
import contains from 'rc-util-solid/lib/Dom/contains';
import pickAttrs from 'rc-util-solid/lib/pickAttrs';
import type { IDialogPropTypes } from '../IDialogPropTypes';
import Mask from './Mask';
import { getMotionName } from '../util';
import Content from './Content';
import type { ContentRef } from './Content/Panel';

export default function Dialog(props_: IDialogPropTypes) {
  const defaultProps = {
    prefixCls: 'rc-dialog',
    visible: false,
    keyboard: true,
    focusTriggerAfterClose: true,
    closable: true,
    mask: true,
    maskClosable: true,
  };
  const props = mergeProps(defaultProps, props_);

  let lastOutSideActiveElementRef = null as (HTMLElement | null);
  let wrapperRef = null as (HTMLDivElement | null);
  let contentRef = null as (ContentRef | null);

  const [animatedVisible, setAnimatedVisible] = createSignal(props.visible);

  // ========================== Init ==========================
  const ariaId = useId();

  // ========================= Events =========================
  function onDialogVisibleChanged(newVisible: boolean) {
    if (newVisible) {
      // Try to focus
      if (!contains(wrapperRef, document.activeElement)) {
        lastOutSideActiveElementRef = document.activeElement as HTMLElement;
        contentRef?.focus();
      }
    } else {
      // Clean up scroll bar & focus back
      setAnimatedVisible(false);

      if (props.mask && lastOutSideActiveElementRef && props.focusTriggerAfterClose) {
        try {
          lastOutSideActiveElementRef.focus({ preventScroll: true });
        } catch (e) {
          // Do nothing
        }
        lastOutSideActiveElementRef = null;
      }

      // Trigger afterClose only when change visible from true to false
      if (!animatedVisible()) {
        props.afterClose?.();
      }
    }
  }

  function onInternalClose(e) {
    props.onClose?.(e);
  }

  // >>> Content
  let contentClickRef = false;
  let contentTimeoutRef = null as (NodeJS.Timeout | null);

  // We need record content click incase content popup out of dialog
  const onContentMouseDown = () => {
    clearTimeout(contentTimeoutRef);
    contentClickRef = true;
  };

  const onContentMouseUp = () => {
    contentTimeoutRef = setTimeout(() => {
      contentClickRef = false;
    });
  };

  // >>> Wrapper
  // Close only when element not on dialog
  let onWrapperClick: (e: React.SyntheticEvent) => void = (e) => {
    if (props.maskClosable) {
      if (contentClickRef) {
        contentClickRef = false;
      } else if (wrapperRef === e.target) {
        onInternalClose(e);
      }
    };
  }

  function onWrapperKeyDown(e: KeyboardEvent) {
    if (props.keyboard && e.keyCode === KeyCode.ESC) {
      e.stopPropagation();
      onInternalClose(e);
      return;
    }

    // keep focus inside dialog
    if (props.visible) {
      if (e.keyCode === KeyCode.TAB) {
        contentRef.changeActive(!e.shiftKey);
      }
    }
  }

  // ========================= Effect =========================
  createEffect(() => {
    if (props.visible) {
      setAnimatedVisible(true);
    }
  }, [props.visible]);

  // Remove direct should also check the scroll bar update
  onCleanup(() => {
    clearTimeout(contentTimeoutRef);
  });

  // createEffect(() => {
  //   if (animatedVisible) {
  //     scrollLocker?.lock();
  //     return scrollLocker?.unLock;
  //   }
  //   return () => {};
  // }, [animatedVisible, scrollLocker]);

  // ========================= Render =========================
  return (
    <div
      class={classNames(`${props.prefixCls}-root`, props.rootClassName)}
      {...pickAttrs(props, { data: true })}
    >
      <Mask
        prefixCls={props.prefixCls}
        visible={props.mask && props.visible}
        motionName={getMotionName(props.prefixCls, props.maskTransitionName, props.maskAnimation)}
        style={{
          'z-index': props.zIndex,
          ...props.maskStyle,
        }}
        maskProps={props.maskProps}
      />
      <div
        tabIndex={-1}
        onKeyDown={onWrapperKeyDown}
        class={classNames(`${props.prefixCls}-wrap`, props.wrapClassName)}
        ref={wrapperRef}
        onClick={onWrapperClick}
        style={{ 'z-index': props.zIndex, ...props.wrapStyle, display: !animatedVisible() ? 'none' : null }}
        {...props.wrapProps}
      >
        <Content
          {...props}
          onMouseDown={onContentMouseDown}
          onMouseUp={onContentMouseUp}
          ref={contentRef}
          closable={props.closable}
          ariaId={ariaId}
          prefixCls={props.prefixCls}
          visible={props.visible}
          onClose={onInternalClose}
          onVisibleChanged={onDialogVisibleChanged}
          motionName={getMotionName(props.prefixCls, props.transitionName, props.animation)}
        />
      </div>
    </div>
  );
}
