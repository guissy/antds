import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import { render, fireEvent, screen, cleanup } from "solid-testing-library";
import Trigger from '../src';
import { getMouseEvent } from './util';

/**
 * dom-align internal default position is `-999`.
 * We do not need to simulate full position, check offset only.
 */
describe('Trigger.Point', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  const Demo = (props) => {
    return (
      <Trigger
        ref={props.ref}
        popup={<div class="point-popup">POPUP</div>}
        popupAlign={{ points: ['tl'] }}
        alignPoint
        {...props}
      >
        <div class="point-region" />
      </Trigger>
    );
  }

  function trigger(container, eventName, data) {
    const pointRegion = container.querySelector('.point-region');
    fireEvent(pointRegion, getMouseEvent(eventName, data));

    // React scheduler will not hold when createEffect. We need repeat to tell that times go
    for (let i = 0; i < 10; i += 1) {
      jest.runAllTimers();
    }
  }

  it('onClick', async () => {
    const { container } = render(() => <Demo action={['click']} />);
    trigger(container, 'click', { pageX: 10, pageY: 20 });

    const popup = document.querySelector('.rc-trigger-popup');
    expect(popup.style).toEqual(
      expect.objectContaining({ left: '-989px', top: '-979px' }),
    );
  });

  it('hover', () => {
    const { container } = render(() => <Demo action={['hover']} />);
    trigger(container, 'mouseenter', { pageX: 10, pageY: 20 });
    trigger(container, 'mouseover', { pageX: 10, pageY: 20 });

    const popup = document.querySelector('.rc-trigger-popup');
    expect(popup.style).toEqual(
      expect.objectContaining({ left: '-989px', top: '-979px' }),
    );
  });

  describe('contextMenu', () => {
    it('basic', () => {
      let triggerRef = null;
      const { container } = render(() =>
        <Demo
          ref={triggerRef}
          action={['contextMenu']}
          hideAction={['click']}
        />,
      );
      trigger(container, 'contextmenu', { pageX: 10, pageY: 20 });

      const popup = document.querySelector('.rc-trigger-popup');
      expect(popup.style).toEqual(
        expect.objectContaining({ left: '-989px', top: '-979px' }),
      );

      // Not trigger point update when close
      const clickEvent = {};
      const pagePropDefine = {
        get: () => {
          throw new Error('should not read when close');
        },
      };
      Object.defineProperties(clickEvent, {
        pageX: pagePropDefine,
        pageY: pagePropDefine,
      });
      fireEvent.click(triggerRef.getRootDomNode(), clickEvent);
    });

    // https://github.com/ant-design/ant-design/issues/17043
    it('not prevent default', (done) => {
      const { container } = render(() =>
        <Demo showAction={['contextMenu']} hideAction={['click']} />,
      );
      trigger(container, 'contextmenu', { pageX: 10, pageY: 20 });

      const popup = document.querySelector('.rc-trigger-popup');
      expect(popup.style).toEqual(
        expect.objectContaining({ left: '-989px', top: '-979px' }),
      );

      // Click to close
      fireEvent(
        document.querySelector('.rc-trigger-popup > *'),
        getMouseEvent('click', {
          preventDefault() {
            done.fail();
          },
        }),
      );

      done();
    });
  });

  describe('placement', () => {
    function testPlacement(name, builtinPlacements, afterAll?) {
      it(name, () => {
        const { container } = render(() =>
          <Demo
            action={['click']}
            builtinPlacements={builtinPlacements}
            popupPlacement="right"
          />,
        );
        trigger(container, 'click', { pageX: 10, pageY: 20 });

        const popup = document.querySelector('.rc-trigger-popup');
        expect(popup.style).toEqual(
          expect.objectContaining({ left: '-989px', top: '-979px' }),
        );

        if (afterAll) {
          afterAll(document.body);
        }
      });
    }

    testPlacement('not hit', {
      right: {
        // This should not hit
        points: ['cl'],
      },
    });

    testPlacement(
      'hit',
      {
        left: {
          points: ['tl'],
        },
      },
      (wrapper) => {
        expect(wrapper.querySelector('div.rc-trigger-popup')).toHaveClass(
          'rc-trigger-popup-placement-left',
        );
      },
    );
  });
});
