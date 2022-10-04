import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import classNames from 'classnames';
import type { CSSMotionProps } from 'rc-motion-solid';
import CSSMotion from 'rc-motion-solid';
import type { TransitionNameType, AnimationType } from '../interface';
import { getMotion } from '../utils/legacyUtil';

export interface MaskProps {
  prefixCls: string;
  visible?: boolean;
  zIndex?: number;
  mask?: boolean;

  // Motion
  maskMotion?: CSSMotionProps;

  // Legacy Motion
  maskAnimation?: AnimationType;
  maskTransitionName?: TransitionNameType;
}

const Mask: Component<MaskProps> = (props) => {
  // const {
  //   prefixCls,
  //   visible,
  //   zIndex,

  //   mask,
  //   maskMotion,
  //   maskAnimation,
  //   maskTransitionName,
  // } = props;

  if (!props.mask) {
    return null;
  }

  let motion: CSSMotionProps = createMemo(() => {
    let motion: CSSMotionProps = {};
    if (props.maskMotion || props.maskTransitionName || props.maskAnimation) {
      motion = {
        motionAppear: true,
        ...getMotion({
          motion: props.maskMotion,
          prefixCls: props.prefixCls,
          transitionName: props.maskTransitionName,
          animation: props.maskAnimation,
        }),
      };
    }
    return motion;
  });

  return (
    <CSSMotion {...motion()} visible={props.visible} removeOnLeave>
      {({ className }) => (
        <div
          style={{ 'z-index': props.zIndex } as {}}
          class={classNames(`${props.prefixCls}-mask`, className)}
        />
      )}
    </CSSMotion>
  );
}

export default Mask