/* @refresh reload */
import { render } from 'solid-js/web';

import CSSMotion from '../examples/CSSMotion'
import CSSMotionList from '../examples/CSSMotionList'
import TransitionInsideDebug from '../examples/TransitionInsideDebug'
// import CSSMotionDemo from '../examples/CSSMotionDeadline'


render(() => <>
<CSSMotion />
<CSSMotionList />
<TransitionInsideDebug />
</>, document.getElementById('root') as HTMLElement);
