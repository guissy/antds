import {type Component, type JSX, createEffect, createSignal, createContext, useContext, children as Children, splitProps, Show} from "solid-js";
import { createStore } from 'solid-js/store';
import type { CSSMotionProps } from 'rc-motion-solid';
import createMemo from 'rc-util-solid/lib/hooks/useMemo';
import shallowEqual from 'shallowequal';
import type {
  BuiltinPlacements,
  MenuClickEventHandler,
  MenuMode,
  RenderIconType,
  TriggerSubMenuAction,
} from '../interface';

export interface MenuContextProps {
  prefixCls: string;
  rootClassName?: string;
  openKeys: string[];
  rtl?: boolean;

  // Mode
  mode: MenuMode;

  // Disabled
  disabled?: boolean;
  // Used for overflow only. Prevent hidden node trigger open
  overflowDisabled?: boolean;

  // Active
  activeKey: string;
  onActive: (key: string) => void;
  onInactive: (key: string) => void;

  // Selection
  selectedKeys: string[];

  // Level
  inlineIndent: number;

  // Motion
  motion?: CSSMotionProps;
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>;

  // Popup
  subMenuOpenDelay: number;
  subMenuCloseDelay: number;
  forceSubMenuRender?: boolean;
  builtinPlacements?: BuiltinPlacements;
  triggerSubMenuAction?: TriggerSubMenuAction;

  // Icon
  itemIcon?: RenderIconType;
  expandIcon?: RenderIconType;

  // Function
  onItemClick: MenuClickEventHandler;
  onOpenChange: (key: string, open: boolean) => void;
  getPopupContainer: (node: HTMLElement) => HTMLElement;
}

export const MenuContext = createContext<MenuContextProps>(null);

function mergeProps(
  origin: MenuContextProps,
  target: Partial<MenuContextProps>,
): MenuContextProps {
  const clone = { ...origin };

  Object.keys(target).forEach(key => {
    const value = target[key];
    if (value !== undefined) {
      clone[key] = value;
    }
  });

  return clone;
}

export interface InheritableContextProps extends Partial<MenuContextProps> {
  children?: JSX.Element;
  locked?: boolean;
}

export default function MenuContextProvider(props: InheritableContextProps) {
  const [_, restProps] = splitProps(props, ['locked', 'children']);
  const context = useContext(MenuContext) ?? {} as MenuContextProps;
  const [state, setState] = createStore<MenuContextProps>({} as MenuContextProps);
  createMemo(
    () => {
      const [_, restProps] = splitProps(props, ['locked', 'children']);
      setState(mergeProps(context, restProps));
      // console.log(restProps.openKeys, JSON.stringify(context.openKeys))
    },
    () => {
      const [_, restProps] = splitProps(props, ['locked', 'children']);
      return [context, restProps]
    },
    (prev, next) =>
      !props.locked && (prev[0] !== next[0] || !shallowEqual(prev[1], next[1])),
  );
  return (
    <MenuContext.Provider value={state}>
      <Show when={state?.prefixCls || state?.mode}>
        {props.children}
      </Show>
    </MenuContext.Provider>
  );
}
