export interface Risk {
  type: string;
  probability: number;
  explanation: string;
}

// Naive example of risk scoring; replace with ML model later
export function scoreFromMetrics(metrics: { sleepHours?: number, steps?: number, hydration?: number }): Risk[] {
  const risks: Risk[] = [];
  if(metrics.sleepHours !== undefined && metrics.sleepHours < 7){
    risks.push({ type: 'sleep_deficit', probability: 0.6, explanation: 'Avg sleep < 7h' });
  }
  if(metrics.steps !== undefined && metrics.steps < 8000){
    risks.push({ type: 'inactivity', probability: 0.5, explanation: 'Steps < 8k daily' });
  }
  if(metrics.hydration !== undefined && metrics.hydration < 1.5){
    risks.push({ type: 'hydration_low', probability: 0.4, explanation: 'Water intake < 1.5L' });
  }
  return risks;
}
