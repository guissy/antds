export default function addEventListenerWrap(target, eventType, cb, option) {
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
