const events = [
    "cut",
    "paste",
    "compositionEnd",
    "compositionStart",
    "compositionUpdate",
    "keyDown",
    "keyPress",
    "keyUp",
    "focus",
    "blur",
    "focusIn",
    "focusOut",
    "change",
    "input",
    "invalid",
    "submit",
    "reset",
    "click",
    "contextMenu",
    "dblClick",
    "drag",
    "dragEnd",
    "dragEnter",
    "dragExit",
    "dragLeave",
    "dragOver",
    "dragStart",
    "drop",
    "mouseDown",
    "mouseEnter",
    "mouseLeave",
    "mouseMove",
    "mouseOut",
    "mouseOver",
    "mouseUp",
    "popState",
    "select",
    "touchCancel",
    "touchEnd",
    "touchMove",
    "touchStart",
    "scroll",
    "wheel",
    "abort",
    "canPlay",
    "canPlayThrough",
    "durationChange",
    "emptied",
    "encrypted",
    "ended",
    "loadedData",
    "loadedMetadata",
    "loadStart",
    "pause",
    "play",
    "playing",
    "progress",
    "rateChange",
    "seeked",
    "seeking",
    "stalled",
    "suspend",
    "timeUpdate",
    "volumeChange",
    "waiting",
    "load",
    "error",
    "animationStart",
    "animationEnd",
    "animationIteration",
    "transitionEnd",
    "doubleClick",
    "pointerOver",
    "pointerEnter",
    "pointerDown",
    "pointerMove",
    "pointerUp",
    "pointerCancel",
    "pointerOut",
    "pointerLeave",
    "gotPointerCapture",
    "lostPointerCapture",
];

export const enzymeTransform = (react: string): string => {
    return react
        .replace(
            /import (.*)from 'enzyme';/,
            'import { render as renderFn, fireEvent } from "solid-testing-library";\nconst render = (jsx: JSX.Element) => { const dom = renderFn(() => jsx); dom.render = () => renderFn(() => jsx); dom.setProps = () => !0; return dom; };\nconst mount = render;\n'
        )
        .replace(
            /\.isEmptyRender\(\)\).toBeTruthy\(\);/g,
            ".container.firstChild).toBeNull()"
        )
        .replace(
            /\.find\(([^)]+)\)\.first\(\)\.prop/g,
            ".container.querySelector($1).getAttribute"
        )
        .replace(/\.find\(([^)]+)\)\.first\(\)/g, ".container.querySelector($1)")
        .replace(
            /\.find\(([^)]+)\)\.at\(([^)]+)\)/g,
            ".container.querySelectorAll($1)[$2]"
        )
        .replace(/\.find\(([^)]+)\)/g, ".container.querySelectorAll($1)")
        .replace(
            /(\w+)\.simulate\('(\w+)'\)/g,
            (_, s1, s2) =>
                `fireEvent.${events.find((e) => e.toLowerCase() === s2)}(${s1})`
        );
};

export const testingTransform = (react: string): string => {
    const hasRerender = react.includes('rerender(');
    const hasTesting = react.includes('@testing-library\/react');
    react = react
        .replace(
            /import { render } from '@testing-library\/react';/,
            !hasRerender ? `import { render, fireEvent } from "solid-testing-library";`
            : `import { render, fireEvent } from "solid-testing-library";
import { createSignal } from "solid-js";      
const wrapFC = (Cmp) => {
    const fn = (props) => {
        const [state, setState] = createSignal(props);
        (fn as unknown as { setProps }).setProps = (n) => {
            setState(p => Object.keys(n).some((k) => p[k] !== n[k]) ? Object.assign({}, p, n) : p);
        };
        return <Cmp {...state}>{state().children}</Cmp>
    }
    return fn as typeof fn & { setProps: (o: object) => void }
}`
        )
    if (hasTesting) {
        react = react.replace(/render\(/g, "render(() => ")
    }
    return react;
};



export const reactToSolidTest = (react: string): string => {
    return enzymeTransform(testingTransform(react));
}

export default reactToSolidTest;