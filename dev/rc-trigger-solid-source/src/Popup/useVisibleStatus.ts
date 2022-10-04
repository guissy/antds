import { type Setter, createEffect, onCleanup, Accessor } from "solid-js";
import raf from 'rc-util-solid/lib/raf';
import createSignal from 'rc-util-solid/lib/hooks/useState';

/**
 * Popup should follow the steps for each component work correctly:
 * measure - check for the current stretch size
 * align - let component align the position
 * aligned - re-align again in case additional className changed the size
 * afterAlign - choice next step is trigger motion or finished
 * beforeMotion - should reset motion to invisible so that CSSMotion can do normal motion
 * motion - play the motion
 * stable - everything is done
 */
type PopupStatus =
  | null
  | 'measure'
  | 'alignPre'
  | 'align'
  | 'aligned'
  | 'motion'
  | 'stable';

type Func = () => void;

const StatusQueue: PopupStatus[] = [
  'measure',
  'alignPre',
  'align',
  null,
  'motion',
];

export default (
  visible: boolean,
  doMeasure: Func,
): [Accessor<PopupStatus>, (callback?: () => void) => void] => {
  const [status, setInternalStatus] = createSignal<PopupStatus>(null);
  let rafRef  = null as (number | null);

  function setStatus(
    nextStatus: Parameters<Setter<PopupStatus>>[0],
  ) {
    console.log("ο▬▬▬▬▬▬▬▬◙▅▅▆▆▇▇◤", typeof nextStatus === 'string' ? nextStatus : nextStatus())
    setInternalStatus(nextStatus, true);
  }

  function cancelRaf() {
    raf.cancel(rafRef);
  }

  function goNextStatus(callback?: () => void) {
    cancelRaf();
    rafRef = raf(() => {
      // Only align should be manually trigger
      setStatus((prev) => {
        switch (status()) {
          case 'align':
            return 'motion';
          case 'motion':
            return 'stable';
          default:
        }

        return prev;
      });

      callback?.();
    });
  }

  // Init status
  createEffect(() => {
    setStatus('measure');
  }, [visible]);

  // Go next status
  createEffect(() => {
    switch (status()) {
      case 'measure':
        doMeasure();
        break;
      default:
    }

    if (status) {
      rafRef = raf(async () => {
        const index = StatusQueue.indexOf(status());
        const nextStatus = StatusQueue[index + 1];
        if (nextStatus && index !== -1) {
          setStatus(nextStatus);
        }
      });
    }
  }, [status]);

  onCleanup(() => {
      cancelRaf();
  });

  return [status, goNextStatus];
};
