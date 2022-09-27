interface Cache<Value, Condition> {
    condition?: Condition;
    value?: Value;
  }
  
  export default function createMemo<Value, Condition = any[]>(
    getValue: () => Value,
    condition: Condition,
    shouldUpdate: (prev: Condition, next: Condition) => boolean,
  ) {
    let cacheRef  = {} as Cache<Value, Condition>;
  
    if (
      !('value' in cacheRef) ||
      shouldUpdate(cacheRef.condition, condition)
    ) {
      cacheRef.value = getValue();
      (cacheRef as unknown as { condition: typeof condition }).condition = condition;
    }
  
    return cacheRef.value;
  }
  