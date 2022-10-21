/* eslint-disable react/button-has-type,react/no-find-dom-node,react/no-render-return-value,object-shorthand,func-names,max-len */
import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import { render, fireEvent, screen } from "solid-testing-library";
import Menu, { Divider, Item as MenuItem } from 'rc-menu-solid';
import { spyElementPrototypes } from 'rc-util-solid/lib/test/domHook';
import { getPopupDomNode, sleep } from './utils';
import Dropdown from '../src';
import placements from '../src/placements';
import KeyCode from "rc-util-solid/lib/KeyCode";
import { createStore } from "solid-js/store";
// import '../assets/index.less';

spyElementPrototypes(HTMLElement, {
  offsetParent: {
    get: () => document.body,
  },
  offsetLeft: {
    get: function () {
      return parseFloat(window.getComputedStyle(this).marginLeft) || 0;
    },
  },
  offsetTop: {
    get: function () {
      return parseFloat(window.getComputedStyle(this).marginTop) || 0;
    },
  },
  offsetHeight: {
    get: function () {
      return parseFloat(window.getComputedStyle(this).height) || 0;
    },
  },
  offsetWidth: {
    get: function () {
      return parseFloat(window.getComputedStyle(this).width) || 0;
    },
  },
});

describe('dropdown', () => {
  it('default visible', () => {
    const dropdown = render(() =>
      <Dropdown overlay={<div class="check-for-visible">Test</div>} visible>
        <button class="my-button">open</button>
      </Dropdown>,
    );
    expect(getPopupDomNode(dropdown) instanceof HTMLDivElement).toBeTruthy();
    expect(dropdown.container.querySelector('.my-button')).toHaveClass('rc-dropdown-open');
  });

  it('supports constrolled visible prop', () => {
    const onVisibleChange = jest.fn();
    const dropdown = render(() =>
      <Dropdown
        overlay={<div class="check-for-visible">Test</div>}
        visible
        trigger={['click']}
        onVisibleChange={onVisibleChange}
      >
        <button class="my-button">open</button>
      </Dropdown>,
    );
    expect(getPopupDomNode(dropdown) instanceof HTMLDivElement).toBeTruthy();
    expect(dropdown.container.querySelector('.my-button')).toHaveClass('rc-dropdown-open');

    fireEvent.click(dropdown.container.querySelector('.my-button'));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
  });

  it('simply works', async () => {
    let clicked;

    function onClick({ key }) {
      clicked = key;
    }

    const onOverlayClick = jest.fn();

    const menu = (
      <Menu style={{ width: '140px' }} onClick={onClick}>
        <MenuItem key="1">
          <span class="my-menuitem">one</span>
        </MenuItem>
        <Divider />
        <MenuItem key="2">two</MenuItem>
      </Menu>
    );
    const dropdown = render(() =>
      <Dropdown trigger={['click']} overlay={menu} onOverlayClick={onOverlayClick}>
        <button class="my-button">open</button>
      </Dropdown>,
    );
    expect(dropdown.container.querySelector('.my-button')).toBeTruthy();
    fireEvent.click(dropdown.container.querySelector('.my-button'));
    expect(document.querySelector('.rc-dropdown')).toBeTruthy();
    expect(clicked).toBeUndefined();
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(false);
    expect(dropdown.container).toMatchSnapshot();
    fireEvent.click(document.querySelector('.my-menuitem'));
    expect(clicked).toBe('1');
    expect(onOverlayClick).toHaveBeenCalled();
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(true);
  });

  it('re-align works', async () => {
    const buttonStyle = { width: 600, height: 20, marginLeft: 100 };
    const buttonStyle2 = { width: '600px', height: '20px', 'margin-left': '100px' };
    const menu = (
      <Menu>
        <MenuItem key="1">one</MenuItem>
      </Menu>
    );
    const dropdown = render(() =>
      <Dropdown trigger={['click']} placement="bottomRight" overlay={menu}>
        <button class="my-btn" style={buttonStyle2}>
          open
        </button>
      </Dropdown>,
    );

    fireEvent.click(dropdown.container.querySelector('.my-btn'));
    await sleep(500);
    expect(getPopupDomNode(dropdown).getAttribute('style')).toEqual(
      expect.stringContaining(
        `left: -${999 - buttonStyle.width - placements.bottomLeft.offset[0]}px; top: -${999 - buttonStyle.height - placements.bottomLeft.offset[1]
        }px;`,
      ),
    );
  });

  // https://github.com/ant-design/ant-design/issues/9559
  it('should have correct menu width when switch from shorter menu to longer', async () => {
    const Example: Component = () => {
      const [state, setState] = createStore({ longList: true });
      let trigger = null;
      const getPopupDomNode = () => {
        return trigger.getPopupDomNode();
      }

      const short = () => {
        setState({ longList: false });
      };

      const long = () => {
        setState({ longList: true });
      };


      const menuItems = [
        <MenuItem key="1">1st item</MenuItem>,
        <MenuItem key="2">2nd item</MenuItem>,
      ];
      if (state.longList) {
        menuItems.push(<MenuItem key="3">3rd LONG SUPER LONG item</MenuItem>);
      }
      return (
        <Dropdown
          trigger={['click']}
          ref={(node) => {
            trigger = node;
          }}
          overlay={<Menu>{menuItems}</Menu>}
        >
          <button>Actions 111</button>
        </Dropdown>
      );
    }
    const dropdown = render(() => <Example />);
    fireEvent.click(dropdown.container.querySelector('button'));
    await sleep(500);
    
    expect(getPopupDomNode(dropdown).getAttribute('style')).toEqual(
      expect.stringContaining(
        `left: -${999 - placements.bottomLeft.offset[0]}px; top: -${999 - placements.bottomLeft.offset[1]
        }px;`,
      ),
    );

    // Todo - offsetwidth
  });

  it('Test default minOverlayWidthMatchTrigger', async () => {
    const overlayWidth = 50;
    const overlay = <div style={{ width: overlayWidth + 'px' }}>Test</div>;

    const dropdown = render(() =>
      <Dropdown trigger={['click']} overlay={overlay}>
        <button style={{ width: '100px' }} class="my-button">
          open
        </button>
      </Dropdown>,
    );

    fireEvent.click(dropdown.container.querySelector('.my-button'));
    await sleep(500);
    expect(getPopupDomNode(dropdown).getAttribute('style')).toEqual(
      expect.stringContaining('min-width: 100px'),
    );
  });

  it('user pass minOverlayWidthMatchTrigger', async () => {
    const overlayWidth = 50;
    const overlay = <div style={{ width: overlayWidth + 'px' }}>Test</div>;

    const dropdown = render(() =>
      <Dropdown trigger={['click']} overlay={overlay} minOverlayWidthMatchTrigger={false}>
        <button style={{ width: '100px' }} class="my-button">
          open
        </button>
      </Dropdown>,
    );

    fireEvent.click(dropdown.container.querySelector('.my-button'));
    await sleep(500);
    expect(getPopupDomNode(dropdown).getAttribute('style')).not.toEqual(
      expect.stringContaining('min-width: 100px'),
    );
  });

  it('should support default openClassName', () => {
    const overlay = <div style={{ width: '50px' }}>Test</div>;
    const dropdown = render(() =>
      <Dropdown trigger={['click']} overlay={overlay} minOverlayWidthMatchTrigger={false}>
        <button style={{ width: '100px' }} class="my-button">
          open
        </button>
      </Dropdown>,
    );
    fireEvent.click(dropdown.container.querySelector('.my-button'));
    expect(dropdown.container.querySelector('.my-button').className).toBe('my-button rc-dropdown-open');
    fireEvent.click(dropdown.container.querySelector('.my-button'));
    expect(dropdown.container.querySelector('.my-button').className).toBe('my-button');
  });

  it('should support custom openClassName', async () => {
    const overlay = <div style={{ width: '50px' }}>Test</div>;
    const dropdown = render(() =>
      <Dropdown
        trigger={['click']}
        overlay={overlay}
        minOverlayWidthMatchTrigger={false}
        openClassName="opened"
      >
        <button style={{ width: '100px' }} class="my-button">
          open
        </button>
      </Dropdown>,
    );

    fireEvent.click(dropdown.container.querySelector('.my-button'));
    expect(dropdown.container.querySelector('.my-button').className).toBe('my-button opened');
    fireEvent.click(dropdown.container.querySelector('.my-button'));
    expect(dropdown.container.querySelector('.my-button').className).toBe('my-button');
  });

  it('overlay callback', async () => {
    const overlay = <div style={{ width: '50px' }}>Test</div>;
    const dropdown = render(() =>
      <Dropdown trigger={['click']} overlay={() => overlay}>
        <button class="my-button">open</button>
      </Dropdown>,
    );

    fireEvent.click(dropdown.container.querySelector('.my-button'));
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(false);
  });

  it('should support arrow', async () => {
    const overlay = <div style={{ width: '50px' }}>Test</div>;
    const dropdown = render(() =>
      <Dropdown arrow overlay={overlay} trigger={['click']}>
        <button style={{ width: '100px' }} class="my-button">
          open
        </button>
      </Dropdown>,
    );

    fireEvent.click(dropdown.container.querySelector('.my-button'));
    await sleep(500);
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-show-arrow')).toBe(true);
    expect(
      document.querySelector('.rc-dropdown-arrow'),
    ).toBeTruthy();
  });

  it.skip('Keyboard navigation works', async () => {
    const overlay = (
      <Menu>
        <MenuItem key="1">
          <span class="my-menuitem">one</span>
        </MenuItem>
        <MenuItem key="2">two</MenuItem>
      </Menu>
    );
    const dropdown = render(() =>
      <Dropdown trigger={['click']} overlay={overlay} className="trigger-button">
        <button class="my-button">open</button>
      </Dropdown>,
    );
    const trigger = dropdown.container.querySelector('.my-button');

    // Open menu
    fireEvent.click(trigger);
    await sleep(200);
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(false);

    // Close menu with Esc
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 })); // Esc
    await sleep(200);
    expect(document.activeElement.className).toContain('my-button');

    // Open menu
    fireEvent.click(trigger);
    await sleep(200);
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(false);

    // Focus menu with Tab
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9 })); // Tab
    expect(document.activeElement.className).toContain('menu');

    // Close menu with Tab
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9 })); // Tab
    await sleep(200);
    expect(document.activeElement.className).toContain('my-button');
  });

  it.skip('keyboard should work if menu is wrapped', async () => {
    const overlay = (
      <div>
        <Menu>
          <MenuItem key="1">
            <span class="my-menuitem">one</span>
          </MenuItem>
          <MenuItem key="2">two</MenuItem>
        </Menu>
      </div>
    );
    const dropdown = render(() =>
      <Dropdown trigger={['click']} overlay={overlay} className="trigger-button">
        <button class="my-button">open</button>
      </Dropdown>,
    );
    const trigger = dropdown.container.querySelector('.my-button');

    // Open menu
    fireEvent.click(trigger);
    await sleep(200);
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(false);

    // Close menu with Esc
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 })); // Esc
    await sleep(200);
    expect(document.activeElement.className).toContain('my-button');

    // Open menu
    fireEvent.click(trigger);
    await sleep(200);
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(false);

    // Focus menu with Tab
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9 })); // Tab

    // Close menu with Tab
    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9 })); // Tab
    await sleep(200);
    expect(document.activeElement.className).toContain('my-button');
  });

  it('support Menu expandIcon', async () => {
    const props = {
      overlay: (
        <Menu expandIcon={() => <span id="customExpandIcon" />}>
          <Menu.Item key="1">foo</Menu.Item>
          <Menu.SubMenu key="s" title="SubMenu">
            <Menu.Item key="2">foo</Menu.Item>
          </Menu.SubMenu>
        </Menu>
      ),
      visible: true,
      getPopupContainer: (node) => node.parentElement,
    };

    const wrapper = render(() =>
      <Dropdown {...props}>
        <button type="button">button</button>
      </Dropdown>,
    );
    await sleep(500);
    screen.debug()
    expect(document.querySelector('#customExpandIcon')).toBeTruthy()
  });

  it('should support customized menuRef', async () => {
    let menuRef = null;
    const props = {
      overlay: (
        <Menu ref={menuRef}>
          <Menu.Item key="1">foo</Menu.Item>
        </Menu>
      ),
      visible: true,
    };

    const wrapper = render(() =>
      <Dropdown {...props}>
        <button type="button">button</button>
      </Dropdown>,
    );

    await sleep(500);
    expect(menuRef).toBeTruthy();
  });

  it('should support trigger which not support focus', async () => {
    jest.useFakeTimers();
    const Button = (props) => {
      props.ref?.(({
        foo: () => { },
      }));
      return (
        <button
          onClick={(e) => {
            props.onClick?.(e);
          }}
        >
          trigger
        </button>
      );
    };
    const wrapper = render(() =>
      <Dropdown
        trigger={['click']}
        getPopupContainer={(node) => node.parentElement}
        overlay={
          <Menu>
            <Menu.Item key="1">foo</Menu.Item>
          </Menu>
        }
      >
        <Button />
      </Dropdown>,
    );
    fireEvent.click(wrapper.container.querySelector('button'));
    fireEvent.click(document.querySelector('li'));
    jest.runAllTimers();
    jest.useRealTimers();
  });

  it('should support autoFocus', async () => {
    const overlay = () => (
      <Menu>
        <MenuItem key="1">
          <span class="my-menuitem">one</span>
        </MenuItem>
        <MenuItem key="2">two</MenuItem>
      </Menu>
    );
    const dropdown = render(() =>
      <Dropdown autoFocus trigger={['click']} overlay={overlay} className="trigger-button">
        <button class="my-button">open</button>
      </Dropdown>,
    );
    const trigger = dropdown.container.querySelector('.my-button');

    // Open menu
    fireEvent.click(trigger);
    await sleep(200);
    expect(getPopupDomNode(dropdown).classList.contains('rc-dropdown-hidden')).toBe(false);
    expect(document.activeElement.className).toContain('menu');

    // Close menu with Tab
    document.body.focus()
    expect(document.activeElement.className).toContain('menu');

    // window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: KeyCode.ESC })); // Tab
    // fireEvent.keyDown(document.querySelector('.rc-menu'), {
    //   keyCode: KeyCode.ESC, 
    // });
    fireEvent.keyDown(document.querySelector('.rc-menu'), {
      keyCode: KeyCode.TAB,
    });
    await sleep(200);
    // TODO: solid
    // expect(document.activeElement.className).not.toContain('menu');
  });
});
