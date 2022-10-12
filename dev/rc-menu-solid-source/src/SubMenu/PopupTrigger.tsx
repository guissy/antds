import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, onCleanup, on} from "solid-js";
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

export default function PopupTrigger(props: PopupTriggerProps) {
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
  // {
  //   prefixCls,
  //   visible,
  //   children,
  //   popup,
  //   popupClassName,
  //   popupOffset,
  //   disabled,
  //   mode,
  //   onVisibleChange,
  // }
  const context = useContext(MenuContext) ?? {} as MenuContextProps;

  const [innerVisible, setInnerVisible] = createSignal(false);

  const placement = context.rtl
    ? { ...placementsRtl, ...context.builtinPlacements }
    : { ...placements, ...context.builtinPlacements };

  // const popupPlacement = popupPlacementMap[props.mode];

  // const targetMotion = getMotion(props.mode, context.motion, context.defaultMotions);

  // const mergedMotion: CSSMotionProps = {
  //   ...getMotion(props.mode, context.motion, context.defaultMotions),
  //   leavedClassName: `${props.prefixCls}-hidden`,
  //   removeOnLeave: false,
  //   motionAppear: true,
  // };

  // Delay to change visible
  let visibleRef = null as (number | null);
  createEffect(on(() => props.visible, () => {
    visibleRef = raf(() => {
      setInnerVisible(props.visible);
    });
    onCleanup(() => {
      raf.cancel(visibleRef);
    })
  }));

  return (
    <Trigger
      prefixCls={props.prefixCls}
      popupClassName={classNames(
        `${props.prefixCls}-popup`,
        {
          [`${props.prefixCls}-rtl`]: context.rtl,
        },
        props.popupClassName,
        context.rootClassName,
      )}
      stretch={props.mode === 'horizontal' ? 'minWidth' : null}
      getPopupContainer={context.getPopupContainer}
      builtinPlacements={placement}
      popupPlacement={popupPlacementMap[props.mode]}
      popupVisible={innerVisible()}
      popup={props.popup}
      popupAlign={props.popupOffset && { offset: props.popupOffset }}
      action={props.disabled ? [] : [context.triggerSubMenuAction]}
      mouseEnterDelay={context.subMenuOpenDelay}
      mouseLeaveDelay={context.subMenuCloseDelay}
      onPopupVisibleChange={props.onVisibleChange}
      forceRender={context.forceSubMenuRender}
      popupMotion={{
        ...getMotion(props.mode, context.motion, context.defaultMotions),
        leavedClassName: `${props.prefixCls}-hidden`,
        removeOnLeave: false,
        motionAppear: true,
      }}
    >
      {props.children}
    </Trigger>
  );
}
