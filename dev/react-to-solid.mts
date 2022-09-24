const events = ['cut','paste','compositionEnd','compositionStart','compositionUpdate','keyDown','keyPress','keyUp','focus','blur','focusIn','focusOut','change','input','invalid','submit','reset','click','contextMenu','dblClick','drag','dragEnd','dragEnter','dragExit','dragLeave','dragOver','dragStart','drop','mouseDown','mouseEnter','mouseLeave','mouseMove','mouseOut','mouseOver','mouseUp','popState','select','touchCancel','touchEnd','touchMove','touchStart','scroll','wheel','abort','canPlay','canPlayThrough','durationChange','emptied','encrypted','ended','loadedData','loadedMetadata','loadStart','pause','play','playing','progress','rateChange','seeked','seeking','stalled','suspend','timeUpdate','volumeChange','waiting','load','error','animationStart','animationEnd','animationIteration','transitionEnd','doubleClick','pointerOver','pointerEnter','pointerDown','pointerMove','pointerUp','pointerCancel','pointerOut','pointerLeave','gotPointerCapture','lostPointerCapture']
// "import (type )?\* as React from 'react';": "import {createEffect, createSignal, createContext, createMemo, JSX, useContext} from \"solid-js\";",
// "import React from 'react';": "import {createEffect, createSignal, createContext, JSX, useContext} from \"solid-js\";",
// "import { [^}]+ } from 'react';": "",
export const importResolve = (react: string): string => {
    const solidImport = "import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from \"solid-js\";"
    return react
    .replace(/import (.*)from 'react';?/g, solidImport)
}

// "(React.)?useState": "createSignal",
// "(React.)?useEffect": "createEffect",
// "(React.)?useMemo": "createMemo",
// "React.useContext": "useContext",
// "React.createContext": "createContext",

export const hookResolve = (react: string): string => {
    return react
    .replace(/(React.)?useState/g, 'createSignal')
    .replace(/(React.)?useEffect/g, 'createEffect')
    .replace(/(React.)?useMemo/g, 'createMemo')
    .replace(/(React.)?useContext/g, 'useContext')
    .replace(/(React.)?createContext/g, 'createContext')
}

// "React.FC": "Component",
// "React.ReactElement": "JSX.Element",
// "React.ReactNode": "JSX.Element",
// "(React.)?ReactInstance": "JSX.Element",
// "React.CSSProperties": "JSX.CSSProperties",
// "React.Key": "Key",
// "React.HTMLAttributes": "JSX.HTMLAttributes",

export const jsxResolve = (react: string): string => {
    return react.replace(/return (React.)?createElement\([\s\n]*([^,]+),[\s\n]*{([^}]+)},[\s\n]*([^\n]+),([\n\s\);]*)/m, 'const _el$ = template(`<${$2}></${$2}>`, 2).cloneNode(true);\ninsert(_el$, () => $4);\nspread(_el$, {$3}, false, true);\nreturn _el$;\n')
    .replace(/return (React.)?createElement\([\s\n]*([^,]+),[\s\n]*([^,]+),[\s\n]*([^\n]+),([\n\s\);]*)/m, 'const _el$ = template(`<${$2}></${$2}>`, 2).cloneNode(true);\ninsert(_el$, () => $4);\nspread(_el$, $3, false, true);return _el$;\n')
    .replace(/React.FC/g, 'Component')
    .replace(/(React.)?ReactElement/g, 'JSX.Element')
    .replace(/(React.)?ReactNode/g, 'JSX.Element')
    .replace(/(React.)?ReactNode/g, 'JSX.Element')
    .replace(/(React.)?ReactInstance/g, 'JSX.Element')
    .replace(/(React.)?CSSProperties/g, 'JSX.CSSProperties')
    .replace(/React.HTMLProps/g, 'JSX.HTMLAttributes')
    .replace(/React.ComponentType/g, 'Component')
    .replace(/React.SVGProps/g, 'JSX.SvgSVGAttributes')
    .replace(/React.AriaAttributes/g, 'JSX.AriaAttributes')
    .replace(/React.ForwardRefExoticComponent<(.+)>/g, 'JSX.IntrinsicAttributes')
    .replace(/React.Key\b/g, 'number | string')
    .replace(/(React.)?HTMLAttributes/g, 'JSX.HTMLAttributes')
}

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
    .replace(/ = (React.)?useRef<(\w+)>\(\)": /g, ': $2 = null as unknown as $2')
    .replace(/ = (React.)?useRef<(\w+)>\(([^)]+)\)": /g, ': $2 = $3 as unknown as $2')
    .replace(/ = (React.)?useRef\(([^)]+)\)": /g, ': $2')
    .replace(/ = React.forwardRef<([^,]+),\s*([^>]+)>\(\(props, ref\)/g, ': Component<$2 & JSX.CustomAttributes<HTMLDivElement>> = ((props)')
    .replace(/React.forwardRef<.+>\(/g, '(')
    .replace(/const (\w+)Ref/g, 'let $1Ref')
    .replace(/(\w+)Ref.current/g, '$1Ref')
    .replace(/\bref=\{[^}]+\}/g, '')
    .replace(/(&\s)*React.RefAttributes<\w+>/g, '')
    
}


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
    .replace(/(React.)?(Mouse|Keyboard|Focus|Touch)EventHandler<(\w+)>/g, 'JSX.EventHandlerUnion<$3, $2Event>')
    .replace(/(React.)?(Mouse|Keyboard|Focus|Touch)Event(<[^>]+>)?/g, '$2Event')
    .replace(/(React\.)?\buseCallback\(([^\},]+)\},\s*\[[^\]]*\]\)/mg, "$2}")
    .replace(/(React.)?\bChangeEvent<([^>]+)>?/g, 'Event & { currentTarget: $2 }')
}

export const classResolve = (react: string): string => {
    return react
    .replace(/className=/g, 'class=')
    // .replace(/className:/g, 'class:')
    // .replace(/className,/g, 'class')
    .replace(/(\w+).displayName/g, ';($1 as unknown as { displayName: string }).displayName')
    .replace(/(\w+).(\w+) = (\w+);/g, (_, s1, s2, s3) => {
        return s2 === s3 ? `(${s1} as unknown as { ${s2}: typeof ${s3} }).${s2} = ${s3};` : _;
    })
}

export const resolveChildren = (react: string): string => {
    const hasChildren = /\bChildren\./g.test(react);
    if (hasChildren) {
        return react.replace(/\"solid-js\";/, "\"solid-js\";\nimport { spread } from 'solid-js/web';")
        .replace(/React\.Children\.map\(([^,]+), /, "Children(() => svgProps.children).toArray().map(")
        .replace(/React\.cloneElement\(([^,]+),([^,]+),/m, "(spread($1, $2), $1")
        .replace(/child.type/, "child?.nodeName")
    } else {
        return react;
    }
}

export const styleing = (react: string): string => {
    return react.replace(/import styled from 'styled-components'/, "import {styled} from 'solid-styled-components'");
}

export const testing = (react: string): string => {
    return react.replace(/import (.*)from 'enzyme';/, 'import { render as renderFn, fireEvent } from "solid-testing-library";\nconst render = (jsx: JSX.Element) => { const dom = renderFn(() => jsx); dom.render = () => renderFn(() => jsx); dom.setProps = () => !0; return dom; };\nconst mount = render;\n')
    .replace(/\.isEmptyRender\(\)\).toBeTruthy\(\);/g, '.container.firstChild).toBeNull()')
    .replace(/\.find\(([^)]+)\)\.first\(\)\.prop/g, ".container.querySelector($1).getAttribute")
    .replace(/\.find\(([^)]+)\)\.first\(\)/g, ".container.querySelector($1)")
    .replace(/\.find\(([^)]+)\)\.at\(([^)]+)\)/g, ".container.querySelectorAll($1)[$2]")
    .replace(/\.find\(([^)]+)\)/g, ".container.querySelectorAll($1)")
    .replace(/(\w+)\.simulate\('(\w+)'\)/g, (_, s1, s2) => `fireEvent.${events.find(e => e.toLowerCase() === s2)}(${s1})`)
}


export const reactToSolid = (react: string): string => {
    return styleing(resolveChildren(classResolve(eventResolve(refResolve(jsxResolve(hookResolve(importResolve(testing(react)))))))));
}

export default reactToSolid;
