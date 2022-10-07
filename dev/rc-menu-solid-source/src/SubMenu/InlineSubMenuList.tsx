import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import CSSMotion from 'rc-motion-solid';
import { getMotion } from '../utils/motionUtil';
import MenuContextProvider, { MenuContext, MenuContextProps } from '../context/MenuContext';
import SubMenuList from './SubMenuList';
import type { MenuMode } from '../interface';

export interface InlineSubMenuListProps {
  id?: string;
  open: boolean;
  keyPath: string[];
  children: JSX.Element;
}

export default function InlineSubMenuList({
  id,
  open,
  keyPath,
  children,
}: InlineSubMenuListProps) {
  const fixedMode: MenuMode = 'inline';

  // const {
  //   prefixCls,
  //   forceSubMenuRender,
  //   motion,
  //   defaultMotions,
  //   mode,
  // }
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  // Always use latest mode check
  let sameModeRef  = false;
  sameModeRef = context.mode === fixedMode;

  // We record `destroy` mark here since when mode change from `inline` to others.
  // The inline list should remove when motion end.
  const [destroy, setDestroy] = createSignal(!sameModeRef);

  const mergedOpen = sameModeRef ? open : false;

  // ================================= Effect =================================
  // Reset destroy state when mode change back
  createEffect(() => {
    if (sameModeRef) {
      setDestroy(false);
    }
  }, [context.mode]);

  // ================================= Render =================================
  const mergedMotion = { ...getMotion(fixedMode, context.motion, context.defaultMotions) };

  // No need appear since nest inlineCollapse changed
  if (keyPath.length > 1) {
    mergedMotion.motionAppear = false;
  }

  // Hide inline list when mode changed and motion end
  const originOnVisibleChanged = mergedMotion.onVisibleChanged;
  mergedMotion.onVisibleChanged = newVisible => {
    if (!sameModeRef && !newVisible) {
      setDestroy(true);
    }

    return originOnVisibleChanged?.(newVisible);
  };

  if (destroy) {
    return null;
  }

  return (
    <MenuContextProvider mode={fixedMode} locked={!sameModeRef}>
      <CSSMotion
        visible={mergedOpen}
        {...mergedMotion}
        forceRender={context.forceSubMenuRender}
        removeOnLeave={false}
        leavedClassName={`${context.prefixCls}-hidden`}
      >
        {({ className: motionClassName, style: motionStyle }) => {
          return (
            <SubMenuList
              id={id}
              class={motionClassName}
              style={motionStyle}
            >
              {children}
            </SubMenuList>
          );
        }}
      </CSSMotion>
    </MenuContextProvider>
  );
}
