import { type Component, type JSX } from "solid-js";
import classNames from 'classnames';

export interface ContentProps {
  prefixCls?: string;
  children: (() => JSX.Element) | JSX.Element;
  id?: string;
  overlayInnerStyle?: JSX.CSSProperties;
  arrowContent?: JSX.Element;
  className?: string;
  style?: JSX.CSSProperties;
  showArrow?: boolean;
}

export default function Popup(props: ContentProps) {


  return (
    <div class={classNames(`${props.prefixCls}-content`, props.className)} style={props.style}>
      {props.showArrow !== false && (
        <div class={`${props.prefixCls}-arrow`}>
          {props.arrowContent}
        </div>
      )}
      <div class={`${props.prefixCls}-inner`} id={props.id} role="tooltip" style={props.overlayInnerStyle}>
        {props.children}
      </div>
    </div>
  );
}
