/* eslint no-console:0 */

import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Menu, { Item as MenuItem } from '../../src';

import '../../assets/index.less';


const menuStyle = {
  width: '200px',
  height: '200px',
  overflow: 'auto',
};

export default () => (
  <div>
    <h2>keyboard scrollable menu</h2>
    <Menu style={menuStyle}>{() => {
      const children = [];
      for (let i = 0; i < 20; i += 1) {
        children.push(<MenuItem key={String(i)}>{i}</MenuItem>);
      }
      return children
    }}</Menu>
  </div>
);
