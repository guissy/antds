import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, Accessor} from "solid-js";import Notifications from './Notifications';
import type { Placement } from './Notifications';
import type { NotificationsRef, OpenConfig } from './Notifications';
import type { CSSMotionProps } from 'rc-motion-solid';

const defaultGetContainer = () => document.body;

type OptionalConfig = Partial<OpenConfig>;

export interface NotificationConfig {
  prefixCls?: string;
  /** Customize container. It will repeat call which means you should return same container element. */
  getContainer?: () => HTMLElement;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  closeIcon?: JSX.Element;
  closable?: boolean;
  maxCount?: number;
  duration?: number;
  /** @private. Config for notification holder style. Safe to remove if refactor */
  className?: (placement: Placement) => string;
  /** @private. Config for notification holder style. Safe to remove if refactor */
  style?: (placement: Placement) => JSX.CSSProperties;
  /** @private Trigger when all the notification closed. */
  onAllRemoved?: VoidFunction;
}

export interface NotificationAPI {
  open: (config: OptionalConfig) => void;
  close: (key: number | string) => void;
  destroy: () => void;
}

interface OpenTask {
  type: 'open';
  config: OpenConfig;
}

interface CloseTask {
  type: 'close';
  key: number | string;
}

interface DestroyTask {
  type: 'destroy';
}

type Task = OpenTask | CloseTask | DestroyTask;

let uniqueKey = 0;

function mergeConfig<T>(...objList: Partial<T>[]): T {
  const clone: T = {} as T;

  objList.forEach((obj) => {
    if (obj) {
      Object.keys(obj).forEach((key) => {
        const val = obj[key];

        if (val !== undefined) {
          clone[key] = val;
        }
      });
    }
  });

  return clone;
}

export default function useNotification(
  rootConfig: NotificationConfig = {},
): [NotificationAPI, JSX.Element] {
  const {
    getContainer = defaultGetContainer,
    motion,
    prefixCls,
    maxCount,
    className,
    style,
    onAllRemoved,
    ...shareConfig
  } = rootConfig;

  const [container, setContainer] = createSignal<HTMLElement>();
  let notificationsRef = null;

  const contextHolder = (
    <Notifications
      container={container()}
      ref={notificationsRef}
      prefixCls={prefixCls}
      motion={motion}
      maxCount={maxCount}
      className={className}
      style={style}
      onAllRemoved={onAllRemoved}
    />
  );

  const [taskQueue, setTaskQueue] = createSignal<Task[]>([]);

  // ========================= Refs =========================
  const api = createMemo<NotificationAPI>(() => {
    return {
      open: (config) => {
        const mergedConfig = mergeConfig(shareConfig, config);
        if (mergedConfig.key === null || mergedConfig.key === undefined) {
          mergedConfig.key = `rc-notification-${uniqueKey}`;
          uniqueKey += 1;
        }

        setTaskQueue((queue) => [...queue, { type: 'open', config: mergedConfig }]);
      },
      close: (key) => {
        setTaskQueue((queue) => [...queue, { type: 'close', key }]);
      },
      destroy: () => {
        setTaskQueue((queue) => [...queue, { type: 'destroy' }]);
      },
    };
  });

  // ======================= Container ======================
  // React 18 should all in effect that we will check container in each render
  // Which means getContainer should be stable.
  createEffect(() => {
    setContainer(getContainer());
  });

  // ======================== Effect ========================
  createEffect(() => {
    // Flush task when node ready
    if (notificationsRef && taskQueue().length) {
      taskQueue().forEach((task) => {
        switch (task.type) {
          case 'open':
            notificationsRef.open(task.config);
            break;

          case 'close':
            notificationsRef.close(task.key);
            break;

          case 'destroy':
            notificationsRef.destroy();
            break;
        }
      });

      setTaskQueue([]);
    }
  }, [taskQueue()]);

  // ======================== Return ========================
  return [api(), contextHolder];
}
