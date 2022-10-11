import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import warning from 'rc-util-solid/lib/warning';
import { nextSlice } from '../utils/timeUtil';

const PATH_SPLIT = '__RC_UTIL_PATH_SPLIT__';

const getPathStr = (keyPath: string[]) => keyPath.join(PATH_SPLIT);
const getPathKeys = (keyPathStr: string) => keyPathStr.split(PATH_SPLIT);

export const OVERFLOW_KEY = 'rc-menu-more';

export default function useKeyRecords() {
  const [, internalForceUpdate] = createSignal({});
  let key2pathRef  = new Map<string, string>();
  let path2keyRef  = new Map<string, string>();
  const [overflowKeys, setOverflowKeys] = createSignal([]);
  let updateRef  = 0;
  let destroyRef  = false;

  const forceUpdate = () => {
    if (!destroyRef) {
      internalForceUpdate({});
    }
  };

  const registerPath = (key: string, keyPath: string[]) => {
    // Warning for invalidate or duplicated `key`
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !key2pathRef.has(key),
        `Duplicated key '${key}' used in Menu by path [${keyPath.join(' > ')}]`,
      );
    }

    // Fill map
    const connectedPath = getPathStr(keyPath);
    
    path2keyRef.set(connectedPath, key);
    key2pathRef.set(key, connectedPath);

    updateRef += 1;
    const id = updateRef;

    nextSlice(() => {
      if (id === updateRef) {
        forceUpdate();
      }
    });
  };

  const unregisterPath = (key: string, keyPath: string[]) => {
    const connectedPath = getPathStr(keyPath);
    path2keyRef.delete(connectedPath);
    key2pathRef.delete(key);
  };

  const refreshOverflowKeys = (keys: string[]) => {
    setOverflowKeys(keys);
  };

  const getKeyPath = 
    (eventKey: string, includeOverflow?: boolean) => {
      const fullPath = key2pathRef.get(eventKey) || '';
      const keys = getPathKeys(fullPath);

      if (includeOverflow && overflowKeys().includes(keys[0])) {
        keys.unshift(OVERFLOW_KEY);
      }

      return keys;
    };
    // [overflowKeys],
  // );

  const isSubPathKey = 
    (pathKeys: string[], eventKey: string) =>
      pathKeys?.some(pathKey => {
        const pathKeyList = getKeyPath(pathKey, true);

        return pathKeyList.includes(eventKey);
      });
    // [getKeyPath],
  // );

  const getKeys = () => {
    const keys = [...key2pathRef.keys()];

    if (overflowKeys().length) {
      keys.push(OVERFLOW_KEY);
    }

    return keys;
  };

  /**
   * Find current key related child path keys
   */
  const getSubPathKeys = (key: string): Set<string> => {
    const connectedPath = `${key2pathRef.get(key)}${PATH_SPLIT}`;
    const pathKeys = new Set<string>();

    [...path2keyRef.keys()].forEach(pathKey => {
      if (pathKey.startsWith(connectedPath)) {
        pathKeys.add(path2keyRef.get(pathKey));
      }
    });
    return pathKeys;
  }// }, []);

  createEffect(
    () => () => {
      destroyRef = true;
    },
    [],
  );

  return {
    // Register
    registerPath,
    unregisterPath,
    refreshOverflowKeys,

    // Util
    isSubPathKey,
    getKeyPath,
    getKeys,
    getSubPathKeys,
  };
}
