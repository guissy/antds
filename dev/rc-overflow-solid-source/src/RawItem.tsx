import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps } from "solid-js";
import classNames from 'classnames';
import Item from './Item';
import { OverflowContext } from './Overflow';
import type { ComponentType } from './Overflow';
import { Dynamic } from "solid-js/web";

export interface RawItemProps extends JSX.HTMLAttributes<any> {
  component?: ComponentType;
  children?: JSX.Element;
  className?: string;
}

const InternalRawItem = (props: RawItemProps) => {
  const context = useContext(OverflowContext);

  // Render directly when context not provided
  if (!context) {
    const [_, restProps] = splitProps(props, ['component']);
    return <Dynamic
      component={props.component as unknown as string}
      {...restProps}
      ref={props.ref}
    />;
  }

  const { className: contextClassName, ...restContext } = context;
  // const { className, ...restProps } = props;
  const [_, restProps] = splitProps(props, ['className']);
  // Do not pass context to sub item to avoid multiple measure
  return (
    <OverflowContext.Provider value={null}>
      <Item
        ref={props.ref}
        class={classNames(contextClassName, props.className)}
        {...restContext}
        {...restProps}
      />
    </OverflowContext.Provider>
  );
};

const RawItem = (InternalRawItem);
; (RawItem as unknown as { displayName: string }).displayName = 'RawItem';

export default RawItem;
