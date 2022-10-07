import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { MenuContext, MenuContextProps } from '../context/MenuContext';
import type { MenuHoverEventHandler } from '../interface';

interface ActiveObj {
  active: boolean;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
}

export default function useActive(
  eventKey: string,
  disabled: boolean,
  onMouseEnter?: MenuHoverEventHandler,
  onMouseLeave?: MenuHoverEventHandler,
): ActiveObj {
  // const {
  //   // Active
  //   activeKey,
  //   onActive,
  //   onInactive,
  // }
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  const ret: ActiveObj = {
    active: context.activeKey === eventKey,
  };

  // Skip when disabled
  if (!disabled) {
    ret.onMouseEnter = domEvent => {
      onMouseEnter?.({
        key: eventKey,
        domEvent,
      });
      context.onActive(eventKey);
    };
    ret.onMouseLeave = domEvent => {
      onMouseLeave?.({
        key: eventKey,
        domEvent,
      });
      context.onInactive(eventKey);
    };
  }

  return ret;
}
