import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, Accessor, on} from "solid-js";
import KeyCode from 'rc-util-solid/lib/KeyCode';
import raf from 'rc-util-solid/lib/raf';
import { getFocusNodeList } from 'rc-util-solid/lib/Dom/focus';

const { ESC, TAB } = KeyCode;

interface UseAccessibilityProps {
  visible: Accessor<boolean>;
  setTriggerVisible: (visible: boolean) => void;
  triggerRef: React.RefObject<any>;
  onVisibleChange?: (visible: boolean) => void;
  autoFocus?: boolean;
}

export default function useAccessibility({
  visible,
  setTriggerVisible,
  triggerRef,
  onVisibleChange,
  autoFocus,
}: UseAccessibilityProps) {
  let focusMenuRef  = false as boolean;

  const handleCloseMenuAndReturnFocus = () => {

    if (visible() && triggerRef) {
      
      triggerRef?.triggerRef?.focus?.();
      setTriggerVisible(false);
      if (typeof onVisibleChange === 'function') {
        onVisibleChange(false);
      }
    }
  };

  const focusMenu = () => {
    
    if (triggerRef?.popupRef?.getElement?.()) {
      const elements = getFocusNodeList(triggerRef?.popupRef?.getElement?.());
      const firstElement = elements[0];
  
      if (firstElement?.focus) {
        firstElement.focus();
        focusMenuRef = true;
        return true;
      }
    }
    return false;
  };

  const handleKeyDown = (event) => {
    switch (event.keyCode) {
      case ESC:
        handleCloseMenuAndReturnFocus();
        break;
      case TAB: {
        let focusResult: boolean = false;
        if (!focusMenuRef) {
          focusResult = focusMenu();
        }

        if (focusResult) {
          event.preventDefault();
        } else {
          handleCloseMenuAndReturnFocus();
        }
        break;
      }
    }
  };

  createEffect(on(visible, () => {
    if (visible()) {
      window.addEventListener('keydown', handleKeyDown);
      if (autoFocus) {        
        // FIXME: hack with raf
        raf(focusMenu, 3);
      }
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        focusMenuRef = false;
      };
    }
    return () => {
      focusMenuRef = false;
    };
  })); // eslint-disable-line react-hooks/exhaustive-deps
}
