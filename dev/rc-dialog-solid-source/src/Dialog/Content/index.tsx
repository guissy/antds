import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import classNames from 'classnames';
import CSSMotion from 'rc-motion-solid';
import { offset } from '../../util';
import type { PanelProps, ContentRef } from './Panel';
import Panel from './Panel';

export type ContentProps = {
  motionName: string;
  ariaId: string;
  onVisibleChanged: (visible: boolean) => void;
} & PanelProps;

const Content: Component<ContentProps & JSX.CustomAttributes<HTMLDivElement>> = ((props) => {
  // const {
  //   prefixCls,
  //   title,
  //   style,
  //   className,
  //   visible,
  //   forceRender,
  //   destroyOnClose,
  //   motionName,
  //   ariaId,
  //   onVisibleChanged,
  //   mousePosition,
  // } = props;

  let dialogRef  = null as (HTMLDivElement | null);

  // ============================= Style ==============================
  const [transformOrigin, setTransformOrigin] = createSignal<string>();
  const contentStyle: JSX.CSSProperties = {};

  if (transformOrigin) {
    (contentStyle as unknown as { transformOrigin: typeof transformOrigin }).transformOrigin = transformOrigin;
  }

  function onPrepare() {
    const elementOffset = offset(dialogRef);

    setTransformOrigin(
      props.mousePosition
        ? `${props.mousePosition.x - elementOffset.left}px ${props.mousePosition.y - elementOffset.top}px`
        : '',
    );
  }

  // ============================= Render =============================
  return (
    <CSSMotion
      visible={props.visible}
      onVisibleChanged={props.onVisibleChanged}
      onAppearPrepare={onPrepare}
      onEnterPrepare={onPrepare}
      forceRender={props.forceRender}
      motionName={props.motionName}
      removeOnLeave={props.destroyOnClose}
      ref={dialogRef}
    >
      {({ className: motionClassName, style: motionStyle }) => (
        <Panel
          {...props}
          ref={props.ref}
          title={props.title}
          ariaId={props.ariaId}
          prefixCls={props.prefixCls}
          // holderRef={motionRef}
          style={{ ...motionStyle, ...props.style, ...contentStyle }}
          className={classNames(props.className, motionClassName)}
        />
      )}
    </CSSMotion>
  );
});

;(Content as unknown as { displayName: string }).displayName = 'Content';

export default Content;
