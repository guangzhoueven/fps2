/* ==================================================================
 *  敌人 —— 模型 / 生成 / AI / 碰撞 / 视线检测
 * ================================================================== */
'use strict';

/* ------------------------------------------------------------------
 *  视线检测：Ray-Box 相交，防止敌人隔墙开火、隔墙可见
 * ------------------------------------------------------------------ */
const _losRay = new THREE.Ray();
const _losDir = new THREE.Vector3();
const _losHit = new THREE.Vector3();

function hasLineOfSight(from, to){
  _losDir.subVectors(to, from);
  const dist = _losDir.length();
  if(dist < 0.01) return true;
  _losDir.normalize();
  _losRay.origin.copy(from);
  _losRay.direction.copy(_losDir);

  for(const box of colliders){
    if(_losRay.intersectBox(box, _losHit)){
      const hitDist = _losHit.distanceTo(from);
      // 如果墙在敌人和玩家之间（留 0.3 容差防止贴墙误判）
      if(hitDist < dist - 0.3) return false;
    }
  }
  return true;
}

/* ------------------------------------------------------------------
 *  敌人模型 —— 双手持枪、枪口发光
 * ------------------------------------------------------------------ */
function createEnemyModel(){
  const g = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: .8 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: .9 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .5 });
  const vestMat = new THREE.MeshStandardMaterial({ color: 0x2a3322, roughness: .8 });
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: .7, roughness: .4 });

  // 身体
  const body = new THREE.Mesh(new THREE.BoxGeometry(.5,.7,.3), clothMat);
  body.position.y = 1.15;
  body.castShadow = true;
  g.add(body);

  // 战术背心
  const vest = new THREE.Mesh(new THREE.BoxGeometry(.55,.42,.35), vestMat);
  vest.position.y = 1.18;
  vest.castShadow = true;
  g.add(vest);
  for(let i=-1;i<=1;i++){
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(.1,.12,.06), darkMat);
    pouch.position.set(i*.16, 1.08, .19);
    g.add(pouch);
  }

  // 头
  const head = new THREE.Mesh(new THREE.SphereGeometry(.16,16,16), skinMat);
  head.position.y = 1.65;
  head.castShadow = true;
  g.add(head);

  // 头盔
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(.18,16,16,0,Math.PI*2,0,Math.PI/2), darkMat);
  helmet.position.y = 1.68;
  helmet.castShadow = true;
  g.add(helmet);

  // 面罩（朝前，-Z 方向）
  const maskMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 1, roughness: .1 });
  const mask = new THREE.Mesh(new THREE.BoxGeometry(.26,.1,.06), maskMat);
  mask.position.set(0,1.63,-.15);
  g.add(mask);

  // 腿
  const legL = new THREE.Mesh(new THREE.BoxGeometry(.16,.7,.16), clothMat);
  legL.position.set(-.14,.35,0);
  legL.castShadow = true;
  g.add(legL);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(.16,.7,.16), clothMat);
  legR.position.set(.14,.35,0);
  legR.castShadow = true;
  g.add(legR);

  // 靴子
  const bootL = new THREE.Mesh(new THREE.BoxGeometry(.18,.15,.28), darkMat);
  bootL.position.set(-.14,.07,.04);
  g.add(bootL);
  const bootR = new THREE.Mesh(new THREE.BoxGeometry(.18,.15,.28), darkMat);
  bootR.position.set(.14,.07,.04);
  g.add(bootR);

  // 双臂向前伸出、双手持枪
  const armR = new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.5), clothMat);
  armR.position.set(.22, 1.32, -.15);
  armR.castShadow = true;
  g.add(armR);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.55), clothMat);
  armL.position.set(-.2, 1.28, -.22);
  armL.rotation.y = .32;
  armL.castShadow = true;
  g.add(armL);

  const handR = new THREE.Mesh(new THREE.SphereGeometry(.06,8,8), skinMat);
  handR.position.set(.22, 1.32, -.4);
  g.add(handR);

  const handL = new THREE.Mesh(new THREE.SphereGeometry(.06,8,8), skinMat);
  handL.position.set(-.02, 1.26, -.48);
  g.add(handL);

  // 步枪：横置于胸前，枪口朝 -Z（即面向玩家方向）
  const gun = new THREE.Mesh(new THREE.BoxGeometry(.07,.1,.38), gunMat);
  gun.position.set(.15, 1.32, -.35);
  g.add(gun);

  const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.3,8), gunMat);
  gunBarrel.rotation.x = Math.PI/2;
  gunBarrel.position.set(.15, 1.34, -.68);
  g.add(gunBarrel);

  const gunMag = new THREE.Mesh(new THREE.BoxGeometry(.04,.14,.08), gunMat);
  gunMag.position.set(.15, 1.2, -.32);
  gunMag.rotation.x = -.15;
  g.add(gunMag);

  const gunStock = new THREE.Mesh(new THREE.BoxGeometry(.05,.08,.15), gunMat);
  gunStock.position.set(.15, 1.3, -.1);
  g.add(gunStock);

  // 枪口发光点：让玩家一眼就能看到敌人手里有枪
  const muzzleGlow = new THREE.Mesh(
    new THREE.SphereGeometry(.04, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffaa33 })
  );
  muzzleGlow.position.set(.15, 1.34, -.86);
  g.add(muzzleGlow);
  g.userData.muzzleGlow = muzzleGlow;

  return g;
}

/* ------------------------------------------------------------------
 *  生成 / 更新
 * ------------------------------------------------------------------ */
function findSafeSpawnPos(minPlayerDist){
  let x, z, ok = false;
  const tries = minPlayerDist ? 80 : 50;
  for(let i=0;i<tries;i++){
    x = (Math.random()-.5) * (MAP_SIZE*1.7);
    z = (Math.random()-.5) * (MAP_SIZE*1.7);
    if(minPlayerDist && Math.hypot(x-player.pos.x, z-player.pos.z) < minPlayerDist) continue;
    if(!collidesEnemy(x, 0, z)){ ok = true; break; }
  }
  if(!ok){ x = 0; z = minPlayerDist ? 20 : -20; }
  return { x, z };
}

function spawnEnemy(){
  const { x, z } = findSafeSpawnPos(12);
  const mesh = createEnemyModel();
  mesh.position.set(x, 0, z);
  enemyGroup.add(mesh);
  enemies.push({
    mesh, hp: 100, maxHp: 100, dead: false, deadTime: 0,
    speed: 2 + Math.random()*1.2,
    fireCd: 1 + Math.random()*1.2,
    strafe: Math.random()<.5 ? 1 : -1,
    strafeTimer: 1 + Math.random()*1.5,
    hitFlash: 0,
    canSee: false,
    muzzleGlowBase: 1
  });
}

const _enemyChest = new THREE.Vector3();
const _playerChest = new THREE.Vector3();
const _muzzleWorld = new THREE.Vector3();

function updateEnemies(dt){
  for(const e of enemies){
    if(e.dead){
      e.deadTime += dt;
      e.mesh.rotation.x = Math.min(Math.PI/2, e.deadTime*4);
      if(e.deadTime > 5){
        const { x, z } = findSafeSpawnPos();
        e.mesh.position.set(x, 0, z);
        e.mesh.rotation.set(0, 0, 0);
        e.hp = e.maxHp;
        e.dead = false;
        e.deadTime = 0;
        e.fireCd = 1 + Math.random()*1.5;
      }
      continue;
    }

    if(e.hitFlash > 0){
      e.hitFlash -= dt;
      e.mesh.traverse(c=>{
        if(c.isMesh && c.material && c.material.emissive){
          c.material.emissive.setHex(e.hitFlash > 0 ? 0xff0000 : 0x000000);
        }
      });
    }

    const ePos = e.mesh.position;
    const dx = player.pos.x - ePos.x;
    const dz = player.pos.z - ePos.z;
    const dist = Math.hypot(dx, dz);

    // 用 lookAt 让敌人 -Z 轴（模型前方）面向玩家
    if(dist > 0.1){
      e.mesh.lookAt(player.pos.x, ePos.y, player.pos.z);
    }

    // 移动：朝玩家 + 随机侧向摇摆
    if(dist > 4.5 && dist < 35){
      const dirX = dx / dist;
      const dirZ = dz / dist;
      const spd = e.speed;

      let moveX = dirX * spd * dt;
      let moveZ = dirZ * spd * dt;

      e.strafeTimer -= dt;
      if(e.strafeTimer <= 0){
        e.strafe *= -1;
        e.strafeTimer = 1 + Math.random()*2;
      }
      const strafeAmt = .5;
      moveX += -dirZ * e.strafe * spd * dt * strafeAmt;
      moveZ += dirX * e.strafe * spd * dt * strafeAmt;

      if(!collidesEnemy(ePos.x + moveX, ePos.y, ePos.z)){
        ePos.x += moveX;
      }
      if(!collidesEnemy(ePos.x, ePos.y, ePos.z + moveZ)){
        ePos.z += moveZ;
      }
    }

    // 视线检测 + 开火
    _enemyChest.set(ePos.x, ePos.y + 1.32, ePos.z);
    _playerChest.set(player.pos.x, player.pos.y + 1.3, player.pos.z);
    const see = hasLineOfSight(_enemyChest, _playerChest);
    e.canSee = see;

    if(dist < 28 && dist > 1.5 && !player.isDead && see){
      e.fireCd -= dt;
      if(e.fireCd <= 0){
        e.fireCd = .8 + Math.random()*1.3;

        // 枪口世界坐标：从敌人胸口沿朝玩家方向前伸
        const fwdX = dx / dist, fwdZ = dz / dist;
        _muzzleWorld.set(ePos.x + fwdX * 0.9, 1.34, ePos.z + fwdZ * 0.9);

        // 枪口火焰
        spawnParticles(_muzzleWorld, 5, 0xffcc44, 2.5, .05, .06);
        const flashLight = new THREE.PointLight(0xffaa33, 2, 5);
        flashLight.position.copy(_muzzleWorld);
        scene.add(flashLight);
        setTimeout(()=> scene.remove(flashLight), 60);

        // 枪口发光点短暂变亮
        if(e.mesh.userData.muzzleGlow){
          e.mesh.userData.muzzleGlow.material.color.setHex(0xffffff);
          setTimeout(()=>{
            if(e.mesh && e.mesh.userData.muzzleGlow)
              e.mesh.userData.muzzleGlow.material.color.setHex(0xffaa33);
          }, 80);
        }

        snd('shot', .09 * Math.max(.15, 1 - dist/28));

        const acc = Math.max(.12, .45 - dist*.014);
        if(Math.random() < acc){
          damagePlayer(6 + Math.random()*7, Math.atan2(dx, dz));
        }
      }
    }
  }
}

/* 敌人圆柱体 vs AABB 碰撞检测 */
function collidesEnemy(x, y, z){
  const r = .4;
  const box = new THREE.Box3(
    new THREE.Vector3(x-r, y+.1, z-r),
    new THREE.Vector3(x+r, y+1.8, z+r)
  );
  for(const b of colliders) if(box.intersectsBox(b)) return true;
  return false;
}
