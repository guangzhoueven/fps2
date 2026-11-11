/* ==================================================================
 *  武器操作 —— 射击 / 换弹 / 切枪 / 开镜（含战绩统计）
 * ================================================================== */
'use strict';

function shoot(){
  if(!isPlaying || player.isDead || player.reloading) return;
  const w = WEAPON_DATA[player.weapon];
  const now = performance.now();
  if(now < player.nextShot) return;

  /* 军刀：近战挥砍，射线检测 */
  if(player.weapon === 'knife'){
    player.nextShot = now + w.fireRate;
    snd('swing', .25);
    player.recoilOffset += .05;
    player.stats.shots++;

    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0,0), camera);
    ray.far = w.range;
    const targets = enemies.filter(e=>!e.dead).map(e=>e.mesh);
    const hits = ray.intersectObjects(targets, true);
    if(hits.length){
      for(const e of enemies){
        if(e.dead) continue;
        let obj = hits[0].object;
        while(obj && obj !== e.mesh) obj = obj.parent;
        if(obj === e.mesh){ player.stats.hits++; damageEnemy(e, w.damage, false); break; }
      }
    }
    updateHUD();
    return;
  }

  if(player.ammo[player.weapon] <= 0){
    snd('empty', .1);
    player.nextShot = now + 280;
    return;
  }

  player.ammo[player.weapon]--;
  player.nextShot = now + w.fireRate;
  player.recoilOffset += w.recoil;
  player.spread = Math.min(1, player.spread + .12);
  player.stats.shots++;

  snd('shot', player.weapon === 'awm' ? .7 : (player.weapon === 'deagle' ? .4 : .28));

  shakeTime = .06;
  shakeAmount = player.weapon === 'awm' ? .08 : .03;

  pitch += w.recoil * .8;
  pitch = Math.min(Math.PI/2 - .05, pitch);
  camera.rotation.x = pitch;

  spawnMuzzleFlash();
  spawnShell();

  /* 射线检测：命中敌人或墙面 */
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(0,0), camera);
  ray.far = w.range;

  const sp = player.spread * .06;
  ray.ray.direction.x += (Math.random()-.5) * sp;
  ray.ray.direction.y += (Math.random()-.5) * sp;
  ray.ray.direction.z += (Math.random()-.5) * sp;
  ray.ray.direction.normalize();

  const targets = [...enemies.filter(e=>!e.dead).map(e=>e.mesh), ...wallMeshes];
  const hits = ray.intersectObjects(targets, true);

  const muzzlePos = getMuzzleWorld();
  let enemyHit = null;

  if(hits.length){
    const hit = hits[0];
    for(const e of enemies){
      if(e.dead) continue;
      let obj = hit.object;
      while(obj && obj !== e.mesh) obj = obj.parent;
      if(obj === e.mesh){ enemyHit = e; break; }
    }

    if(enemyHit){
      const isHead = hit.point.y > enemyHit.mesh.position.y + 1.5;
      const dmg = w.damage * (isHead ? 2.5 : 1) * (.85 + Math.random()*.3);
      player.stats.hits++;
      damageEnemy(enemyHit, dmg, isHead);
      spawnBlood(hit.point);
    } else {
      spawnSpark(hit.point);
      if(hit.face) spawnBulletHole(hit.point, hit.face.normal);
    }
  }

  /* 弹道曳光：枪口 → 命中点（未命中则射向远方） */
  const end = hits.length
    ? hits[0].point.clone()
    : ray.ray.origin.clone().addScaledVector(ray.ray.direction, w.range * .6);
  spawnTracer(muzzlePos, end, 0xffee88, .05);

  player.spread *= .8;
  updateHUD();
}

/* ------------------------------------------------------------------
 *  开镜（仅 AWM 等带镜武器）
 * ------------------------------------------------------------------ */
function toggleScope(on){
  if(on && WEAPON_DATA[player.weapon].isScope){
    player.isScoped = true;
    camera.fov = 35;
    camera.updateProjectionMatrix();
    document.getElementById('scope').style.display = 'block';
    document.getElementById('crosshair').style.display = 'none';
  } else {
    player.isScoped = false;
    camera.fov = 75;
    camera.updateProjectionMatrix();
    document.getElementById('scope').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
  }
}

function reload(){
  if(!isPlaying || player.isDead || player.reloading) return;
  if(player.weapon === 'knife') return;
  const w = WEAPON_DATA[player.weapon];
  if(player.ammo[player.weapon] >= w.magSize) return;
  if(player.reserve[player.weapon] <= 0) return;

  player.reloading = true;
  document.getElementById('reload-hint').style.opacity = 1;
  snd('reload', .2);

  setTimeout(()=>{
    if(!player.reloading) return;
    const need = w.magSize - player.ammo[player.weapon];
    const take = Math.min(need, player.reserve[player.weapon]);
    player.ammo[player.weapon] += take;
    player.reserve[player.weapon] -= take;
    player.reloading = false;
    document.getElementById('reload-hint').style.opacity = 0;
    updateHUD();
  }, w.reloadTime);
}

function switchWeapon(key){
  if(!isPlaying || player.isDead) return;
  if(player.weapon === key) return;

  if(player.reloading){
    player.reloading = false;
    document.getElementById('reload-hint').style.opacity = 0;
  }

  if(player.isScoped) toggleScope(false);

  player.weapon = key;
  player.weaponSwitchAnim = 1;
  snd('switch', .12);

  if(currentWeaponModel) currentWeaponModel.visible = false;
  currentWeaponModel = weaponModels[key];
  currentWeaponModel.visible = true;

  updateHUD();
}
