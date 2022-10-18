/* eslint no-console:0 */
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import 'rc-select/assets/index.less';
import { Panel } from '../../src';
import '../../assets/index.less';

export default () => (
  <Panel prefixCls="rc-dialog" title="Title" closable>
    Hello World!
  </Panel>
);
