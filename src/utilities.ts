export const getOnceTimeEventName = (event: string): string => `___once_event___${event}`

export const toTimestamp = (hour: number = 0, min: number = 0, sec: number = 0): number => {
  return ((hour * 60 + min) * 60 + sec) * 1000
}

export enum TimeSchedule {
  everyDay = toTimestamp(24),
  everyHour = toTimestamp(1),
  everyMinute = toTimestamp(0, 1),
  everySecond = toTimestamp(0, 0, 1)
}

export interface Settings {
  delay: number
}

export interface Events {
  name: string,
  data: any[]
}