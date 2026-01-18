import { v4 as uuidv4 } from 'uuid';

export interface CreateStrategyRequest {
  id?: string;
  strategyName: string;
  entryType: string;
  exitType: string;
  user: string;
  date: string;
  update?: string;
}

export interface Strategy extends CreateStrategyRequest {
  id: string;
}

export class CreateStrategyDto implements Strategy {
  id: string;
  strategyName: string;
  entryType: string;
  exitType: string;
  user: string;
  date: string;
  update?: string;

  constructor(data: CreateStrategyRequest) {
    this.id = data.id || uuidv4();
    this.strategyName = data.strategyName;
    this.entryType = data.entryType;
    this.exitType = data.exitType;
    this.user = data.user;
    this.date = data.date;
    this.update = data.update;
  }
}
