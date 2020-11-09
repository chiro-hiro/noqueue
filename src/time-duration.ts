/**
 * [[include: time-duration-001.md]]
 * @export
 * @class TimeDuration
 */
export class TimeDuration {
  /**
   * Store hour of [[TimeDuration]]
   * @private
   * @type {number}
   * @memberof [[TimeDuration]]
   */
  private hour: number;

  /**
   * Store minute of [[TimeDuration]]
   * @private
   * @type {number}
   * @memberof [[TimeDuration]]
   */
  private minute: number;

  /**
   * Store second of [[TimeDuration]]
   * @private
   * @type {number}
   * @memberof [[TimeDuration]]
   */
  private second: number;

  /**
   * Store millisecond of [[TimeDuration]]
   * @private
   * @type {number}
   * @memberof [[TimeDuration]]
   */
  private millisecond: number;

  /**
   * Creates an instance of TimeDuration.
   * @param {number} h Hour
   * @param {number} m Minute
   * @param {number} s Second
   * @param {number} ms Millisecond
   * @memberof [[TimeDuration]]
   */
  constructor(h?: number, m?: number, s?: number, ms?: number) {
    this.hour = h || 0;
    this.minute = m || 0;
    this.second = s || 0;
    this.millisecond = ms || 0;
  }

  /**
   * Create new instance of [[TimeDuration]] from milliseconds
   * @static
   * @param {number} msec Duration in milliseconds
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public static fromMillisecond(msec: number): TimeDuration {
    const sec = Math.floor(msec / 1000);
    const ms = msec - sec * 1000;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec - h * 3600) / 60);
    const s = sec - (h * 3600 + m * 60);
    return new TimeDuration(h, m, s, ms);
  }

  /**
   * Create new instance of [[TimeDuration]] from seconds
   * @static
   * @param {number} sec Duration in seconds
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public static fromSecond(sec: number): TimeDuration {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec - h * 3600) / 60);
    const s = sec - (h * 3600 + m * 60);
    return new TimeDuration(h, m, s);
  }

  /**
   * Create new instance of [[TimeDuration]] from minutes
   * @static
   * @param {number} min Duration in minutes
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public static fromMinute(min: number): TimeDuration {
    const h = Math.floor(min / 60);
    const m = min - h * 60;
    return new TimeDuration(h, m);
  }

  /**
   * Create new instance of [[TimeDuration]] from hours
   * @static
   * @param {number} hour Durations in hours
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public static fromHour(hour: number): TimeDuration {
    return new TimeDuration(hour);
  }

  /**
   * Set hour of current instance
   * @param {number} h Hour
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public setHour(h: number): TimeDuration {
    this.hour = h;
    return this;
  }

  /**
   * Set minute of current instance
   * @param {number} m Minute
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public setMinute(m: number): TimeDuration {
    this.minute = m;
    return this;
  }

  /**
   * Set second of current instance
   * @param {number} s Second
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public setSecond(s: number): TimeDuration {
    this.second = s;
    return this;
  }

  /**
   * Set millisecond of current instance
   * @param {number} ms
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public setMillisecond(ms: number): TimeDuration {
    this.millisecond = ms;
    return this;
  }

  /**
   * Create new instance of [[TimeDuration]] that's sum of two given [[TimeDuration]]
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public add(t: TimeDuration): TimeDuration {
    return TimeDuration.fromMillisecond(t.toMillisecond() + this.toMillisecond());
  }

  /**
   * Create new instance of [[TimeDuration]] that's subtraction of two given [[TimeDuration]]
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public sub(t: TimeDuration): TimeDuration {
    const ms = this.toMillisecond() - t.toMillisecond();
    if (ms >= 0) {
      return TimeDuration.fromMillisecond(ms);
    }
    throw new Error('Duration can not be negative');
  }

  /**
   * Create new instance of [[TimeDuration]] that's different between two given [[TimeDuration]]
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {TimeDuration}
   * @memberof [[TimeDuration]]
   */
  public diff(t: TimeDuration): TimeDuration {
    const ms = this.toMillisecond() - t.toMillisecond();
    return TimeDuration.fromSecond(Math.abs(ms));
  }

  /**
   * Does two [[TimeDuration]] equal?
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {boolean}
   * @memberof [[TimeDuration]]
   */
  public eq(t: TimeDuration): boolean {
    return this.toMillisecond() === t.toMillisecond();
  }

  /**
   * Does current instance greater than given duration?
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {boolean}
   * @memberof [[TimeDuration]]
   */
  public gt(t: TimeDuration): boolean {
    return this.toMillisecond() > t.toMillisecond();
  }

  /**
   * Does current instance greater or equal to given duration?
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {boolean}
   * @memberof [[TimeDuration]]
   */
  public gte(t: TimeDuration): boolean {
    return this.toMillisecond() >= t.toMillisecond();
  }

  /**
   * Does current instance less than given duration?
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {boolean}
   * @memberof [[TimeDuration]]
   */
  public lt(t: TimeDuration): boolean {
    return this.toMillisecond() < t.toMillisecond();
  }

  /**
   * Does current instance less or equal to given duration?
   * @param {TimeDuration} t Another [[TimeDuration]] instance
   * @return {boolean}
   * @memberof [[TimeDuration]]
   */
  public lte(t: TimeDuration): boolean {
    return this.toMillisecond() <= t.toMillisecond();
  }

  /**
   * Get instance's duration in millisecond
   * @return {number}
   * @memberof [[TimeDuration]]
   */
  public toMillisecond(): number {
    return (this.hour * 3600 + this.minute * 60 + this.second) * 1000 + this.millisecond;
  }

  /**
   * Get instance's duration in second
   * @return {number}
   * @memberof [[TimeDuration]]
   */
  public toSecond(): number {
    return this.hour * 3600 + this.minute * 60 + this.second;
  }

  /**
   * Get instance's duration in string
   * @return {string}
   * @memberof [[TimeDuration]]
   */
  public toString(): string {
    const t = this.toMillisecond();
    const sec = Math.floor(t / 1000);
    const ms = t - sec * 1000;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec - h * 3600) / 60);
    const s = sec - (h * 3600 + m * 60);
    return `${h} ${h > 1 ? 'hours' : 'hour'} ${m} ${m > 1 ? 'minutes' : 'minute'} ${s} ${
      s > 1 ? 'seconds' : 'second'
    } ${ms} ${ms > 1 ? 'milliseconds' : 'millisecond'}`;
  }
}

export default TimeDuration;
