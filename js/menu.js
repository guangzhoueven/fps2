/* ==================================================================
 *  菜单 / 流程 —— 开始 / 死亡复活 / 胜利 / 暂停
 * ================================================================== */
'use strict';

function showMenu(title, btnText, winMsg, stateType){
  menuState = stateType || 'start';
  const menu = document.getElementById('menu');
  menu.classList.remove('hide');
  menu.querySelector('h1').textContent = title;
  document.getElementById('start-btn').textContent = btnText;
  document.getElementById('win-msg').textContent = winMsg || '';
}

/* 结算战绩文本 */
function statsText(){
  const s = player.stats;
  const acc = s.shots ? Math.round(s.hits / s.shots * 100) : 0;
  return '准确率 ' + acc + '% · 爆头 ' + s.headshots;
}

/* 死亡后复活：保留击杀数，重置血量弹药 */function respawnPlayer(){
  player.hp = 100;
  player.armor = 100;
  player.isDead = false;
  player.pos.copy(SAFE_SPAWN);
  player.vel.set(0, 0, 0);
  player.onGround = true;
  player.currentHeight = 1.7;
  player.ammo = { m4: 30, deagle: 7, knife: 0, awm: 5 };
  player.reserve = { m4: 120, deagle: 35, knife: 0, awm: 25 };
  player.grenades = 3;
  player.weapon = 'm4';
  player.isScoped = false;
  player.reloading = false;
  player.spread = 0;
  player.recoilOffset = 0;
  yaw = 0; pitch = 0;
  camera.rotation.set(0, 0, 0);
  camera.fov = 75;
  camera.updateProjectionMatrix();
  camera.position.set(SAFE_SPAWN.x, SAFE_SPAWN.y + 1.7, SAFE_SPAWN.z);

  for(const k in weaponModels) weaponModels[k].visible = false;
  weaponModels.m4.visible = true;
  currentWeaponModel = weaponModels.m4;
  weaponGroup.position.set(.18, -.16, -.35);
  weaponGroup.rotation.set(0, 0, 0);

  updateHUD();
}

/* 开新局：重置一切（分数 / 实体 / 特效） */
function resetGame(){
  player.hp = 100;
  player.armor = 100;
  player.kills = 0;
  player.deaths = 0;
  player.isDead = false;
  player.pos.copy(SAFE_SPAWN);
  player.vel.set(0, 0, 0);
  player.onGround = true;
  player.currentHeight = 1.7;
  player.ammo = { m4: 30, deagle: 7, knife: 0, awm: 5 };
  player.reserve = { m4: 120, deagle: 35, knife: 0, awm: 25 };
  player.grenades = 3;
  player.weapon = 'm4';
  player.isScoped = false;
  player.reloading = false;
  player.spread = 0;
  player.recoilOffset = 0;
  player.weaponSwitchAnim = 0;
  player.stats = { shots: 0, hits: 0, headshots: 0 };
  yaw = 0; pitch = 0;
  camera.rotation.set(0, 0, 0);
  camera.fov = 75;
  camera.updateProjectionMatrix();
  camera.position.set(SAFE_SPAWN.x, SAFE_SPAWN.y + 1.7, SAFE_SPAWN.z);

  for(const k in weaponModels) weaponModels[k].visible = false;
  weaponModels.m4.visible = true;
  currentWeaponModel = weaponModels.m4;
  weaponGroup.position.set(.18, -.16, -.35);
  weaponGroup.rotation.set(0, 0, 0);

  for(const e of enemies) enemyGroup.remove(e.mesh);
  enemies.length = 0;
  for(let i=0;i<5;i++) spawnEnemy();

  /* 特效与补给统一清理 */
  for(const g of grenades) scene.remove(g.mesh);
  grenades.length = 0;
  clearFx();
  clearPickups();
  pickupTimer = 6;

  comboCount = 0;
  updateHUD();
}

/* 隐藏菜单，锁定指针进入游戏 */
function enterGame(){
  initAudio();
  if(AC && AC.state === 'suspended') AC.resume();

  document.getElementById('menu').classList.add('hide');
  document.getElementById('crosshair').style.display = 'block';
  isPlaying = true;
  renderer.domElement.requestPointerLock();
}

/* 开始按钮：根据菜单状态决定是重开还是复活 */
document.getElementById('start-btn').addEventListener('click', ()=>{
  if(menuState === 'start' || menuState === 'win'){
    resetGame();
  } else if(menuState === 'dead'){
    respawnPlayer();
  }
  enterGame();
});

function winGame(){
  isPlaying = false;
  document.exitPointerLock();
  showMenu('W I N', '再 来 一 局', '击杀 ' + player.kills + ' 名敌人 · ' + statsText(), 'win');
}
