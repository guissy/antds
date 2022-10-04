// addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
export default function addEventListenerWrap(target: EventTarget, eventType: string, cb: EventListenerOrEventListenerObject | null, option?: AddEventListenerOptions | boolean) {
  /* eslint camelcase: 2 */
  const callback = cb;
  if (target.addEventListener) {
    target.addEventListener(eventType, callback, option);
  }
  return {
    remove: () => {
      if (target.removeEventListener) {
        target.removeEventListener(eventType, callback, option);
      }
    },
  };
}
