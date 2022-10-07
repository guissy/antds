import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Overflow from '../src';
import { render, fireEvent } from "solid-testing-library";

interface ItemType {
  label: JSX.Element;
  key: number | string;
}

describe('Overflow.Invalidate', () => {
  function getData(count: number) {
    return new Array(count).fill(undefined).map((_, index) => ({
      label: `Label ${index}`,
      key: `k-${index}`,
    }));
  }

  it('render item', () => {
    const wrapper = render(() => 
      <Overflow<ItemType>
        data={getData(2)}
        renderItem={item => {
          return item.label;
        }}
        itemKey={item => `bamboo-${item.key}`}
        itemComponent="li"
        component="ul"
        maxCount={Overflow.INVALIDATE}
      />,
    );

    expect(wrapper.container.innerHTML).toMatchSnapshot();
  });

  it('render raw', () => {
    const wrapper = render(() => 
      <Overflow<ItemType>
        data={getData(2)}
        renderRawItem={item => {
          return <Overflow.Item component="li">{item.label}</Overflow.Item>;
        }}
        itemKey={item => `bamboo-${item.key}`}
        component="ul"
        maxCount={Overflow.INVALIDATE}
      />,
    );

    expect(wrapper.container.innerHTML).toMatchSnapshot();
  });
});
