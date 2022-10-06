import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import Tooltip from '../../src';

import '../../assets/bootstrap.less';
import { createStore } from "solid-js/store";

const Test: Component = () => {
  const [state, setState] = createStore({
    visible: false,
    destroy: false,
  });

  const handleDestroy = () => {
    setState({
      destroy: true,
    });
  };

  const handleChange = e => {
    setState({
      visible: !e.target.value,
    });
  };


  if (state.destroy) {
    return null;
  }
  return (
    <div>
      <div style={{ 'margin-top': '100px', 'margin-left': '100px', 'margin-bottom': '100px' }}>
        <Tooltip
          visible={state.visible}
          animation="zoom"
          trigger={[]}
          overlayStyle={{ 'z-index': 1000 }}
          overlay={<span>required!</span>}
        >
          <input onChange={handleChange} />
        </Tooltip>
      </div>
      <button type="button" onClick={handleDestroy}>
        destroy
      </button>
    </div>
  );
}

export default Test;
