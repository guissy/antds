import Menu, { Item as MenuItem } from 'rc-menu-solid'
import '../../assets/index.less'
import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import Dropdown from '../../src'
import { createStore } from 'solid-js/store'

const Example: Component = () => {
  const [state, setState] = createStore({ longList: false })

  const short = () => {
    setState({ longList: false })
  }

  const long = () => {
    setState({ longList: true })
  }


  const menuItems = () => {
    return [
      <MenuItem key="1">1st item</MenuItem>,
      <MenuItem key="2">2nd item</MenuItem>,
      ...(state.longList ? [
        <MenuItem key="3">3rd LONG SUPER LONG item</MenuItem>
      ] : [])
    ]
  }

  const menu = <Menu>{menuItems}</Menu>
  return (
    <div>
      <Dropdown overlay={menu}>
        <button>Actions</button>
      </Dropdown>
      <button onClick={long}>Long List</button>
      <button onClick={short}>Short List</button>
    </div>
  )

}

export default Example
