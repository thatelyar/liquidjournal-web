;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="559088d1-4c53-265c-2be6-b61f8b48b33b")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,52489,e=>{"use strict";var t=e.i(271645);let a=`#version 300 es
in vec2 aPos; out vec2 vUv;
void main() { vUv = aPos; gl_Position = vec4(aPos, 0.0, 1.0); }`,i=`#version 300 es
precision highp float;
in vec2 vUv; out vec4 outColor;
uniform sampler2D uSdf, uEnv, uEnvSoft;
uniform float uBox;        // the distance map's square, in logo units
uniform mat3 uRot;         // object -> view
uniform float uFlat, uBling, uTime, uPx;
uniform vec3 uBlingDir;
const float R = 1.32;      // the tube's radius near the edge (the bake's R)
const float CAM = 64.0, EXT = 13.6;

/* The distance map: R the exact distance to the logo's edges, G the swell's height (scripts/make-ring-sdf.mjs). */
vec2 mapUv(vec2 p) { return vec2(p.x / uBox + 0.5, 0.5 - p.y / uBox); }
vec2 sdf2(vec2 p) {
  vec2 uv = mapUv(p);
  vec2 o = max(abs(uv - 0.5) - 0.5, 0.0);
  return texture(uSdf, clamp(uv, 0.0, 1.0)).rg + length(o) * uBox;
}
/* The same, read through a cubic B-spline (four filtered reads): a surface with no texel facets, for the light. A
   plain linear read made the normals jump at every texel, which mirror chrome showed as a crumpled, foil-like skin. */
vec4 bsw(float v) {
  vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
  vec4 c = n * n * n;
  float x = c.x, y = c.y - 4.0 * c.x, z = c.z - 4.0 * c.y + 6.0 * c.x;
  return vec4(x, y, z, 6.0 - x - y - z) * (1.0 / 6.0);
}
vec2 sdf2Smooth(vec2 p) {
  vec2 uv = mapUv(p);
  vec2 o = max(abs(uv - 0.5) - 0.5, 0.0);
  vec2 ts = vec2(textureSize(uSdf, 0));
  vec2 st = clamp(uv, 0.0, 1.0) * ts - 0.5;
  vec2 f = fract(st); st -= f;
  vec4 xc = bsw(f.x), yc = bsw(f.y);
  vec4 c = st.xxyy + vec2(-0.5, 1.5).xyxy;
  vec4 sw = vec4(xc.xz + xc.yw, yc.xz + yc.yw);
  vec4 off = (c + vec4(xc.yw, yc.yw) / sw) / ts.xxyy;
  vec2 s0 = texture(uSdf, off.xz).rg, s1 = texture(uSdf, off.yz).rg, s2 = texture(uSdf, off.xw).rg, s3 = texture(uSdf, off.yw).rg;
  float sx = sw.x / (sw.x + sw.y), sy = sw.z / (sw.z + sw.w);
  return mix(mix(s3, s2, sx), mix(s1, s0, sx), sy) + length(o) * uBox;
}
/* An inflated logo: a rounded tube along the edge (exact silhouette where z = 0), swelling where the ring is thick.
   The swell is baked (no crease down the middle of a thick part, no seam where it begins, fine steps). */
float shapeOf(vec2 sd, float z) {
  return length(vec2(max(sd.x + R, 0.0), z)) - R - sd.y;
}
float shape(vec3 p) { return shapeOf(sdf2(p.xy), p.z); }
float shapeSmooth(vec3 p) { return shapeOf(sdf2Smooth(p.xy), p.z); }
vec3 normalAt(vec3 p) {
  const float e = 0.05;
  return normalize(vec3(
    shapeSmooth(p + vec3(e, 0, 0)) - shapeSmooth(p - vec3(e, 0, 0)),
    shapeSmooth(p + vec3(0, e, 0)) - shapeSmooth(p - vec3(0, e, 0)),
    shapeSmooth(p + vec3(0, 0, e)) - shapeSmooth(p - vec3(0, 0, e))));
}
vec3 env(sampler2D t, vec3 r) {
  float u = 0.5 + atan(r.x, -r.z) / 6.2831853;
  float v = 0.5 - asin(clamp(r.y, -1.0, 1.0)) / 3.1415927;
  /* A fixed level: at the panorama's wrap the screen-space derivative jumps and picked a blurry level (a seam line).
     1.25, not 0 (owner, 19 Oct 2026: the chrome looked like crumpled foil): the world's ripples, mirrored razor sharp
     and squeezed on the curves, read as creased metal; a hair softer they read as polished. Same colours. */
  return textureLod(t, vec2(u, v), 1.25).rgb;
}
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }

void main() {
  /* The view: a camera on +z looking at the Ring's centre; the square canvas spans +-EXT units at the centre. */
  vec3 ro = vec3(0.0, 0.0, CAM);
  vec3 rd = normalize(vec3(vUv * EXT, -CAM));
  mat3 inv = transpose(uRot);
  vec3 o = inv * ro, d = inv * rd;
  /* March inside the bounding sphere only. */
  float b = dot(o, d), c = dot(o, o) - 15.5 * 15.5, h = b * b - c;
  if (h < 0.0) { outColor = vec4(0.0); return; }
  h = sqrt(h);
  float t = max(-b - h, 0.0), tEnd = -b + h, minD = 1e9, tMin = t;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    vec3 p = o + d * t;
    float s = shape(p);
    if (s < minD) { minD = s; tMin = t; }
    if (s < 0.0025) { hit = true; break; }
    t += max(s * 0.62, 0.006);
    if (t > tEnd) break;
  }
  /* Edge softness: a near miss gives a little coverage, so the outline is smooth at any size. */
  float px = uPx * (tMin / CAM) * 1.4;
  float cover = hit ? 1.0 : smoothstep(px, 0.0, minD);
  if (cover <= 0.0) { outColor = vec4(0.0); return; }
  /* Settle the hit onto the smooth surface the light is computed on. */
  if (hit) for (int k = 0; k < 3; k++) t += shapeSmooth(o + d * t) * 0.9;
  vec3 p = o + d * (hit ? t : tMin);
  vec3 n = uRot * normalAt(p);
  vec3 vdir = rd;
  vec3 r = reflect(vdir, n);
  float fres = 0.62 + 0.38 * pow(1.0 - max(dot(-vdir, n), 0.0), 5.0);
  vec3 col = env(uEnv, r) * 1.15 * fres + env(uEnvSoft, n) * 0.05;
  /* The sliding glint: a hard highlight from a light just above-left of the camera, it runs along the bevel as the
     Ring turns. */
  vec3 L = normalize(vec3(-0.35, 0.55, 0.76));
  col += vec3(1.0, 0.99, 0.97) * pow(max(dot(r, L), 0.0), 380.0) * 2.4;
  /* A bling: a band of light swept across the chrome. */
  if (uBling > 0.0) {
    float band = exp(-pow((dot(normalize(uBlingDir), n) - (uBling * 2.2 - 1.1)) * 9.0, 2.0));
    col += vec3(1.0) * band * 1.6 * sin(uBling * 3.1415927);
  }
  col = aces(col * 1.35);
  col = pow(col, vec3(1.0 / 2.2));
  /* The nav logo's flat white, for the handover. */
  col = mix(col, vec3(0.961, 0.961, 0.969), uFlat);
  outColor = vec4(col * cover, cover);
}`;async function n(e){let t=new Image;return t.decoding="async",t.src=e,await t.decode(),t}async function o(e="/liquidjournal-web/landing/ring",t){let r=document.createElement("canvas"),l=r.getContext("webgl2",{premultipliedAlpha:!0,alpha:!0,antialias:!1,powerPreference:"high-performance"});if(!l)return null;let s=!1;r.addEventListener("webglcontextlost",e=>{e.preventDefault(),s=!0,t?.()},{once:!0});let[c,h,f,u]=await Promise.all([fetch(`${e}/ring-sdf.json`).then(e=>e.json()),fetch(`${e}/ring-sdf.bin`).then(e=>e.arrayBuffer()),n(`${e}/env.jpg`),n(`${e}/env-soft.jpg`)]).catch(()=>[null,null,null,null]);if(!c||!h||!f||!u||s)return null;let d=(e,t)=>{let a=l.createShader(e);if(l.shaderSource(a,t),l.compileShader(a),!l.getShaderParameter(a,l.COMPILE_STATUS))throw Error(l.getShaderInfoLog(a)??"shader");return a},p=l.createProgram();if(l.attachShader(p,d(l.VERTEX_SHADER,a)),l.attachShader(p,d(l.FRAGMENT_SHADER,i)),l.linkProgram(p),!l.getProgramParameter(p,l.LINK_STATUS))return null;l.useProgram(p);let v=l.createBuffer();l.bindBuffer(l.ARRAY_BUFFER,v),l.bufferData(l.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),l.STATIC_DRAW);let m=l.getAttribLocation(p,"aPos");l.enableVertexAttribArray(m),l.vertexAttribPointer(m,2,l.FLOAT,!1,0,0);let x=(e,t)=>{let a=l.createTexture();return l.activeTexture(l.TEXTURE0+e),l.bindTexture(l.TEXTURE_2D,a),t(),a};x(0,()=>{l.pixelStorei(l.UNPACK_ALIGNMENT,4),l.texImage2D(l.TEXTURE_2D,0,l.RG16F,c.n,c.n,0,l.RG,l.HALF_FLOAT,new Uint16Array(h)),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MAG_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE)});let g=(e,t)=>x(e,()=>{l.pixelStorei(l.UNPACK_ALIGNMENT,4),l.texImage2D(l.TEXTURE_2D,0,l.RGB,l.RGB,l.UNSIGNED_BYTE,t),l.generateMipmap(l.TEXTURE_2D),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR_MIPMAP_LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MAG_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.REPEAT),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE)});g(1,f),g(2,u),l.uniform1i(l.getUniformLocation(p,"uSdf"),0),l.uniform1i(l.getUniformLocation(p,"uEnv"),1),l.uniform1i(l.getUniformLocation(p,"uEnvSoft"),2),l.uniform1f(l.getUniformLocation(p,"uBox"),c.box.size);let y=l.getUniformLocation(p,"uRot"),w=l.getUniformLocation(p,"uFlat"),E=l.getUniformLocation(p,"uBling"),T=l.getUniformLocation(p,"uBlingDir"),R=l.getUniformLocation(p,"uTime"),M=l.getUniformLocation(p,"uPx"),A="",b=-1e9,S={canvas:r,size(e){let t=Math.max(32,Math.round(e*Math.min(window.devicePixelRatio||1,window.matchMedia("(max-width: 767px)").matches?1.5:2)));t!==r.width&&(r.width=t,r.height=t,l.viewport(0,0,t,t),A="")},draw(e,t){if(s)return;let a=t-b<900?(t-b)/900:0,i=`${e.yaw.toFixed(4)}|${e.pitch.toFixed(4)}|${e.roll.toFixed(4)}|${e.flat.toFixed(3)}|${a.toFixed(3)}|${r.width}`;if(i!==A){var n,o,c;let s,h,f,u,d,p;A=i,l.uniformMatrix3fv(y,!1,(n=e.yaw,o=e.pitch,c=e.roll,s=Math.cos(n),h=Math.sin(n),f=Math.cos(o),u=Math.sin(o),new Float32Array([(d=Math.cos(c))*s+(p=Math.sin(c))*u*h,p*f,-d*h+p*u*s,-p*s+d*u*h,d*f,p*h+d*u*s,f*h,-u,f*s]))),l.uniform1f(w,e.flat),l.uniform1f(E,a),l.uniform3f(T,-.6,.35,.72),l.uniform1f(R,t/1e3),l.uniform1f(M,27.2/r.width),l.clearColor(0,0,0,0),l.clear(l.COLOR_BUFFER_BIT),l.drawArrays(l.TRIANGLE_STRIP,0,4)}},bling(e){b=e},renderStill(e,t){r.width=e,r.height=e,l.viewport(0,0,e,e),A="",b=-1e9,S.draw(t,0);let a=new Uint8Array(e*e*4);return l.readPixels(0,0,e,e,l.RGBA,l.UNSIGNED_BYTE,a),A="",a},invalidate(){A=""},dispose(){l.getExtension("WEBGL_lose_context")?.loseContext()}};return S}var r=e.i(120451);let l=[48,96,200],s={nav:1,ai:0,aiBtn:1},c=e=>e*e*(3-2*e),h=e=>e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2,f=(e,t,a)=>c(p((a-e)/(t-e)));function u(e,t,a,i,n){let o=1-n;return{x:o*o*o*e.x+3*o*o*n*t.x+3*o*n*n*a.x+n*n*n*i.x,y:o*o*o*e.y+3*o*o*n*t.y+3*o*n*n*a.y+n*n*n*i.y}}let d=(e,t,a)=>e+(t-e)*a,p=e=>e<0?0:e>1?1:e,v=e=>e>=.999?"":e<=.001?"0":e.toFixed(3);e.s(["RingTraveller",0,function({scroller:e}){return(0,t.useEffect)(()=>{let t=e.current;if(!t)return;let a=null,i=0,n=!0,m=[],x=new Map,g=[],y={aiDock:null,aiBtn:null,aiFloat:null},w=null,E=new Set,T=()=>[...document.querySelectorAll("[data-ring-anchor]")].filter(e=>e.getBoundingClientRect().width>0),R=()=>{let e=T()[0];if(!e)return{x:window.innerWidth/2,y:32,size:30};let t=e.getBoundingClientRect(),a=t.width/24,i=e.closest("nav"),n=i?new DOMMatrix(getComputedStyle(i).transform).m42:0;return{x:t.left+11.952*a,y:t.top-n+12.015*a,size:27.2*a}},M=32,A=null,b=0,S=0,z=0,_=0,U=0,B=0,P=null,L=null,D=[],F=e=>e.getBoundingClientRect().top+t.scrollTop,C=()=>{var e,a;let i=window.innerWidth,n=window.innerHeight,o=i<768,r=t.getBoundingClientRect(),l=t.clientHeight,c=(e,t)=>F(e)-r.top+t*(e.offsetHeight-l),h=R();M=h.y;let f={view:{x:h.x,y:h.y}},u=[],p={...s},v=e=>{p={nav:e.nav??p.nav,ai:e.ai??p.ai,aiBtn:e.aiBtn??p.aiBtn},u.push({...e,...p})},g=(e,t,a)=>{v({...u[u.length-1],jump:!1,bling:!1,id:e,s:t,...a})},w=!1;A=null;let E=document.querySelector("[data-ring-park]"),b=document.querySelector("[data-ai-scene]"),S=b?.firstElementChild instanceof HTMLElement?b.firstElementChild:null,z=b?.querySelector("[data-ai-ring]")??null,_=b?.querySelector('[data-ring-dock="ai"]')??null;if(y={aiDock:_,aiBtn:z,aiFloat:b?.querySelector("[data-ai-float]")??null},E&&b&&S&&z&&_){let e=Number(_.querySelector("svg")?.getAttribute("width"))||27,t=e/24,a=S.offsetLeft+z.offsetLeft+z.offsetWidth/2-e/2+11.952*t,s=z.offsetTop+z.offsetHeight/2-e/2+12.015*t,u=27.2*t,p={view:{x:r.left+a,y:r.top+s}},m={doc:{x:r.left+a,y:F(b)+b.offsetHeight-S.offsetHeight+s}},x=c(b,.035),y=document.getElementById("showcase-study"),R=T()[0]?.closest("nav")?.getBoundingClientRect().height??58,M=Math.min(y?F(y)-r.top+y.offsetHeight-R:((e,t=0)=>F(e)-r.top+t*e.offsetHeight-.7*l)(E,0),x-.35*n);v({id:"ai-out",s:M,at:f,size:h.size,face:1,pitch:0,flat:1,alpha:1,nav:0,jump:!0}),v({id:"ai-land",s:x,at:p,size:u,face:1,pitch:0,flat:1,alpha:1,nav:0,ai:0});let U=c(b,0);A={sOut:M,sHand:c(b,.045),sUp:c(b,1),small:o?44:72,dSize:u,rest:{x:i*(o?.72:.78),y:.6*n},c1:e=>({x:d(e.x,.5*i,.6)-.06*i,y:e.y+.47*n}),c2:{x:i*(o?.72:.78)-.28*i,y:.6*n+.11*n},dock:e=>({x:r.left+a,y:r.top+s+Math.max(0,U-e)})},g("ai-under",c(b,.045),{ai:1}),g("ai-dock",c(b,.055),{alpha:0});let B=c(b,1);v({id:"ai-up0",s:B,at:m,size:u,face:1,pitch:0,flat:1,alpha:0,nav:0,ai:1}),g("ai-up1",B+24,{alpha:1,ai:0}),v({id:"ai-up2",s:B+.28*n,at:m,size:1.8*u,face:0,pitch:-.1,flat:.3,alpha:1,nav:0,aiBtn:0}),w=!0}if(w&&(v({id:e="bi-skip",s:a=(u[u.length-1]?.s??0)+.4*n,at:f,size:h.size,face:1,pitch:0,flat:1,alpha:1,nav:0}),v({id:`${e}-in`,s:a+2,at:f,size:h.size,face:1,pitch:0,flat:1,alpha:0,nav:1})),!u.length)return!1;D=(m=u.slice().sort((e,t)=>e.s-t.s)).filter(e=>e.at===f&&e.alpha>0).map(e=>[e.s-.22*n,e.s+.05*n]);let U=t.scrollHeight-l-4;for(let e=m.length-1,t=U;e>=0&&m[e].s>t;e--)m[e].s=t,t-=1;return x=new Map(m.map(e=>[e.id,e])),!0},I=(e,t)=>"view"in e?e.view:{x:e.doc.x,y:e.doc.y-t},k=e=>{if(!m.length||e<m[0].s)return null;let t=m.length-1;for(let a=0;a<m.length-1;a++)if(e<m[a+1].s){t=a;break}let a=m[t],i=m[Math.min(t+1,m.length-1)];if(t===m.length-1||i.jump){let i=I(a.at,e);return{x:i.x,y:i.y,size:a.size,face:a.face,pitch:a.pitch,flat:a.flat,alpha:a.alpha,nav:a.nav,ai:a.ai,aiBtn:a.aiBtn,i:t}}let n=c(p((e-a.s)/Math.max(1,i.s-a.s))),o=I(a.at,e),r=I(i.at,e);return{x:d(o.x,r.x,n),y:d(o.y,r.y,n),size:Math.exp(d(Math.log(a.size),Math.log(i.size),n)),face:d(a.face,i.face,n),pitch:d(a.pitch,i.pitch,n),flat:d(a.flat,i.flat,n),alpha:d(a.alpha,i.alpha,n),nav:d(a.nav,i.nav,n),ai:d(a.ai,i.ai,n),aiBtn:d(a.aiBtn,i.aiBtn,n),i:t}},X=null,N=(e,t,a)=>{e&&e.style[t]!==a&&(e.style[t]=a)},H=()=>{for(let e of((0,r.setNavHeld)(!1),T()))e.style.opacity="";for(let e of[y.aiDock,y.aiBtn])e&&(e.style.opacity="");y.aiFloat&&(y.aiFloat.style.animation="")},G="",O=0,$=e=>{let o;if(!n||(i=requestAnimationFrame($),!a||!w))return;let c=t.scrollTop,T=z?Math.min(.12,(e-z)/1e3):0;z=e;let F=((e,t,i,n)=>{let o,r,l,c,v=A;if(!v)return null;if(e>=v.sUp)return b=1,S=1,P=e,null;let m=v.dock(e),x=e>=v.sHand?4:1,g=+(e>=v.sOut),y=g&&m.y<=window.innerHeight-36?1:0,w=null!==P&&Math.abs(e-P)>1.2*window.innerHeight;P=e,w&&(b=g,S=y,L=null);let E=b;if(S>0&&0===y?S=Math.max(0,S-t/.7*x):0===S&&b<g?b=Math.min(1,b+t/1.4*x):0===S&&b>g?b=Math.max(0,b-t/1.1):1===b&&S<y&&(S=Math.min(1,S+t/.7*x)),1===b&&E<1&&(_=i),E<.5&&b>=.5&&a&&a.bling(i),0===b&&0===S)return L=null,B=0,null;let T=1===b&&1===S,M=R();if(S>0){var z,D;let e,t,a=h(S);z=v.rest,D=v.c2,e=.4*Math.hypot(m.x-z.x,m.y-z.y),t=Math.hypot(z.x-D.x,z.y-D.y)||1,o=u(z,{x:z.x+(z.x-D.x)/t*e,y:z.y+(z.y-D.y)/t*e},{x:m.x,y:m.y-e},m,a),r=Math.exp(d(Math.log(v.small),Math.log(v.dSize),a)),l=f(.55,1,a),c=d(-.15,0,a)}else{let e=h(b),t={x:M.x,y:M.y};if(o=u(t,v.c1(t),v.c2,v.rest,e),r=Math.exp(d(Math.log(M.size),Math.log(v.small),e)),c=-.15*(1-(l=1-f(0,.35,e))),1===b){let e=p((i-_)/600),t=i/1e3;o={x:o.x+2*Math.cos(1.2*t)*e,y:o.y+4*Math.sin(1.7*t)*e}}}if(L&&t>0){let e=(o.x-L.x)/t,a=(o.y-L.y)/t;if(Math.hypot(e,a)>40){let i=Math.atan2(a,e),n=Math.atan2(Math.sin(i-U),Math.cos(i-U))/t;U=i,B=d(B,Math.max(-.3,Math.min(.3,.07*n)),.12)}else B=d(B,0,.1)}L=o;let F=n??{...s,x:0,y:0,size:0,face:0,pitch:0,flat:0,alpha:1,i:-1};return T?{...F,x:m.x,y:m.y,size:v.dSize,face:1,pitch:0,flat:1,nav:0,i:-1,roll:d(B,0,.2)}:{...F,x:o.x,y:o.y,size:r,face:l,pitch:c,flat:l,alpha:1,nav:0,ai:0,i:-1,roll:B}})(c,T,e,k(c))??k(c),C=!!F&&F.alpha>.001;var I,H,j=F??s;let q=v(j.nav);for(let e of g)N(e,"opacity",""===q?"1":q);for(let e of(N(y.aiDock,"opacity",v(j.ai)),N(y.aiBtn,"opacity",v(j.aiBtn)),N(y.aiFloat,"animation",j.ai>=.999&&!C?"":"none"),(0,r.setNavHeld)(!!F&&F.alpha>.01&&F.y<M+110||D.some(([e,t])=>c>=e&&c<=t)),E)){let t=x.get(e);(!t||t.s>c+1)&&E.delete(e)}if(!F||!C){"0"!==w.style.opacity&&(w.style.opacity="0"),X=null;return}let W=F.i>=0?m[F.i]:void 0;W?.bling&&c>=W.s&&!E.has(W.id)&&(E.add(W.id),a.bling(e));let K=(I=F.size,O&&I<=O&&I>.42*O?O:O=l.find(e=>e>=1.05*I)??l[l.length-1]);a.size(K);let Y=a.canvas;Y.style.width!==`${K}px`&&(Y.style.width=`${K}px`,Y.style.height=`${K}px`);let V=`translate3d(${(F.x-F.size/2).toFixed(2)}px,${(F.y-F.size/2).toFixed(2)}px,0) scale(${(F.size/K).toFixed(4)})`;V!==G&&(Y.style.transform=V,G=V),w.style.opacity=String(F.alpha),a.draw({yaw:(H=F.face,o=e/1e3*Math.PI*2/7,H<=.001?(X=null,o):(null===X&&(X=Math.round(o/(2*Math.PI))*Math.PI*2),X+(o-X)*(1-H))),pitch:F.pitch,roll:F.roll??0,flat:F.flat},e)},j=()=>{C()},q=null;return(async()=>{(a=await o("/liquidjournal-web/landing/ring",()=>{n=!1,w&&w.remove(),H()}))&&n&&((w=document.createElement("div")).setAttribute("data-ring-layer",""),w.setAttribute("aria-hidden","true"),w.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:20;opacity:0;contain:strict",a.canvas.style.cssText="position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform",a.canvas.setAttribute("data-ring-canvas",""),w.appendChild(a.canvas),document.body.appendChild(w),g=T(),C()||setTimeout(C,1200),(q=new ResizeObserver(j)).observe(t.firstElementChild??t),window.addEventListener("resize",j),document.fonts?.ready.then(C).catch(()=>{}),i=requestAnimationFrame($))})(),()=>{n=!1,cancelAnimationFrame(i),q?.disconnect(),window.removeEventListener("resize",j),w?.remove(),a?.dispose(),H()}},[e]),null}],52489)},855563,function(e){e.n(e.i(52489))}]);

//# debugId=559088d1-4c53-265c-2be6-b61f8b48b33b