import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import Overflow_ from '../src';
import { render as renderFn, fireEvent, screen } from "solid-testing-library";
import { _rs as onResize } from 'rc-resize-observer-solid/lib/utils/observerUtil';

const wrapFC = (Cmp) => {
  const fn = (props) => {
    const [state, setState] = createSignal(props);
    (fn as unknown as { setProps }).setProps = (n) => {
      setState(p => Object.keys(n).some((k) => p[k] !== n[k]) ? Object.assign({}, p, n) : p);
    };
    return <Cmp {...state}>{state().children}</Cmp>
  }
  return fn as typeof fn & { setProps: (o: object) => void }
}
const Overflow = wrapFC(Overflow_)
Overflow.Item = Overflow_.Item;

const render = (elmFn) => {
  const wrapper = renderFn(elmFn)
  const inject = {
    setProps: Overflow.setProps,
    triggerResize(clientWidth) {
      // act(() => {
        // this.find('ResizeObserver').first().props().onResize({}, { clientWidth });
        const first = wrapper.container.querySelector(".rc-overflow") as HTMLElement;
        onResize([{target: first }])
        first.style.width = clientWidth;
        // console.log(clientWidth, first.offsetWidth)
        jest.runAllTimers();
        // this.update();
      // });
    },
    triggerItemResize(index, offsetWidth) {
      // act(() => {
        // this.find('Item')
        //   .at(index)
        //   .find('ResizeObserver')
        //   .props()
        //   .onResize({ offsetWidth });
        jest.runAllTimers();
      //   this.update();
      // });
    },
    initSize(width, itemWidth) {
      this.triggerResize(width);
      // this.find('Item').forEach((_, index) => {
      //   this.triggerItemResize(index, itemWidth);
      // });
    },
    findItems() {
      return wrapper.container.querySelectorAll('.rc-overflow-item:not(.rc-overflow-item-rest):not(.rc-overflow-item-suffix)');
    },
    findRest() {
      // return this.find('Item.rc-overflow-item-rest');
      return wrapper.container.querySelectorAll('.rc-overflow-item-rest');
    },
    findSuffix() {
      return wrapper.container.querySelector('.rc-overflow-item-suffix');
    }
  }
  return Object.assign(wrapper, inject);
};

interface ItemType {
  label: JSX.Element;
  key: number | string;
}

function renderItem(item: ItemType) {
  return item.label;
}

describe('Overflow.Responsive', () => {
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
    const wrapper = render(() =><div>
      <Overflow<ItemType>
        data={getData(6)}
        renderItem={renderItem}
        maxCount="responsive"
      /></div>,
    );

    wrapper.initSize(100, 20); // [0][1][2][3][4][+2](5)(6)
    expect(wrapper.findItems()).toHaveLength(6);
    // [true, true, true, true, false, false].forEach((display, i) => {
    //   expect(wrapper.findItems().at(i).props().display).toBe(display);
    // });
    expect(wrapper.findRest()).toHaveLength(1);
    expect(wrapper.findRest().text()).toEqual('+ 2 ...');
    expect(
      wrapper.findItems().container.querySelectorAll('div').last().prop('aria-hidden'),
    ).toBeTruthy();
  });

  it('only one', () => {
    const wrapper = render(() =>
      <Overflow<ItemType>
        data={getData(1)}
        itemKey="key"
        renderItem={renderItem}
        maxCount="responsive"
      />,
    );
    wrapper.initSize(100, 20);
    expect(wrapper.findItems()).toHaveLength(1);
    expect(wrapper.findRest().props().display).toBeFalsy();
  });

  it('just fit', () => {
    const wrapper = render(() =>
      <Overflow<ItemType>
        data={getData(1)}
        itemKey="key"
        renderItem={renderItem}
        maxCount="responsive"
      />,
    );
    wrapper.initSize(20, 20);

    expect(wrapper.findItems()).toHaveLength(1);
    expect(wrapper.findRest().props().display).toBeFalsy();
  });

  it('remove to clean up', () => {
    const data = getData(6);

    const wrapper = render(() =>
      <Overflow<ItemType>
        data={data}
        itemKey="key"
        renderItem={renderItem}
        maxCount="responsive"
      />,
    );
    wrapper.initSize(100, 20);

    // Remove one (Just fit the container width)
    const newData = [...data];
    newData.splice(1, 1);
    wrapper.setProps({ data: newData });
    // wrapper.update();

    expect(wrapper.findItems()).toHaveLength(5);
    expect(wrapper.findRest().props().display).toBeFalsy();

    // Remove one (More place for container)
    const restData = [...newData];
    restData.splice(1, 2);
    restData.push({
      label: 'Additional',
      key: 'additional',
    });
    wrapper.setProps({ data: restData });
    // wrapper.update();

    expect(wrapper.findItems()).toHaveLength(4);
    expect(wrapper.findRest().props().display).toBeFalsy();
  });

  it('none to overflow', () => {
    const data = getData(5);

    const wrapper = render(() =>
      <Overflow<ItemType>
        data={data}
        itemKey="key"
        renderItem={renderItem}
        maxCount="responsive"
      />,
    );

    wrapper.initSize(100, 20);
    expect(wrapper.findItems()).toHaveLength(5);
    expect(wrapper.findRest().props().display).toBeFalsy();

    // Add one
    const newData: ItemType[] = [
      {
        label: 'Additional',
        key: 'additional',
      },
      ...data,
    ];
    wrapper.setProps({ data: newData });
    // wrapper.update();

    // Currently resize observer not trigger, rest node is not ready
    expect(wrapper.findItems()).toHaveLength(6);
    expect(wrapper.findRest().props().display).toBeFalsy();

    // Trigger resize, node ready
    wrapper.triggerItemResize(0, 20);
    expect(wrapper.findItems()).toHaveLength(6);
    expect(wrapper.findRest().props().display).toBeTruthy();
  });

  it('unmount no error', () => {
    const wrapper = render(() =>
      <Overflow<ItemType>
        data={getData(1)}
        itemKey="key"
        renderItem={renderItem}
        maxCount="responsive"
      />,
    );

    wrapper.initSize(100, 20);

    wrapper.unmount();


    jest.runAllTimers();

  });

  describe('suffix', () => {
    it('ping the position', () => {
      const wrapper = render(() =>
        <Overflow<ItemType>
          data={getData(10)}
          itemKey="key"
          renderItem={renderItem}
          maxCount="responsive"
          suffix="Bamboo"
        />,
      );

      wrapper.initSize(100, 20);

      expect(wrapper.findSuffix()).toHaveStyle(
        { position: 'absolute', top: 0, left: '80px' },
      );
    });

    it('too long to pin', () => {
      const wrapper = render(() =>
        <Overflow<ItemType>
          data={getData(1)}
          itemKey="key"
          renderItem={renderItem}
          maxCount="responsive"
          suffix="Bamboo"
        />,
      );

      wrapper.initSize(100, 20);
      wrapper.triggerItemResize(0, 90);

      expect(wrapper.findSuffix().props().style.position).toBeFalsy();
    });

    it('long to short should keep correct position', () => {
      const wrapper = render(() =>
        <Overflow<ItemType>
          data={getData(3)}
          itemKey="key"
          renderItem={renderItem}
          maxCount="responsive"
          suffix="Bamboo"
        />,
      );

      wrapper.initSize(20, 20);
      wrapper.setProps({ data: [] });

      expect(wrapper.findRest()).toHaveLength(0);
      expect(wrapper.findSuffix().style.position).toBeFalsy();
    });
  });

  it('render rest directly', () => {
    const wrapper = render(() =>
      <Overflow<ItemType>
        data={getData(10)}
        itemKey="key"
        renderItem={renderItem}
        maxCount="responsive"
        renderRawRest={omitItems => {
          return (
            <Overflow.Item component="span" class="custom-rest">
              {omitItems.length}
            </Overflow.Item>
          );
        }}
      />,
    );

    wrapper.initSize(100, 20);

    expect(wrapper.container.querySelector('span.custom-rest').textContent).toEqual('6');
  });
});
