import flags from "./flags.json";
import {surface,panel,wrap,read,persist,type Frame} from "@shared/surface";
import {loadValues} from "@shared/settings";
const all=flags as [string,string,number][];
let favorites=["ua","pl"],only=false,rotate=false,seconds=5;
let index=all.findIndex(f=>f[0]==="ua");
let timer:ReturnType<typeof setInterval>|undefined;
function choices(){return only?all.filter(f=>favorites.includes(f[0])):all;}
function step(dir:number){index=wrap(index+dir,choices().length);}
function draw():Frame{
 const list=choices(),[code,name,width]=list[index];
 return [{type:"image",id:"flag",display:"front",x:Math.floor((72-width)/2),y:0,align:"top_left",path:"images/"+code+".png"},
 ...panel(name,[code.toUpperCase()+"  "+(index+1)+"/"+list.length,only?"Favorites":"All flags",rotate?"Rotating every "+seconds+"s":"Wheel: choose flag","Click: all / favorites","Start: rotate / stop","Hold click: add / remove"])];
}
const refresh=surface(draw,k=>{
 const current=choices()[index][0];
 if(k==="up"||k==="down")step(k==="up"?1:-1);
 if(k==="ok"&&favorites.length){only=!only;index=Math.max(0,choices().findIndex(f=>f[0]===current));}
 if(k==="hold-ok"){favorites=favorites.includes(current)?favorites.filter(c=>c!==current):favorites.concat(current);persist("favorites",favorites);if(!favorites.length)only=false;index=Math.min(index,choices().length-1);}
 if(k==="start"){rotate=!rotate;if(timer!==undefined)clearInterval(timer);if(rotate)timer=setInterval(()=>{step(1);refresh();},1000*seconds);}
},()=>{if(timer!==undefined)clearInterval(timer);},{enabled:false});
void loadValues().then(v=>{const codes=String(v?.favorites||"ua,pl").toLowerCase().split(",").map(s=>s.trim());favorites=read("favorites",codes).filter(c=>all.some(f=>f[0]===c));seconds=Math.max(1,Math.min(300,Number(v?.seconds)||5));refresh();});
