import { type ParentComponent, type JSX, children as Children } from "solid-js";
import { warning } from 'rc-util-solid/lib/warning';
import SingleObserver from './SingleObserver';
import { Collection } from './Collection';

// const INTERNAL_PREFIX_KEY = 'rc-observer-key';

export interface SizeInfo {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
}

export type OnResize = (size: SizeInfo, element: HTMLElement) => void;

export interface ResizeObserverProps {
  /** Pass to ResizeObserver.Collection with additional data */
  data?: any;
  children: JSX.Element;
  disabled?: boolean;
  /** Trigger if element resized. Will always trigger when first time render. */
  onResize?: OnResize;
}

const ResizeObserver: ParentComponent = (props: ResizeObserverProps) => {
  // const { children } = props;
  const childNodes = Children(() => props.children).toArray();

  if (process.env.NODE_ENV !== 'production') {
    if (childNodes.length > 1) {
      warning(
        false,
        'Find more than one child node with `children` in ResizeObserver. Please use ResizeObserver.Collection instead.',
      );
    } else if (childNodes.length === 0) {
      warning(false, '`children` of ResizeObserver is empty. Nothing is in observe.');
    }
  }

  return childNodes.map((child) => {
    // const key = child?.key || `${INTERNAL_PREFIX_KEY}-${index}`;
    return (
      <SingleObserver {...props}>
        {child}
      </SingleObserver>
    );
  }) as any as JSX.Element;
}

(ResizeObserver as unknown as { Collection: typeof Collection }).Collection = Collection;

export default ResizeObserver as Component & { Collection: typeof Collection };
