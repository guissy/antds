/* eslint react/prop-types: 0 */
import { type Component, type JSX, createEffect, createMemo, createSignal, For, on, splitProps, VoidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import OriginCSSMotion from './CSSMotion';
import type { CSSMotionProps } from './CSSMotion';
import { supportTransition } from './util/motion';
import {
  STATUS_ADD,
  STATUS_KEEP,
  STATUS_REMOVE,
  STATUS_REMOVED,
  diffKeys,
  parseKeys,
} from './util/diff';
import type { KeyObject } from './util/diff';
import { Accessor } from "solid-js";

const MOTION_PROP_NAMES = [
  'eventProps',
  'visible',
  // 'children',
  'motionName',
  'motionAppear',
  'motionEnter',
  'motionLeave',
  'motionLeaveImmediately',
  'motionDeadline',
  'removeOnLeave',
  'leavedClassName',
  'onAppearStart',
  'onAppearActive',
  'onAppearEnd',
  'onEnterStart',
  'onEnterActive',
  'onEnterEnd',
  'onLeaveStart',
  'onLeaveActive',
  'onLeaveEnd',
];

export interface CSSMotionListProps
  extends Omit<CSSMotionProps, 'onVisibleChanged'>,
  Omit<JSX.HTMLAttributes<any>, 'children'> {
  keys: (number | string | { key: number | string;[name: string]: any })[];
  component?: string | Component | false;
  /** This will always trigger after final visible changed. Even if no motion configured. */
  onVisibleChanged?: (visible: boolean, info: { key: number | string }) => void;
  /** All motion leaves in the screen */
  onAllRemoved?: () => void;
}

export interface CSSMotionListState {
  keyEntities: KeyObject[];
}
type Key = KeyObject['key']
/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
export function genCSSMotionList(
  transitionSupport: boolean,
  CSSMotion = OriginCSSMotion,
): Component<CSSMotionListProps> {
  const CSSMotionList: Component<CSSMotionListProps> = (props) => {
    // static defaultProps = {
    //   component: 'div',
    // };
    const [keyEntities, setKeyEntities] = createSignal<KeyObject[]>([])
    // const state: CSSMotionListState = {
    //   keyEntities: [],
    // };

    createEffect(() => {
      setKeyEntities((older) => {
        // console.log("props.keys", props.keys)
        const parsedKeyObjects = parseKeys(props.keys as Key[]);
        const mixedKeyEntities = diffKeys(older, parsedKeyObjects);
        const newer = mixedKeyEntities.filter(entity => {
          const prevEntity = older.find(({ key }) => entity.key === key);
          // Remove if already mark as removed
          return !(prevEntity &&
            prevEntity.status === STATUS_REMOVED &&
            entity.status === STATUS_REMOVE);

        });
        const prev = JSON.stringify(older);
        const next = JSON.stringify(newer);

        // if (prev !== next) {
        //   console.log("set nextKeyEntities", older, newer)
        // }

        return prev !== next ? newer : older;
      })
    })

    // static getDerivedStateFromProps(
    //   { keys }: CSSMotionListProps,
    //   { keyEntities }: CSSMotionListState,
    // ) {
    //   const parsedKeyObjects = parseKeys(keys);
    //   const mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);

    //   return {
    //     keyEntities: mixedKeyEntities.filter(entity => {
    //       const prevEntity = keyEntities.find(({ key }) => entity.key === key);

    //       // Remove if already mark as removed
    //       if (
    //         prevEntity &&
    //         prevEntity.status === STATUS_REMOVED &&
    //         entity.status === STATUS_REMOVE
    //       ) {
    //         return false;
    //       }
    //       return true;
    //     }),
    //   };
    // }

    // ZombieJ: Return the count of rest keys. It's safe to refactor if need more info.
    const removeKey = (removeKey: number | string) => {
      // const { keyEntities } = this.state;
      let n = 0;
      setKeyEntities((older) => {
        const nextKeyEntities = older.map(entity => {
          if (entity.key !== removeKey) return entity;
          return {
            ...entity,
            status: STATUS_REMOVED,
          };
        });

        // setKeyEntities(nextKeyEntities)
        const newer = nextKeyEntities;
        // console.log("nextKeyEntities", nextKeyEntities)
        n = nextKeyEntities.filter(({ status }) => status !== STATUS_REMOVED)
          .length;
        const prev = JSON.stringify(older);
        const next = JSON.stringify(newer);
        return prev !== next ? newer : older;
      });
      return n;
    };

    // render() {
    // const { keyEntities } = this.state;
    // const {
    // component,
    // children,
    // onVisibleChanged,
    // onAllRemoved,
    // ...restProps
    // } = this.props;
    const [_, restProps] = splitProps(props, ['component', 'children', 'onVisibleChanged', 'onAllRemoved', 'keys']);
    const component = createMemo(on(() => props.component, () => {
      let component: VoidComponent<typeof restProps> = (props) => props.children;
      if (props.component === false) component = (props) => props.children;
      else if (props.component == null) component = 'div' as unknown as VoidComponent;
      else if (typeof props.component === 'string') component = (props.component || "div") as unknown as VoidComponent;
      else if (typeof props.component === 'function') component = props.component as unknown as VoidComponent;
      return component;
    }))
    // const Component = <Dynamic component={component} />
    // const motionProps = createMemo(() => {
    //   console.log("motionProps", keyEntities());

    //   const motionProps: CSSMotionProps = {};
    //   MOTION_PROP_NAMES.forEach(prop => {
    //     motionProps[prop] = restProps[prop];
    //     delete restProps[prop];
    //   });
    //   delete restProps.keys;
    //   return motionProps;
    // })

    const [motionProps] = splitProps(restProps, MOTION_PROP_NAMES as (keyof typeof restProps)[])

    // const items = createMemo<KeyObject[]>(() => keyEntities(), [] as KeyObject[], {
    //   equals: (p, n) => {
    //     const keys = p.map(it => it.key).join(',') === n.map(it => it.key).join(',')
    //     const status = p.map(it => it.status).join(',') === n.map(it => it.status).join(',')
    //     return keys && status;
    //   }
    // })

    const items = createMemo(() => keyEntities().map(it => it.key));

    return (
      <Dynamic component={"div"} {...restProps}>
        <For each={items()}>{(_key, i) => {
          // const it: Accessor<KeyObject> = createMemo(JSON.parse(item()));
          const it = () => keyEntities()[i()];
          return (
            <CSSMotion
              {...motionProps}
              key={it().key}
              visible={it().status === STATUS_ADD || it().status === STATUS_KEEP}
              eventProps={splitProps(it(), ['status'])[1]}
              onVisibleChanged={changedVisible => {
                props.onVisibleChanged?.(changedVisible, { key: it().key });
                if (!changedVisible) {
                  const restKeysCount = removeKey(it().key);

                  if (restKeysCount === 0 && typeof props.onAllRemoved === 'function') {
                    props.onAllRemoved();
                  }
                }
              }}
            >
              {props.children}
            </CSSMotion>
          );
        }}
        </For>
      </Dynamic>
    );
  }
  return CSSMotionList;
}

export default genCSSMotionList(supportTransition);
