import Menu, { Item as MenuItem, Divider } from 'rc-menu-solid'
import '../../assets/index.less'
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Dropdown from '../../src'

function onSelect({ key }) {
  console.log(`${key} selected`)
}

function onVisibleChange(visible) {
  console.log(visible)
}

const menuCallback = () => (
  <Menu onSelect={onSelect}>
    <MenuItem disabled>disabled</MenuItem>
    <MenuItem key="1">one</MenuItem>
    <Divider />
    <MenuItem key="2">two</MenuItem>
  </Menu>
)

export default function OverlayCallback() {
  return (
    <div style={{ margin: '20px' }}>
      <div style={{ height: '100px' }} />
      <div>
        <Dropdown
          trigger={['click']}
          overlay={menuCallback()}
          animation="slide-up"
          onVisibleChange={onVisibleChange}
        >
          <button style={{ width: '100px' }}>open</button>
        </Dropdown>
      </div>
    </div>
  )
}
