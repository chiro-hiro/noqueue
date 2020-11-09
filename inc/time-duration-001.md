## Introduction

Convert and do math on [[TimeDuration]] type that helped people manage duration much more accurate.

### Guide of TimeDuration

#### Use constructor to given initial value

```ts
import { TimeDuration } from 'noqueue';

// TimeDuration will be initialed 1 hour 23 mins 2 seconds
const iTimeDuration = new TimeDuration(1, 23, 2);
```

You could use set methods to modify `iTimeDuration` from above.

```ts
// Overwrite initial value from above with 4 hours 121 minutes 150 seconds
iTimeDuration.setHour(4).setMinute(121).setSecond(150);

// Now try to print it in console
// The result must be: 6 hours 3 minutes 30 seconds 0 millisecond
console.log(iTimeDuration.toString());
```

Instead of [[TimeDuration.constructor]] like usual, you could try:

- [[TimeDuration.fromMillisecond]]
- [[TimeDuration.fromSecond]]
- [[TimeDuration.fromMinute]]
- [[TimeDuration.fromHour]]

#### Do math on TimeDuration

```ts
const iDurationA = new TimeDuration(4, 52, 21, 312);

const iDurationB = TimeDuration.fromMillisecond(13242532);

const iDurationSum = iDurationA.add(iDurationB);

console.log('Before A:', iDurationA.toString());
console.log('Before B:', iDurationB.toString());

console.log('After A:', iDurationA.toString());
console.log('After B:', iDurationB.toString());

console.log('Result A+B:', iDurationSum.toString());
```

Result:

```
Before A: 4 hours 52 minutes 21 seconds 312 milliseconds
Before B: 3 hours 40 minutes 42 seconds 532 milliseconds
After A: 4 hours 52 minutes 21 seconds 312 milliseconds
After B: 3 hours 40 minutes 42 seconds 532 milliseconds
Result A+B: 8 hours 33 minutes 3 seconds 844 milliseconds
```

As you see, A and B weren't change after calculation.

We could shorten these code, in case you don't want to reuse `iDurationB`:

```ts
const iDurationA = new TimeDuration(4, 52, 21, 312);
const iDurationSum = .add(TimeDuration.fromMillisecond(13242532));
console.log('Result A+B:', iDurationSum.toString());
```
