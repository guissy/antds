import '../assets/index.less';
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import type { ResizeObserverProps } from '../src';
import ResizeObserver from '../src';

const Wrapper = ({ children }: any) => <>{children}</>;

export default function App() {
  const [times, setTimes] = createSignal(0);
  const [disabled, setDisabled] = createSignal(false);
  let textareaRef  = null as HTMLTextAreaElement;

  createEffect(() => {
    console.log('Ref:', textareaRef);
  }, []);

  const onResize: ResizeObserverProps['onResize'] = ({
    width,
    height,
    offsetHeight,
    offsetWidth,
  }) => {
    setTimes(prevTimes => prevTimes + 1);
    console.log(
      'Resize:',
      '\n',
      'BoundingBox',
      width,
      height,
      '\n',
      'Offset',
      offsetWidth,
      offsetHeight,
    );
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
          <span>Resize times: {times}</span>
        </div>
        <ResizeObserver onResize={onResize} disabled={disabled()}>
          <Wrapper>
            <textarea ref={textareaRef} placeholder="I'm a textarea!" />
          </Wrapper>
        </ResizeObserver>
      </div>
    </>
  );
}
