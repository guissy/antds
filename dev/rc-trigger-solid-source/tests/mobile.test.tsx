import isMobile from 'rc-util-solid/lib/isMobile';
import { render, fireEvent, screen, cleanup } from "solid-testing-library";
import type { TriggerProps } from '../src';
import Trigger from '../src';
import { placementAlignMap } from './util';

jest.mock('rc-util-solid/lib/isMobile');

describe('Trigger.Mobile', () => {
  beforeAll(() => {
    (isMobile as any).mockImplementation(() => true);
  });
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    const divs = document.querySelectorAll("div");
    divs.forEach(div => div?.parentElement.removeChild(div))
    jest.useRealTimers();
  });

  function isPopupHidden() {
    return document
      .querySelector('.rc-trigger-popup')
      .className.includes('-hidden');
  }

  function getTrigger(
    props?: Partial<TriggerProps>,
  ) {
    return (
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content" />}
        destroyPopupOnHide={false}
        autoDestroy={false}
        mask
        maskClosable
        mobile={{}}
        {...props}
      >
        <div class="target">click</div>
      </Trigger>
    );
  }

  it('mobile config', () => {
    const { container } = render(() => 
      getTrigger({
        mobile: {
          popupClassName: 'mobile-popup',
          popupStyle: { background: 'red' },
        },
      }),
    );

    fireEvent.click(container.querySelector('.target'));

    expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
      'mobile-popup',
    );

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      background: 'red',
    });
  });

  it('popupRender', () => {
    const { container } = render(() => 
      getTrigger({
        mobile: {
          popupRender: (node) => (
            <>
              <div>Light</div>
              {node}
            </>
          ),
        },
      }),
    );

    fireEvent.click(container.querySelector('.target'));
    expect(document.querySelector('.rc-trigger-popup')).toMatchSnapshot();
  });

  it('click inside not close', () => {
    let triggerRef = null;
    const { container } = render(() => getTrigger({}));
    fireEvent.click(container.querySelector('.target'));
    jest.runAllTimers();

    // expect(triggerRef.state.popupVisible).toBeTruthy();
    fireEvent.click(document.querySelector('.x-content'));
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    // expect(triggerRef.state.popupVisible).toBeTruthy();
    // jest.runAllTimers();

    // Document click
    fireEvent.click(document.querySelector('.rc-trigger-popup-mask'));
    fireEvent.click(document.querySelector('.target'));
    jest.runAllTimers();
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();
    // expect(triggerRef.state.popupVisible).toBeFalsy();
  });

  it('legacy array children', () => {
    const { container } = render(() => 
      getTrigger({
        popup: [<div>Light</div>, <div>Bamboo</div>],
      }),
    );
    fireEvent.click(container.querySelector('.target'));
    expect(document.querySelectorAll('.rc-trigger-popup-content')).toHaveLength(
      1,
    );
  });
});
