
// "import (type )?\* as React from 'react';": "import {createEffect, createSignal, createContext, createMemo, JSX, useContext} from \"solid-js\";",
// "import React from 'react';": "import {createEffect, createSignal, createContext, JSX, useContext} from \"solid-js\";",
// "import { [^}]+ } from 'react';": "",
export const importResolve = (react: string): string => {
  const solidImport =
    'import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";';
  return react
  .replace(/import type \* as React from 'react';/g, "")
  .replace(/import (.*)from 'react';?/g, solidImport);
};

// "(React.)?useState": "createSignal",
// "(React.)?useEffect": "createEffect",
// "(React.)?useMemo": "createMemo",
// "React.useContext": "useContext",
// "React.createContext": "createContext",

export const hookResolve = (react: string): string => {
  var signals = new Map<string, number>();
  var memos = new Map<string, number>();
  react.replace(/const \[(\w+),([^=]+)=\s*(React.)?useState/g, (_, s1) => {
    signals.set(s1, _.length + react.search(s1));
    return _;
  });
  react.replace(/const (\w+)\s*=\s*(React.)?useMemo/g, (_, s1) => {
    memos.set(s1, _.length + react.search(s1));
    return _;
  });
  Array.from(signals.entries()).concat(Array.from(memos.entries())).forEach(([s, n]) => {
    react = react.slice(0, n) + react.slice(n).replace(new RegExp(`\b${s}\b`, "g"), s.concat("()"));
  });
  console.log(Array.from(signals.entries()).concat(Array.from(memos.entries())))
  return react
    .replace(/(React.)?useState/g, "createSignal")
    .replace(/(React.)?useEffect/g, "createEffect")
    .replace(/(React.)?useMemo/g, "createMemo")
    .replace(/(React.)?useContext/g, "useContext")
    .replace(/(React.)?createContext/g, "createContext");
};

// "React.FC": "Component",
// "React.ReactElement": "JSX.Element",
// "React.ReactNode": "JSX.Element",
// "(React.)?ReactInstance": "JSX.Element",
// "React.CSSProperties": "JSX.CSSProperties",
// "React.Key": "Key",
// "React.HTMLAttributes": "JSX.HTMLAttributes",

export const jsxResolve = (react: string): string => {
  return react
    .replace(
      /return (React.)?createElement\([\s\n]*([^,]+),[\s\n]*{([^}]+)},[\s\n]*([^\n]+),([\n\s\);]*)/m,
      "const _el$ = template(`<${$2}></${$2}>`, 2).cloneNode(true);\ninsert(_el$, () => $4);\nspread(_el$, {$3}, false, true);\nreturn _el$;\n"
    )
    .replace(
      /return (React.)?createElement\([\s\n]*([^,]+),[\s\n]*([^,]+),[\s\n]*([^\n]+),([\n\s\);]*)/m,
      "const _el$ = template(`<${$2}></${$2}>`, 2).cloneNode(true);\ninsert(_el$, () => $4);\nspread(_el$, $3, false, true);return _el$;\n"
    )
    .replace(/React.FC/g, "Component")
    .replace(/(React.)?ReactElement/g, "JSX.Element")
    .replace(/(React.)?ReactNode/g, "JSX.Element")
    .replace(/(React.)?ReactNode/g, "JSX.Element")
    .replace(/(React.)?ReactInstance/g, "JSX.Element")
    .replace(/(React.)?CSSProperties/g, "JSX.CSSProperties")
    .replace(/React.HTMLProps/g, "JSX.HTMLAttributes")
    .replace(/React.ComponentType/g, "Component")
    .replace(/React.SVGProps/g, "JSX.SvgSVGAttributes")
    .replace(/React.AriaAttributes/g, "JSX.AriaAttributes")
    .replace(
      /React.ForwardRefExoticComponent<(.+)>/g,
      "JSX.IntrinsicAttributes"
    )
    .replace(/React.Key\b/g, "number | string")
    .replace(/(React.)?HTMLAttributes/g, "JSX.HTMLAttributes");
};

// " = (React.)?useRef<(\w+)>\(\)": ": $2 = null as unknown as $2",
// " = (React.)?useRef<(\w+)>\(([^)]+)\)": ": $2 = $3 as unknown as $2",
// " = (React.)?useRef\(([^)]+)\)": " = $2",
// " = React.forwardRef<(\w+), (\w+)>\(\(props, ref\)": ": Component<$2 & JSX.CustomAttributes<HTMLDivElement>> = (props)",
// "React.forwardRef": "",
// "const (\w+)Ref": "let $1Ref",
// "(\w+)Ref.current": "$1Ref",
export const refResolve = (react: string): string => {
  // const hasRef = / = React.forwardRef<([^>]+)>\(\(props, ref\)/g.test(react);
  return react
    .replace(
      / = (React.)?useRef<(\w+)>\(\)": /g,
      ": $2 = null as unknown as $2"
    )
    .replace(
      / = (React.)?useRef<(\w+)>\(([^)]+)\)": /g,
      ": $2 = $3 as unknown as $2"
    )
    .replace(/ = (React.)?useRef\(([^)]+)\)": /g, ": $2")
    .replace(
      / = React.forwardRef<([^,]+),\s*([^>]+)>\(\(props, ref\)/g,
      ": Component<$2 & JSX.CustomAttributes<HTMLDivElement>> = ((props)"
    )
    .replace(/React.forwardRef<.+>\(/g, "(")
    .replace(/forwardRef<.+>\(/g, "(")
    .replace(/const (\w+)Ref/g, "let $1Ref")
    .replace(/(\w+)Ref.current/g, "$1Ref")
    // .replace(/\bref=\{[^}]+\}/g, "") // testing need it
    .replace(/(const|let) ([^=]+)= (React\.)?useRef<([^\)]+)>\(\)/g, "let $2 = null as ($4 | null)")
    .replace(/(const|let) ([^=]+)= (React\.)?useRef<([^\)]+)>\(([^\)]+)\)/g, "let $2 = $5 as $4")
    .replace(/(const|let) ([^=]+)= (React\.)?useRef\(([^\)]+)\)/g, "let $2 = $4")
    .replace(/(&\s)*React.RefAttributes<\w+>/g, "")
    .replace(/(const|let) ([^=]+)= (React\.)?createRef<(\w+)>\(\)/g, "let $2:$4 = null");
};

// "(React.)?MouseEventHandler<(\w+)>": "JSX.EventHandlerUnion<$2, MouseEvent>",
// "(React.)?MouseEvent<[^>]+>": "MouseEvent",
// "(React.)?MouseEvent": "MouseEvent",
// ("React.)?MouseEvent(<[^>]+>)?": "MouseEvent",
// "(React.)?KeyboardEventHandler<(\w+)>": "JSX.EventHandlerUnion<$2, KeyboardEvent>",
// "(React.)?KeyboardEvent<[^>]+>": "KeyboardEvent",
// "(React.)?KeyboardEvent": "KeyboardEvent",
// "(React.)?FocusEventHandler<(\w+)>": "JSX.EventHandlerUnion<$2, FocusEvent>",
// "(React.)?FocusEvent<[^>]+>": "FocusEvent",
// "(React.)?FocusEvent": "FocusEvent",
// "(React.)?TouchEventHandler<(\w+)>": "JSX.EventHandlerUnion<$2, TouchEvent>",
// "(React.)?TouchEvent<[^>]+>": "TouchEvent",
// "(React.)?TouchEvent": "TouchEvent",
export const eventResolve = (react: string): string => {
  return react
    .replace(
      /(React.)?(Mouse|Keyboard|Focus|Touch)EventHandler<(\w+)>/g,
      "JSX.EventHandlerUnion<$3, $2Event>"
    )
    .replace(/(React.)?(Mouse|Keyboard|Focus|Touch)Event(<[^>]+>)?/g, "$2Event")
    .replace(/(React\.)?\buseCallback\(([^\},]+)\},\s*\[[^\]]*\]\)/gm, "$2}")
    .replace(
      /(React.)?\bChangeEvent<([^>]+)>?/g,
      "Event & { currentTarget: $2 }"
    );
};

export const classResolve = (react: string): string => {
  return (
    react
      .replace(/className=/g, "class=")
      // .replace(/className:/g, 'class:')
      // .replace(/className,/g, 'class')
      .replace(
        /(\w+).displayName/g,
        ";($1 as unknown as { displayName: string }).displayName"
      )
      .replace(/(\w+).(\w+) = (\w+);/g, (_, s1, s2, s3) => {
        return s2 === s3
          ? `(${s1} as unknown as { ${s2}: typeof ${s3} }).${s2} = ${s3};`
          : _;
      })
  );
};

export const resolveChildren = (react: string): string => {
  const hasChildren = /\bChildren\./g.test(react);
  if (hasChildren) {
    return react
      .replace(
        /\"solid-js\";/,
        "\"solid-js\";\nimport { spread } from 'solid-js/web';"
      )
      .replace(
        /React\.Children\.map\(([^,]+), /,
        "Children(() => svgProps.children).toArray().map("
      )
      .replace(/React\.cloneElement\(([^,]+),([^,]+),/m, "(spread($1, $2), $1")
      .replace(/child.type/, "child?.nodeName");
  } else {
    return react;
  }
};

export const styleing = (react: string): string => {
  return react.replace(
    /import styled from 'styled-components'/,
    "import {styled} from 'solid-styled-components'"
  )
  .replace(/\bfontSize: (\d+)/g, "'font-size': '$1px'")
  .replace(/\bfontSize: (['"])/g, "'font-size': $1")
  .replace(/\b\.pointerEvents/g, "['pointer-events']")
  .replace(/\bpointerEvents/g, "'pointer-events'")
};


export const reactToSolid = (react: string): string => {
  return styleing(
    resolveChildren(
      classResolve(
        eventResolve(
          refResolve(jsxResolve(hookResolve(importResolve(react))))
        )
      )
    )
  );
};

export default reactToSolid;
