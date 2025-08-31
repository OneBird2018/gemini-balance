
export interface ApiKey {
  id: string;
  key: string;
  status: 'valid' | 'invalid';
  errorCode?: number;
  errorStatus?: string;
  failureCount: number;
}

export interface ChartDataPoint {
  time: string;
  success: number;
  failure: number;
}
