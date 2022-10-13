import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import type { RenderIconInfo, RenderIconType } from './interface';

export interface IconProps {
  icon?: RenderIconType;
  props: RenderIconInfo;
  /** Fallback of icon if provided */
  children?: JSX.Element;
}

export default function Icon({ icon, props, children }: IconProps) {
  let iconNode: JSX.Element;

  if (typeof icon === 'function') {
    iconNode = icon(props);
  } else {
    // Compatible for origin definition
    iconNode = icon as JSX.Element;
  }

  return iconNode || children || null;
}
