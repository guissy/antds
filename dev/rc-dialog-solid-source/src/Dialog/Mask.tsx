import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import classNames from 'classnames';
import CSSMotion from 'rc-motion-solid';

export type MaskProps = {
  prefixCls: string;
  visible: boolean;
  motionName?: string;
  style?: JSX.CSSProperties;
  maskProps?: JSX.HTMLAttributes<HTMLDivElement>;
};

export default function Mask(props: MaskProps) {
  // const { prefixCls, style, visible, maskProps, motionName } = props;

  return (
    <CSSMotion
      key="mask"
      visible={props.visible}
      motionName={props.motionName}
      leavedClassName={`${props.prefixCls}-mask-hidden`}
    >
      {({ className: motionClassName, style: motionStyle }) => (
        <div
          style={{ ...motionStyle, ...props.style }}
          class={classNames(`${props.prefixCls}-mask`, motionClassName)}
          {...props.maskProps}
        />
      )}
    </CSSMotion>
  );
}
