/* eslint-disable react/no-render-return-value, max-classes-per-file, func-names, no-console */
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { render, fireEvent } from "solid-testing-library";
import { createStore } from 'solid-js/store';
import Dialog from '../src';
/**
 * Since overflow scroll test need a clear env which may affect by other test.
 * Use a clean env instead.
 */
 const cleanup = () => {
  const dom = document.querySelector("[data-rc-order]") as HTMLElement;
  dom?.parentElement?.removeChild(dom);
}
describe('Dialog.Scroll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanup()
  });

  it('Single Dialog body overflow set correctly', () => {
    cleanup()
    let setProps;
    const Demo = (props_?: any) => {
      const [props, setState] = createStore(props_);
      setProps = setState;

      return (<Dialog visible {...props} />);
    }
    render(() => <Demo />)
    // const { unmount, rerender } = render(() => <Dialog visible />);
    expect(document.body).toHaveStyle({
      overflowY: 'hidden',
    });

    setProps({visible: false});
    expect(document.body).not.toHaveStyle({
      overflowY: 'hidden',
    });

    // wrapper.unmount();
    // unmount();
  });

  it('Multiple Dialog body overflow set correctly', () => {
    let setProps;
    const Demo = props_ => {
      const [props, setState] = createStore(props_);
      setProps = setState;
      // { visible = false, visible2 = false, ...restProps }
      return <div>
        <Dialog {...props} visible={props.visible} />
        <Dialog {...props} visible={props.visible2} />
      </div>
    };

    const { unmount } = render(() => <Demo />);

    expect(document.querySelector('.rc-dialog')).toBeFalsy();

    // rerender(<Demo visible />);
    setProps({visible: true, visible2: false});
    expect(document.querySelectorAll('.rc-dialog')).toHaveLength(1);
    expect(document.body).toHaveStyle({
      overflowY: 'hidden',
    });

    // rerender(<Demo visible visible2 />);
    setProps({visible: true, visible2: true});
    expect(document.querySelectorAll('.rc-dialog')).toHaveLength(2);
    expect(document.body).toHaveStyle({
      overflowY: 'hidden',
    });

    // rerender(<Demo />);
    setProps({visible: false, visible2: false});
    expect(document.body).not.toHaveStyle({
      overflowY: 'hidden',
    });

    // rerender(<Demo visible />);
    setProps({visible: true, visible2: false});
    expect(document.body).toHaveStyle({
      overflowY: 'hidden',
    });

    // rerender(<Demo visible2 />);
    setProps({visible: false, visible2: true});
    expect(document.body).toHaveStyle({
      overflowY: 'hidden',
    });

    setProps({visible: false, visible2: false});
    // rerender(<Demo />);
    expect(document.body).not.toHaveStyle({
      overflowY: 'hidden',
    });

    unmount();
  });
});
