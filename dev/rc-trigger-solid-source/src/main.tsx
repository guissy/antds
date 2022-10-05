/* @refresh reload */
import { render } from 'solid-js/web';

import Simple from '../docs/examples/simple'
import Point from '../docs/examples/point'
import Nested from '../docs/examples/nested'
import Nested2 from '../docs/examples/click-nested'
import Case from '../docs/examples/case'


render(() => <main>
    <Case />
    <Nested2 />
<Point />
<Simple />
</main>, document.getElementById('root') as HTMLElement);
