import { type JSX, children as Children } from "solid-js";

function mirror(o: HTMLElement) {
  return o;
}

export default function mapSelf(children: JSX.Element) {
  const resolved = Children(() => children).toArray() as HTMLElement[];
  return resolved.map(mirror);
}
