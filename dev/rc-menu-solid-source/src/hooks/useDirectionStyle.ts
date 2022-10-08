import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { MenuContext, MenuContextProps } from '../context/MenuContext';

export default function useDirectionStyle(level: number): JSX.CSSProperties {
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  if (context.mode !== 'inline') {
    return null;
  }

  const len = level;
  return context.rtl
    ? { 'padding-right': len * context.inlineIndent + 'px' }
    : { 'padding-left': len * context.inlineIndent + 'px' };
}
