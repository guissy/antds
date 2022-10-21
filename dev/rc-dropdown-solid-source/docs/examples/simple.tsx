/* eslint-disable no-console,react/button-has-type */
import Menu, { Item as MenuItem, Divider } from 'rc-menu-solid'
import '../../assets/index.less'
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, onMount} from "solid-js";
import Dropdown from '../../src'

function onSelect({ key }) {
  console.log(`${key} selected`)
}

function onVisibleChange(visible) {
  console.log(visible)
}

const menu = (
  <Menu onSelect={onSelect}>
    <MenuItem disabled>disabled</MenuItem>
    <MenuItem key="1">one</MenuItem>
    <Divider />
    <MenuItem key="2">two</MenuItem>
  </Menu>
)

export default function Simple() {
  onMount(() => {
    setInterval(() => {
      console.log("document.activeElement", document.activeElement)
    }, 500)
  })
  return (
    <div style={{ margin: '20px' }}>
      <div style={{ height: '100px' }} />
      <div>
        <Dropdown
          autoFocus
          trigger={['click']}
          overlay={menu}
          animation="slide-up"
          onVisibleChange={onVisibleChange}
        >
          <button style={{ width: '100px' }}>open</button>
        </Dropdown>
      </div>
    </div>
  )
}
