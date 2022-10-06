/* eslint-disable no-console */
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";import '../../assets/index.less';
import { useNotification } from '../../src';
import motion from './motion';

export default () => {
  const [notice, contextHolder] = useNotification({ motion, maxCount: 3, top: 100 });

  return (
    <>
      <button
        onClick={() => {
          notice.open({
            content: `${new Date().toISOString()}`,
          });
        }}
      >
        Max Count 3
      </button>
      {contextHolder}
    </>
  );
};
