import 'bootstrap/dist/css/bootstrap.css';
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import Draggable from 'react-draggable'; 
import Dialog from '../../src';
import '../../assets/index.less';

const MyControl = () => {
  const [visible, setVisible] = createSignal(false);
  const [disabled, setDisabled] = createSignal(true);
  const onClick = () => {
    setVisible(true);
  }

  const onClose = () => {
    setVisible(false);
  }

  return (
    <div style={{ margin: '20px' }}>
      <p>
        <button type="button" class="btn btn-primary" onClick={onClick}>show dialog</button>
      </p>
      <Dialog
        visible={visible()}
        animation="slide-fade"
        maskAnimation="fade"
        onClose={onClose}
        style={{ width: '600px' }}
        title={(
            <div
                style={{
                    width: '100%',
                    cursor: 'pointer',
                }}
                onMouseOver={() => {
                    if (disabled){
                        setDisabled(false)
                    }
                }}
                onMouseOut={() => {
                    setDisabled(true)
                }}
                // fix eslintjsx-a11y/mouse-events-have-key-events
                // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
                onFocus={ () => {} }
                onBlur={ () => {}} 
                // end 
            >modal</div>
        )}
        modalRender={modal => <Draggable disabled={disabled}>{modal}</Draggable>}
      >
          <div
            style={{
                height: '200px',
            }}
          >
              Day before yesterday I saw a rabbit, and yesterday a deer, and today, you.
          </div>
      </Dialog>
    </div>
  );
};

export default MyControl;
