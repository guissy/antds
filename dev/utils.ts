import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types';
import { generate as generateColor } from '@ant-design/colors';
import { Component, createEffect, createSignal, createContext, createMemo, JSX, useContext } from "solid-js";
import { effect, insert, spread, template } from 'solid-js/web';
import warn from 'rc-util/lib/warning';
import { updateCSS } from 'rc-util/lib/Dom/dynamicCSS';
import IconContext from './components/Context';

export function warning(valid: boolean, message: string) {
  warn(valid, `[@ant-design/icons] ${message}`);
}

export function isIconDefinition(target: any): target is IconDefinition {
  return (
    typeof target === 'object' &&
    typeof target.name === 'string' &&
    typeof target.theme === 'string' &&
    (typeof target.icon === 'object' || typeof target.icon === 'function')
  );
}

export function normalizeAttrs(attrs: Attrs = {}): Attrs {
  return Object.keys(attrs).reduce((acc: Attrs, key) => {
    const val = attrs[key];
    switch (key) {
      case 'class':
        acc.className = val;
        delete acc.class;
        break;
      default:
        acc[key] = val;
    }
    return acc;
  }, {});
}

export interface Attrs {
  [key: string]: string;
}

export function generate(
  node: AbstractNode,
  key: string,
  rootProps?: { [key: string]: any } | false,
): any {
  if (!rootProps) {
    const _el$ = template(`<${node.tag}></${node.tag}>`, 2).cloneNode(false);
    insert(_el$, () => (node.children || []).map((child, index) => generate(child, `${key}-${node.tag}-${index}`)));
    spread(_el$ as any, { key, ...normalizeAttrs(node.attrs)}, false, true)
    return _el$;
  }
  const _el$ = template(`<${node.tag}></${node.tag}>`, 2).cloneNode(false);
  insert(_el$, () => (node.children || []).map((child, index) => generate(child, `${key}-${node.tag}-${index}`)));
  spread(_el$ as any, {
    key,
    ...normalizeAttrs(node.attrs),
    ...rootProps,
    xmlns: "http://www.w3.org/2000/svg"
  }, false, true)
  const svg = (_el$ as HTMLDivElement).outerHTML;
  return template(`${svg}`, 0);
}

export function getSecondaryColor(primaryColor: string): string {
  // choose the second color
  return generateColor(primaryColor)[0];
}

export function normalizeTwoToneColors(
  twoToneColor: string | [string, string] | undefined,
): string[] {
  if (!twoToneColor) {
    return [];
  }

  return Array.isArray(twoToneColor) ? twoToneColor : [twoToneColor];
}

// These props make sure that the SVG behaviours like general text.
// Reference: https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4
export const svgBaseProps = {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  'aria-hidden': 'true',
  focusable: 'false',
};

export const iconStyles = `
.anticon {
  display: inline-block;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -0.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
}

.anticon::before {
  display: none;
}

.anticon .anticon-icon {
  display: block;
}

.anticon[tabindex] {
  cursor: pointer;
}

.anticon-spin::before,
.anticon-spin {
  display: inline-block;
  -webkit-animation: loadingCircle 1s infinite linear;
  animation: loadingCircle 1s infinite linear;
}

@-webkit-keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes loadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`;

export const useInsertStyles = (styleStr: string = iconStyles) => {
  const { csp } = useContext(IconContext);

  createEffect(() => {
    updateCSS(styleStr, '@ant-design-icons', {
      prepend: true,
      csp,
    });
  }, []);
};