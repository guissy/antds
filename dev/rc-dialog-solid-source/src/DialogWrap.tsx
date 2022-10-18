import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, mergeProps, Show } from "solid-js";
import Portal from '@rc-component-solid/portal';
import Dialog from './Dialog';
import type { IDialogPropTypes } from './IDialogPropTypes';

// fix issue #10656
/*
 * getContainer remarks
 * Custom container should not be return, because in the Portal component, it will remove the
 * return container element here, if the custom container is the only child of it's component,
 * like issue #10656, It will has a conflict with removeChild method in react-dom.
 * So here should add a child (div element) to custom container.
 * */

const DialogWrap: Component<IDialogPropTypes> = (props_: IDialogPropTypes) => {
  const defaultProps = { destroyOnClose: false };
  // const { visible, getContainer, forceRender, destroyOnClose = false, afterClose } = ;
  const props = mergeProps(defaultProps, props_);
  const [animatedVisible, setAnimatedVisible] = createSignal<boolean>(props.visible);

  createEffect(() => {
    if (props.visible) {
      setAnimatedVisible(true);
    }
    // console.log(props.forceRender, !props.destroyOnClose, animatedVisible())
  }, [props.visible]);

  // // 渲染在当前 dom 里；
  // if (getContainer === false) {
  //   return (
  //     <Dialog
  //       {...props}
  //       getOpenCount={() => 2} // 不对 body 做任何操作。。
  //     />
  //   );
  // }

  // Destroy on close will remove wrapped div
  // if (!props.forceRender && props.destroyOnClose && !animatedVisible()) {
    // return null;
  // }

  return (
    <Show when={props.forceRender || !props.destroyOnClose || animatedVisible()}>
      <Portal
        open={props.visible || props.forceRender || animatedVisible()}
        autoDestroy={false}
        getContainer={props.getContainer}
        autoLock={props.visible || animatedVisible()}
      >
        <Dialog
          {...props}
          destroyOnClose={props.destroyOnClose}
          afterClose={() => {
            props.afterClose?.();
            setAnimatedVisible(false);
          }}
        />
      </Portal>
    </Show>
  );
};

; (DialogWrap as unknown as { displayName: string }).displayName = 'Dialog';

export default DialogWrap;
