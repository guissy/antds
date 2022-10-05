import '../assets/index.less';
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import ResizeObserver from '../src';

export default function App() {
  const [times, setTimes] = createSignal(0);
  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);
  const [disabled, setDisabled] = createSignal(false);

  const onResize = (size: { width: number; height: number }) => {
    setTimes(prevTimes => prevTimes + 1);
    setWidth(size.width);
    setHeight(size.height);
  };

  return (
    <>
      <div>
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
          <span>
            Resize times: {times()} ({width()}/{height()})
          </span>
        </div>
        <ResizeObserver onResize={onResize} disabled={disabled()}>
          <textarea placeholder="I'm a textarea!" />
          <button type="button">Warning with multiple children</button>
        </ResizeObserver>
      </div>
    </>
  );
}
