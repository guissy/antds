import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import useMergedState from 'rc-util-solid/lib/hooks/useMergedState';
import { Accessor } from "solid-js";

const uniquePrefix = Math.random().toFixed(5).toString().slice(2);

let internalId = 0;

export default function useUUID(id?: string): Accessor<string> {
  const [uuid, setUUID] = useMergedState(id, {
    value: id,
  });

  createEffect(() => {
    internalId += 1;
    const newId =
      process.env.NODE_ENV === 'test'
        ? 'test'
        : `${uniquePrefix}-${internalId}`;
    setUUID(`rc-menu-uuid-${newId}`);
  }, []);

  return uuid;
}
