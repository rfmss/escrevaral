/* ES5. Leitor e relógio injetáveis; sem DOM, storage, rede ou acesso ao editor. */
'use strict';
var norm = require('./normalize');
var defaults = {maxBlockEncodedBytes:4096,maxBlockDecodedBytes:8192,maxRows:64,
  maxIndexDecodedBytes:1048576,maxCachePayloadBytes:65536,maxCacheEntries:16,
  maxRequests:8,maxConcurrentReads:4,maxBlocksPerRequest:32,maxCandidates:256,
  maxSnapshotUnits:4096,maxKeyUnits:128,maxPackages:8,maxSliceMs:4,
  maxRootDecodedBytes:8192,maxIndexPagesPerRequest:32,maxIndexDepth:8};
function clone(x) { return JSON.parse(JSON.stringify(x)); }
function integer(x) { return typeof x === 'number' && isFinite(x) && x >= 0 && Math.floor(x) === x; }
function safeId(x) { return typeof x === 'string' && /^[a-zA-Z0-9_.-]{1,80}$/.test(x); }
function splitPair(s,n) { return n>0 && n<s.length && /[\uD800-\uDBFF]/.test(s.charAt(n-1)) && /[\uDC00-\uDFFF]/.test(s.charAt(n)); }
exports.defaults = clone(defaults);
exports.create = function (options) {
  var limits=clone(defaults), manifests=Object.create(null), cache={}, lru=[], jobs={}, requests=[], disposed=false;
  var reads=0, resident=0, indexBytes=0, k;
  var schedule=options.schedule || function(fn) { return setTimeout(fn,0); };
  var unschedule=options.unschedule || function(id) { clearTimeout(id); };
  var now=options.now || function() { return Date.now(); };
  var stats={reads:0,indexReads:0,dataReads:0,bytesRead:0,indexBytesRead:0,dataBytesRead:0,cacheHits:0,sharedReads:0,staleDropped:0,canceled:0,peakCachePayloadBytes:0,decodeMs:0,searchMs:0,maxDecodeMs:0,maxSearchMs:0,sliceOverruns:0};
  if(typeof options.readBlock!=='function' || typeof options.isCurrent!=='function') throw Error('host-required');
  for(k in options.limits) if(Object.prototype.hasOwnProperty.call(options.limits,k)) {
    if(!Object.prototype.hasOwnProperty.call(limits,k) || !integer(options.limits[k]) || !options.limits[k]) throw Error('invalid-limit');
    limits[k]=options.limits[k];
  }
  if(!Array.isArray(options.manifests) || options.manifests.length>limits.maxPackages) throw Error('manifest-budget');
  function descriptors(list,parent) {
    var previous=null,seen=Object.create(null);
    list.forEach(function(d) {
      if(!d || !safeId(d.id) || seen[d.id] || typeof d.min!=='string' || typeof d.max!=='string' || d.min>d.max ||
        d.min.length>limits.maxKeyUnits || d.max.length>limits.maxKeyUnits || (previous && previous.max>d.min) ||
        !integer(d.rows) || d.rows<1 || d.rows>limits.maxRows || !integer(d.encodedBytes) || d.encodedBytes<1 || d.encodedBytes>limits.maxBlockEncodedBytes ||
        !integer(d.decodedBytes) || d.decodedBytes<1 || d.decodedBytes>limits.maxBlockDecodedBytes || !/^[a-f0-9]{64}$/.test(d.sha256)) throw Error('invalid-block-descriptor');
      if(parent || d.kind!==undefined) {
        if((d.kind!=='data'&&d.kind!=='index') || !integer(d.level) || d.level>limits.maxIndexDepth ||
          (d.kind==='data'?d.level!==0:d.level<1) || (parent && (d.level!==parent.level-1 || d.min<parent.min || d.max>parent.max))) throw Error('invalid-index-descriptor');
      }
      previous=d;seen[d.id]=true;
    });
    if(parent && (list[0].min!==parent.min || list[list.length-1].max!==parent.max)) throw Error('index-range-mismatch');
  }
  options.manifests.forEach(function(text) {
    var m;
    if(typeof text!=='string' || (indexBytes+=text.length*2)>limits.maxIndexDecodedBytes) throw Error('index-budget');
    m=JSON.parse(text);
    if(m.schema!=='scrvrl.lexical-package' || (m.schemaVersion!==1&&m.schemaVersion!==2) || !safeId(m.packageId) || !safeId(m.version) || m.normalization!==norm.id || !Array.isArray(m.dependencies) || !m.source || typeof m.coverage!=='string') throw Error('invalid-manifest');
    k=m.packageId+'@'+m.version;
    if(manifests[k]) throw Error('duplicate-package');
    if(m.schemaVersion===1) {if(!Array.isArray(m.index)) throw Error('invalid-manifest');descriptors(m.index,null);}
    else {
      if(text.length*2>limits.maxRootDecodedBytes || m.index!==undefined) throw Error('root-budget');
      if(m.root===null) {if(m.source.entries!==0) throw Error('invalid-empty-root');}
      else {descriptors([m.root],null);if(m.root.kind!=='index') throw Error('invalid-root');}
    }
    m.dependencies.forEach(function(dep){if(!safeId(dep.packageId)||!safeId(dep.version)) throw Error('invalid-dependency');});
    manifests[k]=m;
  });
  function evict() {
    while(lru.length>limits.maxCacheEntries || resident>limits.maxCachePayloadBytes) {
      var id=lru.shift(); resident-=cache[id].length*2; delete cache[id];
    }
    stats.peakCachePayloadBytes=Math.max(stats.peakCachePayloadBytes,resident);
  }
  function remember(id,text) {
    if(text.length*2>limits.maxCachePayloadBytes) return;
    if(cache[id]) {resident-=cache[id].length*2; lru.splice(lru.indexOf(id),1);}
    cache[id]=text; resident+=text.length*2; lru.push(id); evict();
  }
  function release(req) {
    if(req.ticket) {req.ticket.cancel();req.ticket=null;}
    if(req.timer!==null) {unschedule(req.timer);req.timer=null;}
    var i=requests.indexOf(req); if(i>=0) requests.splice(i,1);
  }
  function current(req) {
    if(req.dead || disposed) return false;
    // The host sees a copy; it cannot mutate the pinned request.
    if(!options.isCurrent(clone(req.identity))) {stats.staleDropped+=1;req.dead=true;release(req);return false;}
    return true;
  }
  function finish(req,status,reason) {
    if(!current(req)) return;
    var result={schema:'scrvrl.lexical-result',schemaVersion:1,identity:clone(req.identity),status:status,reason:reason||null,
      scope:clone(req.identity.scope),snippet:req.snippet,key:req.key,
      complete:status==='encontrado'||status==='ausente-no-pacote',
      coverage:req.coverage,candidates:status==='encontrado'?req.candidates:[]};
    req.dead=true; release(req);req.done(result);
  }
  function later(req,fn) {req.timer=schedule(function(){req.timer=null;if(current(req)) fn();});}
  function decode(text,d) {
    var started=now(), rows, prev=null;
    if(typeof text!=='string' || text.length*2!==d.decodedBytes || norm.utf8Bytes(text)!==d.encodedBytes) throw Error('length-mismatch');
    rows=JSON.parse(text);
    if(!Array.isArray(rows)||rows.length!==d.rows) throw Error('invalid-rows');
    if(d.kind==='index') descriptors(rows,d);
    else rows.forEach(function(row) {
      if(!row || ['key','form','lemma','pos','features','id'].some(function(f){return typeof row[f]!=='string';}) ||
        row.key!==norm.key(row.form) || row.key<d.min || row.key>d.max || (prev!==null && row.key<prev)) throw Error('invalid-row');
      prev=row.key;
    });
    if(d.kind!=='index' && (rows[0].key!==d.min || rows[rows.length-1].key!==d.max)) throw Error('range-mismatch');
    var elapsed=now()-started;stats.decodeMs+=elapsed;stats.maxDecodeMs=Math.max(stats.maxDecodeMs,elapsed);
    if(elapsed>limits.maxSliceMs) stats.sliceOverruns+=1;
    return rows;
  }
  function acquire(task,cb) {
    var id=task.m.packageId+'@'+task.m.version+'/'+task.d.id+'/'+task.d.sha256, job=jobs[id], sub={active:true,cb:cb};
    if(cache[id]) {
      stats.cacheHits+=1;
      var text=cache[id];lru.splice(lru.indexOf(id),1);lru.push(id);
      cb(null,text);return {cancel:function(){}};
    }
    if(job && job.abandoned) {cb({code:'read-draining'});return {cancel:function(){}};}
    if(job) {stats.sharedReads+=1;job.subs.push(sub);}
    else {
      if(reads>=limits.maxConcurrentReads) {cb({code:'read-budget'});return {cancel:function(){}};}
      job={subs:[sub],closed:false,abandoned:false,handle:null};jobs[id]=job;reads+=1;stats.reads+=1;
      stats[task.d.kind==='index'?'indexReads':'dataReads']+=1;
      function completed(error,payload) {
        if(job.closed) return;
        job.closed=true;delete jobs[id];reads-=1;
        if(job.abandoned) {job.subs=[];return;}
        var text=null;
        if(!error) {
          if(!payload || typeof payload.text!=='string' || payload.text.length*2>limits.maxBlockDecodedBytes ||
            payload.byteLength!==task.d.encodedBytes || payload.sha256!==task.d.sha256) error={code:'integrity'};
          else {
            text=payload.text; stats.bytesRead+=payload.byteLength;
            stats[task.d.kind==='index'?'indexBytesRead':'dataBytesRead']+=payload.byteLength;
            try { decode(text,task.d);remember(id,text); } catch(e) {error={code:e.message};}
          }
        }
        job.subs.forEach(function(s){if(s.active) {s.active=false;s.cb(error,text);}});
        job.subs=[];
      }
      try {job.handle=options.readBlock(task.m.packageId,task.m.version,task.d.id,completed,clone(task.d));} catch(e) {completed({code:'reader-threw'});}
    }
    return {cancel:function() {
      if(!sub.active) return;sub.active=false;
      if(!job.closed && !job.subs.some(function(s){return s.active;})) {
        // Cancel is a request, not proof that physical work has ended.
        job.abandoned=true;
        if(job.handle && typeof job.handle.cancel==='function') {try {job.handle.cancel();} catch(ignore) { /* Wait for physical completion. */ }}
        job.subs=[];
      }
    }};
  }
  function resolve(resources,key) {
    var versions=Object.create(null), visited={}, visiting={}, tasks=[], coverage=[];
    function visit(dep) {
      if(!safeId(dep.packageId)||!safeId(dep.version)) throw Error('invalid-resource');
      var id=dep.packageId+'@'+dep.version,m=manifests[id],list;
      if(versions[dep.packageId] && versions[dep.packageId]!==dep.version) throw Error('version-conflict');
      versions[dep.packageId]=dep.version;
      if(visiting[id]) throw Error('dependency-cycle');
      if(visited[id]) return;
      if(!m) throw Error('package-unavailable');
      visiting[id]=true;m.dependencies.forEach(visit);delete visiting[id];visited[id]=true;
      coverage.push({packageId:m.packageId,version:m.version,scope:m.coverage,source:clone(m.source)});
      list=m.schemaVersion===1?m.index:(m.root?[m.root]:[]);
      matching(list,key).forEach(function(d){tasks.push({m:m,d:d});});
      if(tasks.length>limits.maxBlocksPerRequest+limits.maxIndexPagesPerRequest) throw Error('block-budget');
    }
    resources.forEach(visit);return {tasks:tasks,coverage:coverage};
  }
  function matching(list,key) {
    var lo=0,hi=list.length,mid,out=[];
    while(lo<hi){mid=Math.floor((lo+hi)/2);if(list[mid].max<key) lo=mid+1;else hi=mid;}
    while(lo<list.length && list[lo].min<=key) {out.push(list[lo]);lo+=1;}
    return out;
  }
  function lookup(input,done) {
    if(disposed) throw Error('disposed');
    // Validate bounds before copying snapshots. Invalid requests fail synchronously.
    if(!input || typeof input.snapshot!=='string' || input.snapshot.length>limits.maxSnapshotUnits ||
      !integer(input.baseOffset) || !input.scope || !integer(input.scope.start)||!integer(input.scope.end) ||
      input.scope.start<input.baseOffset || input.scope.end>input.baseOffset+input.snapshot.length || input.scope.start>=input.scope.end ||
      input.scope.end-input.scope.start>limits.maxKeyUnits || !integer(input.textGeneration) || !integer(input.revision) ||
      !Array.isArray(input.resources) || !input.resources.length || input.resources.length>limits.maxPackages || typeof done!=='function') throw Error('invalid-request');
    ['requestId','documentId','recordId','engineId','engineVersion'].forEach(function(f){if(!safeId(input[f])) throw Error('invalid-identity');});
    var a=input.scope.start-input.baseOffset,b=input.scope.end-input.baseOffset;
    if(splitPair(input.snapshot,a)||splitPair(input.snapshot,b)) throw Error('split-surrogate');
    if(input.schemaVersion!==1 || !input.contextScope || input.contextScope.start!==input.baseOffset || input.contextScope.end!==input.baseOffset+input.snapshot.length) throw Error('invalid-context');
    if(requests.length>=limits.maxRequests) throw Error('request-budget');
    var identity={schemaVersion:1,requestId:input.requestId,documentId:input.documentId,recordId:input.recordId,revision:input.revision,
      textGeneration:input.textGeneration,scope:{start:input.scope.start,end:input.scope.end},contextScope:{start:input.contextScope.start,end:input.contextScope.end},
      engineId:input.engineId,engineVersion:input.engineVersion,resources:input.resources.map(function(r){return {packageId:r.packageId,version:r.version};})};
    var req={identity:identity,snippet:input.snapshot.slice(a,b),done:done,key:null,dead:false,timer:null,ticket:null,candidates:[],coverage:[]};
    req.key=norm.key(req.snippet);
    if(req.key.length>limits.maxKeyUnits) throw Error('key-budget');
    requests.push(req);
    later(req,function() {
      var plan;
      try {plan=resolve(identity.resources,req.key);req.coverage=plan.coverage;}
      catch(e){finish(req,e.message==='package-unavailable'?'indisponivel':'falha',e.message);return;}
      var pageCount=0,dataCount=0,seen=Object.create(null);
      function enqueue(list) {
        for(var i=0;i<list.length;i+=1) {
          var t=list[i],id=t.m.packageId+'@'+t.m.version+'/'+t.d.id;
          if(seen[id]) throw Error('duplicate-block');seen[id]=true;
          if(t.d.kind==='index') {pageCount+=1;if(pageCount>limits.maxIndexPagesPerRequest) throw Error('index-page-budget');}
          else {dataCount+=1;if(dataCount>limits.maxBlocksPerRequest) throw Error('block-budget');}
        }
        plan.tasks=list.concat(plan.tasks);
      }
      var initial=plan.tasks;plan.tasks=[];
      try {enqueue(initial);} catch(e){finish(req,'falha',e.message);return;}
      function next() {
        if(!plan.tasks.length){finish(req,req.candidates.length?'encontrado':'ausente-no-pacote');return;}
        var task=plan.tasks.shift();
        req.ticket=acquire(task,function(error,text) {
          // Always yield, including cache hits and synchronous readers.
          later(req,function() {
            if(error){finish(req,error.code==='missing'?'indisponivel':'falha',error.code||'read-failed');return;}
            var rows,started;
            try {rows=decode(text,task.d);} catch(e){finish(req,'falha',e.message);return;}
            started=now();
            if(task.d.kind==='index') {
              try {enqueue(matching(rows,req.key).map(function(d){return {m:task.m,d:d};}));}
              catch(e){finish(req,'falha',e.message);return;}
            }
            else for(var i=0;i<rows.length;i+=1) if(rows[i].key===req.key) {
              var row=clone(rows[i]);row.packageId=task.m.packageId;row.packageVersion=task.m.version;req.candidates.push(row);
              if(req.candidates.length>limits.maxCandidates){finish(req,'falha','candidate-budget');return;}
            }
            var elapsed=now()-started;stats.searchMs+=elapsed;stats.maxSearchMs=Math.max(stats.maxSearchMs,elapsed);
            if(elapsed>limits.maxSliceMs) stats.sliceOverruns+=1;
            later(req,next);
          });
        });
      }
      next();
    });
    return {cancel:function(){if(!req.dead){stats.canceled+=1;req.dead=true;release(req);}}};
  }
  return {lookup:lookup,dispose:function(){
    if(disposed) return;disposed=true;
    requests.slice().forEach(function(r){r.dead=true;release(r);});cache={};lru=[];resident=0;
  },stats:function(){var s=clone(stats);s.residentPayloadBytes=resident;s.indexStringBytes=indexBytes;s.activeRequests=requests.length;s.activeReads=reads;s.cacheEntries=lru.length;return s;}};
};
