import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps} from "solid-js";
import classNames from 'classnames';
import type { IconDefinition } from '@ant-design/icons-svg/lib/types';

import Context from './Context';
import type { IconBaseProps } from './Icon';
import SolidIcon from './IconBase';
import { getTwoToneColor, TwoToneColor, setTwoToneColor } from './twoTonePrimaryColor';
import { normalizeTwoToneColors } from '../utils';

export interface AntdIconProps extends IconBaseProps {
  twoToneColor?: TwoToneColor;
}

export interface IconComponentProps extends AntdIconProps {
  icon: IconDefinition;
}

// Initial setting
// should move it to antd main repo?
setTwoToneColor('#1890ff');

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/34757#issuecomment-488848720
interface IconBaseComponent<Props>
  extends JSX.IntrinsicAttributes {
  getTwoToneColor: typeof getTwoToneColor;
  setTwoToneColor: typeof setTwoToneColor;
}

const Icon: Component<IconComponentProps & JSX.CustomAttributes<HTMLDivElement>> = ((props) => {
  // const {
  //   // affect outter <i>...</i>
  //   className,

  //   // affect inner <svg>...</svg>
  //   icon,
  //   spin,
  //   rotate,

  //   tabIndex,
  //   onClick,

  //   // other
  //   twoToneColor,

  //   ...restProps
  // } = props;
  const [_, restProps] = splitProps(props, ["className", "icon", "spin", "rotate", "tabIndex", "onClick", "twoToneColor"]);


  const { prefixCls = 'anticon' } = useContext(Context);

  const classString = classNames(
    prefixCls,
    {
      [`${prefixCls}-${props.icon.name}`]: !!props.icon.name,
      [`${prefixCls}-spin`]: !!props.spin || props.icon.name === 'loading',
    },
    props.className,
    {...props.classList},
    props["class"]
  );

  let iconTabIndex = props.tabIndex;
  if (iconTabIndex === undefined && props.onClick) {
    iconTabIndex = -1;
  }

  const svgStyle = props.rotate
    ? {
        msTransform: `rotate(${props.rotate}deg)`,
        transform: `rotate(${props.rotate}deg)`,
      }
    : undefined;

  const [primaryColor, secondaryColor] = normalizeTwoToneColors(props.twoToneColor);

  return (
    <span
      role="img"
      aria-label={props.icon.name}
      {...restProps}
      
      tabIndex={iconTabIndex}
      onClick={props.onClick}
      class={classString}
    >
      <SolidIcon
        icon={props.icon}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        style={svgStyle}
      />
    </span>
  );
})

;(Icon as unknown as { displayName: string }).displayName = 'AntdIcon';
(Icon as unknown as { getTwoToneColor: typeof getTwoToneColor }).getTwoToneColor = getTwoToneColor;
(Icon as unknown as { setTwoToneColor: typeof setTwoToneColor }).setTwoToneColor = setTwoToneColor;

export default Icon;
