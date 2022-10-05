/* eslint-disable max-classes-per-file */

import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import { render, fireEvent, cleanup, screen } from "solid-testing-library";
import { spyElementPrototypes } from 'rc-util-solid/lib/test/domHook';
import Trigger from '../src';
import { placementAlignMap } from './util';
// import { Portal } from "solid-js/web";
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


describe('Trigger.Basic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    const divs = document.querySelectorAll("div");
    divs.forEach(div => div?.parentElement.removeChild(div))
    jest.useRealTimers();
  });

  function trigger(dom: HTMLElement, selector: string, method = 'click') {
    fireEvent[method](dom.querySelector(selector));
    jest.runAllTimers();
  }

  function isPopupHidden() {
    return document
      .querySelector('.rc-trigger-popup')
      .className.includes('-hidden');
  }

  describe.only('getPopupContainer', () => {
    it('defaults to document.body', () => {
      const { container } = render(() =>
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong class="x-content">tooltip2</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');

      const popupDomNode = document.querySelector('.rc-trigger-popup');
      expect(popupDomNode.parentNode.parentNode.parentNode).toBeInstanceOf(
        HTMLBodyElement,
      );
    });

    it.only('wrapper children with div when multiple children', () => {
      const { container } = render(() =>
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={[<div data-key={0} />, <div data-key={1} />]}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');

      expect(
        document.querySelectorAll('.rc-trigger-popup-content').length,
      ).toBeTruthy();
    });

    it.only('can change', () => {
      function getPopupContainer(node) {
        return node.parentNode;
      }
      const main = document.createElement('main');
      document.body.appendChild(main);
      const { container } = render(() =>
        <Trigger
          action={['click']}
          getPopupContainer={getPopupContainer}
          popupAlign={placementAlignMap.left}
          popup={<strong class="x-content">tooltip2</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
        {
          container: main,
        }
      );

      trigger(container, '.target');

      const popupDomNode = document.querySelector('.rc-trigger-popup');
      
      expect(popupDomNode.parentNode.parentNode.parentNode).toBeInstanceOf(
        HTMLDivElement,
      );
    });
  });

  describe.only('action', () => {
    it.only('click works', () => {
      const { container } = render(() =>
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong class="x-content">tooltip2</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.x-content').textContent).toBe('tooltip2');

      trigger(container, '.target');
      expect(isPopupHidden).toBeTruthy();
    });

    it.only('click works with function', () => {
      const popup = function renderPopup() {
        return <strong class="x-content">tooltip3</strong>;
      };
      const { container } = render(() =>
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={popup}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.x-content').textContent).toBe('tooltip3');

      trigger(container, '.target');
      expect(isPopupHidden()).toBeTruthy();
    });

    it.only('hover works', () => {
      const { container } = render(() =>
        <Trigger
          action={['hover']}
          popupAlign={placementAlignMap.left}
          popup={<strong>trigger</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target', 'mouseEnter');
      expect(isPopupHidden()).toBeFalsy();

      trigger(container, '.target', 'mouseLeave');
      expect(isPopupHidden()).toBeTruthy();
    });

    it.only('contextMenu works', () => {
      let triggerRef = null;
      const { container } = render(() =>
        <Trigger
          ref={triggerRef}
          action={['contextMenu']}
          popupAlign={placementAlignMap.left}
          popup={<strong>trigger</strong>}
        >
          <div class="target">contextMenu</div>
        </Trigger>,
      );

      trigger(container, '.target', 'contextMenu');
      expect(isPopupHidden()).toBeFalsy();


      triggerRef.onDocumentClick({
        target: container.querySelector('.target'),
      });
      jest.runAllTimers();
      expect(isPopupHidden()).toBeTruthy();
    });

    describe.only('afterPopupVisibleChange can be triggered', () => {
      it('uncontrolled', () => {
        let triggered = 0;
        const { container } = render(() =>
          <Trigger
            action={['click']}
            popupAlign={placementAlignMap.left}
            afterPopupVisibleChange={() => {
              triggered = 1;
            }}
            popup={<strong>trigger</strong>}
          >
            <div class="target">click</div>
          </Trigger>,
        );

        trigger(container, '.target');
        expect(triggered).toBe(1);
      });

      it('controlled', () => {
        let demoRef = null;
        let triggered = 0;

        const Trigger2 = wrapFC(Trigger);
        render(() =>
          <Trigger2
            popupVisible={false}
            popupAlign={placementAlignMap.left}
            afterPopupVisibleChange={() => {
              triggered += 1;
            }}
            popup={<strong>trigger</strong>}
          >
            <div class="target">click</div>
          </Trigger2>
        );

        Trigger2.setProps({ popupVisible: true })
        jest.runAllTimers();
        expect(triggered).toBe(1);
        Trigger2.setProps({ popupVisible: false })
        jest.runAllTimers();
        expect(triggered).toBe(2);
      });
    });

    it.only('nested action works', () => {

      let clickTriggerRef = null;

      let hoverTriggerRef = null;

      const { container } = render(() => {
        return (
          <Trigger
            action={['click']}
            popupAlign={placementAlignMap.left}
            ref={clickTriggerRef}
            popup={<strong class="click-trigger">click trigger</strong>}
          >
            <div>
              <Trigger
                action={['hover']}
                popupAlign={placementAlignMap.left}
                ref={hoverTriggerRef}
                popup={<strong class="hover-trigger">hover trigger</strong>}
              >
                <div class="target">trigger</div>
              </Trigger>
            </div>
          </Trigger>
        );
      });

      trigger(container, '.target', 'mouseEnter');
      trigger(container, '.target');

      const clickPopupDomNode =
        document.querySelector('.click-trigger').parentElement;
      const hoverPopupDomNode =
        document.querySelector('.hover-trigger').parentElement;
      expect(clickPopupDomNode).toBeTruthy();
      expect(hoverPopupDomNode).toBeTruthy();

      trigger(container, '.target', 'mouseLeave');
      expect(hoverPopupDomNode.className.includes('-hidden')).toBeTruthy();
      expect(clickPopupDomNode.className.includes('-hidden')).toBeFalsy();

      fireEvent.click(container.querySelector('.target'));
      jest.runAllTimers();
      expect(hoverPopupDomNode.className.includes('-hidden')).toBeTruthy();
      expect(clickPopupDomNode.className.includes('-hidden')).toBeTruthy();
    });
  });

  // Placement & Align can not test in jsdom. This should test in `dom-align`

  describe.only('forceRender', () => {
    it("doesn't render at first time when forceRender=false", () => {
      render(() =>
        <Trigger popup={<span>Hello!</span>}>
          <span>Hey!</span>
        </Trigger>,
      );

      expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    });

    it('render at first time when forceRender=true', () => {
      let triggerRef = null;
      render(() => (
        <Trigger ref={triggerRef} forceRender popup={<span>Hello!</span>}>
          <span>Hey!</span>
        </Trigger>
      ));
      expect(triggerRef.getPopupDomNode()).toBeTruthy();
    });
  });

  describe.only('destroyPopupOnHide', () => {
    it('defaults to false', () => {
      let triggerRef = null;
      const { container } = render(() =>
        <Trigger
          ref={triggerRef}
          action={['click']}
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(triggerRef.getPopupDomNode()).toBeTruthy();

      trigger(container, '.target');
      expect(triggerRef.getPopupDomNode()).toBeTruthy();
    });

    it('set true will destroy tooltip on hide', () => {
      let triggerRef = null;
      const { container } = render(() =>
        <Trigger
          ref={triggerRef}
          action={['click']}
          destroyPopupOnHide
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(triggerRef.getPopupDomNode()).toBeTruthy();

      trigger(container, '.target');
      expect(triggerRef.getPopupDomNode()).not.toBeInTheDocument();
    });
  });

  describe.only('support autoDestroy', () => {
    it('defaults to false', () => {
      let triggerRef = null;
      const { container } = render(() =>
        <Trigger
          ref={triggerRef}
          action={['click']}
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
      );
      expect(triggerRef.props.autoDestroy).toBeFalsy();
      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
      jest.runAllTimers();
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    });

    it('set true will destroy portal on hide', () => {
      const { container } = render(() =>
        <Trigger
          action={['click']}
          autoDestroy
          popupAlign={placementAlignMap.topRight}
          popup={<strong>trigger</strong>}
        >
          <div class="target">click</div>
        </Trigger>,
      );

      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
      trigger(container, '.target');
      expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    });
  });

  describe.skip('github issues', () => {
    // https://github.com/ant-design/ant-design/issues/9114
    it('click in popup of popup', () => {
      const builtinPlacements = {
        right: {
          points: ['cl', 'cr'],
        },
      };
      let innerVisible = null;
      function onInnerPopupVisibleChange(value) {
        innerVisible = value;
      }
      const innerTrigger = (
        <div style={{ background: 'rgba(255, 0, 0, 0.3)' }}>
          <Trigger
            onPopupVisibleChange={onInnerPopupVisibleChange}
            popupPlacement="right"
            action={['click']}
            builtinPlacements={builtinPlacements}
            popup={
              <div
                id="issue_9114_popup"
                style={{ background: 'rgba(0, 255, 0, 0.3)' }}
              >
                Final Popup
              </div>
            }
          >
            <div id="issue_9114_trigger">another trigger in popup</div>
          </Trigger>
        </div>
      );

      let visible = null;
      function onPopupVisibleChange(value) {
        visible = value;
      }
      const { container } = render(() =>
        <Trigger
          onPopupVisibleChange={onPopupVisibleChange}
          popupPlacement="right"
          action={['click']}
          builtinPlacements={builtinPlacements}
          popup={innerTrigger}
        >
          <span style={{ margin: '20px' }} class="target">
            basic trigger
          </span>
        </Trigger>,
      );

      // Basic click
      trigger(container, '.target');
      expect(visible).toBeTruthy();
      expect(innerVisible).toBeFalsy();

      fireEvent.click(document.querySelector('#issue_9114_trigger'));
      expect(visible).toBeTruthy();
      expect(innerVisible).toBeTruthy();

      fireEvent.click(document.querySelector('#issue_9114_popup'));
      expect(visible).toBeTruthy();
      expect(innerVisible).toBeTruthy();
    });
  });

  describe.only('stretch', () => {
    const createTrigger = (stretch) =>
      render(() =>
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong class="x-content">tooltip2</strong>}
          stretch={stretch}
        >
          <div class="target">
            click me to show trigger
            <br />
            react component trigger
          </div>
        </Trigger>,
      );

    let domSpy;

    beforeAll(() => {
      domSpy = spyElementPrototypes(HTMLElement, {
        offsetWidth: {
          get: () => 1128,
        },
        offsetHeight: {
          get: () => 903,
        },
      });
    });

    afterAll(() => {
      domSpy.mockRestore();
    });

    ['width', 'height', 'min-width', 'min-height'].forEach((prop) => {
      it(prop, () => {
        const { container } = createTrigger(prop);

        fireEvent.click(container.querySelector('.target'));
        jest.runAllTimers();

        expect(
          document.querySelector('.rc-trigger-popup').style,
        ).toHaveProperty(prop);
      });
    });
  });

  it.only('className should be undefined by default', () => {
    const { container } = render(() =>
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content">tooltip2</strong>}
      >
        <div>click</div>
      </Trigger>,
    );
    expect(container.querySelector('div')).not.toHaveAttribute('class');
  });

  it.only('support className', () => {
    const { container } = render(() =>
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content">tooltip2</strong>}
        className="className-in-trigger"
      >
        <div class="target">click</div>
      </Trigger>,
    );

    expect(container.querySelector('div')).toHaveClass(
      'target className-in-trigger',
    );
  });

  it.only('support className in nested Trigger', () => {
    const { container } = render(() =>
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content">tooltip2</strong>}
        className="className-in-trigger-2"
      >
        <div>
          <Trigger
            action={['click']}
            popupAlign={placementAlignMap.left}
            popup={<strong class="x-content">tooltip2</strong>}
            className="className-in-trigger-1"
          >
            <div class="target">click</div>
          </Trigger>
        </div>
      </Trigger>,
    );

    expect(container.querySelector('.className-in-trigger-1').className).toBeTruthy()
    expect(container.querySelector('.className-in-trigger-2').className).toBeTruthy()
  });

  it.only('support function component', () => {
    let NoRef = (props) => {
      props.ref = () => null;
      return (
        <div class="target" {...props}>
          click
        </div>
      );
    };

    let triggerRef = null;
    const { container } = render(() =>
      <Trigger
        ref={triggerRef}
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content">tooltip2</strong>}
      >
        <NoRef />
      </Trigger>,
    );

    trigger(container, '.target');
    expect(isPopupHidden()).toBeFalsy();

    fireEvent.click(container.querySelector('.target'));
    () => jest.runAllTimers();
    expect(isPopupHidden()).toBeTruthy();
  });

  it.only('Popup with mouseDown prevent', () => {
    let triggerRef = null;
    const { container } = render(() =>
      <Trigger
        ref={triggerRef}
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={
          <div>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Prevent
            </button>
          </div>
        }
      >
        <h1>233</h1>
      </Trigger>,
    );

    fireEvent.click(container.querySelector('h1'));
    expect(isPopupHidden()).toBeFalsy();

    triggerRef.onDocumentClick({
      target: document.querySelector('button'),
    });
    expect(isPopupHidden()).toBeFalsy();
  });

  // https://github.com/ant-design/ant-design/issues/21770
  it.only('support popupStyle, such as zIndex', () => {
    let triggerRef = null;
    const style = { color: 'red', 'z-index': 9999, top: '100px', opacity: 0.93 };
    render(() =>
      <Trigger
        ref={triggerRef}
        popupVisible
        popupStyle={style}
        popup={<strong class="x-content">tooltip2</strong>}
      >
        <div class="target">click</div>
      </Trigger>,
    );

    const popupDomNode = triggerRef.getPopupDomNode();
    expect(popupDomNode.style.zIndex).toBe(style['z-index'].toString());
    expect(popupDomNode.style.color).toBe(style.color);
    expect(popupDomNode.style.top).toBe(`${style.top}`);
    expect(popupDomNode.style.opacity).toBe(style.opacity.toString());
  });

  describe.only('getContainer', () => {
    it('not trigger when dom not ready', () => {
      const getPopupContainer = jest.fn((node) => node.parentElement);

      function Demo() {
        return (
          <Trigger
            popupVisible
            getPopupContainer={getPopupContainer}
            popup={<strong class="x-content">tooltip2</strong>}
          >
            <div class="target">click</div>
          </Trigger>
        );
      }

      const { container } = render(() => <Demo />);

      expect(getPopupContainer).toHaveReturnedTimes(1);

      jest.runAllTimers();
      expect(getPopupContainer).toHaveReturnedTimes(2);
      expect(getPopupContainer).toHaveBeenCalledWith(
        container.querySelector('.target'),
      );
    });

    it('not trigger when dom no need', () => {
      let triggerTimes = 0;
      const getPopupContainer = () => {
        triggerTimes += 1;
        return document.body;
      };

      function Demo() {
        return (
          <Trigger
            popupVisible
            getPopupContainer={getPopupContainer}
            popup={<strong class="x-content">tooltip2</strong>}
          >
            <div class="target">click</div>
          </Trigger>
        );
      }

      render(() => <Demo />);
      expect(triggerTimes).toEqual(1);
    });
  });

  // https://github.com/ant-design/ant-design/issues/30116
  it.only('createPortal should also work with stopPropagation', () => {
    const root = document.createElement('div');
    root.id = "root";
    document.body.appendChild(root);

    const div = document.createElement('div');
    div.id = "other";
    document.body.appendChild(div);
    const Portal2 = (props) => props.children
    const OuterContent = ({ container }) => {
      return <Portal2 mount={container}>
        <button
          onMouseDown={(e) => {
            // e.stopPropagation();
          }}
        >
          Stop Pop
        </button>
      </Portal2>
    };

    const Demo = () => {
      return (
        <Trigger
          action={['click']}
          popup={
            <strong class="x-content">
              tooltip2
              <OuterContent container={div} />
            </strong>
          }
        >
          <div class="target">click</div>
        </Trigger>
      );
    };

    const { container } = render(() => <Demo />, { container: root });
    trigger(container, '.target');
    expect(isPopupHidden()).toBeFalsy();

    // Click should not close
    fireEvent.mouseDown(document.querySelector('button'));

    // Mock document mouse click event

    const mouseEvent = new MouseEvent('mousedown');
    document.dispatchEvent(mouseEvent);

    expect(isPopupHidden()).toBeFalsy();

    document.body.removeChild(div);
    document.body.removeChild(root);
  });

  it.only('nested Trigger should not force render when ancestor Trigger render', () => {
    let isUpdate = false;
    let isChildUpdate = false;
    let isGrandsonUpdate = false;

    const Grandson = () => {
      if (isUpdate) {
        isGrandsonUpdate = true;
      }

      return null;
    };

    const Child = (() => {
      if (isUpdate) {
        isChildUpdate = true;
      }

      return (
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          forceRender
          popup={() => (
            <strong class="x-content">
              <Grandson />
            </strong>
          )}
        >
          <div class="target">click</div>
        </Trigger>
      );
    });

    const App: Component = () => {
      return (
        <Trigger
          action={['click']}
          popupAlign={placementAlignMap.left}
          popup={<strong class="x-content">tooltip2</strong>}
          className="className-in-trigger-2"
        >
          <div class="target">
            <Child />
          </div>
        </Trigger>
      );
    }

    let appRef = null;
    render(() => <App ref={appRef} />);

    isUpdate = true;

    () => appRef.setState({});

    expect(isChildUpdate).toBeFalsy();
    expect(isGrandsonUpdate).toBeFalsy();
  });

  it.skip('should work in StrictMode with autoDestroy', () => {
    const { container } = render(() =>
      <Trigger action={['click']} autoDestroy={true}>
        <div class="target">click</div>
      </Trigger>,
    );

    // click to show
    trigger(container, '.target');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    // click to hide
    trigger(container, '.target');
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    // click to show
    trigger(container, '.target');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
  });

  it.only('onPopupClick', () => {
    const onPopupClick = jest.fn();

    const {container } = render(() =>
      <Trigger
        popupVisible
        popup={<strong>trigger</strong>}
        onPopupClick={onPopupClick}
      >
        <div class="target" />
      </Trigger>,
    );
    trigger(container, '.target');
    fireEvent.click(document.querySelector('strong'));
    expect(onPopupClick).toHaveBeenCalled();
  });
});
