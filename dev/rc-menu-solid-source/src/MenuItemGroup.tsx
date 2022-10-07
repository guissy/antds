import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
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

const InternalMenuItemGroup = ({
  className,
  title,
  eventKey,
  children,
  ...restProps
}: MenuItemGroupProps) => {
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  const groupPrefixCls = () => `${context.prefixCls}-item-group`;

  return (
    <li
      {...restProps}
      onClick={e => e.stopPropagation()}
      class={classNames(groupPrefixCls(), className)}
    >
      <div
        class={`${groupPrefixCls()}-title`}
        title={typeof title === 'string' ? title : undefined}
      >
        {title}
      </div>
      <ul class={`${groupPrefixCls()}-list`}>{children}</ul>
    </li>
  );
};

export default function MenuItemGroup({
  children,
  ...props
}: MenuItemGroupProps): JSX.Element {
  const connectedKeyPath = useFullPath(props.eventKey);
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
