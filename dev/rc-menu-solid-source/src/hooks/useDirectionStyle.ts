import { type JSX, useContext } from "solid-js";
import { MenuContext, MenuContextProps } from '../context/MenuContext';

export default function useDirectionStyle(level: number): JSX.CSSProperties {
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  if (level === 0 || context.mode !== 'inline' || context.inlineIndent === undefined) {
    return null;
  }
  const len = level;
  return context.rtl
    ? { 'padding-right': (len * context.inlineIndent) + 'px' }
    : { 'padding-left': (len * context.inlineIndent) + 'px' };
}
