import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, Ref, on, Show, For } from "solid-js"; import { createPortal } from 'react-dom';
import { CSSMotionList } from 'rc-motion-solid';
import type { CSSMotionProps } from 'rc-motion-solid';
import classNames from 'classnames';
import Notice from './Notice';
import type { NoticeConfig } from './Notice';
import { Portal } from "solid-js/web";

export interface OpenConfig extends NoticeConfig {
  key: number | string;
  placement?: Placement;
  content?: JSX.Element;
  duration?: number | null;
}

export interface NotificationsProps {
  prefixCls?: string;
  ref?: Ref<{ open: (config) => void, close: (key: string) => void, destroy: () => void }>;
  motion?: CSSMotionProps | ((placement: Placement) => CSSMotionProps);
  container?: HTMLElement;
  maxCount?: number;
  className?: (placement: Placement) => string;
  style?: (placement: Placement) => JSX.CSSProperties;
  onAllRemoved?: VoidFunction;
}

export type Placement = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';

type Placements = Partial<Record<Placement, OpenConfig[]>>;

export interface NotificationsRef {
  open: (config: OpenConfig) => void;
  close: (key: number | string) => void;
  destroy: () => void;
}

// ant-notification ant-notification-topRight
const Notifications: Component<NotificationsProps & JSX.CustomAttributes<HTMLDivElement>> = ((_props) => {
  const props = mergeProps({ prefixCls: 'rc-notification' }, _props);
  // const {
  //   prefixCls = 'rc-notification',
  //   container,
  //   motion,
  //   maxCount,
  //   className,
  //   style,
  //   onAllRemoved,
  // } = props;
  const [configList, setConfigList] = createSignal<OpenConfig[]>([]);

  // ======================== Close =========================
  const onNoticeClose = (key: number | string) => {
    // Trigger close event
    const config = configList().find((item) => item.key === key);
    config?.onClose?.();

    setConfigList((list) => list.filter((item) => item.key !== key));
  };

  // ========================= Refs =========================
  props.ref?.(({
    open: (config) => {
      setConfigList((list) => {
        let clone = [...list];

        // Replace if exist
        const index = clone.findIndex((item) => item.key === config.key);
        if (index >= 0) {
          clone[index] = config;
        } else {
          clone.push(config);
        }

        if (props.maxCount > 0 && clone.length > props.maxCount) {
          clone = clone.slice(-props.maxCount);
        }

        return clone;
      });
    },
    close: (key) => {
      onNoticeClose(key);
    },
    destroy: () => {
      setConfigList([]);
    },
  }));

  // ====================== Placements ======================
  const [placements, setPlacements] = createSignal<Placements>({});

  createEffect(on(configList, () => {

    const nextPlacements: Placements = {};

    configList().forEach((config) => {
      const { placement = 'topRight' } = config;

      if (placement) {
        nextPlacements[placement] = nextPlacements[placement] || [];
        nextPlacements[placement].push(config);
      }
    });

    // Fill exist placements to avoid empty list causing remove without motion
    Object.keys(placements()).forEach((placement) => {
      nextPlacements[placement] = nextPlacements[placement] || [];
    });
    setPlacements(nextPlacements);
  }));

  // Clean up container if all notices fade out
  const onAllNoticeRemoved = (placement: Placement) => {    
    setPlacements((originPlacements) => {
      
      const clone = {
        ...originPlacements,
      };
      const list = clone[placement] || [];

      if (!list.length) {
        delete clone[placement];
      }

      return clone;
    });
  };

  // Effect tell that placements is empty now
  let emptyRef = false;
  createEffect(() => {
    if (Object.keys(placements()).length > 0) {
      emptyRef = true;
    } else if (emptyRef) {
      // Trigger only when from exist to empty
      props.onAllRemoved?.();
      emptyRef = false;
    }
  }, [placements()]);

  // ======================== Render ========================
  // if (!props.container) {
  //   return null;
  // }

  const placementList = createMemo(() => Object.keys(placements()) as Placement[]);

  return (<Show when={props.container}>
    <Portal mount={props.container}>
      <For each={placementList()}>{(placement) => {
        const keys = createMemo(() => placements()[placement].map((config) => ({
          config,
          key: config.key,
        })));

        // const placementMotion = typeof props.motion === 'function' ? props.motion(placement) : props.motion;

        return (
          <CSSMotionList
            key={placement}
            class={classNames(props.prefixCls, `${props.prefixCls}-${placement}`, props.className?.(placement))}
            style={props.style?.(placement)}
            keys={keys()}
            motionAppear
            {...(typeof props.motion === 'function' ? props.motion(placement) : props.motion)}
            onAllRemoved={() => {
              onAllNoticeRemoved(placement);
            }}
          >
            {({ config, className: motionClassName, style: motionStyle }) => {
              const { key } = config as OpenConfig;
              const { className: configClassName, style: configStyle } = config as NoticeConfig;
              return (
                <Notice
                  {...config}
                  prefixCls={props.prefixCls}
                  class={classNames(motionClassName, configClassName)}
                  style={{
                    ...motionStyle,
                    ...configStyle,
                  }}
                  key={key}
                  eventKey={key}
                  onNoticeClose={onNoticeClose}
                />
              );
            }}
          </CSSMotionList>
        );
      }}</For>
    </Portal>
  </Show>);
});

if (process.env.NODE_ENV !== 'production') {
  ; (Notifications as unknown as { displayName: string }).displayName = 'Notifications';
}

export default Notifications;
