import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Overflow from '../src';
import { render, fireEvent } from "solid-testing-library";

interface ItemType {
  label: JSX.Element;
  key: number | string;
}

function renderItem(item: ItemType) {
  return item.label;
}

describe('Overflow.Basic', () => {
  function getData(count: number) {
    return new Array(count).fill(undefined).map((_, index) => ({
      label: `Label ${index}`,
      key: `k-${index}`,
    }));
  }

  it('no data', () => {
    const wrapper = render(() => <Overflow<ItemType> />);
    expect(wrapper.container.querySelectorAll('.rc-overflow-item')).toHaveLength(0);
  });

  it('no maxCount', () => {
    const wrapper = render(() => 
      <Overflow<ItemType> data={getData(6)} renderItem={renderItem} />,
    );
    expect(wrapper.container.querySelectorAll('ResizeObserver')).toHaveLength(0);
    expect(wrapper.container.querySelectorAll('.rc-overflow-item')).toHaveLength(6);
    expect(wrapper.container.querySelectorAll('.rc-overflow-item-rest')).toHaveLength(0);
  });

  it('number maxCount', () => {
    const wrapper = render(() => 
      <Overflow<ItemType>
        data={getData(6)}
        renderItem={renderItem}
        maxCount={4}
      />,
    );
    expect(wrapper.container.querySelectorAll('ResizeObserver')).toHaveLength(0);
    expect(wrapper.container.querySelectorAll('.rc-overflow-item')).toHaveLength(5);
    expect(wrapper.container.querySelectorAll('.rc-overflow-item-rest')).toHaveLength(1);
  });

  it('without renderItem', () => {
    const wrapper = render(() => <Overflow data={[<span>Bamboo Is Light</span>]} />);
    expect(wrapper.container.querySelector('.rc-overflow-item').textContent).toEqual('Bamboo Is Light');
  });

  describe('renderRest', () => {
    it('function', () => {
      const wrapper = render(() => 
        <Overflow
          data={getData(6)}
          renderItem={renderItem}
          renderRest={omittedItems => `Bamboo: ${omittedItems.length}`}
          maxCount={3}
        />,
      );
      expect(wrapper.container.querySelector('.rc-overflow-item-rest').textContent).toEqual('Bamboo: 3');
      
    });

    it('node', () => {
      const wrapper = render(() => 
        <Overflow
          data={getData(6)}
          renderItem={renderItem}
          renderRest={<span>Light Is Bamboo</span>}
          maxCount={3}
        />,
      );

      expect(wrapper.container.querySelectorAll('.rc-overflow-item')).toHaveLength(4);
      expect(wrapper.container.querySelector('.rc-overflow-item-rest').textContent).toEqual('Light Is Bamboo');
    });
  });

  describe('itemKey', () => {
    it('string', () => {
      const wrapper = render(() => 
        <Overflow data={getData(1)} renderItem={renderItem} itemKey="key" />,
      );

      // expect(wrapper.container.querySelectorAll('Item').key()).toEqual('k-0');
    });
    it('function', () => {
      const wrapper = render(() => 
        <Overflow
          data={getData(1)}
          renderItem={renderItem}
          itemKey={item => `bamboo-${item.key}`}
        />,
      );

      expect(wrapper.container.querySelector('.rc-overflow-item')).toBeTruthy();
    });
  });

  it('customize component', () => {
    const wrapper = render(() => 
      <Overflow
        data={getData(1)}
        renderItem={renderItem}
        itemKey={item => `bamboo-${item.key}`}
        component="ul"
        itemComponent="li"
      />,
    );

    expect(wrapper.container.innerHTML).toMatchSnapshot();
  });
});
