import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";

/**
 * Cache callback function that always return same ref instead.
 * This is used for context optimization.
 */
export default function createMemoCallback<T extends (...args: any[]) => void>(
  func: T,
): T {
  return func;
}
