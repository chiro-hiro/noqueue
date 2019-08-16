import { Queue } from './queue'
import { Settings } from './utilities'
import cluster from 'cluster'
import { clearTimeout } from 'timers'
import { EventEmitter } from 'events'

interface ProcessEvent {
  success: boolean,
  reason: string
}

export class ClusterService extends EventEmitter {
  private queue: Queue
  private clusterQueue: any = {}
  private functionQueue: any = {}
  constructor(conf?: Settings) {
    super()
    this.queue = new Queue(conf)
  }

  private _add(name: string, timeout: number) {
    //Fork cluster
    this.clusterQueue[name] = cluster.fork({
      clusterName: name,
      clusterTimeout: timeout
    })
    this.clusterQueue[name].exitedAfterDisconnect = true
    this.clusterQueue[name].on('message', (message: any) => {
      try {
        let msg = JSON.parse(message)
        this.emit(msg.success ? 'success' : 'error', msg.reason)
      } catch (error) {
        this.emit('error', error)
      }
    })
  }

  public add(name: string, callback: Function, timeout: number = 0): ClusterService {
    if (cluster.isMaster) {
      this.queue.add(name, async () => {
        //Trigger if worker is connected
        if (this.clusterQueue[name].isConnected()) {
          this.clusterQueue[name].send("{\"success\":true,\"reason\":\"trigger\"}")
        }
        //Respawn child process
        if (this.clusterQueue[name].isDead()) {
          this._add(name, timeout)
        }
      })
      this._add(name, timeout)
    } else {
      //Mapping 
      this.functionQueue[name] = callback
    }
    return this
  }

  public start() {
    if (cluster.isMaster) {
      this.queue.start()
    } else {
      let timeoutHandler: any = null
      let currentChildProcess = cluster.worker.process
      if (process.env.clusterName && process.env.clusterTimeout) {
        let name = process.env.clusterName
        let timeout = parseInt(process.env.clusterTimeout)
        //Disconnect that means dead
        currentChildProcess.on('disconnect', () => {
          process.exit(0xfe)
        })
        currentChildProcess.on('message', (message) => {
          let msg = JSON.parse(message)
          if (msg.success === true && msg.reason === 'trigger') {
            function emitEvent(event: ProcessEvent) {
              try {
                return currentChildProcess.send(JSON.stringify(event))
              } catch (e) {
                process.stderr.write(e.stack)
              }
            }
            //Auto committed suicide whenever timeout
            if (timeout > 0) {
              timeoutHandler = setTimeout(() => {
                let error = new Error('Child process timeout')
                emitEvent({
                  success: false,
                  reason: `[${name}] ${error.message} - ${error.stack}`
                })
                process.exit(0xff)
              }, timeout)
            }
            //Trigger method in the queue
            this.functionQueue[name]()
              .then((result: any) => {
                emitEvent({
                  success: true,
                  reason: name
                })
              })
              .catch((error: any) => {
                emitEvent({
                  success: false,
                  reason: `[${name}] ${error.message} - ${error.stack}`
                })
              })
              .finally(() => {
                //Clear timeout if it wasn't run out of time
                if (timeoutHandler !== null) {
                  clearTimeout(timeoutHandler)
                }
              })
          }
        })

      }
    }
  }
}
