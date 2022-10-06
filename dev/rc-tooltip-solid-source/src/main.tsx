/* @refresh reload */
import { render } from 'solid-js/web';
import Simple from '../docs/examples/simple';
import ShowArrow from '../docs/examples/showArrow';
import Placement from '../docs/examples/placement';
import FormError from '../docs/examples/formError';
import OnVisibleChange from '../docs/examples/onVisibleChange';
import ArrowContent from '../docs/examples/arrowContent';
import "solid-devtools"

render(() => <>
<Simple />
<ShowArrow />
<Placement />
<OnVisibleChange />
<FormError />
<ArrowContent />
</>, document.getElementById('root') as HTMLElement);
