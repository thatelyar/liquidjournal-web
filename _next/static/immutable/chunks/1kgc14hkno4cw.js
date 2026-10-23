;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="3d011fc6-7244-8aab-d32c-9d29ea2441c6")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,895420,e=>{"use strict";var t=e.i(344230),a=e.i(947414),r=e.i(287022),n=e.i(674008),s=e.i(887652);function o(e,t){let a=(0,s.useMotionValue)(t()),o=()=>a.set(t());return o(),(0,n.useIsomorphicLayoutEffect)(()=>{let t=()=>r.frame.preRender(o,!1,!0),a=e.map(e=>e.on("change",t));return()=>{a.forEach(e=>e()),(0,r.cancelFrame)(o)}}),a}var i=e.i(486427);function l(e,t){let r=(0,a.useConstant)(()=>[]);return o(e,()=>{r.length=0;let a=e.length;for(let t=0;t<a;t++)r[t]=e[t].get();return t(r)})}e.s(["useTransform",0,function e(r,n,s,c){if("function"==typeof r){let e;return i.collectMotionValues.current=[],r(),e=o(i.collectMotionValues.current,r),i.collectMotionValues.current=void 0,e}if(void 0!==s&&!Array.isArray(s)&&"function"!=typeof n){var u=r,d=n,h=s,f=c;let t=(0,a.useConstant)(()=>Object.keys(h)),o=(0,a.useConstant)(()=>({}));for(let a of t)o[a]=e(u,d,h[a],f);return o}let m="function"==typeof n?n:function(...e){let a=!Array.isArray(e[0]),r=a?0:-1,n=e[0+r],s=e[1+r],o=e[2+r],i=e[3+r],l=(0,t.interpolate)(s,o,i);return a?l(n):l}(n,s,c),p=Array.isArray(r)?l(r,m):l([r],([e])=>m(e)),g=Array.isArray(r)?void 0:r.accelerate;return g&&!g.isTransformed&&"function"!=typeof n&&Array.isArray(s)&&c?.clamp!==!1&&(p.accelerate={...g,times:n,keyframes:s,isTransformed:!0,...c?.ease?{ease:c.ease}:{}}),p}],895420)},477132,e=>{"use strict";let t=(0,e.i(456420).default)("at-sign",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8",key:"7n84p3"}]]);e.s(["AtSign",0,t],477132)},328523,e=>{"use strict";let t=(0,e.i(456420).default)("pause",[["rect",{x:"14",y:"3",width:"5",height:"18",rx:"1",key:"kaeet6"}],["rect",{x:"5",y:"3",width:"5",height:"18",rx:"1",key:"1wsw3u"}]]);e.s(["Pause",0,t],328523)},788367,967429,e=>{"use strict";var t=e.i(843476),a=e.i(668109),r=e.i(615227),n=e.i(82217),s=e.i(753291),o=e.i(696067);e.s(["PublicPostCard",0,function({post:e,now:i,className:l=""}){let c,u,d=(0,s.useT)(),h=e.author,f=e.media.find(e=>"image"===e.kind&&e.url),m=h.handle.slice(0,2).toUpperCase(),p=[{n:e.counts.likes,icon:(0,t.jsx)(a.Heart,{size:13}),label:d("likes")},{n:e.counts.replies,icon:(0,t.jsx)(r.MessageCircle,{size:13}),label:d("replies")},{n:e.counts.reposts,icon:(0,t.jsx)(n.Repeat2,{size:13}),label:d("reposts")}].filter(e=>e.n>0);return(0,t.jsxs)("a",{href:o.publicHref.post(e.id),className:`group flex flex-col gap-2.5 rounded-[18px] p-4 text-left text-foreground ${l}`,"data-public-post":!0,children:[(0,t.jsxs)("span",{className:"flex min-w-0 items-center gap-2.5",children:[(0,t.jsx)("span",{className:"flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-raised)] text-[12px] font-bold text-muted-foreground",children:h.avatar?(0,t.jsx)("img",{src:h.avatar,alt:"",className:"h-full w-full object-cover",loading:"lazy"}):m}),(0,t.jsxs)("span",{className:"min-w-0 flex-1 leading-tight",children:[(0,t.jsxs)("span",{className:"flex min-w-0 items-center gap-1.5",children:[(0,t.jsx)("b",{className:`truncate text-[14px] font-bold ${"ultra"===(c=h.plan)?"name-apex-flat":"pro"===c?"name-gold-flat":""}`,children:h.name||h.handle}),h.crew&&(0,t.jsx)("span",{className:"shrink-0 rounded-[6px] px-1.5 py-px text-[10.5px] font-black tracking-[0.06em] text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]",children:h.crew})]}),(0,t.jsxs)("span",{className:"block truncate text-[12.5px] text-muted-foreground",children:["@",h.handle," · ",(u=Math.max(0,Math.round((i-Date.parse(e.createdAt))/6e4)))<60?`${Math.max(1,u)}m`:u<1440?`${Math.round(u/60)}h`:`${Math.round(u/1440)}d`]})]})]}),(e.title||e.text)&&(0,t.jsxs)("p",{className:"line-clamp-4 whitespace-pre-line text-[14px] leading-snug [overflow-wrap:anywhere]",children:[e.title?`${e.title}
`:"",e.text]}),f&&(0,t.jsx)("img",{src:f.url,alt:"",loading:"lazy",className:"max-h-[220px] w-full rounded-[12px] object-cover"}),p.length>0&&(0,t.jsx)("span",{className:"flex gap-4 text-[12.5px] tabular-nums text-muted-foreground",children:p.map(e=>(0,t.jsxs)("span",{className:"inline-flex items-center gap-1","aria-label":`${e.n} ${e.label}`,children:[e.icon,e.n]},e.label))})]})}],788367);var i=e.i(271645);e.s(["useRecentPosts",0,function(e=!0){let[t,a]=(0,i.useState)({posts:[],open:!1,loading:e,at:null});return(0,i.useEffect)(()=>{if(!e)return;let t=new AbortController;return fetch("/api/public/cm/recent",{signal:t.signal}).then(e=>e.ok?e.json():null).then(e=>{a({posts:Array.isArray(e?.posts)?e.posts:[],open:e?.open===!0,loading:!1,at:Date.now()})}).catch(e=>{"AbortError"!==e.name&&a(e=>({...e,loading:!1}))}),()=>t.abort()},[e]),t}],967429)},924346,e=>{"use strict";var t=e.i(843476),a=e.i(271645),r=e.i(761978);let n=`
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,s=`
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uReveal;
uniform float uSeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
/* Three octaves: the big forms only, for the chrome light below. Five
   octaves of slope read as glitter, small sparks all over the dark sheet. */
float fbm3(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  /* aspect-correct and centred, so the light opens as a circle on any screen */
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  float t = uTime * 0.032;

  /* 🚨 LOW FREQUENCY IS THE WHOLE LOOK. At p*1.5 this shaded like marble:
     dozens of small folds, half the screen bright, busy enough to fight the
     headline. The reference is a handful of ENORMOUS soft forms on a mostly
     black ground, so the sampling scale drops and the ramp goes steep. */
  vec2 q = vec2(fbm(p * 0.80 + t), fbm(p * 0.80 + vec2(3.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p * 0.80 + 1.9 * q + vec2(1.7, 9.2) + t * 1.05),
                fbm(p * 0.80 + 1.9 * q + vec2(8.3, 2.8) - t * 0.85));
  float f = fbm(p * 0.80 + 2.2 * r);

  /* the crease: one folded band turns a soft cloud into a sheet of silk */
  float fold = abs(sin((f * 1.7 + length(r) * 0.9) * 3.14159));
  float shade = mix(f, fold, 0.42);

  /* 🚨 STRETCH BEFORE YOU SHAPE. Five octaves of value noise average out to
     roughly 0.25-0.75, so a ramp written against 0-1 never sees its own top
     end: the highlight term below could not fire and the whole sheet shaded
     one flat mid-grey. This maps the band the noise ACTUALLY occupies onto
     0-1, which is what gives the creases somewhere to go. */
  shade = smoothstep(0.26, 0.86, shade);

  /* 🚨 A STEEP POWER, NOT A DIM MULTIPLY. Scaling the whole ramp down greys
     the highlights out with the ground and the silk stops looking lit; a high
     exponent keeps a few near-white creases and sends everything else to
     black, which is what makes it read as light on a dark sheet. */
  /* ⚠️ THE EXPONENT IS THE DARK/LIGHT RATIO, and it is easy to overshoot in
     both directions. At 2.7 half the frame went white and the headline
     disappeared into it; at 4.2 only the top of the range survives, which is
     the reference: a mostly black sheet with a few lit creases. */
  float lum = pow(clamp(shade, 0.0, 1.0), 2.9);
  lum += 0.55 * pow(smoothstep(0.74, 1.0, shade), 2.2);   /* the lit edge */
  lum *= 1.0 - 0.58 * smoothstep(0.14, 0.98, length(p));  /* corners fall away */

#ifdef CHROME
  /* CHROME AND DEPTH (website upgrade, owner-approved plan 18 Oct 2026: "more
     depth and chrome highlights, same greys"). The big forms' slope becomes a
     surface normal lit from the top left: slopes fall a little darker, and a
     soft highlight rides only the lit crests, so the dark sheet stays calm.
     Still one luminance channel. Tuned against the old frame side by side;
     sharper or busier versions read as glitter or as wrinkled foil. */
  float body = fbm3(p * 0.80 + 2.2 * r);
  float k = min(uRes.x, uRes.y) * 0.85;
  vec3 n = normalize(vec3(-dFdx(body) * k, -dFdy(body) * k, 1.0));
  float spec = pow(max(dot(n, normalize(vec3(-0.42, 0.58, 1.0))), 0.0), 20.0);
  lum *= mix(0.84, 1.0, n.z);
  lum += 0.26 * spec * smoothstep(0.45, 0.92, shade);
#endif

  /* THE APERTURE. Small and drifting while closed, past the corners when open.
     The drift is scaled by (1 - reveal) so the light settles as it arrives. */
  vec2 c = vec2(sin(uTime * 0.33), cos(uTime * 0.27)) * 0.055 * (1.0 - uReveal);
  float rad = mix(0.20, 2.4, pow(uReveal, 1.4));
  /* ⚠️ THE CLOSED APERTURE IS LIT HARDER, and it has to be. The open frame is
     tuned to sit mostly black so a headline can live on it; through a 20%
     hole that same ramp shows almost nothing, and the greeting screen loses
     the one thing on it. The lift falls away as the light opens. */
  lum *= mix(2.1, 1.0, uReveal);
  lum *= 1.0 - smoothstep(rad * 0.30, rad, length(p - c));

  /* grain, and it is load-bearing: a smooth grey ramp BANDS on an 8-bit
     display, and the stripes are the first thing that reads as cheap. */
  lum += (hash(gl_FragCoord.xy * 0.61 + fract(uTime)) - 0.5) * 0.028;

  gl_FragColor = vec4(vec3(clamp(lum, 0.0, 1.0)), 1.0);
}
`;function o(e,t,a){let r=e.createShader(t);return r?(e.shaderSource(r,a),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(console.error("[liquid]",e.getShaderInfoLog(r)),e.deleteShader(r),null):null}e.s(["LiquidCanvas",0,function({className:e="",reveal:i=1,speed:l=1,seed:c=0,onReady:u}){let d=(0,a.useRef)(null),h=(0,r.useReducedMotionSafe)(),f=(0,a.useRef)(i),m=(0,a.useRef)(l);return(0,a.useEffect)(()=>{f.current=i},[i]),(0,a.useEffect)(()=>{m.current=l},[l]),(0,a.useEffect)(()=>{let e=d.current;if(!e)return;let t=e.getContext("webgl",{antialias:!1,alpha:!1,depth:!1})??e.getContext("experimental-webgl");if(!t)return;if(t.isContextLost())return void console.warn("[liquid] the WebGL context is lost, skipping this canvas");let a=!!t.getExtension("OES_standard_derivatives"),r=o(t,t.VERTEX_SHADER,n),i=o(t,t.FRAGMENT_SHADER,(a?"#extension GL_OES_standard_derivatives : enable\n#define CHROME 1\n":"")+s);if(!r||!i)return;let l=t.createProgram();if(!l)return;if(t.attachShader(l,r),t.attachShader(l,i),t.linkProgram(l),!t.getProgramParameter(l,t.LINK_STATUS))return void console.error("[liquid]",t.getProgramInfoLog(l));t.useProgram(l);let p=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,p),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let g=t.getAttribLocation(l,"aPos");t.enableVertexAttribArray(g),t.vertexAttribPointer(g,2,t.FLOAT,!1,0,0);let v=t.getUniformLocation(l,"uRes"),y=t.getUniformLocation(l,"uTime"),b=t.getUniformLocation(l,"uReveal");t.uniform1f(t.getUniformLocation(l,"uSeed"),c);let x=0,w=0,A=()=>{let a=Math.min(window.devicePixelRatio||1,1),r=Math.max(1,Math.round(e.clientWidth*a)),n=Math.max(1,Math.round(e.clientHeight*a));(r!==x||n!==w)&&(x=r,w=n,e.width=x,e.height=w,t.viewport(0,0,x,w),t.uniform2f(v,x,w))};A();let S=new ResizeObserver(A);S.observe(e);let T=0,R=0,E=performance.now(),k=!0,O=!0,N=e=>{T=requestAnimationFrame(N);let a=Math.min(.05,(e-E)/1e3);E=e,k&&O&&(R+=a*m.current,t.uniform1f(y,R),t.uniform1f(b,f.current),t.drawArrays(t.TRIANGLES,0,3))};h?(t.uniform1f(y,8.3),t.uniform1f(b,1),t.drawArrays(t.TRIANGLES,0,3)):T=requestAnimationFrame(N);let P=new IntersectionObserver(([e])=>{O=e.isIntersecting},{threshold:0});P.observe(e);let C=()=>{k="visible"===document.visibilityState,E=performance.now()};return document.addEventListener("visibilitychange",C),u?.({setReveal:e=>{f.current=e}}),()=>{cancelAnimationFrame(T),S.disconnect(),P.disconnect(),document.removeEventListener("visibilitychange",C),t.deleteProgram(l),t.deleteShader(r),t.deleteShader(i),t.deleteBuffer(p)}},[h,c]),(0,t.jsx)("canvas",{ref:d,"aria-hidden":!0,className:`block h-full w-full ${e}`})}])},764259,e=>{e.v(t=>Promise.all(["static/immutable/chunks/449_h6qar0m-g.js"].map(t=>e.l(t))).then(()=>t(855563)))},566215,e=>{"use strict";var t=e.i(925599);let a=e=>Math.round(Number(`${e}e2`)),r=null!=t.FIRST_MONTH.pro?a(t.FIRST_MONTH.pro):null;e.s(["FIRST_MONTH_CENTS",0,r,"LENGTH_WORDS",0,{"one-month":"One month only",repeat:"Can repeat every month","first-only":"First payment only",forever:"Forever, every payment",months:"For a set number of months","free-days":"Free days, once per person",credits:"Credits, once per person"},"SECTION_INFO",0,{stripe:{title:"Stripe codes",desc:"Our own % codes on Stripe: LIQUID40, FIRSTMONTH, sales like SPOOKY50, the founding code."},"affiliate-stripe":{title:"Affiliate Stripe codes",desc:"An affiliate's % off code (PAPI40). Their commission comes from these."},trial:{title:"Affiliate trials",desc:"Free days an affiliate gives away (PAPI, DAISY). New members only."},giveaway:{title:"Giveaways and free time",desc:"Our free-time and credit codes: giveaway winners, tests."},gift:{title:"Gift codes",desc:"GIFT- codes: giveaway links (Admin, Giveaway links) and gifts a member paid for."}},"codeMath",0,function(e){let r=[];for(let n of e.tables??["old","new"]){let s="old"===n?t.OLD_PRICES:t.NEW_PRICES;for(let t of e.plans)for(let o of!1===e.yearly?["month"]:["month","year"]){let i=a("month"===o?s[t].monthly:s[t].annualYear),l=null!=e.percentOff?Math.min(i,Math.round(i*e.percentOff/100)):Math.min(i,e.amountOffCents??0);r.push({plan:t,period:o,table:n,list:i,off:l,pay:i-l})}}return r},"freeDaysWorth",0,function(e,r){let n=(0,t.pricesSwitched)()?t.NEW_PRICES:t.OLD_PRICES;return r.map(t=>({plan:t,cents:Math.round(a(n[t].monthly)*e/30)}))},"newCodeProblem",0,function(e,t){return/^[A-Z0-9]{3,24}$/.test(e)?e.includes(String(t))?null:`Put the number in the code, like SPOOKY${t}.`:"A code is 3 to 24 letters and numbers, no spaces."},"usd",0,e=>`$${(e/100).toFixed(2)}`])},209545,e=>{"use strict";let t={accounts:null,trades:null,journalDays:null,passedEvals:null,payouts:null,greenCheck:null,reviews:null,at:null},a=e=>"number"==typeof e&&Number.isFinite(e)&&e>=0?Math.floor(e):null,r=e=>"number"==typeof e&&Number.isFinite(e)&&e>=0?Math.round(100*e)/100:null;e.s(["NO_STATS",0,t,"STARS_FROM",0,8,"cleanStats",0,function(e){if(!e||"object"!=typeof e||Array.isArray(e))return t;let n=e.payouts&&"object"==typeof e.payouts?e.payouts:{},s=e.greenCheck&&"object"==typeof e.greenCheck?e.greenCheck:{},o=a(n.count),i=r(n.sum),l=a(s.traders),c=a(s.payouts),u=r(s.sum),d=e.reviews&&"object"==typeof e.reviews?e.reviews:{},h=a(d.count),f=a(d.incentivised),m="number"==typeof d.avg&&Number.isFinite(d.avg)&&d.avg>=1&&d.avg<=5?Math.round(10*d.avg)/10:null;return{accounts:a(e.accounts),trades:a(e.trades),journalDays:a(e.journalDays),passedEvals:a(e.passedEvals),payouts:null!==o&&null!==i?{count:o,sum:i}:null,greenCheck:null!==l&&null!==c&&null!==u?{traders:l,payouts:c,sum:u}:null,reviews:null!==h&&h>0&&null!==m&&null!==f?{count:h,avg:m,incentivised:f}:null,at:"string"==typeof e.at&&Number.isFinite(Date.parse(e.at))?new Date(e.at).toISOString():null}}])}]);

//# debugId=3d011fc6-7244-8aab-d32c-9d29ea2441c6