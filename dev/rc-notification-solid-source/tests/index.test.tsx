import { render, fireEvent, screen } from "solid-testing-library";
// import { act } from 'react-dom/test-utils';
import { useNotification } from '../src';
import type { NotificationAPI, NotificationConfig } from '../src';

// require('../assets/index.less');

// 🔥 Note: In latest version. We remove static function.
// This only test for hooks usage.
describe('Notification.Basic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderDemo(config?: NotificationConfig) {
    let instance: NotificationAPI;

    const Demo = () => {
      const [api, holder] = useNotification(config);
      instance = api;

      return holder;
    };

    const renderResult = render(() => <Demo />);

    return { ...renderResult, instance };
  }

  it('works', () => {
    const { instance, unmount } = renderDemo();


    instance.open({
      content: <p class="test">1</p>,
      duration: 0.1,

    });
    expect(document.querySelector('.test')).toBeTruthy();


    jest.runAllTimers();

    expect(document.querySelector('.test')).toBeFalsy();

    unmount();
  });

  it('works with custom close icon', () => {
    const { instance } = renderDemo({
      closeIcon: <span class="test-icon">test-close-icon</span>,
    });


    instance.open({
      content: <p class="test">1</p>,
      closable: true,
      duration: 0,

    });
    expect(document.querySelectorAll('.test')).toHaveLength(1);
    expect(document.querySelector('.test-icon').textContent).toEqual('test-close-icon');
  });

  it('works with multi instance', () => {
    const { instance } = renderDemo();


    instance.open({
      content: <p class="test">1</p>,
      duration: 0.1,

    });

    instance.open({
      content: <p class="test">2</p>,
      duration: 0.1,

    });

    expect(document.querySelectorAll('.test')).toHaveLength(2);


    jest.runAllTimers();

    expect(document.querySelectorAll('.test')).toHaveLength(0);
  });

  it('destroy works', () => {
    const { instance } = renderDemo();


    instance.open({
      content: (
        <p id="test" class="test">
          222222
        </p>
      ),
      duration: 0.1,

    });
    expect(document.querySelector('.test')).toBeTruthy();


    instance.destroy();

    expect(document.querySelector('.test')).toBeFalsy();
  });

  it('getContainer works', () => {
    const id = 'get-container-test';
    const div = document.createElement('div');
    (div as unknown as { id: typeof id }).id = id;
    div.innerHTML = '<span>test</span>';
    document.body.appendChild(div);

    const { instance } = renderDemo({
      getContainer: () => document.getElementById('get-container-test'),
      motion: {
        motionName: 'rc-notification-fade',
      }
    });


    instance.open({
      content: (
        <p id="test" class="test">
          222222
        </p>
      ),
      duration: 1,

    });
    expect(document.getElementById(id).children).toHaveLength(2);
    instance.destroy();
    jest.runAllTimers();
    fireEvent.transitionEnd(document.querySelector('.rc-notification-notice'));
    expect(document.getElementById(id).children[1]).toBeEmptyDOMElement();

    document.body.removeChild(div);
  });

  it('remove notify works', () => {
    const { instance, unmount } = renderDemo();

    const key = Math.random();
    const close = (k: number | string) => {
      instance.close(k);
    };


    instance.open({
      content: (
        <p class="test">
          <button type="button" id="closeButton" onClick={() => close(key)}>
            close
          </button>
        </p>
      ),
      key,
      duration: null,
    });


    expect(document.querySelectorAll('.test')).toHaveLength(1);
    fireEvent.click(document.querySelector('#closeButton'));


    jest.runAllTimers();


    expect(document.querySelectorAll('.test')).toHaveLength(0);
    unmount();
  });

  it('update notification by key with multi instance', () => {
    const { instance } = renderDemo();

    const key = 'updatable';
    const value = 'value';
    const newValue = `new-${value}`;
    const notUpdatableValue = 'not-updatable-value';


    instance.open({
      content: (
        <p id="not-updatable" class="not-updatable">
          {notUpdatableValue}
        </p>
      ),
      duration: null,
    });



    instance.open({
      content: (
        <p id="updatable" class="updatable">
          {value}
        </p>
      ),
      key,
      duration: null,
    });


    expect(document.querySelectorAll('.updatable')).toHaveLength(1);
    expect(document.querySelector('.updatable').textContent).toEqual(value);

    instance.open({
      content: (
        <p id="updatable" class="updatable">
          {newValue}
        </p>
      ),
      key,
      duration: 0.1,
    });

    // Text updated successfully
    expect(document.querySelectorAll('.updatable')).toHaveLength(1);
    expect(document.querySelector('.updatable').textContent).toEqual(newValue);


    jest.runAllTimers();


    // Other notices are not affected
    expect(document.querySelectorAll('.not-updatable')).toHaveLength(1);
    expect(document.querySelector('.not-updatable').textContent).toEqual(notUpdatableValue);

    // Duration updated successfully
    expect(document.querySelectorAll('.updatable')).toHaveLength(0);
  });

  it('freeze notification layer when mouse over', () => {
    const { instance } = renderDemo();


    instance.open({
      content: (
        <p id="freeze" class="freeze">
          freeze
        </p>
      ),
      duration: 0.3,

    });

    expect(document.querySelectorAll('.freeze')).toHaveLength(1);

    // Mouse in should not remove
    fireEvent.mouseEnter(document.querySelector('.rc-notification-notice'));

    // jest.runAllTimers();
    expect(document.querySelectorAll('.freeze')).toHaveLength(1);

    // Mouse out will remove
    fireEvent.mouseLeave(document.querySelector('.rc-notification-notice'));

    // jest.runAllTimers();
    // TODO: solid
    // expect(document.querySelectorAll('.freeze')).toHaveLength(0);
  });

  describe('maxCount', () => {
    it('remove work when maxCount set', () => {
      const { instance } = renderDemo({
        maxCount: 1,
      });

      // First

      instance.open({
        content: <div class="max-count">bamboo</div>,
        key: 'bamboo',
        duration: 0,

      });

      // Next

      instance.open({
        content: <div class="max-count">bamboo</div>,
        key: 'bamboo',
        duration: 0,

      });
      expect(document.querySelectorAll('.max-count')).toHaveLength(1);


      instance.close('bamboo');

      expect(document.querySelectorAll('.max-count')).toHaveLength(0);
    });

    it('drop first notice when items limit exceeds', () => {
      const { instance } = renderDemo({
        maxCount: 1,
      });

      const value = 'updated last';

      instance.open({
        content: <span class="test-maxcount">simple show</span>,
        duration: 0,

      });


      instance.open({
        content: <span class="test-maxcount">simple show</span>,
        duration: 0,

      });

      instance.open({
        content: <span class="test-maxcount">{value}</span>,
        duration: 0,
      });



      jest.runAllTimers();


      expect(document.querySelectorAll('.test-maxcount')).toHaveLength(1);
      expect(document.querySelector('.test-maxcount').textContent).toEqual(value);
    });

    it('duration should work', () => {
      const { instance } = renderDemo({
        maxCount: 1,
      });


      instance.open({
        content: <span class="auto-remove">bamboo</span>,
        duration: 99,

      });
      expect(document.querySelector('.auto-remove').textContent).toEqual('bamboo');


      instance.open({
        content: <span class="auto-remove">light</span>,
        duration: 0.5,

      });
      expect(document.querySelector('.auto-remove').textContent).toEqual('light');


      jest.runAllTimers();

      expect(document.querySelectorAll('.auto-remove')).toHaveLength(0);
    });
  });

  it('onClick trigger', () => {
    const { instance } = renderDemo();
    let clicked = 0;

    const key = Date.now();
    const close = (k: number | string) => {
      instance.close(k);
    };

    instance.open({
      content: (
        <p class="test">
          <button type="button" id="closeButton" onClick={close.bind(null, key)}>
            close
          </button>
        </p>
      ),
      key,
      duration: null,
      onClick: () => {
        clicked += 1;
      },
    });


    fireEvent.click(document.querySelector('.rc-notification-notice')); // origin latest
    expect(clicked).toEqual(1);
  });

  it('Close Notification only trigger onClose', () => {
    const { instance } = renderDemo();
    let clickCount = 0;
    let closeCount = 0;

    instance.open({
      content: <p class="test">1</p>,
      closable: true,
      onClick: () => {
        clickCount += 1;
      },
      onClose: () => {
        closeCount += 1;
      },
    });


    fireEvent.click(document.querySelector('.rc-notification-notice-close')); // origin latest
    expect(clickCount).toEqual(0);
    expect(closeCount).toEqual(1);
  });

  it('sets data attributes', () => {
    const { instance } = renderDemo();

    instance.open({
      content: <span class="test-data-attributes">simple show</span>,
      duration: 3,
      className: 'notice-class',
      props: {
        'data-test': 'data-test-value',
        'data-testid': 'data-testid-value',
      },
    });

    const notice = document.querySelectorAll('.notice-class');
    expect(notice.length).toBe(1);

    expect(notice[0].getAttribute('data-test')).toBe('data-test-value');
    expect(notice[0].getAttribute('data-testid')).toBe('data-testid-value');
  });

  it('sets aria attributes', () => {
    const { instance } = renderDemo();

    instance.open({
      content: <span class="test-aria-attributes">simple show</span>,
      duration: 3,
      className: 'notice-class',
      props: {
        'aria-describedby': 'aria-describedby-value',
        'aria-labelledby': 'aria-labelledby-value',
      },
    });

    const notice = document.querySelectorAll('.notice-class');
    expect(notice.length).toBe(1);
    expect(notice[0].getAttribute('aria-describedby')).toBe('aria-describedby-value');
    expect(notice[0].getAttribute('aria-labelledby')).toBe('aria-labelledby-value');
  });

  it('sets role attribute', () => {
    const { instance } = renderDemo();

    instance.open({
      content: <span class="test-aria-attributes">simple show</span>,
      duration: 3,
      className: 'notice-class',
      props: { role: 'alert' },
    });

    const notice = document.querySelectorAll('.notice-class');
    expect(notice.length).toBe(1);
    expect(notice[0].getAttribute('role')).toBe('alert');
  });

  it('should style work', () => {
    const { instance } = renderDemo({
      style: () => ({
        content: 'little',
      }),
    });


    instance.open({
    });

    expect(document.querySelector('.rc-notification')).toHaveStyle({
      content: 'little',
    });
  });

    it('should className work', () => {
      const { instance } = renderDemo({
        className: (placement) => `bamboo-${placement}`,
      });


      instance.open({});
      expect(document.querySelector('.bamboo-topRight')).toBeTruthy();
    });


  it('placement', () => {
    const { instance } = renderDemo();


    instance.open({
      placement: 'bottomLeft',

    });

    expect(document.querySelector('.rc-notification')).toHaveClass('rc-notification-bottomLeft');
  });

  it('motion as function', () => {
    const motionFn = jest.fn();

    const { instance } = renderDemo({
      motion: motionFn,
    });


    instance.open({
      placement: 'bottomLeft',

    });

    expect(motionFn).toHaveBeenCalledWith('bottomLeft');
  });


  it('notice when empty', () => {
    const onAllRemoved = jest.fn();

    const { instance } = renderDemo({
      onAllRemoved,
      motion: {
        motionName: 'rc-notification-fade',
        motionAppear: true,
        motionEnter: true,
        motionLeave: true,
      }
    });

    expect(onAllRemoved).not.toHaveBeenCalled();

    // Open!

    instance.open({
      duration: 0.1,
    });
    expect(onAllRemoved).not.toHaveBeenCalled();

    // Hide
    jest.runAllTimers();
    fireEvent.transitionEnd(document.querySelector('.rc-notification-notice'));
    expect(onAllRemoved).toHaveBeenCalled();

    // Open again
    onAllRemoved.mockReset();
    instance.open({
      duration: 0.1,
      key: 'first',
    });


    instance.open({
      duration: 0.1,
      key: 'second',
    });

    expect(onAllRemoved).not.toHaveBeenCalled();

    // Close first
    instance.close('first');
    jest.runAllTimers();
    fireEvent.transitionEnd(document.querySelector('.rc-notification-notice'));
    expect(onAllRemoved).not.toHaveBeenCalled();

    // Close second
    instance.close('second');
    jest.runAllTimers();
    fireEvent.transitionEnd(document.querySelector('.rc-notification-notice'));
    expect(onAllRemoved).toHaveBeenCalled();
  });
});
