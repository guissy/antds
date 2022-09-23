import {type Component, type JSX, useContext, children as Children, splitProps} from "solid-js";
import classNames from 'classnames';
import Context from './Context';

import { svgBaseProps, warning, useInsertStyles } from '../utils';

export interface IconBaseProps extends React.HTMLProps<HTMLSpanElement> {
  spin?: boolean;
  rotate?: number;
}

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill: string;
  viewBox?: string;
  className?: string;
  style?: JSX.CSSProperties;
}
export interface IconComponentProps extends IconBaseProps {
  viewBox?: string;
  component?: React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>> | React.ForwardRefExoticComponent<CustomIconComponentProps>;
  ariaLabel?: React.AriaAttributes['aria-label'];
}

const Icon: Component<IconComponentProps & JSX.CustomAttributes<HTMLDivElement>> = ((props) => {
  // const {
    // affect outter <i>...</i>
    // className,

    // // affect inner <svg>...</svg>
    // component: Component,
    // viewBox,
    // spin,
    // rotate,

    // tabIndex,
    // onClick,

    // // children
    // children,
    // ...restProps
  // } = props;

  const [_, restProps] = splitProps(props, ["className", "spin", "rotate", "tabIndex", "onClick", "children"]);

  warning(
    Boolean(props.component || props.children),
    'Should have `component` prop or `children`.',
  );

  useInsertStyles();

  const { prefixCls = 'anticon' } = useContext(Context);

  const classString = classNames(
    prefixCls,
    props.className,
  );

  const svgClassString = classNames({
    [`${prefixCls}-spin`]: !!props.spin,
  });

  const svgStyle = props.rotate
    ? {
        msTransform: `rotate(${props.rotate}deg)`,
        transform: `rotate(${props.rotate}deg)`,
      }
    : undefined;

  const innerSvgProps: CustomIconComponentProps = {
    ...svgBaseProps,
    className: svgClassString,
    style: svgStyle,
    viewBox: props.viewBox,
  };

  if (!props.viewBox) {
    delete innerSvgProps.viewBox;
  }

  // component > children
  const renderInnerNode = () => {
    // const Component = props.component;
    const children = Children(() => props.children)()
    if (Component) {
      return <Component {...innerSvgProps}>{children}</Component>;
    }

    if (children) {
      warning(
        Boolean(props.viewBox) ||
          ((children as Node)?.nodeName === 'use'),
        'Make sure that you provide correct `viewBox`' +
        ' prop (default `0 0 1024 1024`) to the icon.',
      );

      return (
        <svg {...innerSvgProps} viewBox={props.viewBox}>
          {children}
        </svg>
      );
    }

    return null;
  };

  let iconTabIndex = props.tabIndex;
  if (iconTabIndex === undefined && props.onClick) {
    iconTabIndex = -1;
  }

  return (
    <span
      role="img"
      {...restProps}
      
      tabIndex={iconTabIndex}
      onClick={props.onClick}
      class={classString}
    >
      {renderInnerNode()}
    </span>
  );
});

;(Icon as unknown as { displayName: string }).displayName = 'AntdIcon';

export default Icon;
