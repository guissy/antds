/* eslint-disable no-eval */
import { Component, createEffect, createSignal, Index } from "solid-js";
import { render, screen } from "solid-testing-library";
import { composeRef, supportRef, useComposeRef, Ref } from '../src/ref';

describe('ref', () => {
  describe('composeRef', () => {
    it('basic', () => {
      const refFunc1 = jest.fn();
      const refFunc2 = jest.fn();

      const mergedRef = composeRef(refFunc1, refFunc2);
      const testRefObj = {};
      mergedRef(testRefObj);
      expect(refFunc1).toHaveBeenCalledWith(testRefObj);
      expect(refFunc2).toHaveBeenCalledWith(testRefObj);
    });

    it('ignore empty', () => {
      let ref = { current: null };
      expect(composeRef(undefined, ref, null)).toBe(ref);
      expect(composeRef(undefined, null)).toBeFalsy();
    });

    it('useComposeRef', () => {
      const Demo: Component<{ ref1: Ref<HTMLDivElement>, ref2: Ref<HTMLDivElement> }> = (props) => {
        const mergedRef = useComposeRef(props.ref1, props.ref2);
        return <div ref={mergedRef} />;
      };
      let r1 = {current: 1}
      let r2 = {current: 1}
      let ref1 = (ref) => { r1.current = ref };
      let ref2 = (ref) => { r2.current = ref };
      render(() => <Demo ref1={ref1} ref2={ref2} />);
      expect(r1.current).toBeTruthy();
      expect(r1.current).toBe(r2.current);
    });
  });

  describe('supportRef', () => {
    const Holder = (props) => <div ref={props.ref}>{props.children}</div>;

    it('function component', () => {
      let holderRef = null;

      function FC1(props) {
        return <div ref={props.ref}/>;
      }
      function FC2(props) {
        return <div />;
      }

      render(() => 
        <Holder ref={holderRef}>
          <FC1 />
          <FC2 />
        </Holder>,
      );
      
      expect(supportRef(FC1)).toBeTruthy();
      expect(supportRef(FC2)).toBeFalsy();
      expect(holderRef).toBeTruthy();
    });

    it('arrow function component', () => {
      let holderRef = null;

      // Use eval since jest will convert arrow function to function
      const FC = eval('() => null');
      render(() => 
        <Holder ref={holderRef}>
          <FC />
        </Holder>,
      );
      expect(supportRef(FC)).toBeFalsy();
      expect(supportRef(holderRef)).toBeFalsy();
    });

    it.skip('forwardRef function component', () => {
      let holderRef = null;;

      // const FRC = forwardRef(() => <div />);
      const FRC = (() => <div />);
      render(() => 
        <Holder ref={holderRef}>
          <FRC />
        </Holder>,
      );
      expect(supportRef(FRC)).toBeTruthy();
      expect(supportRef(holderRef.current.props.children)).toBeTruthy();
    });

    it.skip('class component', () => {
      let holderRef = null;;

      class CC {
        state = {};

        render() {
          return null;
        }
      }
      render(() =>
        <Holder ref={holderRef}>
          <CC />
        </Holder>,
      );
      expect(supportRef(CC)).toBeTruthy();
      expect(supportRef(holderRef.current.props.children)).toBeTruthy();
    });

    it.skip('memo of function component', () => {
      let holderRef = null;;

      const FC = () => <div />;
      const MemoFC = (FC);
      // const MemoFC = memo(FC);
      render(() =>
        <Holder ref={holderRef}>
          <MemoFC />
        </Holder>,
      );
      expect(supportRef(MemoFC)).toBeFalsy();
      // expect(supportRef(holderRef.current.props.children)).toBeFalsy();
    });

    it.skip('memo of forwardRef function component', () => {
      let holderRef = null;;

      // const FRC = forwardRef(() => <div />);
      // const MemoFC = memo(FRC);
      const FC = () => <div />;
      const MemoFC = (FC);
      render(() =>
        <Holder ref={holderRef}>
          <MemoFC />
        </Holder>,
      );
      expect(supportRef(MemoFC)).toBeTruthy();
      expect(supportRef(holderRef.current.props.children)).toBeTruthy();
    });
  });
});
