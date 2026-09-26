export const LIMITS = Object.freeze({year:2026,employee401k:24500,ira:7500,total401k:72000});
export function project({monthly,years,annualReturn,match=0,delay=0}) {
  const rate=Math.pow(1+annualReturn/100,1/12)-1;
  let balance=0,contributions=0,employer=0;
  const points=[{year:0,balance:0,contributions:0,employer:0}];
  for(let month=1;month<=years*12;month++){
    const active=month>delay*12;
    balance=balance*(1+rate)+(active?monthly+match:0);
    if(active){contributions+=monthly;employer+=match;}
    if(month%12===0) points.push({year:month/12,balance,contributions,employer});
  }
  return {balance,contributions,employer,growth:balance-contributions-employer,points};
}
export function employerMatch(monthly,salary,matchRate,matchCap){return Math.min(monthly,salary*matchCap/100/12)*matchRate/100;}
export function calculateAccount({account,monthly,years,annualReturn,salary=60000,matchRate=0,matchCap=6}){
 const cap=account==='roth'?LIMITS.ira:Math.min(LIMITS.employee401k,salary);
 const appliedMonthly=Math.min(monthly,cap/12);
 const match=account==='roth'?0:Math.max(0,Math.min(employerMatch(appliedMonthly,salary,matchRate,matchCap),Math.min(LIMITS.total401k,salary)/12-appliedMonthly));
 return {...project({monthly:appliedMonthly,years,annualReturn,match}),appliedMonthly,match,cap};
}
