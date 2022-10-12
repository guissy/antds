import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Menu, { SubMenu, Item } from '../../src';
import './inlineCollapsed.less';

const App = () => {
  const [collapsed, setCollapsed] = createSignal(false);
  return (
    <>
      <label>
        <input type="checkbox" value={collapsed()} onChange={e => setCollapsed(e.target.checked)} />
        inlineCollapsed: {collapsed().toString()}
      </label>
      <Menu
        mode="inline"

        style={{ width: '600px' }}
        class={collapsed() ? 'collapsed' : ''}
      >
        <Item key="1">item 1</Item>
        <SubMenu key="2" title={`inlineCollapsed: ${collapsed().toString()}`}>
          <Item key="3">item 2</Item>
          <Item key="4">item 3</Item>
        </SubMenu>
      </Menu>
    </>
  );
}

export default App;
