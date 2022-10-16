import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import { render, fireEvent, screen } from "solid-testing-library";
import { createStore } from 'solid-js/store';

import Portal from '../src';

global.isOverflow = true;

jest.mock('../src/util', () => {
  const origin = jest.requireActual('../src/util');
  return {
    ...origin,
    isBodyOverflowing: () => global.isOverflow,
  };
});
const cleanup = () => {
  const dom = document.querySelector("[data-rc-order]") as HTMLElement;
  dom?.parentElement?.removeChild(dom);
}
describe('Portal', () => {
  beforeEach(() => {
    global.isOverflow = true;
  });

  afterEach(() => {
    cleanup();
  })

  it('Order', () => {
    render(() =>
      <Portal open debug="root">
        <p>Root</p>
        <Portal open debug="parent">
          <p>Parent</p>
          <Portal open debug="children">
            <p>Children</p>
          </Portal>
        </Portal>
      </Portal>,
    );

    const pList = Array.from(document.body.querySelectorAll('p'));
    expect(pList).toHaveLength(3);
    expect(pList.map(p => p.textContent)).toEqual([
      'Root',
      'Parent',
      'Children',
    ]);
  });

  describe('getContainer', () => {
    it('false', () => {
      const { container } = render(() =>
        <>
          Hello
          <Portal open getContainer={false}>
            Bamboo
          </Portal>
          Light
        </>,
      );

      expect(container).toMatchSnapshot();
    });

    it('customize in same level', () => {
      let renderTimes = 0;

      const Content = () => {
        createEffect(() => {
          renderTimes += 1;
        });

        return <>Bamboo</>;
      };

      const Demo = () => {
        let divRef = null;

        return (
          <div ref={divRef} class="holder">
            <Portal open getContainer={() => divRef}>
              <Content />
            </Portal>
          </div>
        );
      };

      const { container } = render(() => <Demo />);
      expect(container).toMatchSnapshot();
      expect(renderTimes).toEqual(1);
    });
  });

  describe('dynamic change autoLock', () => {
    function test(name: string, config?: Parameters<typeof render>[1]) {
      it(name, () => {
        let setProps;
        const RenderDemo = props_ => {
          const [props, setState] = createStore(props_);
          setProps = setState;
          return (<Portal {...props} />)
        };
        render(() => <RenderDemo open />, config);
        expect(document.body).not.toHaveStyle({
          overflowY: 'hidden',
        });

        setProps({open: true, autoLock: true});
        expect(document.body).toHaveStyle({
          overflowY: 'hidden',
        });

        setProps({open: false, autoLock: true});
        expect(document.body).not.toHaveStyle({
          overflowY: 'hidden',
        });

        setProps({open: true, autoLock: true});
        expect(document.body).toHaveStyle({
          overflowY: 'hidden',
        });

        setProps({open: true, autoLock: false});
        expect(document.body).not.toHaveStyle({
          overflowY: 'hidden',
        });
      });
    }

    test('basic');
    test('StrictMode', {
      // wrapper: React.StrictMode,
    });

    it('window not scrollable', () => {
      global.isOverflow = false;
      render(() => <Portal open />);

      expect(document.body).not.toHaveStyle({
        overflowY: 'hidden',
      });
    });

    it('not lock screen when getContainer is not body', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      render(() =>
        <Portal open autoLock getContainer={() => div}>
          Bamboo
        </Portal>,
      );
      expect(document.body).not.toHaveStyle({
        overflowY: 'hidden',
      });
    });

    it('lock when getContainer give document.body', () => {
      render(() =>
        <Portal open autoLock getContainer={() => document.body}>
          Bamboo
        </Portal>,
      );

      expect(document.body).toHaveStyle({
        overflowY: 'hidden',
      });
    });
  });

  it('autoDestroy', () => {
    expect(document.querySelector('p')).toBeFalsy();

    let setProps;
    const RenderDemo = props_ => {
      const [props, setState] = createStore(props_);
      setProps = setState;
      return (<Portal open={props.open} autoDestroy={props.autoDestroy}>
        <p>Root</p>
      </Portal>
      )
    };

    const { rerender } = render(() => <RenderDemo {...{open: true, autoDestroy: false}} />);
    expect(document.querySelector('p')).toBeTruthy();

    setProps({open: false, autoDestroy: false});
    expect(document.querySelector('p')).toBeTruthy();

    setProps({open: false, autoDestroy: true});
    expect(document.querySelector('p')).toBeFalsy();
  });
});
