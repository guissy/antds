import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import classNames from 'classnames';
import { MenuContext, MenuContextProps } from './context/MenuContext';
import { useMeasure } from './context/PathContext';
import type { MenuDividerType } from './interface';

export type DividerProps = Omit<MenuDividerType, 'type'>;

export default function Divider({ className, style }: DividerProps) {
  const context = useContext(MenuContext) ?? {} as MenuContextProps;
  const measure = useMeasure();

  if (measure) {
    return null;
  }

  return (
    <li
      class={classNames(`${context.prefixCls}-item-divider`, className)}
      style={style}
    />
  );
}
