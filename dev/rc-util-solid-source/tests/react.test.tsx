import { render, unmount, _r, _u } from '../src/React/render';


describe('React', () => {
  afterEach(() => {
    Array.from(document.body.childNodes).forEach(node => {
      document.body.removeChild(node);
    });
  });

  it('render & unmount', async () => {
    const errorSpy = jest.spyOn(console, 'error');

    const div = document.createElement('div');
    document.body.appendChild(div);

    // Mount
    render(() => <div class="bamboo" />, div);
    expect(div.querySelector('.bamboo')).toBeTruthy();

    // Unmount
    unmount(div);
    expect(div.querySelector('.bamboo')).toBeFalsy();

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('React 17 render & unmount', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    // Mount
    _r(() => <div class="bamboo" />, div);
    expect(div.querySelector('.bamboo')).toBeTruthy();

    // Unmount
    _u(div);
    expect(div.querySelector('.bamboo')).toBeFalsy();
  });
});
