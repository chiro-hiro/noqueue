import { First, WaitSleep, TillSuccess, Fill, OneForAll } from './utilities';
import { EventDispatcher } from './event-dispatcher';
import { QueueLoop } from './queue-loop';
import { ParallelLoop } from './parallel-loop';
import { TimeDuration } from './time-duration';

export * from './common';

export { EventDispatcher, QueueLoop, ParallelLoop, TimeDuration };

export default { EventDispatcher, QueueLoop, ParallelLoop, TimeDuration };

export const Utilities = {
  First,
  WaitSleep,
  TillSuccess,
  Fill,
  OneForAll,
};
