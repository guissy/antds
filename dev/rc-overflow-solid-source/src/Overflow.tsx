import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, splitProps, Accessor, Show, on } from "solid-js";
import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer-solid';
import useLayoutEffect from 'rc-util-solid/lib/hooks/useLayoutEffect';
import Item from './Item';
import { useBatchFrameState } from './hooks/useBatchFrameState';
import RawItem from './RawItem';
import { Dynamic } from "solid-js/web";

export const OverflowContext = createContext<{
  prefixCls: string;
  responsive: boolean;
  order: number;
  registerSize: (key: number | string, width: number | null) => void;
  display: boolean;

  invalidate: boolean;

  // Item Usage
  item?: any;
  itemKey?: number | string;

  // Rest Usage
  className?: string;
}>(null);

const RESPONSIVE = 'responsive' as const;
const INVALIDATE = 'invalidate' as const;

export type ComponentType =
  | Component<any>
  | JSX.IntrinsicAttributes
  | Component<any>
  | keyof React.ReactHTML;

export interface OverflowProps<ItemType> extends JSX.HTMLAttributes<any> {
  prefixCls?: string;
  className?: string;
  style?: JSX.CSSProperties;
  data?: ItemType[];
  itemKey?: number | string | ((item: ItemType) => number | string);
  /** Used for `responsive`. It will limit render node to avoid perf issue */
  itemWidth?: number;
  renderItem?: (item: ItemType) => JSX.Element;
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawItem?: (item: ItemType, index: number) => JSX.Element;
  maxCount?: number | typeof RESPONSIVE | typeof INVALIDATE;
  renderRest?:
  | JSX.Element
  | ((omittedItems: ItemType[]) => JSX.Element);
  /** @private Do not use in your production. Render raw node that need wrap Item by developer self */
  renderRawRest?: (omittedItems: ItemType[]) => JSX.Element;
  suffix?: JSX.Element;
  component?: ComponentType;
  itemComponent?: ComponentType;

  /** @private This API may be refactor since not well design */
  onVisibleChange?: (visibleCount: number) => void;

  /** When set to `full`, ssr will render full items by default and remove at client side */
  ssr?: 'full';
}

function defaultRenderRest<ItemType>(omittedItems: ItemType[]) {
  return `+ ${omittedItems.length} ...`;
}

function Overflow<ItemType extends JSX.Element>(
  props_: OverflowProps<ItemType>,
) {
  const defaultProps = {
    prefixCls: 'rc-overflow',
    data: [],
    itemWidth: 10,
    component: 'div',
  }
  const props = mergeProps(defaultProps, props_);
  const [_, restProps] = splitProps(props, ["prefixCls", "data", "renderItem", "renderRawItem",
    "itemKey", "itemWidth", "ssr", "style", "className", "maxCount", "renderRest", "renderRawRest",
    "suffix", "component", "itemComponent", "onVisibleChange"])
  // const {
  //   prefixCls = 'rc-overflow',
  //   data = [],
  //   renderItem,
  //   renderRawItem,
  //   itemKey,
  //   itemWidth = 10,
  //   ssr,
  //   style,
  //   className,
  //   maxCount,
  //   renderRest,
  //   renderRawRest,
  //   suffix,
  //   component: Component = 'div',
  //   itemComponent,
  //   onVisibleChange,
  //   // ...restProps
  // } = props;

  const [dep, createUseState] = useBatchFrameState();

  const fullySSR = () => props.ssr === 'full';

  const [containerWidth, setContainerWidth] = createSignal<number>(null);
  const mergedContainerWidth = () => (containerWidth() || 0);

  const [itemWidths, setItemWidths] = createUseState(
    new Map<number | string, number>(),
  );

  const [prevRestWidth, setPrevRestWidth] = createUseState(0);
  const [restWidth, setRestWidth] = createUseState(0);

  const [suffixWidth, setSuffixWidth] = createUseState(0);
  const [suffixFixedStart, setSuffixFixedStart] = createSignal<number>(null);

  const [displayCount, setDisplayCount] = createSignal(null);
  const mergedDisplayCount = createMemo(() => {
    if (displayCount() === null && fullySSR()) {
      return Number.MAX_SAFE_INTEGER;
    }

    return displayCount() || 0;
  }, [displayCount, containerWidth()]);

  const [restReady, setRestReady] = createSignal(false);

  const itemPrefixCls = `${props.prefixCls}-item`;

  // Always use the max width to avoid blink
  const mergedRestWidth = () => Math.max(prevRestWidth(), restWidth());

  // ================================= Data =================================
  const isResponsive = () => props.maxCount === RESPONSIVE;
  const propsData = createMemo(() => props.data);
  const shouldResponsive = () => propsData().length && isResponsive();
  const invalidate = () => props.maxCount === INVALIDATE;

  /**
   * When is `responsive`, we will always render rest node to get the real width of it for calculation
   */
  const showRest = () =>
    shouldResponsive() ||
    (typeof props.maxCount === 'number' && propsData()?.length > props.maxCount);

  const mergedData = createMemo(on([() => Array.isArray(propsData()) ? propsData() : [], () => props.itemWidth, containerWidth, () => props.maxCount, shouldResponsive, mergedContainerWidth], 
    ([data, itemWidth, containerWidth, maxCount, shouldResponsive, mergedContainerWidth]) => {
    let items = data;

    if (shouldResponsive) {
      if (containerWidth === null && fullySSR()) {
        items = data;
      } else {
        items = data.slice(
          0,
          Math.min(data.length, mergedContainerWidth / itemWidth),
        );
      }
    } else if (typeof maxCount === 'number') {
      items = data.slice(0, maxCount);
    }
    return items;
  }));

  const omittedItems = createMemo(() => {
    const data = Array.isArray(propsData()) ? propsData() : [];
    if (shouldResponsive()) {
      return data.slice(mergedDisplayCount() + 1);
    }
    return data.slice(mergedData().length);
  }, [propsData(), mergedData, shouldResponsive, mergedDisplayCount]);

  // ================================= Item =================================
  const getKey = (item: ItemType, index: number) => {
    if (typeof props.itemKey === 'function' && item) {
      return props.itemKey(item);
    }
    return (props.itemKey && (item as any)?.[props.itemKey as string]) ?? index;
  };
  //   [itemKey],
  // );

  // const mergedRenderItem = (
  //   props.renderItem || ((item: ItemType) => item)
  // );

  function updateDisplayCount(
    count: number,
    suffixFixedStartVal: number,
    notReady?: boolean,
  ) {
    // React 18 will sync render even when the value is same in some case.
    // We take `mergedData` as deps which may cause dead loop if it's dynamic generate.
    // ref: https://github.com/ant-design/ant-design/issues/36559    
    if (
      displayCount() === count &&
      (suffixFixedStartVal === undefined ||
        suffixFixedStartVal === suffixFixedStart())
    ) {
      return;
    }

    setDisplayCount(count);
    if (!notReady) {
      setRestReady(count < propsData().length - 1);

      props.onVisibleChange?.(count);
    }

    if (suffixFixedStartVal !== undefined) {
      setSuffixFixedStart(suffixFixedStartVal);
    }
  }

  // ================================= Size =================================
  function onOverflowResize(_: object, element: HTMLElement) {
    setContainerWidth(element.clientWidth);
  }

  function registerSize(key: number | string, width: number | null) {
    setItemWidths(origin => {
      const clone = new Map(origin);
      if (width === null) {
        clone.delete(key);
      } else {
        clone.set(key, width);
      }
      return clone;
    });
  }

  function registerOverflowSize(_: number | string, width: number | null) {
    setRestWidth(width!);
    setPrevRestWidth(restWidth);
  }

  function registerSuffixSize(_: number | string, width: number | null) {
    setSuffixWidth(width!);
  }

  // ================================ Effect ================================
  function getItemWidth(index: number) {
    return itemWidths().get(getKey(mergedData()[index], index));
  }

  useLayoutEffect(on([dep, mergedData], () => {
    // console.log("useLayoutEffect", mergedContainerWidth(), mergedRestWidth(), mergedData());
    
    if (mergedContainerWidth() && mergedRestWidth() && mergedData()) {
      let totalWidth = suffixWidth();

      const len = mergedData().length;
      const lastIndex = len - 1;

      // When data count change to 0, reset this since not loop will reach
      if (!len) {
        updateDisplayCount(0, null);
        return;
      }

      for (let i = 0; i < len; i += 1) {
        let currentItemWidth = getItemWidth(i);

        // Fully will always render
        if (fullySSR()) {
          currentItemWidth = currentItemWidth || 0;
        }

        // Break since data not ready
        if (currentItemWidth === undefined) {
          updateDisplayCount(i - 1, undefined, true);
          break;
        }

        // Find best match
        totalWidth += currentItemWidth;

        if (
          // Only one means `totalWidth` is the final width
          (lastIndex === 0 && totalWidth <= mergedContainerWidth()) ||
          // Last two width will be the final width
          (i === lastIndex - 1 &&
            totalWidth + getItemWidth(lastIndex)! <= mergedContainerWidth())
        ) {
          // Additional check if match the end
          updateDisplayCount(lastIndex, null);
          break;
        } else if (totalWidth + mergedRestWidth() > mergedContainerWidth()) {
          // Can not hold all the content to show rest
          updateDisplayCount(
            i - 1,
            totalWidth - currentItemWidth - suffixWidth() + restWidth(),
          );
          break;
        }
      }

      if (props.suffix && getItemWidth(0) + suffixWidth() > mergedContainerWidth()) {
        setSuffixFixedStart(null);
      }
    }
  }));

  // ================================ Render ================================
  const displayRest = () => restReady() && !!omittedItems().length;

  let suffixStyle: Accessor<JSX.CSSProperties> = createMemo(() => {
    let suffixStyle = {};
    if (suffixFixedStart() !== null && shouldResponsive()) {
      suffixStyle = {
        position: 'absolute',
        left: suffixFixedStart(),
        top: 0,
      };
    }
    return suffixStyle;
  });


  const itemSharedProps = () => ({
    prefixCls: itemPrefixCls,
    responsive: shouldResponsive(),
    component: props.itemComponent,
    invalidate: invalidate(),
  });

  // >>>>> Choice render fun by `renderRawItem`
  const internalRenderItemNode = props.renderRawItem
    ? (item: ItemType, index: number) => {
      const key = getKey(item, index);
      return (
        <OverflowContext.Provider
          // key={key}
          value={{
            ...itemSharedProps(),
            order: index,
            item,
            itemKey: key,
            registerSize,
            display: index <= mergedDisplayCount(),
          }}
        >
          {props.renderRawItem(item, index)}
        </OverflowContext.Provider>
      );
    }
    : (item: ItemType, index: number) => {
      const key = getKey(item, index);

      return (
        <Item
          {...itemSharedProps()}
          order={index}
          // key={key}
          item={item}
          renderItem={props.renderItem || ((item: ItemType) => item)}
          itemKey={key}
          registerSize={registerSize}
          display={index <= mergedDisplayCount()}
        />
      );
    };

  // >>>>> Rest node
  let restNode: JSX.Element;
  const restContextProps = () => ({
    order: displayRest() ? mergedDisplayCount() : Number.MAX_SAFE_INTEGER,
    className: `${itemPrefixCls}-rest`,
    registerSize: registerOverflowSize,
    display: displayRest(),
  });

  if (!props.renderRawRest) {
    const mergedRenderRest = props.renderRest || defaultRenderRest;

    restNode = (
      <Item
        {...itemSharedProps()}
        // When not show, order should be the last
        {...restContextProps()}
      >
        {typeof mergedRenderRest === 'function'
          ? mergedRenderRest(omittedItems())
          : mergedRenderRest}
      </Item>
    );
  } else if (props.renderRawRest) {
    restNode = (
      <OverflowContext.Provider
        value={{
          ...itemSharedProps(),
          ...restContextProps(),
        }}
      >
        {props.renderRawRest(omittedItems())}
      </OverflowContext.Provider>
    );
  }


  let overflowNode = (
    <Dynamic
      component={props.component as unknown as string}
      class={classNames(!invalidate() && props.prefixCls, props.className)}
      style={props.style}
      // ref={ref}
      {...restProps}
    >
      {mergedData().map(internalRenderItemNode)}

      {/* Rest Count Item */}
      {showRest() ? restNode : null}

      {/* Suffix Node */}
      {/* {props.suffix && ( */}
      <Show when={props.suffix}>
        <Item
          {...itemSharedProps}
          responsive={isResponsive()}
          responsiveDisabled={!shouldResponsive()}
          order={mergedDisplayCount()}
          class={`${itemPrefixCls}-suffix`}
          registerSize={registerSuffixSize}
          display
          style={suffixStyle()}
        >
          {props.suffix}
        </Item>
      </Show>
    </Dynamic>
  );

  // if (isResponsive()) {
  //   overflowNode = (
  //     <ResizeObserver onResize={onOverflowResize} disabled={!shouldResponsive()}>
  //       {overflowNode}
  //     </ResizeObserver>
  //   );
  // }

  return (
    <Show when={!isResponsive()} fallback={(
      <ResizeObserver onResize={onOverflowResize} disabled={!shouldResponsive()}>
        {overflowNode}
      </ResizeObserver>
    )}>
      {overflowNode}
    </Show>
  )
}

const ForwardOverflow = Overflow;

type ForwardOverflowType = <ItemType = any>(
  props: React.PropsWithChildren<OverflowProps<ItemType>> & {
    ref?: React.Ref<HTMLDivElement>;
  },
) => JSX.Element;

type FilledOverflowType = ForwardOverflowType & {
  Item: typeof RawItem;
  RESPONSIVE: typeof RESPONSIVE;
  /** Will work as normal `component`. Skip patch props like `prefixCls`. */
  INVALIDATE: typeof INVALIDATE;
};

; (ForwardOverflow as unknown as { displayName: string }).displayName = 'Overflow';

(ForwardOverflow as unknown as FilledOverflowType).Item = RawItem;
(ForwardOverflow as unknown as FilledOverflowType).RESPONSIVE = RESPONSIVE;
(ForwardOverflow as unknown as FilledOverflowType).INVALIDATE = INVALIDATE;

// Convert to generic type
export default ForwardOverflow as unknown as FilledOverflowType;
