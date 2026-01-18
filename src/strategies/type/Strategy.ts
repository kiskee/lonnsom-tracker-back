export interface Strategy {
  id: string;
  user: string;
  date: string;
  update?: string;
  strategyName: string;
  entryType: string;
  exitType: string;
}

export interface CreateStrategyRequest {
  id?: string;
  user: string;
  date: string;
  update?: string;
  strategyName: string;
  entryType: string;
  exitType: string;
}

export interface UpdateStrategyRequest {
  strategyName?: string;
  entryType?: string;
  exitType?: string;
  update?: string;
}

export interface StrategyResponse {
  id: string;
  user: string;
  date: string;
  update?: string;
  strategyName: string;
  entryType: string;
  exitType: string;
}
