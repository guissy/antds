import { Accessor, createMemo as createMemoSolid } from "solid-js";

export default function createMemo<Value, Condition = any[]>(
  getValue: () => Value,
  condition: Accessor<Condition>,
  shouldUpdate: (prev?: Condition, next?: Condition) => boolean,
) {
  const acc = createMemoSolid<[Value, Condition]>(
    () => [getValue(), condition()], 
    [getValue(), condition()], 
    { equals: ([v1, prev], [v2, next]) => !shouldUpdate(prev, next)}
    );
  return createMemoSolid(() => acc()[0])
}
