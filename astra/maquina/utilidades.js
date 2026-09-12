(function (root) {
  'use strict';
  var E = root.Escr;
  /* Calendário adaptado de main/cronograma-controller.js: mesmas datas,
     fases aproximadas e chave vrda-planner. Sem DOM ou dependências modernas. */
  E.calendarMonths = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  E.calendarKey = function (y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); };
  E.calendarMonth = function (y, m) {
    var date = new Date(y, m, 1), a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,n=Math.floor((a+11*h+22*l)/451);
    var easter = new Date(y,Math.floor((h+l-7*n+114)/31)-1,((h+l-7*n+114)%31)+1);
    /* A main misturava DD-MM e MM-DD nas datas fixas; aqui todas usam MM-DD. */
    var dates = {'01-01':'Confraternização Universal','04-21':'Tiradentes','05-01':'Dia do Trabalhador','09-07':'Independência do Brasil','10-12':'Nossa Senhora Aparecida','11-02':'Finados','11-15':'Proclamação da República','11-20':'Dia da Consciência Negra','12-25':'Natal'};
    [[-47,'Carnaval'],[-2,'Sexta-feira Santa'],[60,'Corpus Christi']].forEach(function (item) { var dt = new Date(easter.getTime()); dt.setDate(dt.getDate()+item[0]); dates[pad(dt.getMonth()+1)+'-'+pad(dt.getDate())] = item[1]; });
    var moons = [], synodic = 29.530588853, dayMs = 86400000, reference = Date.UTC(2000,0,6,18,14), start = Date.UTC(y,m,1,12), cycle = Math.floor((start-reference)/(synodic*dayMs))-1, j;
    for (j=cycle; j<cycle+4; j+=1) {
      ['Nova','Crescente','Cheia','Minguante'].forEach(function (name, phase) { var t = reference+(j+phase/4)*synodic*dayMs, dt = new Date(t); if (dt.getFullYear()===y && dt.getMonth()===m) { moons.push({day:dt.getDate(),name:name,time:t}); } });
    }
    moons.sort(function (x,z) { return x.time-z.time; });
    return { year:y, month:m, first:date.getDay(), days:new Date(y,m+1,0).getDate(), dates:dates, moons:moons };
  };
  E.validPlanner = function (data) {
    if (!data || typeof data !== 'object' || Object.prototype.toString.call(data) === '[object Array]') { return false; }
    return Object.keys(data).every(function (key) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(data[key])) { return false; }
      return data[key].every(function (item) { return item && (typeof item.id === 'number' || typeof item.id === 'string') && typeof item.text === 'string' && (item.type==='task' || item.type==='note') && typeof item.completed==='boolean'; });
    });
  };
  /* Analisador aritmético delimitado. Nunca executa a expressão como código. */
  E.calculate = function (input) {
    var s=String(input).replace(/\s/g,'').replace(/,/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'), p=0;
    if (!s || s.length>160 || /[^0-9.+*/()%\-]/.test(s)) { throw new Error('Confira a conta.'); }
    function atom() { var sign=1, value, match; if(s.charAt(p)==='+' || s.charAt(p)==='-'){ if(s.charAt(p++)==='-'){sign=-1;} } if(s.charAt(p)==='('){p+=1;value=sum();if(s.charAt(p++)!==')'){throw new Error('Feche os parênteses.');}}else{match=/^(?:\d+(?:\.\d*)?|\.\d+)/.exec(s.slice(p));if(!match){throw new Error('Confira a conta.');}p+=match[0].length;value=Number(match[0]);}if(s.charAt(p)==='%'){p+=1;value/=100;}return sign*value; }
    function product() {var value=atom(),op,right;while(s.charAt(p)==='*'||s.charAt(p)==='/'){op=s.charAt(p++);right=atom();if(op==='/'&&right===0){throw new Error('Não é possível dividir por zero.');}value=op==='*'?value*right:value/right;}return value;}
    function sum() {var value=product(),op;while(s.charAt(p)==='+'||s.charAt(p)==='-'){op=s.charAt(p++);value+= (op==='+'?1:-1)*product();}return value;}
    var result=sum(); if(p!==s.length || !isFinite(result)){throw new Error('Confira a conta.');} return Number(result.toPrecision(12));
  };
  E.pomodoroRemaining = function (state, now) { return Math.max(0, Math.ceil((state.paused ? state.remaining : state.target-now)/1000)); };
}(typeof window !== 'undefined' ? window : this));
