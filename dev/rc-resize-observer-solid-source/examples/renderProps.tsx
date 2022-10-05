import '../assets/index.less';
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import type { ResizeObserverProps } from '../src';
import ResizeObserver from '../src';

export default function App() {
  const [times, setTimes] = createSignal(0);
  const [disabled, setDisabled] = createSignal(false);

  const onResize: ResizeObserverProps['onResize'] = () => {
    setTimes(prevTimes => prevTimes + 1);
  };

  return (
    <>
      <div style={{ transform: 'scale(1.1)', 'transform-origin': '0% 0%' }}>
        <div>
          <label>
            <input
              type="checkbox"
              onChange={() => {
                setDisabled(!disabled());
              }}
              checked={disabled()}
            />{' '}
            Disabled Observe
          </label>
          {' >>> '}
          <span>Resize times: {times()}</span>
        </div>
        <ResizeObserver onResize={onResize} disabled={disabled()}>
          {resizeRef => (
            <div style={{ display: 'inline-flex', 'flex-direction': 'column' }}>
              <textarea placeholder="I'm a textarea!" />
              <div ref={resizeRef} style={{ background: 'red', height: '50px', 'font-size': '10px' }}>
                Target
              </div>
            </div>
          )}
        </ResizeObserver>
      </div>
    </>
  );
}
