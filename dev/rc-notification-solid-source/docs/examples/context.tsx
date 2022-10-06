/* eslint-disable no-console */
import { createContext, createMemo, createSignal, useContext } from "solid-js"; import '../../assets/index.less';
import { useNotification } from '../../src';
import motion from './motion';
// import { createStore } from "solid-js/store";

const NOTICE = {
  content: <span>simple show</span>,
  onClose() {
    console.log('simple close');
  },
  // duration: null,
};

export const Context = createContext({ name: 'light' });

const Demo = () => {
  const [{ open, close }, holder] = useNotification({
    motion,
    closeIcon: <span class="test-icon">test-close-icon</span>,
    onAllRemoved() {
      console.log("all removed!")
    },
  });

  return (
    <Context.Provider value={{ "name": "kaboo" }}>
      <button onClick={() => open({ key: 'k1', content: "good" })}>k1</button>
      <button onClick={() => close('k1')}>close k1</button>
      <button
        type="button"
        onClick={() => {
          open({
            ...NOTICE,
            key: 'k' + 1,
            duration: 1000,
            closable: true,
            content: () => {
              const { name } = useContext(Context);
              return <>{name}</>
            },
            props: {
              'data-testid': 'my-data-testid',
            },
          });
        }}
      >
        simple show
      </button>
      {holder}
      {() => {
        let state = useContext(Context);
        return <> Context.name =  {state.name}</>;
      }}
    </Context.Provider>
  );
};

export default Demo;
