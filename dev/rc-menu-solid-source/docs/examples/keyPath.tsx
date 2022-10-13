/* eslint no-console:0 */

import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import Menu, { SubMenu, Item as MenuItem } from '../../src';

import '../../assets/index.less';

const Test: Component = () => {
  const onClick = info => {
    console.log('click ', info);
  };

  const getMenu = () => {
    return (
      <Menu onClick={onClick} mode="inline">
        <SubMenu key="1" title="submenu1">
          <MenuItem key="1-1">item1-1</MenuItem>
          <MenuItem key="1-2">item1-2</MenuItem>
        </SubMenu>
        <SubMenu key="2" title="submenu2">
          <MenuItem key="2-1">item2-1</MenuItem>
          <MenuItem key="2-2">item2-2</MenuItem>
          <SubMenu key="2-3" title="submenu2-3">
            <MenuItem key="2-3-1">item2-3-1</MenuItem>
            <MenuItem key="2-3-2">item2-3-2</MenuItem>
          </SubMenu>
        </SubMenu>
        <MenuItem key="3">item3</MenuItem>
      </Menu>
    );
  }


  return (
    <div>
      <div style={{ width: '400px' }}>{getMenu()}</div>
    </div>
  );

}

export default Test;
