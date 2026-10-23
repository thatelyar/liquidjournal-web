/* Isolated loader for the original public LiquidJournal UI. Original Next/server bootstrap is not executed. */
(function(G){
const factories=new Map(),cache={},overrides=new Map(),logs=[];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const record=id=>cache[id]||(cache[id]={id,exports:{}});
function define(out,items,unsealed){
 if(!own(out,'__esModule'))Object.defineProperty(out,'__esModule',{value:true});
 let i=0;while(i<items.length){let key=items[i++],tag=items[i++],desc;
 if(typeof tag==='number'){if(tag!==0)throw Error('Unsupported export tag '+tag);desc={value:items[i++],enumerable:true};}
 else {desc={get:tag,enumerable:true};if(typeof items[i]==='function')desc.set=items[i++];}
 if(!own(out,key))Object.defineProperty(out,key,desc);
 }if(!unsealed)Object.seal(out);
}
function namespace(mod){if(mod.namespaceObject)return mod.namespaceObject;let out=mod.exports;if(out&&out.__esModule)return mod.namespaceObject=out;let ns=typeof out==='function'?function(...args){return out.apply(this,args)}:Object.create(null);let names=new Set();for(let p=out;p&&(typeof p==='object'||typeof p==='function')&&p!==Object.prototype&&p!==Function.prototype;p=Object.getPrototypeOf(p))for(const key of Object.getOwnPropertyNames(p))names.add(key);for(const key of names)if(key!=='default'&&!own(ns,key))Object.defineProperty(ns,key,{enumerable:true,get:()=>out[key]});Object.defineProperty(ns,'default',{value:out,enumerable:true});return mod.namespaceObject=ns;}
const chunkLoads=new Map();
function loadLocalChunk(info){
 if(Array.isArray(info))return Promise.all(info.map(loadLocalChunk));
 let path=typeof info==='string'?info:info?.path||info?.url;
 if(!path)return Promise.reject(Error('Unsupported local chunk descriptor'));if(path.startsWith('/liquidjournal-web/'))path='/'+path.slice(19);
 path=path.replace(/^\/_next\//,'').replace(/^\//,'');
 if(!/^static\/immutable\/(chunks|media)\/[a-zA-Z0-9_.-]+\.(js|css)$/.test(path))return Promise.reject(Error('Only copied local UI chunks can load: '+path));
 const url='/liquidjournal-web/_next/'+path;if(chunkLoads.has(url))return chunkLoads.get(url);
 const p=new Promise((resolve,reject)=>{const el=document.createElement(path.endsWith('.css')?'link':'script');if(path.endsWith('.css')){el.rel='stylesheet';el.href=url}else el.src=url;el.onload=()=>resolve();el.onerror=()=>reject(Error('Missing local UI chunk '+url));document.head.append(el)});chunkLoads.set(url,p);return p;
}
function load(id,parent){if(overrides.has(id))return overrides.get(id);let m=cache[id];if(m){if(m.error)throw m.error;return m;}const factory=factories.get(id);if(!factory)throw Error('Missing factory '+id+' imported by '+parent);m=record(id);const initial=m.exports;
 const ctx={m,e:initial,c:cache,g:G,M:factories,
 i:id=>namespace(load(id,m.id)),r:id=>load(id,m.id).exports,
 s:(items,id,unsealed)=>{let target=id==null?m:record(id);target.namespaceObject=target.exports;define(target.exports,items,unsealed)},
 v:(value,id)=>{(id==null?m:record(id)).exports=value},n:(value,id)=>{let target=id==null?m:record(id);target.exports=target.namespaceObject=value},
 A:id=>{const loader=load(id,m.id).exports;return loader(k=>namespace(load(k,m.id)))},
 l:loadLocalChunk,
 L:loadLocalChunk,
 t:()=>{throw Error('External require disabled')},z:()=>{throw Error('Dynamic require disabled')},
 R:id=>{const out=load(id,m.id).exports;return out?.default??out},P:p=>'/ROOT/'+(p??''),F:p=>'file:///ROOT/'+(p??''),
 h:p=>'/liquidjournal-web/_next/'+p,b:'/liquidjournal-web/_next/',X:'',q:(p,id)=>{(id==null?m:record(id)).exports=p},
 j:(source,id)=>{const target=id==null?m:record(id);for(const key of Object.keys(source))if(key!=='default'&&!own(target.exports,key))Object.defineProperty(target.exports,key,{enumerable:true,get:()=>source[key]})},
 };
 try{factory(ctx,m,initial);logs.push({id,ok:true});}catch(error){m.error=error;logs.push({id,ok:false,error:String(error)});throw error;}return m;
}
function register(entry){if(!Array.isArray(entry))return;let i=1;while(i<entry.length){let ids=[];while(i<entry.length&&typeof entry[i]!=='function')ids.push(entry[i++]);if(i===entry.length)break;const fn=entry[i++];const existing=ids.map(id=>factories.get(id)).find(Boolean);for(const id of ids)if(!factories.has(id))factories.set(id,existing||fn)}}
G.TURBOPACK={push:register};G.OriginalUI={factories,cache,logs,require:id=>load(id,'harness').exports,import:id=>namespace(load(id,'harness')),override(id,value){overrides.set(id,{id,exports:value,namespaceObject:value})}};
})(globalThis);
