import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, on} from "solid-js";
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

export default function InlineSubMenuList(props: InlineSubMenuListProps) {
  
  const fixedMode: MenuMode = 'inline';
  // {
  //   id,
  //   open,
  //   keyPath,
  //   children,
  // }
  // const {
  //   prefixCls,
  //   forceSubMenuRender,
  //   motion,
  //   defaultMotions,
  //   mode,
  // }
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  // Always use latest mode check
  let sameModeRef = () => context.mode === fixedMode;

  // We record `destroy` mark here since when mode change from `inline` to others.
  // The inline list should remove when motion end.
  const [destroy, setDestroy] = createSignal(!sameModeRef());

  // const mergedOpen = createMemo(() => sameModeRef() ? props.open : false);

  // ================================= Effect =================================
  // Reset destroy state when mode change back
  createEffect(on(() => context.mode, () => {
    // context.mode; // changed
    if (sameModeRef()) {
      setDestroy(false);
    }
  }));

  // ================================= Render =================================
  const mergedMotion = () => {
    const motion = { ...getMotion(fixedMode, context.motion, context.defaultMotions) };
      // No need appear since nest inlineCollapse changed
    if (props.keyPath.length > 1) {
      motion.motionAppear = false;
    }
      // Hide inline list when mode changed and motion end
    const originOnVisibleChanged = motion.onVisibleChanged;
    motion.onVisibleChanged = newVisible => {
      if (!sameModeRef() && !newVisible) {
        setDestroy(true);
      }

      return originOnVisibleChanged?.(newVisible);
    };
    return motion;
  };

  if (destroy()) {
    // TODO: solid
    return null;
  }

  return (
    <MenuContextProvider mode={fixedMode} locked={!sameModeRef()}>
      <CSSMotion
        visible={sameModeRef() ? props.open : false}
        {...mergedMotion()}
        forceRender={context.forceSubMenuRender}
        removeOnLeave={false}
        leavedClassName={`${context.prefixCls}-hidden`}
      >
        {({ className: motionClassName, style: motionStyle }) => {
          return (
            <SubMenuList
              id={props.id}
              class={motionClassName}
              style={motionStyle}
              ref={() => 1}
            >
              {props.children}
            </SubMenuList>
          );
        }}
      </CSSMotion>
    </MenuContextProvider>
  );
}
