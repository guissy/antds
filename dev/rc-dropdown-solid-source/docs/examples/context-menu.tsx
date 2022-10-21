import Menu, { Item as MenuItem } from 'rc-menu-solid'
import '../../assets/index.less'
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Dropdown from '../../src'

function ContextMenu() {
  const menu = (
    <Menu style={{ width: '140px' }}>
      <MenuItem key="1">one</MenuItem>
      <MenuItem key="2">two</MenuItem>
    </Menu>
  )

  return (
    <Dropdown
      trigger={['contextMenu']}
      overlay={menu}
      animation="slide-up"
      alignPoint
    >
      <div
        role="button"
        style={{
          border: '1px solid #000',
          padding: '100px 0',
          'text-align': 'center',
        }}
      >
        Right click me!
      </div>
    </Dropdown>
  )
}

export default ContextMenu
