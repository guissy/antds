/* eslint-disable no-console, react/require-default-props, no-param-reassign */

import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { CommonMenu, inlineMotion } from './antd';
import '../../assets/index.less';

const Demo = () => {
  const [inline, setInline] = createSignal(false);
  const [openKeys, setOpenKey] = createSignal(['1']);

  const restProps = createMemo(() => {
    let restProps = {};
    if (inline()) {
      restProps = { motion: inlineMotion };
    } else {
      restProps = { openAnimation: 'zoom' };
    }
    return restProps;
  })

  return (
    <div style={{ margin: '20px', width: '200px' }}>
      <label>
        <input
          type="checkbox"
          checked={inline()}
          onChange={() => setInline(!inline())}
        />{' '}
        Inline
      </label>
      <CommonMenu
        mode="inline"
        openKeys={openKeys()}
        onOpenChange={keys => {
          console.error('Open Keys Changed:', keys);
          setOpenKey(keys);
        }}
        inlineCollapsed={!inline}
        {...restProps()}
      />
    </div>
  );
};

export default Demo;
/* eslint-enable */
