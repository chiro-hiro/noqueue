## Introduction

[[EventDispatcher]] is an alternative solution to `EventEmitter` that allowed you to delivery event and manage listeners easier. It's working on both Node.js and browser.

### Guide of EventDispatcher

You could use [[EventDispatcher]] to transmit event between object or from internal to outside world.

```ts
import { EventDispatcher } from 'noqueue';

// Create new instance of EventDispatcher
const iEventDispatcher = new EventDispatcher();

// Add new event listener
iEventDispatcher.on('new-message', (message: string) => {
  console.log('Received message:', message);
});

// Add one time event listener
iEventDispatcher.once('new-message', (message: string) => {
  console.log("We're only receive this one time:", message);
});

// Emit event to listener
iEventDispatcher.emit('new-message', "Hi! I'm EventDispatcher.");
iEventDispatcher.emit('new-message', 'You did it well');
```

Or extend your class:

```ts
export YourNewClass extends EventDispatcher {
  // Your code here, you're almost access all methods
  // of EventDispatch except the private one
}
```
