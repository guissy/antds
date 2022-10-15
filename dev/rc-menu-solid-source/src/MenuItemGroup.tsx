import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps} from "solid-js";
import classNames from 'classnames';
import omit from 'rc-util-solid/lib/omit';
import { parseChildren } from './utils/nodeUtil';
import { MenuContext, MenuContextProps } from './context/MenuContext';
import { useFullPath, useMeasure } from './context/PathContext';
import type { MenuItemGroupType } from './interface';

export interface MenuItemGroupProps
  extends Omit<MenuItemGroupType, 'type' | 'children' | 'label'> {
  title?: JSX.Element;

  children?: JSX.Element;

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string;

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean;
}

const InternalMenuItemGroup = (props: MenuItemGroupProps) => {
  // {
  //   className,
  //   title,
  //   eventKey,
  //   children,
  //   ...restProps
  // }
  const [_, restProps] = splitProps(props, ['className', 'title', 'eventKey', 'children'])
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  const groupPrefixCls = () => `${context.prefixCls}-item-group`;

  return (
    <li
      {...restProps}
      onClick={e => e.stopPropagation()}
      class={classNames(groupPrefixCls(), props.className)}
    >
      <div
        class={`${groupPrefixCls()}-title`}
        title={typeof props.title === 'string' ? props.title : undefined}
      >
        {props.title}
      </div>
      <ul class={`${groupPrefixCls()}-list`}>{props.children}</ul>
    </li>
  );
};

export default function MenuItemGroup({
  children,
  ...props
}: MenuItemGroupProps): JSX.Element {
  const connectedKeyPath = useFullPath(() => props.eventKey || props.key);
  const childList: JSX.Element[] = parseChildren(
    children,
    connectedKeyPath(),
  );

  const measure = useMeasure();
  if (measure) {
    return childList as any as JSX.Element;
  }

  return (
    <InternalMenuItemGroup {...omit(props, ['warnKey'])}>
      {childList}
    </InternalMenuItemGroup>
  );
}
