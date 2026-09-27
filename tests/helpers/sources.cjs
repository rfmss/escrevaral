'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
exports.scripts=()=>require('../../build/modules.json').sourceOrder.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
