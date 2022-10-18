/* eslint-disable react/no-render-return-value, max-classes-per-file, func-names, no-console */
// import Select from 'rc-select-solid';
import { render, fireEvent } from "solid-testing-library";
import Dialog from '../src';

/**
 * Since overflow scroll test need a clear env which may affect by other test.
 * Use a clean env instead.
 */
describe('Dialog.Portal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.skip('event should bubble', () => {
    const onClose = jest.fn();

    const wrapper = render(() => 
      <Dialog onClose={onClose} visible>
        {/* <Select virtual={false} open>
          <Select.Option value="bamboo">Bamboo</Select.Option>
        </Select> */}
      </Dialog>,
    );

    
      jest.runAllTimers();
    

    wrapper.container.querySelectorAll('.rc-dialog-content').simulate('mousedown');
    wrapper.container.querySelectorAll('.rc-select-item-option-content').simulate('click');
    wrapper.container.querySelectorAll('.rc-dialog-content').simulate('mouseup');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('dialog dont close when mouseDown in content and mouseUp in wrap', () => {
    const onClose = jest.fn();

    const wrapper = render(() => 
      <Dialog onClose={onClose} visible>
        content
      </Dialog>,
    );

    
      jest.runAllTimers();
    

      fireEvent.mouseDown(document.querySelector('.rc-dialog-content'));
      fireEvent.mouseUp(document.querySelector('.rc-dialog-wrap'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
