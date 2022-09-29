/* eslint-disable react/no-danger */

import { createEffect, createSignal } from "solid-js";
import getScrollBarSize, {
  getTargetScrollBarSize,
} from '../../src/getScrollBarSize';

export default () => {
  let divRef  = null as (HTMLDivElement | null);
  const [sizeData, setSizeData] = createSignal('');

  createEffect(() => {
    const originSize = getScrollBarSize();
    const targetSize = getTargetScrollBarSize(divRef);

    setSizeData(
      `Origin: ${originSize}, Target: ${targetSize.width}/${targetSize.height}`,
    );
  }, []);

  return (
    <div>
      <style>{`
            #customizeContainer::-webkit-scrollbar {
              width: 2em;
              height: 23px;
              background: blue;
            }

            #customizeContainer::-webkit-scrollbar-thumb {
              background: red;
              height: 30px;
            }
          `}
      </style>
      <div
        style={{ width: '100px', height: '100px', overflow: 'auto' }}
        id="customizeContainer"
        ref={divRef}
      >
        <div style={{ width: '100vw', height: '100vh', background: 'green' }}>
          Hello World!
        </div>
      </div>

      <div
        style={{
          width: '100px',
          height: '100px',
          overflow: 'scroll',
          background: 'yellow',
        }}
      />

      <pre>{sizeData}</pre>
    </div>
  );
};
