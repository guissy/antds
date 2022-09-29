import { createEffect } from "solid-js";
import PortalWrapper from '../../src/PortalWrapper';

export default () => {
  let divRef: HTMLDivElement = null;
  let outerRef: HTMLDivElement = null;

  createEffect(() => {
    console.log('>>>', divRef);
  }, []);
  
  function getRef() {
    return outerRef;
  }

  return (
    <>
      <PortalWrapper visible getContainer={getRef}>
        {() => <div ref={divRef}>2333</div>}
      </PortalWrapper>
      <div style={{ background: 'red', height: '20px' }} ref={outerRef} />
    </>
  );
};
