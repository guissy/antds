import { isStyleSupport } from '../../src/Dom/styleChecker';

export default () => {
  const supportFlex = isStyleSupport('flex');
  const supportSticky = isStyleSupport('position', 'sticky');
  const supportNotExistValue = isStyleSupport('position', 'sticky2');

  return (
    <ul>
      <li data-key="flex">supportFlex: {String(supportFlex)}</li>
      <li data-key="sticky">supportSticky: {String(supportSticky)}</li>
      <li data-key="not-exist">
        supportNotExistValue: {String(supportNotExistValue)}
      </li>
    </ul>
  );
};
