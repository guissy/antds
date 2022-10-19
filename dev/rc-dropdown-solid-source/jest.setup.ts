// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/solidjs/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
window.requestAnimationFrame = func => {
    window.setTimeout(func, 16);
};
window.AnimationEvent = window.AnimationEvent || class AnimationEvent { constructor(e, opt) { return new window.Event(e, opt) } };
window.TransitionEvent = window.TransitionEvent || class TransitionEvent { constructor(e, opt) { return new window.Event(e, opt) } };
import ResizeObserver from 'resize-observer-polyfill';
globalThis.ResizeObserver = ResizeObserver;
