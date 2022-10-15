import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";

export const IdContext = createContext<string>(null);

export function getMenuId(uuid: string, eventKey: string) {
  if (uuid === undefined) {
    return null;
  }
  return `${uuid}-${eventKey}`;
}

/**
 * Get `data-menu-id`
 */
let n = 0;
export function useMenuId(eventKey: string) {
  const id = useContext(IdContext);
  return getMenuId(id, eventKey || `tmp_key-${n+=1}`);
}
