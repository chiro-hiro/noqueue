import EventEmitter from 'events'

export class EventDispatcher extends EventEmitter {

  //Execute on success
  public then(callback: (...args: any[]) => void): EventDispatcher {
    return this.once('___then___', callback)
  }

  //Execute on error
  public catch(callback: (...args: any[]) => void): EventDispatcher {
    return this.once('___catch___', callback)
  }

  //Resolve
  public resolve(value: any): boolean {
    return this.emit('___then___', value)
  }

  //Reject
  public reject(error: Error): boolean {
    return this.emit('___catch___', error)
  }

}