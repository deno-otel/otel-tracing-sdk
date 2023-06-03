export class SpanLimits {
  constructor(
    private attributeCountLimit: number = 128,
    private linkCountLimit: number = 128,
    private eventCountLimit: number = 128
  ) {}

  getAttributeCountLimit() {
    return this.attributeCountLimit;
  }

  getEventCountLimit() {
    return this.eventCountLimit;
  }

  getLinkCountLimit() {
    return this.linkCountLimit;
  }
}
