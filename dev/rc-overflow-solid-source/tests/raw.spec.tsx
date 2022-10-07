import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Overflow from '../src';
import Item from '../src/Item';
import { render, fireEvent } from "solid-testing-library";

interface ItemType {
  label: JSX.Element;
  key: number | string;
}

describe('Overflow.Raw', () => {
  function getData(count: number) {
    return new Array(count).fill(undefined).map((_, index) => ({
      label: `Label ${index}`,
      key: `k-${index}`,
    }));
  }

  it('render node directly', () => {
    const elements = new Set<HTMLElement>();

    const wrapper = render(() => 
      <Overflow<ItemType>
        data={getData(1)}
        renderRawItem={item => {
          return (
            <Overflow.Item
              component="li"
              ref={ele => {
                elements.add(ele);
              }}
            >
              {item.label}
            </Overflow.Item>
          );
        }}
        itemKey={item => `bamboo-${item.key}`}
        component="ul"
      />,
    );

    const elementList = [...elements];
    expect(elementList).toHaveLength(1);
    expect(elementList[0] instanceof HTMLLIElement).toBeTruthy();

    expect(wrapper.container.innerHTML).toMatchSnapshot();
  });

  it('safe with item directly', () => {
    const wrapper = render(() => <Overflow.Item>Bamboo</Overflow.Item>);

    expect(wrapper.container.innerHTML).toMatchSnapshot();

    expect(wrapper.container.querySelector('.rc-overflow-item')).toBeFalsy();
  });

  it('HOC usage', () => {
    interface SharedProps {
      visible?: boolean;
      children?: JSX.Element;
    }

    const ComponentWrapper = (props: SharedProps) => (
      <Overflow.Item {...props} />
    );

    const UserHOC = (props: SharedProps) =>
      props.visible ? <ComponentWrapper {...props} /> : null;

    const wrapper = render(() => 
      <Overflow
        data={[
          <UserHOC key="light">Light</UserHOC>,
          <UserHOC key="bamboo" visible>
            Bamboo
          </UserHOC>,
        ]}
        renderRawItem={node => node}
        itemKey={node => node?.key}
      />,
    );

    expect(wrapper.container.innerHTML).toMatchSnapshot();
  });
});
