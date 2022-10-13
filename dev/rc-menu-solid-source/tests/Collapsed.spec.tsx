/* eslint-disable no-undef, react/no-multi-comp, react/jsx-curly-brace-presence */
import { render, fireEvent, screen } from "solid-testing-library";
import { createSignal } from "solid-js";
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
import Menu, { MenuItem, SubMenu } from '../src';
// const Menu = wrapFC(Menu_)

describe('Menu.Collapsed', () => {
  describe('inlineCollapse and siderCollapsed', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should always follow openKeys when mode is switched', () => {
      let setProps;
      let props;
      const GenMenu = () => {
        ([props, setProps] = createSignal({}));
        return (
          <Menu openKeys={['1']} mode="inline" {...props}>
            <SubMenu key="1" title="submenu1">
              <MenuItem key="submenu1">Option 1</MenuItem>
              <MenuItem key="submenu2">Option 2</MenuItem>
            </SubMenu>
            <MenuItem key="2">menu2</MenuItem>
          </Menu>
        )
      };
      // let Menus = { setProps }
      const { container } = render(() => <GenMenu />);

      // Inline
      expect(container.querySelector('ul.rc-menu-sub')).not.toHaveClass(
        'rc-menu-hidden',
      );

      // Vertical
      setProps({ mode: 'vertical' });

      jest.runAllTimers();
      expect(container.querySelector('ul.rc-menu-sub')).not.toHaveClass(
        'rc-menu-hidden',
      );

      // Inline
      // rerender(genMenu({ mode: 'inline' }));
      setProps({ mode: 'inline' });
      jest.runAllTimers();

      expect(container.querySelector('ul.rc-menu-sub')).not.toHaveClass(
        'rc-menu-hidden',
      );
    });

    it('should always follow openKeys when inlineCollapsed is switched', () => {
      let setProps;
      let props;
      const GenMenu = () => {
        ([props, setProps] = createSignal({}));
        return <Menu defaultOpenKeys={['1']} mode="inline" {...props}>
          <MenuItem key="menu1">
            <span>Option</span>
          </MenuItem>
          <SubMenu key="1" title="submenu1">
            <MenuItem key="submenu1">Option</MenuItem>
            <MenuItem key="submenu2">Option</MenuItem>
          </SubMenu>
        </Menu>
      };

      const { container } = render(() => <GenMenu />);
      expect(container.querySelector('ul.rc-menu-sub')).toHaveClass(
        'rc-menu-inline',
      );
      expect(container.querySelector('ul.rc-menu-sub')).not.toHaveClass(
        'rc-menu-hidden',
      );

      setProps({ inlineCollapsed: true });
      // 动画结束后套样式;

      jest.runAllTimers();

      fireEvent.transitionEnd(container.querySelector('.rc-menu-root'), {
        propertyName: 'width',
      });

      // Flush SubMenu raf state update

      jest.runAllTimers();


      expect(container.querySelector('ul.rc-menu-root')).toHaveClass(
        'rc-menu-vertical',
      );
      expect(container.querySelectorAll('ul.rc-menu-sub')).toHaveLength(0);

      setProps({ inlineCollapsed: false });

      jest.runAllTimers();


      expect(container.querySelector('ul.rc-menu-sub')).toHaveClass(
        'rc-menu-inline',
      );
      expect(container.querySelector('ul.rc-menu-sub')).not.toHaveClass(
        'rc-menu-hidden',
      );
    });

    it('inlineCollapsed should works well when specify a not existed default openKeys', () => {
      let setProps;
      let props;
      const GenMenu = () => {
        ([props, setProps] = createSignal({}));
        return <Menu defaultOpenKeys={['not-existed']} mode="inline" {...props}>
          <MenuItem key="menu1">
            <span>Option</span>
          </MenuItem>
          <SubMenu key="1" title="submenu1">
            <MenuItem key="submenu1">Option</MenuItem>
            <MenuItem key="submenu2">Option</MenuItem>
          </SubMenu>
        </Menu>
      };

      const { container } = render(() => <GenMenu />);
      expect(container.querySelectorAll('.rc-menu-sub')).toHaveLength(0);

      // Do collapsed
      setProps({ inlineCollapsed: true });


      jest.runAllTimers();


      //   wrapper
      //     .container.querySelectorAll('Overflow')
      //     .simulate('transitionEnd', { propertyName: 'width' });
      fireEvent.transitionEnd(container.querySelector('.rc-menu-root'), {
        propertyName: 'width',
      });

      // Wait internal raf work

      jest.runAllTimers();


      // Hover to show
      //   wrapper.container.querySelectorAll('.rc-menu-submenu-title')[0].simulate('mouseEnter');
      fireEvent.mouseEnter(container.querySelector('.rc-menu-submenu-title'));


      jest.runAllTimers();


      jest.runAllTimers();


      expect(container.querySelector('.rc-menu-submenu')).toHaveClass(
        'rc-menu-submenu-vertical',
      );

      expect(container.querySelector('.rc-menu-submenu')).toHaveClass(
        'rc-menu-submenu-open',
      );

      expect(container.querySelector('ul.rc-menu-sub')).toHaveClass(
        'rc-menu-vertical',
      );
      expect(container.querySelector('ul.rc-menu-sub')).not.toHaveClass(
        'rc-menu-hidden',
      );
    });

    it('inlineCollapsed MenuItem Tooltip can be removed', () => {
      let setProps;
      let props;
      const GenMenu = () => {
        ([props, setProps] = createSignal({}));
        return <Menu
          defaultOpenKeys={['not-existed']}
          mode="inline"
          inlineCollapsed
          getPopupContainer={node => node.parentNode}
        >
          <MenuItem key="menu1">item</MenuItem>
          <MenuItem key="menu2" title="title">
            item
          </MenuItem>
          <MenuItem key="menu3" title={undefined}>
            item
          </MenuItem>
          <MenuItem key="menu4" title={null}>
            item
          </MenuItem>
          <MenuItem key="menu5" title="">
            item
          </MenuItem>
          <MenuItem key="menu6" title={false}>
            item
          </MenuItem>
        </Menu>
      };
      const { container } = render(() => <GenMenu />);
      expect(
        Array.from(container.querySelectorAll('.rc-menu-item')).map(
          node => node.title,
        ),
      ).toEqual(['', 'title', '', '', '', '']);
    });

    // https://github.com/ant-design/ant-design/issues/18825
    // https://github.com/ant-design/ant-design/issues/8587
    it('should keep selectedKeys in state when collapsed to 0px', () => {
      let setProps;
      let props;
      const GenMenu = () => {
        ([props, setProps] = createSignal({}));
        return <Menu
          mode="inline"
          inlineCollapsed={false}
          defaultSelectedKeys={['1']}
          openKeys={['3']}
          {...props}
        >
          <MenuItem key="1">Option 1</MenuItem>
          <MenuItem key="2">Option 2</MenuItem>
          <SubMenu key="3" title="Option 3">
            <MenuItem key="4">Option 4</MenuItem>
          </SubMenu>
        </Menu>
      };
      const { container } = render(() => <GenMenu />);

      // Default
      expect(
        container.querySelector('.rc-menu-item-selected').textContent,
      ).toBe('Option 1');

      // Click to change select
      fireEvent.click(container.querySelectorAll('.rc-menu-item')[1]);
      expect(
        container.querySelector('.rc-menu-item-selected').textContent,
      ).toBe('Option 2');

      // Collapse it
      setProps({ inlineCollapsed: true });

      jest.runAllTimers();


      // Open since controlled
      expect(container.querySelector('.rc-menu-submenu-popup')).toBeTruthy();

      // Expand it
      setProps({ inlineCollapsed: false });
      expect(
        container.querySelector('.rc-menu-item-selected').textContent,
      ).toBe('Option 2');
    });

    it('should hideMenu in initial state when collapsed', () => {
      let setProps;
      let props;
      const GenMenu = () => {
        ([props, setProps] = createSignal({}));
        return <Menu
          mode="inline"
          inlineCollapsed
          defaultSelectedKeys={['1']}
          openKeys={['3']}
          {...props}
        >
          <MenuItem key="1">Option 1</MenuItem>
          <MenuItem key="2">Option 2</MenuItem>
          <SubMenu key="3" title="Option 3">
            <MenuItem key="4">Option 4</MenuItem>
          </SubMenu>
        </Menu>
      };

      const { container } = render(() => <GenMenu />);

      jest.runAllTimers();


      expect(container.querySelector('.rc-menu-submenu-popup')).toBeTruthy();

      setProps({ inlineCollapsed: false });

      jest.runAllTimers();


      expect(
        container.querySelector('.rc-menu-item-selected').textContent,
      ).toBe('Option 1');
    });

    it('vertical also support inlineCollapsed', () => {
      const { container } = render(() => <Menu mode="vertical" inlineCollapsed />);

      expect(container.querySelector('.rc-menu-inline-collapsed')).toBeTruthy();
    });
  });
});
/* eslint-enable */
