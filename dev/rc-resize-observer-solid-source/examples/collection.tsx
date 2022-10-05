import '../assets/index.less';
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import ResizeObserver from '../src';

function randomSize(): { width: string, height: string } {
  return {
    width: Math.round(50 + Math.random() * 150) + 'px',
    height: Math.round(50 + Math.random() * 150) + 'px',
  };
}

const sharedStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
  color: '#fff',
};

export default function App() {
  const [size1, setSize1] = createSignal<{ width: string, height: string }>(randomSize());
  const [size2, setSize2] = createSignal<{ width: string, height: string }>(randomSize());

  console.log('Render:', size1(), size2());

  return (
    <ResizeObserver.Collection
      onBatchResize={infoList => {
        console.log(
          'Batch Resize:',
          infoList,
          infoList.map(({ data, size }) => `${data}(${size.width}/${size.height})`),
        );
      }}
    >
      <div style={{ display: 'flex', 'column-gap': '4px', 'margin-bottom': '8px' }}>
        <button onClick={() => setSize1(randomSize())}>Resize: 1</button>
        <button onClick={() => setSize2(randomSize())}>Resize: 2</button>
        <button
          onClick={() => {
            setSize1(randomSize());
            setSize2(randomSize());
          }}
        >
          Resize: all
        </button>
      </div>
      <div style={{ display: 'flex', 'column-gap': '16px' }}>
        <ResizeObserver data="shape_1">
          <div style={{ ...sharedStyle, ...size1(), background: 'red' }}>1</div>
        </ResizeObserver>
        <ResizeObserver data="shape_2">
          <div style={{ ...sharedStyle, ...size2(), background: 'blue' }}>2</div>
        </ResizeObserver>
      </div>
    </ResizeObserver.Collection>
  );
}
