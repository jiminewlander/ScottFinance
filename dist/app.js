import {project,LIMITS,calculateAccount} from './math.js';
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const hero=project({monthly:500,years:35,annualReturn:7});
$('hero-total').textContent=money(hero.balance);
const heroPath=hero.points.map((p,i)=>`${i?'L':'M'}${5+p.year/35*535},${192-p.balance/hero.balance*177}`).join(' ');
$('hero-chart').innerHTML=`<defs><linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b7e871" stop-opacity=".3"/><stop offset="100%" stop-color="#b7e871" stop-opacity="0"/></linearGradient></defs>${[40,90,140,192].map(y=>`<path d="M5 ${y}H540" stroke="#ffffff12"/>`).join('')}<path d="${heroPath} L540 192 L5 192Z" fill="url(#hero-fill)"/><path d="${heroPath}" fill="none" stroke="#b7e871" stroke-width="3"/><circle cx="540" cy="15" r="5" fill="#b7e871"/>`;
function updateComparison(){
 const monthly=+$('start-monthly').value,annualReturn=+$('start-return').value,years=+$('start-years').value;
 $('start-monthly-out').value=money(monthly);$('start-return-out').value=`${annualReturn}%`;$('start-years-out').value=`${years} years`;
 const scenarios=[0,5,10].map(delay=>project({monthly,years,annualReturn,delay}));
 $('comparison').innerHTML=scenarios.map((s,i)=>`<div class="scenario"><span class="scenario-label">${['Start today','Wait 5 years','Wait 10 years'][i]}</span><strong>${money(s.balance)}</strong><div class="bar-track"><div class="bar" style="width:${scenarios[0].balance?s.balance/scenarios[0].balance*100:0}%"></div></div><p>${money(s.contributions)} contributed · ${years-i*5} years invested</p></div>`).join('');
 $('wait-cost').innerHTML=`Waiting 10 years means <strong>${money(scenarios[0].balance-scenarios[2].balance)} less</strong> at the finish, with these assumptions. ${annualReturn>0?'The years you give your money matter.':'Returns can be negative; saving consistently still adds to your balance.'}`;
}
['start-monthly','start-return','start-years'].forEach(id=>$(id).addEventListener('input',updateComparison));updateComparison();
let account='roth';
const savedMonthly={roth:500,'401k':500};
const inputIds=['calc-monthly','calc-years','calc-return','calc-salary','calc-match','calc-cap'];
function values(){return {account,monthly:Number($('calc-monthly').value),years:Number($('calc-years').value),annualReturn:Number($('calc-return').value),salary:Number($('calc-salary').value),matchRate:Number($('calc-match').value),matchCap:Number($('calc-cap').value)};}
function renderChart(result,years,real){
 const max=Math.max(1,...result.points.flatMap(p=>[p.balance,p.contributions+p.employer].map(v=>v/(real?Math.pow(1.025,p.year):1))));
 const chartWidth=Math.max(280,$('calc-chart').clientWidth);
 $('calc-chart').setAttribute('viewBox',`0 0 ${chartWidth} 280`);
 const left=60,right=chartWidth-12,top=15,bottom=244;
 const x=y=>left+y/years*(right-left),y=(value,year)=>bottom-(value/(real?Math.pow(1.025,year):1))/max*(bottom-top);
 const path=key=>result.points.map((p,i)=>`${i?'L':'M'}${x(p.year).toFixed(2)},${y(key(p),p.year).toFixed(2)}`).join(' ');
 let drawing=[0,.25,.5,.75,1].map(f=>`<path d="M${left} ${bottom-f*(bottom-top)}H${right}" stroke="#dce4dd" stroke-dasharray="3 5"/><text x="${left-10}" y="${bottom-f*(bottom-top)+4}" text-anchor="end" fill="#526369" font-family="sans-serif" font-size="12">${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(max*f)}</text>`).join('');
 const curve=path(p=>p.balance);
 drawing+=`<defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#157e71" stop-opacity=".18"/><stop offset="100%" stop-color="#157e71" stop-opacity=".015"/></linearGradient></defs><path d="${curve} L${right} ${bottom} L${left} ${bottom}Z" fill="url(#chart-fill)"/><path d="${curve}" fill="none" stroke="#157e71" stroke-width="3"/><path d="${path(p=>p.contributions)}" fill="none" stroke="#8fa9ad" stroke-width="2" stroke-dasharray="5 4"/>`;
 if(result.employer>0)drawing+=`<path d="${path(p=>p.contributions+p.employer)}" fill="none" stroke="#ba7a49" stroke-width="2" stroke-dasharray="3 3"/>`;
 const labels=[...new Set([0,Math.round(years/2),years])];
 drawing+=labels.map(v=>`<text x="${x(v)}" y="270" text-anchor="${v===0?'start':v===years?'end':'middle'}" font-size="12" font-family="sans-serif" fill="#526369">${v===0?'Today':`Year ${v}`}</text>`).join('');
 $('chart-drawing').innerHTML=drawing;
 $('chart-desc').textContent=`After ${years} years: ${money(result.balance/(real?Math.pow(1.025,years):1))} ${real?'in today’s buying power':'in future dollars'}. Nominal contributions: ${money(result.contributions)}, employer match: ${money(result.employer)}, investment growth or loss: ${money(result.growth)}.`;
}
function updateCalculator(){
 const v=values();
 const relevant=account==='roth'?inputIds.slice(0,3):inputIds;
 const invalid=relevant.find(id=>$(id).value===''||!Number.isFinite(Number($(id).value))||Number($(id).value)<Number($(id).min||0)||($(id).max&&Number($(id).value)>Number($(id).max)));
 relevant.forEach(id=>$(id).setAttribute('aria-invalid',String(id===invalid)));
 if(invalid){$('calc-warning').hidden=false;$('calc-warning').textContent='Enter a valid amount within the field’s allowed range. The last valid projection is shown until corrected.';return null;}
 savedMonthly[account]=v.monthly;
 const r=calculateAccount(v),real=$('real-dollars').checked,adjusted=r.balance/Math.pow(1.025,v.years);
 $('calc-years-out').value=`${v.years}`;$('calc-return-out').value=`${v.annualReturn}%`;
 $('annual-contribution').textContent=`${money(v.monthly*12)} / year entered · ${money(r.cap)} annual ceiling${account==='401k'&&r.cap<LIMITS.employee401k?' at this salary':''}`;
 $('result-heading').textContent=`Potential balance after ${v.years} ${v.years===1?'year':'years'}`;
 $('result-total').textContent=money(real?adjusted:r.balance);
 $('result-badge').textContent=account==='roth'?'ROTH IRA':'401(k)';
 $('result-tax-note').textContent=account==='roth'?'Tax-free only if Roth withdrawal requirements are met.':'Account value before any withdrawal taxes. Employer match included below.';
 $('result-contributed').textContent=money(r.contributions);$('result-match').textContent=money(r.employer);$('result-growth').textContent=money(r.growth);$('growth-label').textContent=r.growth<0?'Investment loss':'Investment growth';
 $('match-legend').hidden=r.employer===0;
 $('inflation-note').textContent=real?`At 2.5% annual inflation. Nominal balance: ${money(r.balance)}. The three totals above stay in nominal dollars.`:`Future dollars. At 2.5% annual inflation, this balance would buy about what ${money(adjusted)} buys today.`;
 const warnings=[];
 if(v.monthly>r.appliedMonthly+0.001) warnings.push(`Your input exceeds the modeled limit. This projection uses ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(r.appliedMonthly)} per month (${money(r.cap)} per year), not the full entered amount.`);
 if(account==='roth')warnings.push('Assumes full Roth eligibility, sufficient taxable compensation, and no contributions to other IRAs.');
 $('calc-warning').hidden=!warnings.length;$('calc-warning').textContent=warnings.join(' ');
 renderChart(r,v.years,real);
 return {account,years:v.years,annualReturn:v.annualReturn,monthlyUsed:r.appliedMonthly,nominalBalance:r.balance,contributions:r.contributions,employerMatch:r.employer,investmentGrowth:r.growth,displayBalance:real?adjusted:r.balance};
}
function setAccount(next,focus=false){
 account=next;$('calc-monthly').value=savedMonthly[next];$('match-fields').hidden=next==='roth';
 for(const type of ['roth','401k']){const tab=$(`tab-${type}`);tab.setAttribute('aria-selected',String(type===next));tab.tabIndex=type===next?0:-1;}
 $('calc-panel').setAttribute('aria-labelledby',`tab-${next}`);if(focus)$(`tab-${next}`).focus();updateCalculator();
}
for(const type of ['roth','401k']){
 $(`tab-${type}`).addEventListener('click',()=>setAccount(type));
 $(`tab-${type}`).addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();setAccount(e.key==='Home'?'roth':e.key==='End'?'401k':account==='roth'?'401k':'roth',true);}});
}
inputIds.forEach(id=>$(id).addEventListener('input',updateCalculator));$('real-dollars').addEventListener('change',updateCalculator);updateCalculator();
window.addEventListener('resize',updateCalculator);
if(document.modelContext?.registerTool){
 try{Promise.resolve(document.modelContext.registerTool({name:'configure_retirement_projection',title:'Configure retirement projection',description:'Update the visible Roth IRA or 401(k) illustration and return its projected balance. Does not save data or invest money.',inputSchema:{type:'object',properties:{account:{type:'string',enum:['roth','401k']},monthly:{type:'number',minimum:0,maximum:10000},years:{type:'integer',minimum:1,maximum:45},annualReturn:{type:'number',minimum:-5,maximum:12}},required:['account','monthly','years','annualReturn'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).some(k=>!['account','monthly','years','annualReturn'].includes(k))||!['roth','401k'].includes(input.account)||!Number.isFinite(input.monthly)||input.monthly<0||input.monthly>10000||!Number.isInteger(input.years)||input.years<1||input.years>45||!Number.isFinite(input.annualReturn)||input.annualReturn<-5||input.annualReturn>12)throw new Error('Invalid projection inputs');setAccount(input.account);$('calc-monthly').value=input.monthly;$('calc-years').value=input.years;$('calc-return').value=Math.round(input.annualReturn*2)/2;return updateCalculator();}})).catch(()=>{});}catch{}
}
