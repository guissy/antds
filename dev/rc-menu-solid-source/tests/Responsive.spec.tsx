/* eslint-disable no-undef, react/no-multi-comp, react/jsx-curly-brace-presence, max-classes-per-file */
import { render, fireEvent } from "solid-testing-library";
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
import KeyCode from 'rc-util-solid/lib/KeyCode';
import Menu, { MenuItem, SubMenu } from '../src';
import { OVERFLOW_KEY } from '../src/hooks/useKeyRecords';
import { last } from './util';

jest.mock('rc-resize-observer', () => {
  // const React = require('react');
  let ResizeObserver = jest.requireActual('rc-resize-observer');
  ResizeObserver = ResizeObserver.default || ResizeObserver;

  let guid = 0;

  return (props) => {
    const id = (() => {
      guid += 1;
      return guid;
    })();

    global.resizeProps = global.resizeProps || new Map<number, any>();
    global.resizeProps.set(id, props);

    return <ResizeObserver {...props} />;
  };
});

describe('Menu.Responsive', () => {
  beforeEach(() => {
    global.resizeProps = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function getResizeProps(): any[] {
    return Array.from(global.resizeProps!.values());
  }

  it('ssr render full', () => {
    const { container } = render(() =>
      <Menu mode="horizontal">
        <MenuItem key="light">Light</MenuItem>
        <SubMenu key="bamboo">Bamboo</SubMenu>
        <MenuItem key="little">Little</MenuItem>
      </Menu>,
    );

    expect(container.children).toMatchSnapshot();
  });

  it('show rest', () => {
    const onOpenChange = jest.fn();

    let setProps;
    let props;
    const GenMenu = () => {
      ([props, setProps] = createSignal({}));
      return <Menu
        mode="horizontal"
        activeKey="little"
        onOpenChange={onOpenChange}
        {...props}
      >
        <MenuItem key="light">Light</MenuItem>
        <MenuItem key="bamboo">Bamboo</MenuItem>
        <SubMenu key="home" title="Home">
          <MenuItem key="little">Little</MenuItem>
        </SubMenu>
      </Menu>
    };

    const { container } = render(() => <GenMenu />);


    jest.runAllTimers();


    // Set container width

    getResizeProps()[0].onResize({} as any, { clientWidth: 41 } as any);
    jest.runAllTimers();


    // Resize every item
    getResizeProps()
      .slice(1)
      .forEach(props => {
        act(() => {
          props.onResize({ offsetWidth: 20 } as any, null);
          jest.runAllTimers();
        });
      });

    // Should show the rest icon
    expect(
      last(container.querySelectorAll('.rc-menu-overflow-item-rest')),
    ).not.toHaveStyle({
      opacity: '0',
    });

    // Should set active on rest
    expect(
      last(container.querySelectorAll('.rc-menu-overflow-item-rest')),
    ).toHaveClass('rc-menu-submenu-active');

    // Key down can open
    expect(onOpenChange).not.toHaveBeenCalled();
    setProps({ activeKey: OVERFLOW_KEY });

    jest.runAllTimers();


    fireEvent.keyDown(container.querySelector('ul.rc-menu-root'), {
      which: KeyCode.DOWN,
      keyCode: KeyCode.DOWN,
      charCode: KeyCode.DOWN,
    });

    expect(onOpenChange).toHaveBeenCalled();
  });
});
/* eslint-enable */
