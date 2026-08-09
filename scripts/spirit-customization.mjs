import { CANDLELIGHT_FRAME_COLORS, CANDLELIGHT_SPIRITS, getSpiritIcon, getSpiritKey, getSpiritLabel } from "./spirit-icons.mjs";

const FRAME_CLASSES = Object.keys(CANDLELIGHT_FRAME_COLORS).map(key => `cl-frame-${key}`);
const FRAME_HEX = Object.freeze({purple:"#a978d4",gold:"#d3a04c",red:"#c8585d",blue:"#5d8fd5",green:"#77a95e",teal:"#4daaaa"});

// Production portrait-frame pipeline. The renderer prefers discrete artwork layers and
// falls back to the current monolithic SVG until the approved production layers land.
const FRAME_ASSETS = Object.freeze({
  base: "/systems/candlelight/assets/ui/portrait-frame-base.svg",
  accent: "/systems/candlelight/assets/ui/portrait-frame-accent.svg",
  foreground: "/systems/candlelight/assets/ui/portrait-frame-foreground.svg",
  fallback: "/systems/candlelight/assets/ui/portrait-frame.svg"
});

// One coordinate system for the artwork. New production assets should use this viewBox.
const FRAME_LAYOUT = Object.freeze({
  width: 320,
  height: 470,
  portrait: {x: 73, y: 88, width: 174, height: 258},
  crest: {x: 160, y: 374, diameter: 92},
  nameplate: {x: 160, y: 444, width: 176, height: 28}
});

// Optical calibration is intentionally explicit. Generic centering is not trusted for
// asymmetric Spirit silhouettes. Values are pixels in the 80px crest canvas plus scale.
const SPIRIT_CALIBRATION = Object.freeze({
  ant:{x:0,y:-3,s:.90},axolotl:{x:0,y:-4,s:.88},badger:{x:0,y:-3,s:.90},bat:{x:0,y:-3,s:.87},bear:{x:0,y:-3,s:.90},
  dragon:{x:2,y:-5,s:.84},fox:{x:0,y:-3,s:.89},hawk:{x:0,y:-4,s:.86},lion:{x:0,y:-3,s:.89},mantis:{x:0,y:-3,s:.85},
  mongoose:{x:1,y:-3,s:.88},monkey:{x:0,y:-3,s:.87},ox:{x:0,y:-3,s:.88},rabbit:{x:0,y:-3,s:.88},rat:{x:0,y:-3,s:.89},
  shark:{x:2,y:-5,s:.84},snake:{x:0,y:-4,s:.87},sphinx:{x:2,y:-4,s:.86},spider:{x:0,y:-3,s:.87},stag:{x:0,y:-4,s:.86},
  turtle:{x:0,y:-3,s:.88},vulture:{x:0,y:-4,s:.85},wolf:{x:0,y:-3,s:.88},phoenix:{x:0,y:-4,s:.83},barguest:{x:0,y:-3,s:.88},
  golem:{x:0,y:-3,s:.87},exile:{x:0,y:-3,s:.87},kraken:{x:0,y:-4,s:.85},thunderbird:{x:0,y:-4,s:.83},unicorn:{x:0,y:-3,s:.87}
});

const assetTextCache = new Map();
let layeredAssetsAvailable;

function optionMarkup(options, selected, blankLabel=null){const rows=[];if(blankLabel!==null)rows.push(`<option value=""${selected?"":" selected"}>${blankLabel}</option>`);for(const [value,label] of Object.entries(options))rows.push(`<option value="${value}"${value===selected?" selected":""}>${label}</option>`);return rows.join("");}
function currentSpiritKey(actor){return getSpiritKey(actor.system.spiritKey)||getSpiritKey(actor.items.find(item=>item.type==="spirit"));}
function currentFrameColor(actor){return CANDLELIGHT_FRAME_COLORS[actor.system.portraitFrameColor]?actor.system.portraitFrameColor:"gold";}
function syncControls(root,actor){const key=currentSpiritKey(actor),color=currentFrameColor(actor);for(const s of root.querySelectorAll("[data-cl-spirit-select]"))s.value=key;for(const s of root.querySelectorAll("[data-cl-frame-select]"))s.value=color;}
function bindSelect(select,value,path,actor,root){select.value=value??"";if(select.dataset.clBound==="true")return;select.dataset.clBound="true";select.addEventListener("change",async e=>{e.preventDefault();e.stopImmediatePropagation();await actor.update({[path]:e.currentTarget.value},{render:false});syncControls(root,actor);updatePortrait(root,actor);updateSpiritTab(root,actor);},{capture:true});}
function ensureControls(root,actor){const key=currentSpiritKey(actor),color=currentFrameColor(actor);const controls=`<div class="cl-portrait-customizer cl-spirit-customizer" data-cl-spirit-customizer><label><span><i class="fa-solid fa-paw"></i> Spirit</span><select class="cl-custom-select" data-cl-spirit-select>${optionMarkup(CANDLELIGHT_SPIRITS,key,"Choose Spirit")}</select></label><label><span><i class="fa-solid fa-palette"></i> Frame</span><select class="cl-custom-select" data-cl-frame-select>${optionMarkup(CANDLELIGHT_FRAME_COLORS,color)}</select></label></div>`;if(!root.querySelector("[data-cl-spirit-customizer]"))root.querySelector(".cl-level-strip")?.insertAdjacentHTML("afterend",controls);if(!root.querySelector("[data-cl-spirit-tab-customizer]")){const sec=root.querySelector('[data-tab-panel="spirit"] section');sec?.querySelector("h2")?.insertAdjacentHTML("afterend",controls.replace("data-cl-spirit-customizer","data-cl-spirit-tab-customizer"));}for(const s of root.querySelectorAll("[data-cl-spirit-select]"))bindSelect(s,key,"system.spiritKey",actor,root);for(const s of root.querySelectorAll("[data-cl-frame-select]"))bindSelect(s,color,"system.portraitFrameColor",actor,root);}
function neutralizeDuplicateLevelField(root){const el=root.querySelector('.cl-header .cl-summary input[name="system.level"]');if(!el)return;el.removeAttribute("name");el.readOnly=true;el.tabIndex=-1;el.title="Level is edited from the Core panel below.";el.classList.add("cl-level-mirror");}

async function fetchAssetText(url, optional=false){
  if(assetTextCache.has(url)) return assetTextCache.get(url);
  const promise=fetch(url).then(r=>{
    if(!r.ok){if(optional&&r.status===404)return "";throw new Error(`HTTP ${r.status}`);}
    return r.text();
  }).catch(err=>{if(!optional)console.error("Candlelight | Portrait asset failed to load",url,err);return "";});
  assetTextCache.set(url,promise);
  return promise;
}

async function hasLayeredAssets(){
  if(layeredAssetsAvailable!==undefined)return layeredAssetsAvailable;
  const [base,accent]=await Promise.all([fetchAssetText(FRAME_ASSETS.base,true),fetchAssetText(FRAME_ASSETS.accent,true)]);
  layeredAssetsAvailable=Boolean(base&&accent);
  return layeredAssetsAvailable;
}

function ensureLayerHosts(portrait){
  let host=portrait.querySelector(":scope > .cl-portrait-frame-assets");
  if(host)return host;
  host=document.createElement("div");
  host.className="cl-portrait-frame-assets";
  host.setAttribute("aria-hidden","true");
  host.innerHTML='<div class="cl-portrait-frame-layer cl-frame-layer-base"></div><div class="cl-portrait-frame-layer cl-frame-layer-accent"></div><div class="cl-portrait-frame-layer cl-frame-layer-foreground"></div>';
  portrait.prepend(host);
  return host;
}

async function ensurePortraitFrameAssets(portrait){
  const host=ensureLayerHosts(portrait);
  if(host.dataset.loaded==="true")return;
  host.dataset.loaded="true";
  if(await hasLayeredAssets()){
    const [base,accent,foreground]=await Promise.all([
      fetchAssetText(FRAME_ASSETS.base),fetchAssetText(FRAME_ASSETS.accent),fetchAssetText(FRAME_ASSETS.foreground,true)
    ]);
    if(!host.isConnected)return;
    host.querySelector(".cl-frame-layer-base").innerHTML=base;
    host.querySelector(".cl-frame-layer-accent").innerHTML=accent;
    host.querySelector(".cl-frame-layer-foreground").innerHTML=foreground;
    host.classList.add("cl-uses-layered-frame");
    return;
  }
  const fallback=await fetchAssetText(FRAME_ASSETS.fallback);
  if(host.isConnected)host.querySelector(".cl-frame-layer-base").innerHTML=fallback;
}

function alphaBounds(ctx,w,h){
  const {data}=ctx.getImageData(0,0,w,h);let minX=w,minY=h,maxX=-1,maxY=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(data[(y*w+x)*4+3]<8)continue;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  if(maxX<minX)return null;
  return{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1};
}

function tintCanvas(canvas,src,tint,key=""){
  if(!canvas||!src)return;
  const size=Number(canvas.dataset.size||80);canvas.width=size;canvas.height=size;
  const out=canvas.getContext("2d");if(!out)return;
  const image=new Image();image.decoding="async";
  image.onload=()=>{
    const scratch=document.createElement("canvas");scratch.width=image.naturalWidth;scratch.height=image.naturalHeight;
    const sctx=scratch.getContext("2d",{willReadFrequently:true});if(!sctx)return;sctx.drawImage(image,0,0);
    const b=alphaBounds(sctx,scratch.width,scratch.height)??{x:0,y:0,width:scratch.width,height:scratch.height};
    const c=SPIRIT_CALIBRATION[key]??{x:0,y:-3,s:.88};
    const pad=Math.round(size*.13),avail=size-pad*2,scale=Math.min(avail/b.width,avail/b.height)*c.s;
    const width=b.width*scale,height=b.height*scale;
    const x=(size-width)/2+c.x,y=(size-height)/2+c.y;
    out.clearRect(0,0,size,size);out.save();out.drawImage(scratch,b.x,b.y,b.width,b.height,x,y,width,height);out.globalCompositeOperation="source-in";out.fillStyle=tint;out.fillRect(0,0,size,size);out.restore();
  };
  image.onerror=()=>console.warn(`Candlelight | Could not load Spirit icon ${src}`);image.src=src;
}

function applyLayoutVariables(portrait){
  portrait.style.setProperty("--cl-frame-native-width",String(FRAME_LAYOUT.width));
  portrait.style.setProperty("--cl-frame-native-height",String(FRAME_LAYOUT.height));
  portrait.style.setProperty("--cl-portrait-x",`${FRAME_LAYOUT.portrait.x}px`);
  portrait.style.setProperty("--cl-portrait-y",`${FRAME_LAYOUT.portrait.y}px`);
  portrait.style.setProperty("--cl-portrait-width",`${FRAME_LAYOUT.portrait.width}px`);
  portrait.style.setProperty("--cl-portrait-height",`${FRAME_LAYOUT.portrait.height}px`);
  portrait.style.setProperty("--cl-crest-x",`${FRAME_LAYOUT.crest.x}px`);
  portrait.style.setProperty("--cl-crest-y",`${FRAME_LAYOUT.crest.y}px`);
  portrait.style.setProperty("--cl-crest-size",`${FRAME_LAYOUT.crest.diameter}px`);
  portrait.style.setProperty("--cl-nameplate-y",`${FRAME_LAYOUT.nameplate.y}px`);
  portrait.style.setProperty("--cl-nameplate-width",`${FRAME_LAYOUT.nameplate.width}px`);
}

function updatePortrait(root,actor){
  const portrait=root.querySelector(".cl-core-portrait");if(!portrait)return;
  const color=currentFrameColor(actor);portrait.classList.remove(...FRAME_CLASSES);portrait.classList.add(`cl-frame-${color}`);applyLayoutVariables(portrait);ensurePortraitFrameAssets(portrait);
  const key=currentSpiritKey(actor);let crest=portrait.querySelector(".cl-portrait-spirit");
  if(!key){crest?.remove();portrait.classList.remove("cl-has-spirit");return;}
  portrait.classList.add("cl-has-spirit");const label=getSpiritLabel(key);
  if(!crest){crest=document.createElement("div");crest.className="cl-portrait-spirit";portrait.appendChild(crest);}
  crest.title=`${label} Spirit`;
  crest.innerHTML=`<canvas class="cl-spirit-canvas" data-size="80" role="img" aria-label="${label} Spirit icon"></canvas><span class="cl-portrait-spirit-name">${label}</span>`;
  tintCanvas(crest.querySelector("canvas"),getSpiritIcon(key),FRAME_HEX[color],key);
}

function updateSpiritTab(root,actor){const key=currentSpiritKey(actor);if(!key)return;const feature=root.querySelector('[data-tab-panel="spirit"] section .cl-feature-card');if(!feature)return;const color=currentFrameColor(actor);feature.classList.remove(...FRAME_CLASSES);feature.classList.add(`cl-frame-${color}`);const old=feature.querySelector("img,.cl-spirit-feature-mask,.cl-spirit-feature-canvas");const canvas=document.createElement("canvas");canvas.className="cl-spirit-feature-canvas";canvas.dataset.size="128";old?.replaceWith(canvas);if(!old)feature.prepend(canvas);tintCanvas(canvas,getSpiritIcon(key),FRAME_HEX[color],key);}

Hooks.on("renderActorSheet",(app,html)=>{const actor=app.actor;if(!actor||actor.type!=="character")return;const root=html?.[0]??html;if(!root?.querySelector?.(".candlelight-sheet"))return;const form=root.matches?.(".candlelight-sheet")?root:root.querySelector(".candlelight-sheet");if(!form)return;neutralizeDuplicateLevelField(form);ensureControls(form,actor);updatePortrait(form,actor);updateSpiritTab(form,actor);});
