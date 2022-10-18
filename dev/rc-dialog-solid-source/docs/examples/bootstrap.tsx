import 'bootstrap/dist/css/bootstrap.css';
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Dialog from '../../src';
import '../../assets/bootstrap.less';

// Check for memo update should work
const InnerRender = () => {
  console.log('Updated...', Date.now());
  return null;
};

const MyControl = () => {
  const [visible, setVisible] = createSignal(false);
  const [destroyOnClose, setDestroyOnClose] = createSignal(false);

  const onClick = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onDestroyOnCloseChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    setDestroyOnClose(e.target.checked);
  };

  const dialog = () => (
    <Dialog
      visible={visible()}
      destroyOnClose={destroyOnClose()}
      animation="slide-fade"
      maskAnimation="fade"
      onClose={onClose}
      style={{ width: '600px' }}
      title={<div>第二个弹框</div>}
      footer={[
        <button type="button" class="btn btn-default" key="close" onClick={onClose}>
          Close
        </button>,
        <button type="button" class="btn btn-primary" key="save" onClick={onClose}>
          Save changes
        </button>,
      ]}
    >
      <InnerRender />
      <h4>Text in a modal</h4>
      <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
      <hr />
      <h4>Overflowing text to show scroll behavior</h4>
      <p>
        Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in,
        egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
      </p>
      <p>
        <button type="button" class="btn btn-primary">
          Primary
        </button>{' '}
        <button type="button" class="btn btn-secondary">
          Secondary
        </button>{' '}
        <button type="button" class="btn btn-success">
          Success
        </button>{' '}
        <button type="button" class="btn btn-danger">
          Danger
        </button>{' '}
        <button type="button" class="btn btn-warning">
          Warning
        </button>{' '}
        <button type="button" class="btn btn-info">
          Info
        </button>{' '}
      </p>
      <p>
        Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus
        vel augue laoreet rutrum faucibus dolor auctor.
      </p>
      <div style={{ display: '' }}>
        <p>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
          scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
          auctor fringilla.
        </p>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
          in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </p>
        <p>
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus
          vel augue laoreet rutrum faucibus dolor auctor.
        </p>
        <p>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
          scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
          auctor fringilla.
        </p>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
          in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </p>
        <p>
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus
          vel augue laoreet rutrum faucibus dolor auctor.
        </p>
        <p>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
          scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
          auctor fringilla.
        </p>
      </div>
    </Dialog>
  );

  return (
    <div style={{ margin: '20px' }}>
      <p>
        <button type="button" class="btn btn-primary" onClick={onClick}>
          show dialog
        </button>
        &nbsp;
        <label>
          destroy on close:
          <input type="checkbox" checked={destroyOnClose()} onChange={onDestroyOnCloseChange} />
        </label>
      </p>
      {dialog}
    </div>
  );
};

export default MyControl;
