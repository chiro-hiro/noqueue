# [n]OT [o]NLY Queue

noQueue is the package that extended loop and queue. It allowed you to write better code and give you more control. Instead of mess up everything by using `setTimeout()` or `setInterval()`, we offered a single instance of an **Infinity Loop** and **Event Driven Pattern**. Let's give it a try !!.

## Installation

```
npm i noqueue
```

_Required: Node.JS >= 10.x.x_

**note**: This package was wrote in TypeScript and it support [ECMAScript Modules](https://nodejs.org/dist/latest-v14.x/docs/api/esm.html) that's why all examples are using `import`, `export` statement. If you are using [CommonJS Modules](https://nodejs.org/dist/latest-v14.x/docs/api/modules.html), try `require()` instead.

## Components

For more detail please check our document: [noQueue Document](https://chiro-hiro.github.io/noqueue/)

- **QueueLoop:** Infinity loop with builtin queue to manage and execute jobs by sequence
- **ParallelLoop:** Infinity loop with parallel trigger mechanism
- **Common:** Common interface and data type
- **Utilities:**
  - **First:** Invoke all jobs at once and take the result from the fastest response
  - **Fill:** Awaiting for all jobs to be fulfilled, all result and error will be listed in array
  - **TillSuccess:** Keep retries till the giving job is successful
  - **AwaitSleep:** Just do nothing and wait for a moment

## License

This package was licensed under [MIT License](https://github.com/chiro-hiro/noqueue/blob/develop/LICENSE)

_built with ❤️_
