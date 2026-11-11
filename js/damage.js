/* ==================================================================
 *  伤害 / 击杀
 * ================================================================== */
'use strict';

function damageEnemy(enemy, dmg, headshot){
  if(enemy.dead) return;
  enemy.hp -= dmg;
  enemy.hitFlash = .12;
  showHitmark(headshot);
  if(headshot) player.stats.headshots++;
  showDamageNumber(dmg, headshot);
  snd('hit', .12);

  if(enemy.hp <= 0){
    enemy.dead = true;
    enemy.deadTime = 0;
    player.kills++;
    addKillFeed('你 ▸ 敌人' + (headshot ? ' [爆头]' : ''));
    showCombo();
    snd('kill', .2);
    spawnBlood(enemy.mesh.position.clone().setY(1.2));
    updateHUD();
    if(player.kills >= KILL_TARGET && isPlaying) { winGame(); return; }
    /*
     * 难度递增：击杀数增加时提升场上敌人数量上限，
     * 不足则立即补一个新的活体（尸体 5 秒后还会再利用）
     */
    if(enemies.length < maxActiveEnemies()) spawnEnemy();
  }
}

function damagePlayer(dmg, angle){
  if(player.isDead) return;
  player.hp -= dmg;
  document.getElementById('damage').style.opacity = .8;
  setTimeout(()=> document.getElementById('damage').style.opacity = 0, 250);

  const dirEl = document.getElementById('dir-indicator');
  const rel = angle - yaw;
  dirEl.style.opacity = .9;
  dirEl.style.transform = `translate(-50%,-50%) rotate(${-rel}rad)`;
  setTimeout(()=> dirEl.style.opacity = 0, 400);

  if(player.hp <= 0){
    player.hp = 0;
    player.isDead = true;
    player.deaths++;
    isPlaying = false;
    document.exitPointerLock();
    showMenu('你 死 了', '重 新 复 活', statsText(), 'dead');
  }
  updateHUD();
}
