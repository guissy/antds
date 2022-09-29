import { createEffect, createSignal } from "solid-js";
import { updateCSS, removeCSS } from '../../src/Dom/dynamicCSS';
import type { Prepend } from '../../src/Dom/dynamicCSS';

function injectStyle(id: number, prepend?: Prepend) {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  updateCSS(`body { background: #${randomColor} }`, `style-${id}`, {
    prepend,
  });
}

export default () => {
  const [id, setId] = createSignal(0);
  // Clean up
  createEffect(() => {
    return () => {
      for (let i = 0; i <= id(); i += 1) {
        removeCSS(`style-${i}`);
      }
    };
  }, []);

  return (
    <>
      <button
        onClick={() => {
          injectStyle(id(), 'queue');
          setId(id() + 1);
        }}
      >
        Prepend Queue: {id}
      </button>

      <button
        onClick={() => {
          injectStyle(-1);
        }}
      >
        Append
      </button>
    </>
  );
};
