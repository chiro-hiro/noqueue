### .TillSuccess() Example

[[Utilities.TillSuccess]] could be used to guarantee your request or data reach target.

```ts
import { Utilities } from './src/index';

(async () => {
  let tried = 0;
  // Retries heavy task each 2 second, max retries are 5 times
  let result = await Utilities.TillSuccess(async () => {
    tried += 1;
    console.log(`Trying ${tried} time(s)`);
    return heavyTask('Yes');
  }, 2000, 5);

  console.log('Was it successful?', result);
})();
```

Result:

```
Trying 1 time(s)
Trying 2 time(s)
Was it successful? Yes
```

If we're fail all the times, an `Error` will be threw.