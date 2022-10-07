import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Trigger from 'rc-trigger-solid';
import classNames from 'classnames';
import raf from 'rc-util-solid/lib/raf';
import type { CSSMotionProps } from 'rc-motion-solid';
import { MenuContext, MenuContextProps } from '../context/MenuContext';
import { placements, placementsRtl } from '../placements';
import type { MenuMode } from '../interface';
import { getMotion } from '../utils/motionUtil';

const popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop',
};

export interface PopupTriggerProps {
  prefixCls: string;
  mode: MenuMode;
  visible: boolean;
  children: JSX.Element;
  popup: JSX.Element;
  popupClassName?: string;
  popupOffset?: number[];
  disabled: boolean;
  onVisibleChange: (visible: boolean) => void;
}

export default function PopupTrigger({
  prefixCls,
  visible,
  children,
  popup,
  popupClassName,
  popupOffset,
  disabled,
  mode,
  onVisibleChange,
}: PopupTriggerProps) {
  // const {
  //   getPopupContainer,
  //   rtl,
  //   subMenuOpenDelay,
  //   subMenuCloseDelay,
  //   builtinPlacements,
  //   triggerSubMenuAction,
  //   forceSubMenuRender,
  //   rootClassName,

  //   // Motion
  //   motion,
  //   defaultMotions,
  // }
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  const [innerVisible, setInnerVisible] = createSignal(false);

  const placement = context.rtl
    ? { ...placementsRtl, ...context.builtinPlacements }
    : { ...placements, ...context.builtinPlacements };

  const popupPlacement = popupPlacementMap[mode];

  const targetMotion = getMotion(mode, context.motion, context.defaultMotions);

  const mergedMotion: CSSMotionProps = {
    ...targetMotion,
    leavedClassName: `${prefixCls}-hidden`,
    removeOnLeave: false,
    motionAppear: true,
  };

  // Delay to change visible
  let visibleRef  = null as (number | null);
  createEffect(() => {
    visibleRef = raf(() => {
      setInnerVisible(visible);
    });

    return () => {
      raf.cancel(visibleRef);
    };
  }, [visible]);

  return (
    <Trigger
      prefixCls={prefixCls}
      popupClassName={classNames(
        `${prefixCls}-popup`,
        {
          [`${prefixCls}-rtl`]: context.rtl,
        },
        popupClassName,
        context.rootClassName,
      )}
      stretch={mode === 'horizontal' ? 'minWidth' : null}
      getPopupContainer={context.getPopupContainer}
      builtinPlacements={placement}
      popupPlacement={popupPlacement}
      popupVisible={innerVisible}
      popup={popup}
      popupAlign={popupOffset && { offset: popupOffset }}
      action={disabled ? [] : [context.triggerSubMenuAction]}
      mouseEnterDelay={context.subMenuOpenDelay}
      mouseLeaveDelay={context.subMenuCloseDelay}
      onPopupVisibleChange={onVisibleChange}
      forceRender={context.forceSubMenuRender}
      popupMotion={mergedMotion}
    >
      {children}
    </Trigger>
  );
}
