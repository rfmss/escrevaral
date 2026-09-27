const {create}=require('..');
const text=process.argv.slice(2).join(' ')||'A menina leu a carta.';
console.log(JSON.stringify(create().analyze('sintaxe',text),null,2));
