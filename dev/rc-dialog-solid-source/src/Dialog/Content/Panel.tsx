import { onMount, Ref, type Component, type JSX } from "solid-js";
import classNames from 'classnames';
// import MemoChildren from './MemoChildren';
import type { IDialogPropTypes } from '../../IDialogPropTypes';

const sentinelStyle = { width: 0, height: 0, overflow: 'hidden', outline: 'none' } as JSX.CSSProperties;

export interface PanelProps extends Omit<IDialogPropTypes, 'getOpenCount'> {
  ref: Ref<ContentRef>
  prefixCls: string;
  ariaId?: string;
  onMouseDown?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onMouseUp?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  holderRef?: Ref<HTMLDivElement>;
}

export type ContentRef = {
  focus: () => void;
  changeActive: (next: boolean) => void;
};

const Panel: Component<PanelProps & JSX.CustomAttributes<HTMLDivElement>> = ((props) => {
  // const [_, restProps] = ["prefixCls","className","style","title","ariaId","footer","closable","closeIcon","onClose","children","bodyStyle","bodyProps","modalRender","onMouseDown","onMouseUp","holderRef","visible","forceRender","width","height"] 

  // ================================= Refs =================================
  let sentinelStartRef  = null as (HTMLDivElement | null);
  let sentinelEndRef  = null as (HTMLDivElement | null);

  onMount(() => {
    props.ref?.(({
      focus: () => {
        sentinelStartRef?.focus();
      },
      changeActive: (next) => {
        const { activeElement } = document;
        
        if (next && activeElement === sentinelEndRef) {
          sentinelStartRef.focus();
        } else if (!next && activeElement === sentinelStartRef) {
          sentinelEndRef.focus();
        }
      },
    }));
  })

  // ================================ Style =================================
  const contentStyle: JSX.CSSProperties = {};

  if (props.width !== undefined) {
    contentStyle.width = typeof props.width === 'number' ? props.width + 'px' : props.width;
  }
  if (props.height !== undefined) {
    contentStyle.height = typeof props.height === 'number' ? props.height + 'px' : props.height;
  }
  // ================================ Render ================================
  let footerNode: JSX.Element;
  if (props.footer) {
    footerNode = <div class={`${props.prefixCls}-footer`}>{props.footer}</div>;
  }

  let headerNode: JSX.Element;
  if (props.title) {
    headerNode = (
      <div class={`${props.prefixCls}-header`}>
        <div class={`${props.prefixCls}-title`} id={props.ariaId}>
          {props.title}
        </div>
      </div>
    );
  }

  let closer: JSX.Element;
  if (props.closable) {
    closer = (
      <button type="button" onClick={props.onClose} aria-label="Close" class={`${props.prefixCls}-close`}>
        {props.closeIcon || <span class={`${props.prefixCls}-close-x`} />}
      </button>
    );
  }

  const content = () => (
    <div class={`${props.prefixCls}-content`}>
      {closer}
      {headerNode}
      <div class={`${props.prefixCls}-body`} style={props.bodyStyle} {...props.bodyProps}>
        {props.children}
      </div>
      {footerNode}
    </div>
  );

  return (
    <div
      key="dialog-element"
      role="dialog"
      aria-labelledby={props.title ? props.ariaId : null}
      aria-modal="true"
      ref={props.holderRef}
      style={{
        ...props.style,
        ...contentStyle,
      }}
      class={classNames(props.prefixCls, props.className)}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
    >
      <div tabIndex={0} ref={sentinelStartRef} style={sentinelStyle} aria-hidden="true" />
      {/* <MemoChildren shouldUpdate={visible || forceRender}> */}
        {props.modalRender ? props.modalRender(content()) : content}
      {/* </MemoChildren> */}
      <div tabIndex={0} ref={sentinelEndRef} style={sentinelStyle} aria-hidden="true" />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  ;(Panel as unknown as { displayName: string }).displayName = 'Panel';
}

export default Panel;
