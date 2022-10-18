/* eslint-disable react/no-render-return-value, max-classes-per-file, func-names, no-console */
import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import { spread } from "solid-js/web";
import { render, fireEvent } from "solid-testing-library";
import KeyCode from 'rc-util-solid/lib/KeyCode';
import { createStore } from 'solid-js/store';
import type { DialogProps } from '../src';
import Dialog from '../src';
import { Result } from "solid-testing-library/dist/types";

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

describe('dialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correct', () => {
    const wrapper = render(() => <Dialog title="Default" visible />);
    jest.runAllTimers();
    // wrapper.update();

    expect(wrapper.container).toMatchSnapshot();
  });

  it('add rootClassName should render correct', () => {
    const wrapper = render(() =>
      <Dialog
        visible
        rootClassName="customize-root-class"
        style={{ width: '600px' }}
        height={903}
        wrapStyle={{ 'font-size': '10px' }}
      />,
    );
    jest.runAllTimers();
    // // wrapper.update();

    expect(wrapper.container).toMatchSnapshot();
    expect(document.querySelectorAll('.customize-root-class').length).toBeTruthy();
    expect(document.querySelector('.rc-dialog-wrap')).toHaveStyle({ "font-size": '10px' });
    expect(document.querySelector('.rc-dialog')).toHaveStyle({ "height": '903px', width: '600px' });
  });

  it('show', () => {
    const wrapper = render(() => <Dialog visible />);
    jest.runAllTimers();
    // // wrapper.update();
    expect(document.querySelector('.rc-dialog-wrap')).toHaveStyle({ display: 'block' });
  });

  it('close', () => {
    let setProps;
    const Demo = (props_?: any) => {
      const [props, setState] = createStore(props_);
      setProps = setState;

      return (<Dialog visible {...props} />);
    }
    render(() => <Demo />)
    jest.runAllTimers();

    setProps({ visible: false });
    jest.runAllTimers();
    // wrapper.update();

    expect(document.querySelector('.rc-dialog-wrap')).toHaveStyle({ display: 'none' });
  });

  it('create & root & mask', () => {
    const wrapper = render(() => <Dialog visible />);
    jest.runAllTimers();
    // wrapper.update();

    expect(document.querySelectorAll('.rc-dialog-root').length).toBeTruthy();
    expect(document.querySelectorAll('.rc-dialog-mask').length).toBeTruthy();
  });

  it('click close', () => {
    const onClose = jest.fn();
    const wrapper = render(() => <Dialog closeIcon="test" onClose={onClose} visible />);
    jest.runAllTimers();
    // wrapper.update();

    const btn = document.querySelector('.rc-dialog-close');
    expect(btn).toHaveTextContent('test');
    fireEvent.click(btn);

    jest.runAllTimers();
    // wrapper.update();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('destroyOnClose', () => {
    it('default is false', () => {
      let setProps;
      const Demo = (props_?: any) => {
        const [props, setState] = createStore(props_);
        setProps = setState;
  
        return (<Dialog visible {...props}>
          <input class="test-destroy" />
        </Dialog>);
      }
      render(() => <Demo />)
      setProps({ visible: false });
      jest.runAllTimers();
      // // wrapper.update();

      expect(document.querySelectorAll('.test-destroy')).toHaveLength(1);

      // wrapper.unmount();
    });

    it('destroy on hide should unmount child components on close', () => {
      let setProps;
      const Demo = (props_?: any) => {
        const [props, setState] = createStore(props_);
        setProps = setState;
  
        return (<Dialog destroyOnClose {...props}>
          <input class="test-input" />
        </Dialog>);
      }
      render(() => <Demo />)

      // Show
      setProps({ visible: true });
      jest.runAllTimers();
      // wrapper.update();

      (document.getElementsByClassName('.test-input') as unknown as HTMLInputElement).value =
        'test';
      expect(
        (document.getElementsByClassName('.test-input') as unknown as HTMLInputElement).value,
      ).toBe('test');

      // Hide
      setProps({ visible: false });
      jest.runAllTimers();
      // wrapper.update();

      // Show
      setProps({ visible: true });
      jest.runAllTimers();
      // wrapper.update();

      expect(
        (document.getElementsByClassName('.test-input') as unknown as HTMLInputElement).value,
      ).toBeUndefined();
      // wrapper.unmount();
    });
  });

  it('esc to close', () => {
    const onClose = jest.fn();
    const wrapper = render(() => <Dialog onClose={onClose} visible />);
    jest.runAllTimers();
    // wrapper.update();

    (document.querySelector('.rc-dialog') as HTMLElement).focus();
    fireEvent.keyDown(document.querySelector('.rc-dialog'), { keyCode: KeyCode.ESC });
    jest.runAllTimers();
    // wrapper.update();
    expect(onClose).toHaveBeenCalled();
  });

  it('mask to close', () => {
    const onClose = jest.fn();
    let setProps;
    const Demo = (props_?: any) => {
      const [props, setState] = createStore(props_);
      setProps = setState;

      return (<Dialog onClose={onClose} visible {...props} />);
    }
    render(() => <Demo />)

    // Mask close
    fireEvent.click(document.querySelector('.rc-dialog-wrap'))
    jest.runAllTimers();
    // // wrapper.update();
    expect(onClose).toHaveBeenCalled();
    onClose.mockReset();

    expect(onClose).not.toHaveBeenCalled();
    // Mask can not close
    setProps({ maskClosable: false });
    fireEvent.click(document.querySelector('.rc-dialog-wrap'))
    jest.runAllTimers();
    // // wrapper.update();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renderToBody', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let setProps;
    const Demo = (props_?: any) => {
      const [props, setState] = createStore(props_);
      setProps = setState;

      return (
        <Dialog visible={false} {...props}>
          <p class="renderToBody">1</p>
        </Dialog>
      )
    };

    const wrapper = render(() => <Demo />, { container: container })
    expect(wrapper.container.querySelectorAll('.renderToBody')).toHaveLength(0);
    expect(wrapper.container.querySelectorAll('.rc-dialog-wrap')).toHaveLength(0);

    // Visible
    setProps({ visible: true });
    jest.runAllTimers();
    // wrapper.update();

    expect(document.querySelectorAll('.rc-dialog-wrap')).toHaveLength(1);
    expect(document.querySelectorAll('.renderToBody')).toHaveLength(1);
    expect(container.contains(container.querySelector('.rc-dialog-wrap'))).toBeFalsy();

    wrapper.unmount();
    document.body.removeChild(container);
  });

  it('getContainer', () => {
    const returnedContainer = document.createElement('div');
    const wrapper = render(() =>
      <Dialog visible getContainer={() => returnedContainer}>
        <p class="getContainer">Hello world!</p>
      </Dialog>,
    );

    expect(returnedContainer.contains(returnedContainer.querySelector('.rc-dialog-wrap'))).toBeTruthy();
    wrapper.unmount();
  });

  it('render title correctly', () => {
    const wrapper = render(() => <Dialog visible title="bamboo" />);
    expect(document.querySelector('.rc-dialog-header')).toHaveTextContent('bamboo');
  });

  it('render footer correctly', () => {
    const wrapper = render(() => <Dialog visible footer="test" />);
    expect(document.querySelector('.rc-dialog-footer')).toHaveTextContent('test');
  });

  it.skip('support input autoFocus', async () => {
    const wrapper = render(() =>
      <Dialog visible>
        <input autoFocus />
      </Dialog>
    );
    // (document.querySelector("input") as HTMLElement).focus();
    jest.runAllTimers();
    expect(document.activeElement).toBe(document.querySelector('input'));
  });

  describe('Tab should keep focus in dialog', () => {
    it('basic tabbing', () => {
      const wrapper = render(() => <Dialog visible />, { container: document.body });
      const sentinelEnd = document.querySelectorAll(
        '.rc-dialog-content + div',
      )[0] as unknown as HTMLDivElement;
      sentinelEnd.focus();

      fireEvent.keyDown(wrapper.container.querySelector('.rc-dialog-wrap'), {
        keyCode: KeyCode.TAB,
      });

      const sentinelStart = document.querySelectorAll('.rc-dialog > div')[0];
      expect(document.activeElement).toBe(sentinelStart);

      wrapper.unmount();
    });

    it('trap focus after shift-tabbing', () => {
      const wrapper = render(() => <Dialog visible />, { container: document.body });
      jest.runAllTimers();
      (document.querySelector('.rc-dialog').firstChild as HTMLElement).focus();
      fireEvent.keyDown(document.querySelector('.rc-dialog-wrap'), {
        charCode: KeyCode.TAB,
        which: KeyCode.TAB,
        keyCode: KeyCode.TAB,
        shiftKey: true,
      });
      jest.runAllTimers();
      const sentinelEnd = document.querySelectorAll('.rc-dialog-content + div')[0];
      expect(document.activeElement).toBe(sentinelEnd);

      wrapper.unmount();
    });
  });

  it.skip('sets transform-origin when property mousePosition is set', () => {
    const wrapper = render(() =>
      <Dialog style={{ width: '600px' }} mousePosition={{ x: 100, y: 100 }} visible>
        <p>the dialog</p>
      </Dialog>,
    );

    // Trigger position align

    // wrapper
    //   .find<any>('Content CSSMotion' as any)
    //   .props()
    //   .onAppearPrepare();


    // expect(
    //   (wrapper.container.querySelectorAll('.rc-dialog')[0].getDOMNode() as HTMLDivElement).style['transform-origin'],
    // ).toBeTruthy();
  });

  it('can get dom element before dialog first show when forceRender is set true ', () => {
    const wrapper = render(() =>
      <Dialog forceRender>
        <div>forceRender element</div>
      </Dialog>,
    );
    expect(document.querySelector('.rc-dialog-body > div')).toHaveTextContent('forceRender element');
  });

  describe('getContainer is false', () => {
    it('not set', () => {
      const { container } = render(() =>
        <Dialog visible>
          <div class="bamboo" />
        </Dialog>,
      );

      expect(container.querySelector('.bamboo')).toBeFalsy();
      expect(document.body.querySelector('.bamboo')).toBeTruthy();
    });

    it('set to false', () => {
      const { container } = render(() =>
        <Dialog visible getContainer={false}>
          <div class="bamboo" />
        </Dialog>,
      );

      expect(container.querySelector('.bamboo')).toBeTruthy();
    });
  });

  it('should not close if mouse down in dialog', () => {
    const onClose = jest.fn();
    const wrapper = render(() => <Dialog onClose={onClose} visible />);
    fireEvent.click(document.querySelector('.rc-dialog-body'))
    expect(onClose).not.toHaveBeenCalled();
  });

  it('zIndex', () => {
    const wrapper = render(() => <Dialog visible zIndex={903} />);
    expect(document.querySelector('.rc-dialog-wrap')).toHaveStyle({ 'z-index': 903 });
  });

  it('should show dialog when initialize dialog, given forceRender and visible is true', () => {
    const DialogWrapTest = (props) => {
      return <Dialog forceRender visible />;
    }

    const wrapper = render(() =>
      <DialogWrapTest>
        <div>Show dialog with forceRender and visible is true</div>
      </DialogWrapTest>,
    );
    jest.runAllTimers();
    // // wrapper.update();
    expect(document.querySelector('.rc-dialog-wrap')).not.toHaveStyle({ display: 'none' });
  });

  it('modalRender', () => {
    const modalRender = render(() =>
      <Dialog
        visible
        modalRender={(node) => {
          spread(node as HTMLElement, { style: { background: '#1890ff' } });
          return node;
        }
        }
      />,
    );
    expect(document.querySelector('.rc-dialog-content')).toHaveStyle({ background: '#1890ff' });
  });

  describe('size should work', () => {
    it('width', () => {
      const wrapper = render(() => <Dialog visible width={1128} />);
      expect(document.querySelector('.rc-dialog')).toHaveStyle({ width: '1128px' });
    });

    it('height', () => {
      const wrapper = render(() => <Dialog visible height={903} />);
      expect(document.querySelector('.rc-dialog')).toHaveStyle({ height: '903px' });
    });
  });

  describe('re-render', () => {
    function createWrapper(props_?: Partial<DialogProps>): [Result, () => number] {
      let renderTimes = 0;
      const RenderChecker = () => {
        renderTimes += 1;
        return null;
      };
      let setProps;
      const Demo = (demoProps?: any) => {
        const [props, setState] = createStore(props_);
        setProps = setState;

        return (
          <Dialog visible {...props} {...demoProps}>
            <RenderChecker />
          </Dialog>
        );
      };

      const wrapper = render(() => <Demo />);
      wrapper.setProps = setProps;
      return [wrapper, () => renderTimes];
    }

    it('should not re-render when visible changed', () => {
      const [wrapper, getRenderTimes] = createWrapper();
      expect(getRenderTimes()).toEqual(1);

      // Hidden should not trigger render
      wrapper.setProps({ visible: false });
      expect(getRenderTimes()).toEqual(1);
    });

    it.skip('should re-render when forceRender', () => {
      const [wrapper, getRenderTimes] = createWrapper({ forceRender: true });
      expect(getRenderTimes()).toEqual(1);

      // Hidden should not trigger render
      wrapper.setProps({ visible: false });
      expect(getRenderTimes()).toEqual(2);
    });
  });

  describe('afterClose', () => {
    it('should trigger afterClose when set visible to false', () => {
      const afterClose = jest.fn();
      const Dialog2 = wrapFC(Dialog);
      const wrapper = render(() => <Dialog2 afterClose={afterClose} visible />);
      jest.runAllTimers();

      // wrapper.setProps({ visible: false });
      Dialog2.setProps({ visible: false });
      jest.runAllTimers();

      expect(afterClose).toHaveBeenCalledTimes(1);
    });

    it('should not trigger afterClose when mount dialog of getContainer={false}', () => {
      const afterClose = jest.fn();
      const Dialog2 = wrapFC(Dialog);
      const wrapper = render(() => <Dialog2 afterClose={afterClose} getContainer={false} />);
      jest.runAllTimers();

      Dialog2.setProps({ visible: false });
      jest.runAllTimers();

      expect(afterClose).toHaveBeenCalledTimes(0);
    });

    it('should not trigger afterClose when mount dialog of forceRender={true}', () => {
      const afterClose = jest.fn();
      const Dialog2 = wrapFC(Dialog);
      const wrapper = render(() => <Dialog2 afterClose={afterClose} forceRender />);
      jest.runAllTimers();

      Dialog2.setProps({ visible: false });
      jest.runAllTimers();

      expect(afterClose).toHaveBeenCalledTimes(0);
    });
  });
});
