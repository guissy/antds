import { createEffect, createSignal, Index } from "solid-js";
import { render, screen } from "solid-testing-library";

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

import PortalWrapper, { getOpenCount } from '../src/PortalWrapper';
import Portal from '../src/Portal';

describe('Portal', () => {
  let domContainer: HTMLDivElement;

  // Mock for raf
  window.requestAnimationFrame = callback => window.setTimeout(callback);
  window.cancelAnimationFrame = id => window.clearTimeout(id);

  beforeEach(() => {
    domContainer = document.createElement('div');
    document.body.appendChild(domContainer);
  });

  afterEach(() => {
    document.body.removeChild(domContainer);
  });

  it('forceRender', () => {
    let divRef: any = null;

    const { unmount } = render(() =>
      <PortalWrapper forceRender>
        {() => <div ref={divRef}>2333</div>}
      </PortalWrapper>,
    );

    expect(divRef).toBeTruthy();

    unmount();
  });

  it('didUpdate', () => {
    const didUpdate = jest.fn();
    const Portal2 = wrapFC(Portal)
    const getContainer = () => document.createElement('div')
    render(() =>
      <Portal2
        didUpdate={didUpdate}
        getContainer={getContainer}
      >
        light
      </Portal2>,
    );

    expect(didUpdate).toHaveBeenCalledTimes(1);
    Portal2.setProps({ getContainer });
    expect(didUpdate).toHaveBeenCalledTimes(1);
    Portal2.setProps({ getContainer: getContainer.bind({}) });
    expect(didUpdate).toHaveBeenCalledTimes(2);
    Portal2.setProps({ children: Date.now() });
    expect(didUpdate).toHaveBeenCalledTimes(3);
  });

  describe('getContainer', () => {
    it('string', () => {
      const div = document.createElement('div');
      div.id = 'bamboo-light';
      document.body.appendChild(div);

      render(() =>
        <PortalWrapper visible getContainer="#bamboo-light">
          {() => <div>2333</div>}
        </PortalWrapper>,
      );

      expect(document.querySelector('#bamboo-light').childElementCount).toEqual(
        1,
      );

      document.body.removeChild(div);
    });

    it('function', () => {
      const div = document.createElement('div');

      render(() =>
        <PortalWrapper visible getContainer={() => div}>
          {() => <div>2333</div>}
        </PortalWrapper>,
      );

      expect(div.childElementCount).toEqual(1);
    });

    it('htmlElement', () => {
      const div = document.createElement('div');

      render(() =>
        <PortalWrapper visible getContainer={div}>
          {() => <div>2333</div>}
        </PortalWrapper>,
      );

      expect(div.childElementCount).toEqual(1);
    });

    it.skip('delay', () => {
      jest.useFakeTimers();
      let divRef: HTMLDivElement = null;
      render(() =>
        <div>
          <PortalWrapper visible getContainer={() => divRef}>
            {() => <div />}
          </PortalWrapper>
          <div ref={divRef} />
        </div>,
      );

      // act(() => {
      //   jest.runAllTimers();
      // });

      expect(divRef.childElementCount).toEqual(1);
      jest.useRealTimers();
    });
  });

  describe('openCount', () => {
    it('start as 0', () => {
      expect(getOpenCount()).toEqual(0);
      const PortalWrapper2 = wrapFC(PortalWrapper);
      render(() =>
        <PortalWrapper2 visible={false}>{() => <div>2333</div>}</PortalWrapper2>,
      );
      expect(getOpenCount()).toEqual(0);

      // rerender(() => <PortalWrapper visible>{() => <div>2333</div>}</PortalWrapper>);
      PortalWrapper2.setProps({ visible: true });
      expect(getOpenCount()).toEqual(1);

    });

    it('correct count', () => {
      const Demo = (props: {
        count: number;
        visible: boolean;
      }) => {
        return (
          <>
            <Index each={Array.from(Array(props.count).keys())}>{(it) => (
              <PortalWrapper visible={props.visible}>
                {() => <div>2333 {it}</div>}
              </PortalWrapper>
            )}</Index>
          </>
        );
      };

      expect(getOpenCount()).toEqual(0);

      const Demo2 = wrapFC(Demo);
      render(() => <Demo2 count={1} visible />);
      expect(getOpenCount()).toEqual(1);

      // rerender(() => <Demo count={2} visible />);
      Demo2.setProps({ count: 2})
      expect(getOpenCount()).toEqual(2);

      // rerender(() => <Demo count={1} visible />);
      Demo2.setProps({ count: 1})
      expect(getOpenCount()).toEqual(1);

      // rerender(() => <Demo count={1} visible={false} />);
      Demo2.setProps({ count: 1, visible: false })
      expect(getOpenCount()).toEqual(0);
    });
  });

  it('wrapperClassName', () => {
    const PortalWrapper2 = wrapFC(PortalWrapper);
    render(() =>
      <PortalWrapper2 visible wrapperClassName="bamboo">
        {() => <div />}
      </PortalWrapper2>,
    );
    expect(document.body.querySelector('.bamboo')).toBeTruthy();
    PortalWrapper2.setProps({ wrapperClassName: "light"})
    expect(document.body.querySelector('.light')).toBeTruthy();
  });

  it.skip('should restore to original place in StrictMode', () => {
    const parentContainer = document.createElement('div');
    const domContainer = document.createElement('div');
    parentContainer.appendChild(domContainer);
    let mountCount = 0;
    let unmountCount = 0;

    const Demo = () => {
      createEffect(() => {
        mountCount += 1;
        return () => {
          unmountCount += 1;
        };
      }, []);

      return <Portal getContainer={() => domContainer}>Contents</Portal>;
    };

    render(() => <Demo />, { /* wrapper: StrictMode */ });

    expect(mountCount).toBe(2);
    expect(unmountCount).toBe(1);
    // portal should be attached to parent node
    expect(parentContainer.textContent).toBe('Contents');
  });
});
