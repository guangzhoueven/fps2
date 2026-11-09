/* ==================================================================
 *  纹理生成 —— Canvas 2D 程序化绘制，无外部图片资源
 * ================================================================== */
'use strict';

function makeTex(draw, w, h){
  const c = document.createElement('canvas');
  c.width = w || 512; c.height = h || 512;
  draw(c.getContext('2d'), c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const TEX = {};

function buildTextures(){
  TEX.concrete = makeTex((g,w,h)=>{
    g.fillStyle = '#4e5157'; g.fillRect(0,0,w,h);
    for(let i=0;i<8000;i++){
      const v = Math.random();
      g.fillStyle = v>0.5 ? `rgba(255,255,255,${v*0.06})` : `rgba(0,0,0,${v*0.18})`;
      g.fillRect(Math.random()*w, Math.random()*h, 3, 3);
    }
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, h*0.33); g.lineTo(w, h*0.33+8);
    g.moveTo(0, h*0.66); g.lineTo(w, h*0.66+5);
    g.moveTo(w*0.5, 0); g.lineTo(w*0.5+6, h);
    g.stroke();
  }, 512, 256);
  TEX.concrete.repeat.set(4, 1);

  TEX.wood = makeTex((g,w,h)=>{
    g.fillStyle = '#8a5a28'; g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=36){
      g.fillStyle = `rgb(${130+Math.random()*30|0},${85+Math.random()*20|0},${40+Math.random()*15|0})`;
      g.fillRect(0,y,w,34);
      g.fillStyle = 'rgba(0,0,0,.35)';
      g.fillRect(0,y+34,w,2);
    }
    g.strokeStyle = '#5b3814'; g.lineWidth = 14;
    g.strokeRect(7,7,w-14,h-14);
    g.strokeStyle = '#6d451b'; g.lineWidth = 10;
    g.beginPath();
    g.moveTo(14,14); g.lineTo(w-14,h-14);
    g.moveTo(w-14,14); g.lineTo(14,h-14);
    g.stroke();
  }, 256, 256);

  TEX.floor = makeTex((g,w,h)=>{
    g.fillStyle = '#2a2a2a'; g.fillRect(0,0,w,h);
    g.strokeStyle = '#111'; g.lineWidth = 2;
    for(let i=0;i<=w;i+=64){
      g.beginPath(); g.moveTo(i,0); g.lineTo(i,h); g.stroke();
      g.beginPath(); g.moveTo(0,i); g.lineTo(w,i); g.stroke();
    }
    for(let i=0;i<3000;i++){
      g.fillStyle = `rgba(255,255,255,${Math.random()*0.06})`;
      g.fillRect(Math.random()*w, Math.random()*h, 2, 2);
    }
  }, 512, 512);
  TEX.floor.repeat.set(12, 12);

  TEX.metal = makeTex((g,w,h)=>{
    g.fillStyle = '#3a4250'; g.fillRect(0,0,w,h);
    for(let x=0;x<w;x+=20){
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x,0,2,h);
      g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x+16,0,4,h);
    }
    for(let y=12;y<h;y+=24){
      for(let x=8;x<w;x+=20){
        g.fillStyle = 'rgba(200,210,230,.6)';
        g.beginPath(); g.arc(x,y,2,0,6.283); g.fill();
      }
    }
  }, 256, 256);
  TEX.metal.repeat.set(2,1);
}
