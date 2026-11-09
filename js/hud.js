/* ==================================================================
 *  HUD —— 血条 / 弹药 / 击杀信息流 / 连杀提示 / 小地图
 * ================================================================== */
'use strict';

function updateHUD(){
  const hpEl = document.getElementById('hp-inner');
  const hpTxt = document.getElementById('hp-text');
  const hpPct = Math.max(0, player.hp / player.maxHp) * 100;
  hpEl.style.width = hpPct + '%';
  hpEl.style.background = hpPct > 60 ? 'linear-gradient(90deg,#33cc66,#66ff99)'
    : hpPct > 30 ? 'linear-gradient(90deg,#ffaa00,#ffcc33)'
    : 'linear-gradient(90deg,#ff2222,#ff5555)';
  hpTxt.textContent = Math.ceil(player.hp);

  document.getElementById('armor-inner').style.width = player.armor + '%';

  const w = WEAPON_DATA[player.weapon];
  document.getElementById('wpn-name').textContent = w.name;
  const ammoNum = document.getElementById('ammo-num');
  ammoNum.textContent = player.ammo[player.weapon];
  ammoNum.classList.toggle('low', player.ammo[player.weapon] <= w.magSize * .2);
  document.getElementById('ammo-res').textContent = ' / ' + player.reserve[player.weapon];
  document.getElementById('grenade-count').textContent = player.grenades;

  document.getElementById('kills').textContent = player.kills;

  if(player.ammo[player.weapon] === 0 && !player.reloading && player.reserve[player.weapon] > 0){
    document.getElementById('reload-hint').style.opacity = 1;
  } else if(!player.reloading){
    document.getElementById('reload-hint').style.opacity = 0;
  }
}

function addKillFeed(text){
  const feed = document.getElementById('feed');
  const el = document.createElement('div');
  el.className = 'feed-item';
  el.textContent = text;
  feed.prepend(el);
  setTimeout(()=> el.remove(), 3000);
  while(feed.children.length > 5) feed.lastChild.remove();
}

/* --- 连杀提示 --- */
let comboCount = 0, comboTimer = 0;

function showCombo(){
  comboCount++;
  comboTimer = 2;
  const el = document.getElementById('combo');
  let text = '';
  if(comboCount >= 5) text = '暴走 MONSTER KILL';
  else if(comboCount === 4) text = '四杀 MULTI KILL';
  else if(comboCount === 3) text = '三杀 TRIPLE KILL';
  else if(comboCount === 2) text = '双杀 DOUBLE KILL';
  else return;

  el.textContent = text;
  el.style.opacity = 1;
  el.style.transform = 'translate(-50%,-50%) scale(1.4)';
  setTimeout(()=>{
    el.style.transform = 'translate(-50%,-50%) scale(1)';
  }, 100);
  setTimeout(()=>{
    el.style.opacity = 0;
    comboCount = 0;
  }, 1600);
}

function showDamageNumber(dmg, headshot){
  const el = document.createElement('div');
  el.className = 'dmg-num';
  el.textContent = Math.round(dmg) + (headshot ? ' 爆头!' : '');
  if(headshot) el.style.color = '#ff3333';
  el.style.left = (50 + (Math.random()-.5)*10) + '%';
  el.style.top = (45 + (Math.random()-.5)*8) + '%';
  el.style.position = 'absolute';
  document.getElementById('hud').appendChild(el);
  setTimeout(()=> el.remove(), 800);
}

/* --- 小地图：障碍 + 敌人（可见=亮红 / 不可见=暗红）+ 玩家朝向 --- */
function updateMinimap(){
  const c = document.getElementById('minimap-canvas');
  const g = c.getContext('2d');
  const w = c.width, h = c.height;
  g.clearRect(0,0,w,h);
  g.fillStyle = 'rgba(0,0,0,.7)';
  g.fillRect(0,0,w,h);

  const scale = w / (MAP_SIZE*2);
  const cx = w/2, cy = h/2;

  g.fillStyle = 'rgba(120,140,160,.7)';
  for(const b of colliders){
    const x = cx + b.min.x * scale;
    const y = cy + b.min.z * scale;
    const bw = (b.max.x - b.min.x) * scale;
    const bh = (b.max.z - b.min.z) * scale;
    g.fillRect(x, y, bw, bh);
  }

  for(const e of enemies){
    if(e.dead) continue;
    const x = cx + e.mesh.position.x * scale;
    const y = cy + e.mesh.position.z * scale;
    g.fillStyle = e.canSee ? '#ff3333' : '#663333';
    g.beginPath(); g.arc(x, y, 3, 0, 6.283); g.fill();
  }

  const px = cx + player.pos.x * scale;
  const py = cy + player.pos.z * scale;
  g.fillStyle = '#33ff66';
  g.beginPath(); g.arc(px, py, 4, 0, 6.283); g.fill();
  g.strokeStyle = '#33ff66';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(px, py);
  g.lineTo(px + Math.cos(yaw)*14, py + Math.sin(yaw)*14);
  g.stroke();
}
