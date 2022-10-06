import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { render, fireEvent, screen } from "solid-testing-library";
import Tooltip_ from '../src';

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

const Tooltip = wrapFC(Tooltip_);


const verifyContent = (wrapper, content) => {
  expect(wrapper.container.querySelector('.x-content').textContent).toBe(content);
  expect(document.querySelector('.rc-tooltip')).toBeTruthy();
  fireEvent.click(wrapper.container.querySelector('.target'));
  expect(wrapper.container.querySelector('.rc-tooltip')).toHaveClass('rc-tooltip-hidden');
};

describe('rc-tooltip', () => {
  window.requestAnimationFrame = window.setTimeout;
  window.cancelAnimationFrame = window.clearTimeout;

  describe('shows and hides itself on click', () => {
    it('using an element overlay', () => {
      const wrapper = render(() =>
        <Tooltip
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      fireEvent.click(wrapper.container.querySelector('.target'));
      verifyContent(wrapper, 'Tooltip content');
    });

    it('using a function overlay', () => {
      const wrapper = render(() =>
        <Tooltip
          trigger={['click']}
          placement="left"
          overlay={() => <strong class="x-content">Tooltip content</strong>}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      fireEvent.click(wrapper.container.querySelector('.target'));
      verifyContent(wrapper, 'Tooltip content');
    });

    // https://github.com/ant-design/ant-design/pull/23155
    it('using style inner style', () => {
      const wrapper = render(() =>
        <Tooltip
          trigger={['click']}
          placement="left"
          overlay={() => <strong class="x-content">Tooltip content</strong>}
          overlayInnerStyle={{ background: 'red' }}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      fireEvent.click(wrapper.container.querySelector('.target'));
      expect(wrapper.container.querySelector('.rc-tooltip-inner')).toHaveStyle({ background: 'red' });
    });

    it('access of ref', () => {
      let domRef = null;
      render(() =>
        <Tooltip
          trigger={['click']}
          placement="left"
          overlay={() => <strong class="x-content">Tooltip content</strong>}
          ref={domRef}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      expect(domRef).toBeTruthy();
    });
  });
  describe('destroyTooltipOnHide', () => {
    const destroyVerifyContent = (wrapper, content) => {
      fireEvent.click(wrapper.container.querySelector('.target'));
      expect(wrapper.container.querySelector('.x-content').textContent).toBe(content);
      expect(document.querySelector('.rc-tooltip')).toBeTruthy();
      fireEvent.click(wrapper.container.querySelector('.target'));
    };
    it('default value', () => {
      const wrapper = render(() =>
        <Tooltip
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      fireEvent.click(wrapper.container.querySelector('.target'));
      verifyContent(wrapper, 'Tooltip content');
    });
    it('should only remove tooltip when value is true', () => {
      const wrapper = render(() =>
        <Tooltip
          destroyTooltipOnHide
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      destroyVerifyContent(wrapper, 'Tooltip content');
      expect(wrapper.container.innerHTML).toBe('<div class="target">Click this</div><div></div>');
    });
    it('should only remove tooltip when keepParent is true', () => {
      const wrapper = render(() =>
        <Tooltip
          destroyTooltipOnHide={{ keepParent: true }}
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      destroyVerifyContent(wrapper, 'Tooltip content');
      expect(wrapper.container.innerHTML).toBe('<div class="target">Click this</div><div></div>');
    });
    it('should remove tooltip and container when keepParent is false', () => {
      const wrapper = render(() =>
        <Tooltip
          destroyTooltipOnHide={{ keepParent: false }}
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      destroyVerifyContent(wrapper, 'Tooltip content');
      expect((wrapper.container.firstChild as HTMLElement).outerHTML).toBe('<div class="target">Click this</div>');
    });
  });

  // This is only test for motion pass to internal rc-trigger
  // It's safe to remove since meaningless to rc-tooltip if refactor
  it('should motion props work', () => {
    const wrapper = render(() =>
      <Tooltip trigger={['click']} overlay="Light" motion={{ motionName: 'bamboo-is-light' }}>
        <span class="target">Bamboo</span>
      </Tooltip>,
    );
    fireEvent.click(wrapper.container.querySelector('.target'));
    expect(document.querySelector('.bamboo-is-light')).toBeTruthy();
  });

  it('zIndex', () => {
    jest.useFakeTimers();

    const wrapper = render(() =>
      <Tooltip trigger={['click']} zIndex={903} overlay="Bamboo">
        <div class="target">Light</div>
      </Tooltip>,
    );
    fireEvent.click(wrapper.container.querySelector('.target'));

    jest.runAllTimers();
    // wrapper.update();

    expect(wrapper.container.querySelector('div.rc-tooltip')).toHaveStyle({
        'z-index': 903,
    });
    // expect(wrapper.container.querySelector('div.rc-tooltip').style).toEqual(
    //   expect.objectContaining({
    //     'z-index': 903,
    //   }),
    // );

    jest.useRealTimers();
  });

  describe('showArrow', () => {
    it('should show tooltip arrow default', () => {
      const wrapper = render(() =>
        <Tooltip
          destroyTooltipOnHide={{ keepParent: false }}
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      fireEvent.click(wrapper.container.querySelector('.target'));
      expect(wrapper.container.querySelector('.rc-tooltip-content').outerHTML).toBe(
        '<div class="rc-tooltip-content"><div class="rc-tooltip-arrow"></div><div role="tooltip" class="rc-tooltip-inner"><strong class="x-content">Tooltip content</strong></div></div>',
      );
    });
    it('should show tooltip arrow when showArrow is true', () => {
      const wrapper = render(() =>
        <Tooltip
          destroyTooltipOnHide={{ keepParent: false }}
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
          showArrow
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      fireEvent.click(wrapper.container.querySelector('.target'));
      expect(wrapper.container.querySelector('.rc-tooltip-content').outerHTML).toBe(
        '<div class="rc-tooltip-content"><div class="rc-tooltip-arrow"></div><div role="tooltip" class="rc-tooltip-inner"><strong class="x-content">Tooltip content</strong></div></div>',
      );
    });
    it('should hide tooltip arrow when showArrow is false', () => {
      const wrapper = render(() =>
        <Tooltip
          destroyTooltipOnHide={{ keepParent: false }}
          trigger={['click']}
          placement="left"
          overlay={<strong class="x-content">Tooltip content</strong>}
          showArrow={false}
        >
          <div class="target">Click this</div>
        </Tooltip>,
      );
      fireEvent.click(wrapper.container.querySelector('.target'));
      expect(wrapper.container.querySelector('.rc-tooltip-content').outerHTML).toBe(
        '<div class="rc-tooltip-content"><div role="tooltip" class="rc-tooltip-inner"><strong class="x-content">Tooltip content</strong></div></div>',
      );
    });
  });

  it('visible', () => {
    const wrapper = render(() =>
      <Tooltip overlay={<strong class="x-content">Tooltip content</strong>} visible={false}>
        <div />
      </Tooltip>,
    );

    expect(wrapper.container.querySelector('.x-content')).toBeFalsy();

    Tooltip.setProps({ visible: true });
    expect(wrapper.container.querySelector('.x-content')).toBeTruthy();
  });
});
