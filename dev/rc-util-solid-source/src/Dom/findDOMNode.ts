import { type JSX, children as Children} from "solid-js";

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
export default function findDOMNode<T = Element | Text>(
  node: JSX.Element | HTMLElement,
): T {
  if (node instanceof HTMLElement) {
    return (node as unknown) as T;
  }
  if (Array.isArray(node)) {
    return node[0] as unknown as T
  }
  const child = Children(() => node);
  return child() as T;
  // return (ReactDOM.findDOMNode(node) as unknown) as T;
}
