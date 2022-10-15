/* eslint-disable no-undef, react/no-multi-comp, react/jsx-curly-brace-presence, max-classes-per-file */
import { render, fireEvent, screen } from "solid-testing-library";
import { createEffect, createSignal } from "solid-js";
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
import KeyCode from 'rc-util-solid/lib/KeyCode';
import { resetWarned } from 'rc-util-solid/lib/warning';
import Menu, { Divider, MenuItem, MenuItemGroup, SubMenu } from '../src';
import { isActive, last } from './util';
import { createStore } from "solid-js/store";

jest.mock('rc-trigger-solid', () => {
  // const React = require('react');
  let Trigger = jest.requireActual('rc-trigger-solid/lib/mock');
  Trigger = Trigger.default || Trigger;

  return ((props) => {
    global.triggerProps = props;
    return <Trigger {...props} />;
  });
});

jest.mock('rc-motion-solid', () => {
  let Motion = jest.requireActual('rc-motion-solid');
  Motion = Motion.default || Motion;

  return (props) => {
    global.motionProps = props;
    return <Motion {...props} />;
  };
});

describe('Menu', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('should render', () => {
    function createMenu(props, subKey) {
      return (
        <Menu
          disabledOverflow
          className="myMenu"
          // openAnimation="fade"
          motion={{ motionName: 'rc-menu-open-slicde-up' }}
          {...props}
        >
          <MenuItemGroup title="g1">
            <MenuItem key="1">1</MenuItem>
            <Divider />
            <MenuItem key="2">2</MenuItem>
          </MenuItemGroup>
          <MenuItem key="3">3</MenuItem>
          <MenuItemGroup title="g2">
            <MenuItem key="4">4</MenuItem>
            <MenuItem key="5" disabled>
              5
            </MenuItem>
          </MenuItemGroup>
          <SubMenu key={subKey} title="submenu">
            <MenuItem key="6">6</MenuItem>
          </SubMenu>
        </Menu>
      );
    }

    it('popup with rtl has correct className', () => {
      const { container, unmount } = render(() =>
        createMenu(
          { mode: 'vertical', direction: 'rtl', openKeys: ['sub'] },
          'sub',
        ),
      );


      jest.runAllTimers();


      expect(
        document.querySelector('.rc-menu-submenu-popup .rc-menu-rtl'),
      ).toBeTruthy();

      unmount();
    });

    ['vertical', 'horizontal', 'inline'].forEach(mode => {
      it(`${mode} menu correctly`, () => {
        const { container } = render(() => createMenu({ mode }));
        expect(container.children).toMatchSnapshot();
      });

      it(`${mode} menu with empty children without error`, () => {
        expect(() => render(() => <Menu mode={mode}>{[]}</Menu>)).not.toThrow();
      });

      it(`${mode} menu with undefined children without error`, () => {
        expect(() => render(() => <Menu mode={mode} />)).not.toThrow();
      });

      it(`${mode} menu that has a submenu with undefined children without error`, () => {
        expect(() =>
          render(() =>
            <Menu mode={mode}>
              <SubMenu />
            </Menu>,
          ),
        ).not.toThrow();
      });

      it(`${mode} menu with rtl direction correctly`, () => {
        const { container } = render(() => createMenu({ mode, direction: 'rtl' }, 's'));
        expect(container.children).toMatchSnapshot();
        expect(document.querySelector('ul').className).toContain('-rtl');
      });
    });

    it('should support Fragment', () => {
      const { container } = render(() =>
        <Menu>
          <SubMenu title="submenu">
            <MenuItem key="6">6</MenuItem>
          </SubMenu>
          <MenuItem key="7">6</MenuItem>
          <>
            <SubMenu title="submenu">
              <MenuItem key="8">6</MenuItem>
            </SubMenu>
            <MenuItem key="9">6</MenuItem>
          </>
        </Menu>,
      );
      expect(container.children).toMatchSnapshot();
    });
  });

  describe('render role listbox', () => {
    function createMenu() {
      return (
        <Menu class="myMenu"
          motion={{ motionName: 'rc-menu-open-slicde-up' }}
          role="listbox">
          <MenuItem key="1" role="option">
            1
          </MenuItem>
          <MenuItem key="2" role="option">
            2
          </MenuItem>
          <MenuItem key="3" role="option">
            3
          </MenuItem>
        </Menu>
      );
    }

    it('renders menu correctly', () => {
      const { container } = render(() => createMenu());
      expect(container.children).toMatchSnapshot();
    });
  });

  it('set activeKey', () => {
    let setProps;
    const GenMenu = props_ => {
      const [props, setState] = createStore(props_);
      setProps = setState;
      return <Menu activeKey="1" {...props}>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>
    };

    const { container, rerender } = render(() => <GenMenu />);
    isActive(container, 0);
    isActive(container, 1, false);

    setProps({ activeKey: '2' });
    isActive(container, 0, false);
    isActive(container, 1);
  });

  it('active first item', () => {
    const { container } = render(() =>
      <Menu defaultActiveFirst>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>,
    );
    expect(container.querySelector('.rc-menu-item')).toHaveClass(
      'rc-menu-item-active',
    );
  });

  it('should render none menu item children', () => {
    expect(() => {
      render(() =>
        <Menu activeKey="1">
          <MenuItem key="1">1</MenuItem>
          <MenuItem key="2">2</MenuItem>
          string
          {'string'}
          {null}
          {undefined}
          {12345}
          <div />
          <input />
        </Menu>,
      );
    }).not.toThrow();
  });

  it('select multiple items', () => {
    const { container } = render(() =>
      <Menu multiple>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>,
    );

    fireEvent.click(container.querySelector('.rc-menu-item'));
    fireEvent.click(last(container.querySelectorAll('.rc-menu-item')));

    expect(container.querySelectorAll('.rc-menu-item-selected')).toHaveLength(
      2,
    );
  });

  it('can be controlled by selectedKeys', () => {
    let setProps;
    const GenMenu = props_ => {
      const [props, setState] = createStore(props_);
      setProps = setState;
      return <Menu selectedKeys={['1']} {...props}>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>
    };
    const { container, rerender } = render(() => <GenMenu />);
    expect(container.querySelector('li').className).toContain('-selected');
    setProps({ selectedKeys: ['2'] });
    expect(last(container.querySelectorAll('li')).className).toContain(
      '-selected',
    );
  });

  it('empty selectedKeys not to throw', () => {
    render(() =>
      <Menu selectedKeys={null}>
        <MenuItem key="foo">foo</MenuItem>
      </Menu>,
    );
  });

  it('not selectable', () => {
    const onSelect = jest.fn();

    let setProps;
    const GenMenu = props_ => {
      const [props, setState] = createStore(props_);
      setProps = setState;
      return <Menu onSelect={onSelect} selectedKeys={[]} {...props}>
        <MenuItem key="bamboo">Bamboo</MenuItem>
      </Menu>
    };

    const { container, rerender } = render(() => <GenMenu />);

    fireEvent.click(container.querySelector('.rc-menu-item'));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ selectedKeys: ['bamboo'] }),
    );

    onSelect.mockReset();
    setProps({ selectable: false });
    fireEvent.click(container.querySelector('.rc-menu-item'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('select default item', () => {
    const { container } = render(() =>
      <Menu defaultSelectedKeys={['1']}>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>,
    );
    expect(container.querySelector('li').className).toContain('-selected');
  });

  it('issue https://github.com/ant-design/ant-design/issues/29429', () => {
    // don't use selectedKeys as string
    // it is a compatible feature for https://github.com/ant-design/ant-design/issues/29429
    const { container } = render(() =>
      <Menu selectedKeys="item_abc">
        <MenuItem key="item_a">1</MenuItem>
        <MenuItem key="item_abc">2</MenuItem>
      </Menu>,
    );
    expect(container.querySelector('li').className).not.toContain('-selected');
    expect(container.querySelectorAll('li')[1].className).toContain(
      '-selected',
    );
  });

  describe('openKeys', () => {
    it('can be controlled by openKeys', () => {
      let setProps;
      const GenMenu = props_ => {
        const [props, setState] = createSignal(props_);
        setProps = setState;
        return (<Menu openKeys={['g1']} {...props}>
          <Menu.SubMenu key="g1">
            <MenuItem key="1">1</MenuItem>
          </Menu.SubMenu>
          <Menu.SubMenu key="g2">
            <MenuItem key="2">2</MenuItem>
          </Menu.SubMenu>
        </Menu>
        )
      };
      const { container, rerender } = render(() => <GenMenu />);

      expect(
        container.querySelectorAll('.rc-menu-submenu-vertical')[0],
      ).toHaveClass('rc-menu-submenu-open');
      expect(
        container.querySelectorAll('.rc-menu-submenu-vertical')[1],
      ).not.toHaveClass('rc-menu-submenu-open');

      setProps({ openKeys: ['g2'] });
      expect(
        container.querySelectorAll('.rc-menu-submenu-vertical')[0],
      ).not.toHaveClass('rc-menu-submenu-open');
      expect(
        container.querySelectorAll('.rc-menu-submenu-vertical')[1],
      ).toHaveClass('rc-menu-submenu-open');
    });

    it('openKeys should allow to be empty', () => {
      const { container } = render(() =>
        <Menu
          onClick={() => { }}
          onOpenChange={() => { }}
          openKeys={undefined}
          selectedKeys={['1']}
          mode="inline"
        >
          <SubMenu title="1231">
            <MenuItem>
              <a>
                <span>123123</span>
              </a>
            </MenuItem>
          </SubMenu>
        </Menu>,
      );
      expect(container.innerHTML).toBeTruthy();
    });

    it('null of openKeys', () => {
      const { container } = render(() =>
        <Menu openKeys={null} mode="inline">
          <SubMenu key="bamboo" title="Bamboo">
            <MenuItem key="light">Light</MenuItem>
          </SubMenu>
        </Menu>,
      );
      expect(container.innerHTML).toBeTruthy();
    });
  });

  it('open default submenu', () => {
    const { container } = render(() =>
      <Menu defaultOpenKeys={['g1']}>
        <SubMenu key="g1">
          <MenuItem key="1">1</MenuItem>
        </SubMenu>
        <SubMenu key="g2">
          <MenuItem key="2">2</MenuItem>
        </SubMenu>
      </Menu>,
    );


    jest.runAllTimers();


    expect(
      document.querySelectorAll('.rc-menu-submenu-vertical')[0],
    ).toHaveClass('rc-menu-submenu-open');
    expect(
      document.querySelectorAll('.rc-menu-submenu-vertical')[1],
    ).not.toHaveClass('rc-menu-submenu-open');
  });

  it('fires select event', () => {
    const handleSelect = jest.fn();
    const { container } = render(() =>
      <Menu onSelect={handleSelect}>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>,
    );
    fireEvent.click(container.querySelector('.rc-menu-item'));
    expect(handleSelect.mock.calls[0][0].key).toBe('1');
  });

  it.skip('fires click event', () => {
    resetWarned();

    const errorSpy = jest.spyOn(console, 'error');

    const handleClick = jest.fn();
    const { container } = render(() =>
      <Menu onClick={handleClick} openKeys={['parent']}>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
        <Menu.SubMenu key="parent">
          <MenuItem key="3">3</MenuItem>
        </Menu.SubMenu>
      </Menu>,
    );


    jest.runAllTimers();


    fireEvent.click(container.querySelector('.rc-menu-item'));
    const info = handleClick.mock.calls[0][0];
    expect(info.key).toBe('1');
    // expect(info.item).toBeTruthy();

    // expect(errorSpy).toHaveBeenCalledWith(
    //   'Warning: `info.item` is deprecated since we will move to function component that not provides React Node instance in future.',
    // );

    handleClick.mockReset();
    fireEvent.click(last(container.querySelectorAll('.rc-menu-item')));
    expect(handleClick.mock.calls[0][0].keyPath).toEqual(['3', 'parent']);

    errorSpy.mockRestore();
  });

  it('fires deselect event', () => {
    const handleDeselect = jest.fn();
    const { container } = render(() =>
      <Menu multiple onDeselect={handleDeselect}>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>,
    );
    const item = container.querySelector('.rc-menu-item');
    fireEvent.click(item);
    fireEvent.click(item);
    expect(handleDeselect.mock.calls[0][0].key).toBe('1');
  });

  it('active by mouse enter', () => {
    const { container } = render(() =>
      <Menu>
        <MenuItem key="item1">item</MenuItem>
        <MenuItem disabled>disabled</MenuItem>
        <MenuItem key="item2">item2</MenuItem>
      </Menu>,
    );
    // wrapper.container.querySelectorAll('li').last().simulate('mouseEnter');
    fireEvent.mouseEnter(last(container.querySelectorAll('.rc-menu-item')));
    // expect(wrapper.isActive(2)).toBeTruthy();
    isActive(container, 2);
  });

  it('active by key down', () => {
    let setProps;
    const GenMenu = props_ => {
      const [props, setState] = createStore(props_);
      setProps = setState;
      return (<Menu activeKey="1" {...props}>
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="2">2</MenuItem>
      </Menu>)
    };
    const { container, rerender } = render(() => <GenMenu />);

    // KeyDown will not change activeKey since control
    fireEvent.keyDown(container.querySelector('.rc-menu-root'), {
      which: KeyCode.DOWN,
      keyCode: KeyCode.DOWN,
      charCode: KeyCode.DOWN,
    });
    isActive(container, 0);

    setProps({ activeKey: '2' });
    isActive(container, 1);
  });

  it('defaultActiveFirst', () => {
    const { container } = render(() =>
      <Menu selectedKeys={['foo']} defaultActiveFirst>
        <MenuItem key="foo">foo</MenuItem>
      </Menu>,
    );
    isActive(document.querySelector("body"), 0);
  });

  it('should accept builtinPlacements', () => {
    const builtinPlacements = {
      leftTop: {
        points: ['tr', 'tl'],
        overflow: {
          adjustX: 0,
          adjustY: 0,
        },
        offset: [0, 0],
      },
    };

    const { container } = render(() =>
      <Menu builtinPlacements={builtinPlacements}>
        <MenuItem>menuItem</MenuItem>
        <SubMenu title="submenu">
          <MenuItem>menuItem</MenuItem>
        </SubMenu>
      </Menu>,
    );

    expect(global.triggerProps.builtinPlacements.leftTop).toEqual(
      builtinPlacements.leftTop,
    );
  });

  describe('motion', () => {
    const defaultMotions = {
      inline: { motionName: 'inlineMotion' },
      horizontal: { motionName: 'horizontalMotion' },
      other: { motionName: 'defaultMotion' },
    };

    it('defaultMotions should work correctly', () => {
      let setProps;
      const GenMenu = props_ => {
        const [props, setState] = createStore(props_);
        setProps = setState;
        return (<Menu mode="inline" defaultMotions={defaultMotions} {...props}>
          <SubMenu key="bamboo">
            <MenuItem key="light" />
          </SubMenu>
        </Menu>
        )
      };

      render(() => <GenMenu />);

      // Inline
      setProps({ mode: 'inline' });
      jest.runAllTimers();
      expect(global.motionProps.motionName).toEqual('inlineMotion');

      // Horizontal
      setProps({ mode: 'horizontal' });
      jest.runAllTimers();
      expect(global.triggerProps.popupMotion.motionName).toEqual(
        'horizontalMotion',
      );

      // Default
      setProps({ mode: 'vertical' });
      jest.runAllTimers();
      expect(global.triggerProps.popupMotion.motionName).toEqual(
        'defaultMotion',
      );
    });

    it('motion is first level', async () => {
      let setProps;
      const GenMenu = props_ => {
        const [props, setState] = createSignal(props_);
        setProps = setState;
        return (<Menu
          mode="inline"
          defaultMotions={defaultMotions}
          motion={{ motionName: 'bambooLight' }}
          {...props}
        >
          <SubMenu key="bamboo">
            <MenuItem key="light" />
          </SubMenu>
        </Menu>
        )
      };
      render(() => <GenMenu />);

      // Inline
      setProps({ mode: 'inline' });
      jest.runAllTimers()
      expect(global.motionProps.motionName).toEqual('bambooLight');

      // Horizontal
      setProps({ mode: 'horizontal' });
      jest.runAllTimers()
      expect(global.triggerProps.popupMotion.motionName).toEqual('bambooLight');

      // Default
      setProps({ mode: 'vertical' });
      jest.runAllTimers()
      expect(global.triggerProps.popupMotion.motionName).toEqual('bambooLight');
    });
  });

  it('onMouseEnter should work', () => {
    const onMouseEnter = jest.fn();
    const { container } = render(() =>
      <Menu onMouseEnter={onMouseEnter} defaultSelectedKeys={['test1']}>
        <MenuItem key="test1">Navigation One</MenuItem>
        <MenuItem key="test2">Navigation Two</MenuItem>
      </Menu>,
    );

    fireEvent.mouseEnter(container.querySelector('.rc-menu-root'));
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it('Nest children active should bump to top', async () => {
    const { container } = render(() =>
      <Menu activeKey="light" mode="vertical">
        <SubMenu key="bamboo" title="Bamboo">
          <MenuItem key="light">Light</MenuItem>
        </SubMenu>
      </Menu>,
    );

    expect(container.querySelector('.rc-menu-submenu-active')).toBeTruthy();
  });

  it.skip('not warning on destroy', async () => {
    resetWarned();

    const errorSpy = jest.spyOn(console, 'error');

    const { unmount } = render(() =>
      <Menu>
        <MenuItem key="bamboo">Bamboo</MenuItem>
      </Menu>,
    );

    unmount();

    await Promise.resolve();

    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  describe('Click should close Menu', () => {
    function test(name, props) {
      it(name, async () => {
        const onOpenChange = jest.fn();

        const { container } = render(() =>
          <Menu
            openKeys={['bamboo']}
            mode="vertical"
            onOpenChange={onOpenChange}
            {...props}
          >
            <SubMenu key="bamboo" title="Bamboo">
              <MenuItem key="light">Light</MenuItem>
            </SubMenu>
          </Menu>,
        );

        // Open menu
        jest.runAllTimers();

        // wrapper.container.querySelectorAll('.rc-menu-item').last().simulate('click');
        fireEvent.click(last(document.querySelectorAll('.rc-menu-item')));
        expect(onOpenChange).toHaveBeenCalledWith([]);
      });
    }

    test('basic');
    test('not selectable', { selectable: false });
    test('inlineCollapsed', { mode: 'inline', inlineCollapsed: true });

    it('not close inline', async () => {
      const onOpenChange = jest.fn();

      const { container } = render(() =>
        <Menu openKeys={['bamboo']} mode="inline" onOpenChange={onOpenChange}>
          <SubMenu key="bamboo" title="Bamboo">
            <MenuItem key="light">Light</MenuItem>
          </SubMenu>
        </Menu>,
      );

      // Open menu
      jest.runAllTimers();

      fireEvent.click(last(container.querySelectorAll('.rc-menu-item')));
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  it('should support ref', () => {
    let menuRef = null;
    const { container } = render(() =>
      <Menu ref={menuRef}>
        <MenuItem key="light">Light</MenuItem>
      </Menu>,
    );
    expect(menuRef?.list).toBe(document.querySelector('ul'));
  });

  it('should support focus through ref', () => {
    let menuRef = null;
    const { container } = render(() =>
      <Menu ref={menuRef}>
        <SubMenu key="bamboo" title="Disabled" disabled>
          <MenuItem key="light">Disabled child</MenuItem>
        </SubMenu>
        <MenuItem key="light">Light</MenuItem>
      </Menu>,
    );
    menuRef?.focus();

    expect(document.activeElement).toBe(last(document.querySelectorAll('li')));
  });

  it('should focus active item through ref', () => {
    let menuRef = null;
    const { container } = render(() =>
      <Menu ref={menuRef} activeKey="cat">
        <MenuItem key="light">Light</MenuItem>
        <MenuItem key="cat">Cat</MenuItem>
      </Menu>,
    );
    menuRef.focus();

    expect(document.activeElement).toBe(document.querySelector('.rc-menu-item-active'));
  });
});
/* eslint-enable */
