export class Stopwatch {
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  getEllapsedMilliseconds() {
    return new Date().getTime() - this.startTime.getTime();
  }
}
