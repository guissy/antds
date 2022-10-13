/* eslint no-console:0 */

import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Menu, { SubMenu, Item as MenuItem } from '../../src';

import '../../assets/index.less';
import { createStore } from "solid-js/store";

const Test: Component = () => {
  const [state, setState] = createStore({
    destroyed: false,
    selectedKeys: [],
    openKeys: [],
  });

  const onSelect = info => {
    console.log('selected ', info);
    setState({
      selectedKeys: info.selectedKeys,
    });
  };

  const onDeselect = info => {
    console.log('deselect ', info);
  };

  const onOpenChange = openKeys => {
    console.log('onOpenChange ', openKeys);
    setState({
      openKeys,
    });
  };

  const onCheck = e => {
    const { value } = e.target;
    if (e.target.checked) {
      setState(state => ({
        selectedKeys: state.selectedKeys.concat(value),
      }));
    } else {
      setState(({ selectedKeys }) => {
        const newSelectedKeys = selectedKeys.concat();
        const index = newSelectedKeys.indexOf(value);
        if (value !== -1) {
          newSelectedKeys.splice(index, 1);
        }

        return {
          selectedKeys: newSelectedKeys,
        };
      });
    }
  };

  const onOpenCheck = e => {
    const { value } = e.target;
    if (e.target.checked) {
      setState(state => ({
        openKeys: state.openKeys.concat(value),
      }));
    } else {
      setState(({ openKeys }) => {
        const newOpenKeys = openKeys.concat();
        const index = newOpenKeys.indexOf(value);
        if (value !== -1) {
          newOpenKeys.splice(index, 1);
        }
        return {
          openKeys: newOpenKeys,
        };
      });
    }
  };

  const getMenu = () => {
    return (
      <Menu
        multiple
        onSelect={onSelect}
        onDeselect={onDeselect}
        onOpenChange={onOpenChange}
        openKeys={state.openKeys}
        selectedKeys={state.selectedKeys}
      >
        <SubMenu key="1" title="submenu1">
          <MenuItem key="1-1">item1-1</MenuItem>
          <MenuItem key="1-2">item1-2</MenuItem>
        </SubMenu>
        <SubMenu key="2" title="submenu2">
          <MenuItem key="2-1">item2-1</MenuItem>
          <MenuItem key="2-2">item2-2</MenuItem>
        </SubMenu>
        <MenuItem key="3">item3</MenuItem>
      </Menu>
    );
  }

  const destroy = () => {
    setState({
      destroyed: true,
    });
  }


    if (state.destroyed) {
      return null;
    }
    const allSelectedKeys = ['1-1', '1-2', '2-1', '2-2', '3'];
    const allOpenKeys = ['1', '2'];
    // const { selectedKeys } = state;
    // const { openKeys } = state;

    return (
      <div>
        <h2>multiple selectable menu</h2>

        <p>
          selectedKeys: &nbsp;&nbsp;&nbsp;
          {allSelectedKeys.map(k => (
            <label key={k}>
              {k}
              <input
                value={k}
                key={k}
                type="checkbox"
                onChange={onCheck}
                checked={state.selectedKeys.indexOf(k) !== -1}
              />
            </label>
          ))}
        </p>

        <p>
          openKeys: &nbsp;&nbsp;&nbsp;
          {allOpenKeys.map(k => (
            <label key={k}>
              {k}
              <input
                value={k}
                type="checkbox"
                onChange={onOpenCheck}
                checked={state.openKeys.indexOf(k) !== -1}
              />
            </label>
          ))}
        </p>

        <div style={{ width: '400px' }}>{getMenu()}</div>
      </div>
    );

}

export default Test;
