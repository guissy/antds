import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { spread } from 'solid-js/web';
import CSSMotion from 'rc-motion-solid';
import classNames from 'classnames';
import type { PopupInnerProps, PopupInnerRef } from './PopupInner';
import type { MobileConfig } from '../interface';

interface MobilePopupInnerProps extends PopupInnerProps {
  mobile?: MobileConfig;
}

const MobilePopupInner: Component<MobilePopupInnerProps> = (props) => {
    // const {
    //   prefixCls,
    //   visible,
    //   zIndex,
    //   children,
    //   mobile: {
    //     popupClassName,
    //     popupStyle,
    //     popupMotion = {},
    //     popupRender,
    //   } = {},
    //   onClick,
    // } = props;
    let elementRef  = null as (HTMLDivElement | null);

    // ========================= Refs =========================
    props.ref?.({
      forceAlign: () => {},
      getElement: () => elementRef,
    });

    // ======================== Render ========================
    const mergedStyle: JSX.CSSProperties & { 'z-index': number } = {
      'z-index': props.zIndex,
      ...props.mobile?.popupStyle,
    };
    const resolved = Children(() => props.children)
    let childNode: HTMLElement | JSX.Element = resolved() as HTMLElement;

    // Wrapper when multiple children
    if (resolved.toArray().length > 1) {
      childNode = <div class={`${props.prefixCls}-content`}>{childNode}</div>;
    }

    // Mobile support additional render
    if (props.mobile?.popupRender) {
      childNode = props.mobile.popupRender(childNode as JSX.Element);
    }

    return (
      <CSSMotion
        visible={props.visible}
        ref={elementRef}
        removeOnLeave
        {...props.mobile?.popupMotion}
      >
        {(motion: { className, style }) => {
          return (
            <div
              class={classNames(
                props.prefixCls,
                props.mobile?.popupClassName,
                motion.className,
              )}
              onClick={props.onClick}
              style={{
                ...motion.style,
                ...mergedStyle,
              }}
            >
              {childNode}
            </div>
          );
        }}
      </CSSMotion>
    );
  };

;(MobilePopupInner as unknown as { displayName: string }).displayName = 'MobilePopupInner';

export default MobilePopupInner;
