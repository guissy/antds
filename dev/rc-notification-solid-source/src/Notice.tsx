import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, Show, on } from "solid-js"; import classNames from 'classnames';
import useId from 'rc-util-solid/lib/hooks/useId';
export interface NoticeConfig {
  key?: string;
  content?: JSX.Element;
  duration?: number | null;
  closeIcon?: JSX.Element;
  closable?: boolean;
  className?: string;
  style?: JSX.CSSProperties;
  /** @private Internal usage. Do not override in your code */
  props?: JSX.HTMLAttributes<HTMLDivElement> & Record<string, any>;

  onClose?: VoidFunction;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
}

export interface NoticeProps extends Omit<NoticeConfig, 'onClose'> {
  prefixCls: string;
  className?: string;
  style?: JSX.CSSProperties;
  eventKey: number | string;

  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onNoticeClose?: (key: number | string) => void;
}

const Notify: Component<NoticeProps & JSX.CustomAttributes<HTMLDivElement>> = ((_props) => {
  const defaultProps = {
    duration: 4.5,
    closeIcon: 'x',
  }
  const props = mergeProps(defaultProps, _props);
  // const {
  //   prefixCls,
  //   style,
  //   className,
  //   duration = 4.5,

  //   eventKey,
  //   content,
  //   closable,
  //   closeIcon = 'x',
  //   props: divProps,

  //   onClick,
  //   onNoticeClose,
  // } = props;
  const [hovering, setHovering] = createSignal(false);

  // ======================== Close =========================
  const onInternalClose = () => {
    props.onNoticeClose(props.eventKey);
  };

  // ======================== Effect ========================
  createEffect(() => {
    if (!hovering() && props.duration > 0) {
      const timeout = setTimeout(() => {
        onInternalClose();
      }, props.duration * 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [props.duration, hovering()]);

  // ======================== Render ========================
  const noticePrefixCls = `${props.prefixCls}-notice`;
  const idClose = '_' + String(props.key || 'notice').replace(/(\.|\s)/g, "") + '_close';
  const idContent = '_' + String(props.key || 'notice').replace(/(\.|\s)/g, "") + '_content';
  createEffect(() => {
    if (props.closeIcon) {
      let elm = Children(() => props.closeIcon)();
      if (typeof elm === 'string') {
        elm = document.createTextNode(elm);
      }
      if (elm instanceof Node) {
        const p = document.querySelector('#' + idClose);
        if (p?.firstChild) {
          p.removeChild(p.firstChild);
        }
        document.querySelector('#' + idClose)?.appendChild(elm as Node);      
      }
    }
    if (props.content) {
      let elm = Children(() => props.content)();
      if (typeof elm === 'string') {
        elm = document.createTextNode(elm);
      }
      if (elm instanceof Node) {
        const p = document.querySelector('#' + idContent);
        if (p?.firstChild) {
          p.removeChild(p.firstChild);
        }
        document.querySelector('#' + idContent)?.appendChild(elm as Node);      
      }
    }
  })

  return (
    <div
      {...props.props}
      ref={props.ref}
      class={classNames(noticePrefixCls, props.className, {
        [`${noticePrefixCls}-closable`]: props.closable,
      })}
      style={props.style}
      onMouseEnter={() => {
        setHovering(true);
      }}
      onMouseLeave={() => {
        setHovering(false);
      }}
      onClick={props.onClick}
    >
      {/* Content */}
      <div id={idContent} class={`${noticePrefixCls}-content`}>{props.content}</div>

      {/* Close Icon */}
      <Show when={props.closable}>
        <a
          id={idClose}
          tabIndex={0}
          class={`${noticePrefixCls}-close`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onInternalClose();
          }}
        >
          {props.closeIcon}
        </a>
      </Show>
    </div>
  );
});

export default Notify;
