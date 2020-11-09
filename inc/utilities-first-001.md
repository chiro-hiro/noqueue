### .First() Guide

[[Utilities.First]] could be use for the same task to get the result as soon as possible.

```ts
import { Utilities } from './src/index';

(async () => {
  let result = await Utilities.First(
    async () => {
      return heavyTask('First');
    },
    async () => {
      return heavyTask('Second');
    },
    async () => {
      return heavyTask('Third');
    },
  );

  console.log('The fastest is:', result);
})();
```

Result:

```
The fastest is: Second
```

As you see, we have one winner here. If there are an `Error`, It's fine too that meant all tasks were failed.