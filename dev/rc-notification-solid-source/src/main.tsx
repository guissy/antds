/* @refresh reload */
import { render } from 'solid-js/web';
import MaxCount from '../docs/examples/maxCount';
import Hooks from '../docs/examples/hooks';
import Context from '../docs/examples/context';

render(() => <>
<Context />
<Hooks />
<MaxCount />
</>, document.getElementById('root') as HTMLElement);
