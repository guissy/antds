import createChainedFunction from '../src/createChainedFunction';

describe('rc-util', () => {
  it('createChainedFunction works', () => {
    const ret = [];

    function f1() {
      ret.push(1);
    }

    function f2() {
      ret.push(2);
    }

    function f3() {
      ret.push(3);
    }

    createChainedFunction(f1, f2, f3, null)();
    expect(ret).toEqual([1, 2, 3]);
  });

});
