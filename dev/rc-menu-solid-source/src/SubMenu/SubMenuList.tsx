import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps } from "solid-js";
import classNames from 'classnames';
import { MenuContext, MenuContextProps } from '../context/MenuContext';

export interface SubMenuListProps
  extends JSX.HTMLAttributes<HTMLUListElement> {
  className?: string;
  children?: JSX.Element;
}

const SubMenuList = (props: SubMenuListProps) => {
  const [_, restProps] = splitProps(props, ['className', 'children']);
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  return (
    <ul
      class={classNames(
        context.prefixCls,
        context.rtl && `${context.prefixCls}-rtl`,
        `${context.prefixCls}-sub`,
        `${context.prefixCls}-${context.mode === 'inline' ? 'inline' : 'vertical'}`,
        props.className,
      )}
      {...restProps}
      data-menu-list
      ref={props.ref}
    >
      {props.children}
    </ul>
  );
};

// const SubMenuList = (SubMenuList);
; (SubMenuList as unknown as { displayName: string }).displayName = 'SubMenuList';

export default SubMenuList;
