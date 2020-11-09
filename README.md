# [n]OT-[o]NLY-Queue

noQueue is the package that extended loop and queue. It allowed you to write better code and more control to program's flow. Instead of mess up everything with `setTimeout()` or `setInterval()`, It's time for you to try better approach.

## Installation

```
install i noqueue
```

_Required: Node.JS >= 10.x.x_

**note**: This package write in TypeScript, It's use `import`, `export` statement. If you are using this package in tranditional way, try `require()` instead.

## Components

For more detail please access our document: [noQueue Document](https://chiro-hiro.github.io/noqueue/)

- QueueLoop: Infinity loop with builtin queue for jobs
- ParallelLoop: Infinity loop with parallel trigger mechanism
- Common: Common interface and data type
- Utilities
  - First: Invoke all jobs at once and take result of fastest response
  - Fill: Awaiting for all jobs to be fulfilled
  - TillSuccess: Keep retries till job success
  - AwaitSleep: Just do nothing and wait for a moment

## License

This package was liscensed under [MIT License](https://github.com/chiro-hiro/noqueue/blob/develop/LICENSE)
