import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { render, fireEvent } from "solid-testing-library";
import { act } from 'react-dom/test-utils';
import Overflow from '../src';

interface ItemType {
  label: JSX.Element;
  key: number | string;
}

function renderItem(item: ItemType) {
  return item.label;
}

describe('Overflow.SSR', () => {
  function getData(count: number) {
    return new Array(count).fill(undefined).map((_, index) => ({
      label: `Label ${index}`,
      key: `k-${index}`,
    }));
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('basic', () => {
    const wrapper = render(
      <Overflow<ItemType>
        data={getData(2)}
        renderItem={renderItem}
        maxCount="responsive"
        ssr="full"
      />,
    );

    expect(wrapper).toMatchSnapshot();
  });
});
