import { scoreFromMetrics } from '../riskScorer';

describe('Risk Scorer', ()=>{
  it('flags low sleep', ()=>{
    const risks = scoreFromMetrics({ sleepHours: 6 });
    expect(risks.find(r=>r.type==='sleep_deficit')).toBeTruthy();
  });
});
