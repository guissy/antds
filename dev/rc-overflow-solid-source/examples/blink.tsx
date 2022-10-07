import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Overflow from '../src';
import '../assets/index.less';
import './common.less';

const overflowSharedStyle: JSX.CSSProperties = {
  background: 'rgba(0, 255, 0, 0.1)',
};

interface ItemType {
  value: string | number;
  label: string;
}

function createData(count: number): ItemType[] {
  const data: ItemType[] = new Array(count).fill(undefined).map((_, index) => ({
    value: index,
    label: `Label ${index}`,
  }));

  return data;
}

const sharedStyle: JSX.CSSProperties = {
  padding: '4px 8px',
  width: '90px',
  overflow: 'hidden',
  background: 'rgba(255, 0, 0, 0.2)',
};

function renderItem(item: ItemType) {
  return <div style={sharedStyle}>{item.label}</div>;
}

function renderRest(items: ItemType[]) {
  if (items.length === 3) {
    return items.length;
  }

  return <div style={sharedStyle}>+{items.length}...</div>;
}

const data = createData(5);
const data2 = createData(2);

const Demo = () => {
  return (
    <div style={{ padding: '32px' }}>
      <p>
        Test for a edge case that rest can not decide the final display count
      </p>
      <div
        style={{
          border: '10px solid green',
          'margin-top': '32px',
          display: 'inline-block',
        }}
      >
        <Overflow<ItemType>
          data={data}
          style={{ width: '300px', ...overflowSharedStyle }}
          renderItem={renderItem}
          renderRest={renderRest}
          maxCount="responsive"
        />

        <Overflow<ItemType>
          data={data2}
          style={{ width: '180px', ...overflowSharedStyle }}
          renderItem={renderItem}
          renderRest={renderRest}
          maxCount="responsive"
        />
      </div>
    </div>
  );
};

export default Demo;
