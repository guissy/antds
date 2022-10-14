import { Accessor, createContext, createMemo, useContext } from "solid-js";

const EmptyList: string[] = [];

// ========================= Path Register =========================
export interface PathRegisterContextProps {
  registerPath: (key: string, keyPath: string[]) => void;
  unregisterPath: (key: string, keyPath: string[]) => void;
}

export const PathRegisterContext = createContext<PathRegisterContextProps>(
  null,
);

export function useMeasure() {
  return useContext(PathRegisterContext);
}

// ========================= Path Tracker ==========================
export const PathTrackerContext = createContext<string[]>(EmptyList);

export function useFullPath(eventKey?: Accessor<string>) {
  const parentKeyPath = useContext(PathTrackerContext);
  
  return createMemo(
    () =>
      eventKey?.() !== undefined ? parentKeyPath.concat(eventKey()) : parentKeyPath,
  );
}

// =========================== Path User ===========================
export interface PathUserContextProps {
  isSubPathKey: (pathKeys: string[], eventKey: string) => boolean;
}

export const PathUserContext = createContext<PathUserContextProps>(null);
