export interface UpdateStrategyRequest {
  strategyName?: string;
  entryType?: string;
  exitType?: string;
  update?: string;
}

export class UpdateStrategyDto {
  strategyName?: string;
  entryType?: string;
  exitType?: string;
  update: string;

  constructor(data: UpdateStrategyRequest) {
    if (data.strategyName) this.strategyName = data.strategyName;
    if (data.entryType) this.entryType = data.entryType;
    if (data.exitType) this.exitType = data.exitType;
    this.update = data.update || new Date().toISOString();
  }
}
