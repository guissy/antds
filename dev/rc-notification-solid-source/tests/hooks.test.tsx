import { render, fireEvent, screen } from "solid-testing-library";
import { useNotification } from '../src';
import type { NotificationAPI, NotificationConfig } from '../src';
import { createContext, useContext } from "solid-js";

// require('../assets/index.less');

describe('Notification.Hooks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function renderDemo(config?: NotificationConfig) {
    let instance: NotificationAPI;

    const Demo = () => {
      const [api, holder] = useNotification(config);
      instance = api;

      return holder;
    };

    const renderResult = render(() => <Demo />);

    return { ...renderResult, instance };
  }

  it('works', async () => {
    const Context = createContext({ name: 'light' });

    const Demo = () => {
      const [api, holder] = useNotification();
      return (
        <Context.Provider value={{ name: 'bamboo' }}>
          <button
            type="button"
            onClick={() => {
              api.open({
                duration: 0.1,
                key: "light-bamboo",
                content: () => {
                  const {name} = useContext(Context);
                  console.log(name)
                  return <div class="context-content">{name}</div>
                },
              });
            }}
          />
          {holder}
        </Context.Provider>
      );
    };

    const { container: demoContainer, unmount } = render(() => <Demo />);
    fireEvent.click(demoContainer.querySelector('button'));

    expect(document.querySelector('.context-content').textContent).toEqual('bamboo');

    jest.runAllTimers();

    expect(document.querySelectorAll('.rc-notification-notice')).toHaveLength(0);

    unmount();
  });

  it('key replace', async () => {
    const Demo = () => {
      const [api, holder] = useNotification();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                key: 'little',
                duration: 1000,
                content: <div class="context-content">light</div>,
              });

              setTimeout(() => {
                api.open({
                  key: 'little',
                  duration: 1000,
                  content: <div class="context-content">bamboo</div>,
                });
              }, 500);
            }}
          />
          {holder}
        </>
      );
    };

    const { container: demoContainer, unmount } = render(() => <Demo />);
    fireEvent.click(demoContainer.querySelector('button'));
    expect(document.querySelector('.context-content').textContent).toEqual('light');
    jest.advanceTimersByTime(600);
    screen.debug();
    expect(document.querySelector('.context-content').textContent).toEqual('bamboo');

    unmount();
  });

  it('duration config', () => {
    const { instance } = renderDemo({
      duration: 0,
    });


    instance.open({
      content: <div class="bamboo" />,

    });

    expect(document.querySelector('.bamboo')).toBeTruthy();


    jest.runAllTimers();

    expect(document.querySelector('.bamboo')).toBeTruthy();

    // Can be override

    instance.open({
      content: <div class="little" />,
      duration: 1,

    });


    jest.runAllTimers();

    expect(document.querySelector('.little')).toBeFalsy();

    // Can be undefined

    instance.open({
      content: <div class="light" />,
      duration: undefined,

    });


    jest.runAllTimers();

    expect(document.querySelector('.light')).toBeTruthy();
  });
});
