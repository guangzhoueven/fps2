/* ==================================================================
 *  音频引擎 —— Web Audio API 纯代码合成音效，无音频文件
 * ================================================================== */
'use strict';

let AC = null, NOISE_BUF = null;

function initAudio(){
  if(AC) return;
  try{
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const len = AC.sampleRate;
    NOISE_BUF = AC.createBuffer(1, len, AC.sampleRate);
    const d = NOISE_BUF.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
  }catch(e){ AC = null; }
}

function snd(type, vol){
  if(!AC) return;
  const t = AC.currentTime;
  const g = AC.createGain();
  g.connect(AC.destination);
  vol = vol || 0.2;

  switch(type){
    case 'shot': {
      const src = AC.createBufferSource();
      src.buffer = NOISE_BUF;
      const f = AC.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(3000, t);
      f.frequency.exponentialRampToValueAtTime(200, t+0.1);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
      src.connect(f); f.connect(g);
      src.start(t); src.stop(t+0.15);
      const o = AC.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(50, t+0.1);
      o.connect(g); o.start(t); o.stop(t+0.12);
      break;
    }
    case 'hit': {
      const o = AC.createOscillator();
      o.type = 'square'; o.frequency.setValueAtTime(1600, t);
      o.frequency.exponentialRampToValueAtTime(900, t+0.05);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.05);
      o.connect(g); o.start(t); o.stop(t+0.06);
      break;
    }
    case 'empty': {
      const o = AC.createOscillator();
      o.type = 'square'; o.frequency.setValueAtTime(220, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.06);
      o.connect(g); o.start(t); o.stop(t+0.07);
      break;
    }
    case 'explosion': {
      const src = AC.createBufferSource();
      src.buffer = NOISE_BUF;
      const f = AC.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1000, t);
      f.frequency.exponentialRampToValueAtTime(80, t+1.5);
      g.gain.setValueAtTime(vol*3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+1.5);
      src.connect(f); f.connect(g);
      src.start(t); src.stop(t+1.5);
      break;
    }
    case 'reload': {
      const o = AC.createOscillator();
      o.type = 'square'; o.frequency.setValueAtTime(400, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.08);
      o.connect(g); o.start(t); o.stop(t+0.1);
      setTimeout(()=>snd('reload2', vol*0.8), 200);
      break;
    }
    case 'reload2': {
      const o = AC.createOscillator();
      o.type = 'square'; o.frequency.setValueAtTime(600, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.06);
      o.connect(g); o.start(t); o.stop(t+0.08);
      break;
    }
    case 'swing': {
      const src = AC.createBufferSource();
      src.buffer = NOISE_BUF;
      const f = AC.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.setValueAtTime(3000, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
      src.connect(f); f.connect(g);
      src.start(t); src.stop(t+0.15);
      break;
    }
    case 'step': {
      const src = AC.createBufferSource();
      src.buffer = NOISE_BUF;
      const f = AC.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.setValueAtTime(800, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.06);
      src.connect(f); f.connect(g);
      src.start(t); src.stop(t+0.06);
      break;
    }
    case 'kill': {
      const o = AC.createOscillator();
      o.type = 'sine'; o.frequency.setValueAtTime(900, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
      o.connect(g); o.start(t); o.stop(t+0.15);
      setTimeout(()=>{
        const o2 = AC.createOscillator();
        const g2 = AC.createGain();
        g2.connect(AC.destination);
        o2.type = 'sine'; o2.frequency.setValueAtTime(1300, t+0.1);
        g2.gain.setValueAtTime(vol*0.8, t+0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, t+0.25);
        o2.connect(g2); o2.start(t+0.1); o2.stop(t+0.26);
      }, 80);
      break;
    }
    case 'switch': {
      const o = AC.createOscillator();
      o.type = 'square'; o.frequency.setValueAtTime(500, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.05);
      o.connect(g); o.start(t); o.stop(t+0.06);
      break;
    }
    case 'throw': {
      const src = AC.createBufferSource();
      src.buffer = NOISE_BUF;
      const f = AC.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.setValueAtTime(1500, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.2);
      src.connect(f); f.connect(g);
      src.start(t); src.stop(t+0.2);
      break;
    }
    case 'pickup': {
      const o = AC.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(700, t);
      o.frequency.exponentialRampToValueAtTime(1400, t+0.12);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.18);
      o.connect(g); o.start(t); o.stop(t+0.2);
      break;
    }
  }
}
