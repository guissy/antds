import Menu, { Item as MenuItem, Divider } from 'rc-menu-solid';
import '../../assets/index.less';
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Dropdown from '../../src';

function onSelect({ key }) {
  console.log(`${key} selected`);
}

function onVisibleChange(visible) {
  console.log(visible);
}

const menu = (
  <Menu onSelect={onSelect}>
    <MenuItem disabled>disabled</MenuItem>
    <MenuItem key="1">one</MenuItem>
    <Divider />
    <MenuItem key="2">two</MenuItem>
  </Menu>
);

export default function Arrow() {
  return (
    <div style={{ margin: '20px' }}>
      <div style={{ height: '100px' }} />
      <div>
        <Dropdown
          arrow
          trigger={['click']}
          overlay={menu}
          animation="slide-up"
          onVisibleChange={onVisibleChange}
        >
          <button style={{ width: '100px' }}>open</button>
        </Dropdown>
      </div>
      <div>
        <Dropdown
          placement="topLeft"
          arrow
          trigger={['click']}
          overlay={menu}
          animation="slide-up"
          onVisibleChange={onVisibleChange}
        >
          <button style={{ width: '100px' }}>open</button>
        </Dropdown>
      </div>
    </div>
  );
}
