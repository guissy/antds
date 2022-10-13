/* eslint-disable no-console, no-param-reassign */
import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import Menu, { SubMenu, Item as MenuItem, Divider } from '../../src';
import '../../assets/index.less';

const getSvgIcon = (style = {}, text?: JSX.Element) => {
  if (text) {
    return <i style={style}>{text}</i>;
  }
  const path =
    'M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h' +
    '-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v' +
    '60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91' +
    '.5c1.9 0 3.8-0.7 5.2-2L869 536.2c14.7-12.8 14.7-35.6 0-48.4z';
  return (
    <i style={style}>
      <svg
        viewBox="0 0 1024 1024"
        width="1em"
        height="1em"
        fill="currentColor"
        style={{ 'vertical-align': '-.125em' }}
      >
        <path d={path} />
      </svg>
    </i>
  );
};

function itemIcon(props) {
  return getSvgIcon({
    position: 'absolute',
    right: '1rem',
    color: props.isSelected ? 'pink' : 'inherit',
  });
}

function expandIcon(props) {
  return getSvgIcon({
    position: 'absolute',
    right: '1rem',
    color: 'lightblue',
    transform: `rotate(${props.isOpen ? 90 : 0}deg)`,
  });
}

const collapseNode = () => ({ height: 0 });
const expandNode = node => ({ height: node.scrollHeight });

const inlineMotion = {
  motionName: 'rc-menu-collapse',
  onAppearStart: collapseNode,
  onAppearActive: expandNode,
  onEnterStart: collapseNode,
  onEnterActive: expandNode,
  onLeaveStart: expandNode,
  onLeaveActive: collapseNode,
};

const Demo: Component = () => {
  const onOpenChange = value => {
    console.log('onOpenChange', value);
  };

  const handleClick = info => {
    console.log(`clicked ${info.key}`);
    console.log(info);
  };

  const renderNestSubMenu = (props = {}) => (
    <SubMenu
      title={<span>offset sub menu 2</span>}
      key="4"
      popupOffset={[10, 15]}
      {...props}
    >
      <MenuItem key="4-1">inner inner</MenuItem>
      <Divider />
      <SubMenu key="4-2" title={<span>sub menu 3</span>}>
        <SubMenu title="sub 4-2-0" key="4-2-0">
          <MenuItem key="4-2-0-1">inner inner</MenuItem>
          <MenuItem key="4-2-0-2">inner inner2</MenuItem>
        </SubMenu>
        <MenuItem key="4-2-1">inn</MenuItem>
        <SubMenu title={<span>sub menu 4</span>} key="4-2-2">
          <MenuItem key="4-2-2-1">inner inner</MenuItem>
          <MenuItem key="4-2-2-2">inner inner2</MenuItem>
        </SubMenu>
        <SubMenu title="sub 4-2-3" key="4-2-3">
          <MenuItem key="4-2-3-1">inner inner</MenuItem>
          <MenuItem key="4-2-3-2">inner inner2</MenuItem>
        </SubMenu>
      </SubMenu>
    </SubMenu>
  );

  const renderCommonMenu = (props = {}) => (
    <Menu
      onClick={handleClick}
      onOpenChange={onOpenChange}
      {...props}
    >
      <SubMenu title={<span>sub menu</span>} key="1">
        <MenuItem key="1-1">0-1</MenuItem>
        <MenuItem key="1-2">0-2</MenuItem>
      </SubMenu>
      {renderNestSubMenu()}
      <MenuItem key="2">1</MenuItem>
      <MenuItem key="3">outer</MenuItem>
      <MenuItem disabled>disabled</MenuItem>
      <MenuItem key="5">outer3</MenuItem>
    </Menu>
  );


  const verticalMenu = renderCommonMenu({
    mode: 'vertical',
    openAnimation: 'zoom',
    itemIcon,
    expandIcon,
  });

  const inlineMenu = renderCommonMenu({
    mode: 'inline',
    defaultOpenKeys: ['1'],
    motion: inlineMotion,
    itemIcon,
    expandIcon,
  });

  return (
    <div style={{ margin: '20px' }}>
      <h2>Antd menu - Custom icon</h2>
      <div>
        <h3>vertical</h3>
        <div style={{ margin: '20px', width: '200px' }}>{verticalMenu}</div>
        <h3>inline</h3>
        <div style={{ margin: '20px', width: '400px' }}>{inlineMenu}</div>
      </div>
    </div>
  );

}

export default Demo;
/* eslint-enable */
