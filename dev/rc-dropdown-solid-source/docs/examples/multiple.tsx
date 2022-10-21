import Menu, { Item as MenuItem, Divider } from 'rc-menu-solid'
import '../../assets/index.less'
import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import Dropdown from '../../src'
import { createStore } from 'solid-js/store'

const Test: Component = () => {
  const [state, setState] = createStore({
    visible: false,
  })

  const onVisibleChange = visible => {
    console.log('visible', visible)
    setState({
      visible,
    })
  }

  let selected = []

  const saveSelected = ({ selectedKeys }) => {
    selected = selectedKeys
  }

  const confirm = () => {
    console.log(selected)
    setState({
      visible: false,
    })
  }


  const menu = (
    <Menu
      style={{ width: '140px' }}
      multiple
      onSelect={saveSelected}
      onDeselect={saveSelected}
    >
      <MenuItem key="1">one</MenuItem>
      <MenuItem key="2">two</MenuItem>
      <Divider />
      <MenuItem disabled>
        <button
          style={{
            cursor: 'pointer',
            color: '#000',
            'pointer-events': 'visible',
          }}
          onClick={confirm}
        >
          确定
        </button>
      </MenuItem>
    </Menu>
  )

  return (
    <Dropdown
      trigger={['click']}
      onVisibleChange={onVisibleChange}
      visible={state.visible}
      closeOnSelect={false}
      overlay={menu}
      animation="slide-up"
    >
      <button>open</button>
    </Dropdown>
  )

}

export default Test
