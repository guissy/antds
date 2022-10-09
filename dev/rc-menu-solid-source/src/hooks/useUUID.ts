import { createEffect } from "solid-js";
import useMergedState from 'rc-util-solid/lib/hooks/useMergedState';
import { Accessor } from "solid-js";

const uniquePrefix = Math.random().toFixed(5).toString().slice(2);

let internalId = 0;

const genId = () => {
  internalId += 1;
  const newId =
    process.env.NODE_ENV === 'test'
      ? 'test'
      : `${uniquePrefix}-${internalId}`;
  return `rc-menu-uuid-${newId}`;
}

export default function useUUID(id?: string): Accessor<string> {
  const [uuid, setUUID] = useMergedState(id || genId(), {
    value: id,
  });

  createEffect(() => {
    setUUID(genId());
  });

  return uuid;
}
