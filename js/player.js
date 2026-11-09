/* ==================================================================
 *  玩家 —— 碰撞 / 移动 / 姿态 / 武器摆动
 * ================================================================== */
'use strict';

/* 玩家 AABB 碰撞检测 */
function collides(x, y, z, h){
  const r = .35;
  const box = new THREE.Box3(
    new THREE.Vector3(x-r, y+.1, z-r),
    new THREE.Vector3(x+r, y+h-.1, z+r)
  );
  for(const b of colliders) if(box.intersectsBox(b)) return true;
  return false;
}

function updatePlayer(dt){
  if(player.isDead) return;

  /* 卡进障碍物时回出生点 */
  if(collides(player.pos.x, player.pos.y, player.pos.z, player.currentHeight)){
    player.pos.copy(SAFE_SPAWN);
    player.vel.set(0, 0, 0);
  }

  player.isCrouching = !!(keys['KeyC'] || keys['ControlLeft']);
  const targetH = player.isCrouching ? player.crouchHeight : player.height;
  player.currentHeight += (targetH - player.currentHeight) * Math.min(1, dt*12);

  const sinY = Math.sin(yaw), cosY = Math.cos(yaw);
  const fwd = new THREE.Vector3(-sinY, 0, -cosY);
  const right = new THREE.Vector3(cosY, 0, -sinY);

  let ix = 0, iz = 0;
  if(keys['KeyW']) iz += 1;
  if(keys['KeyS']) iz -= 1;
  if(keys['KeyA']) ix -= 1;
  if(keys['KeyD']) ix += 1;

  const moveDir = new THREE.Vector3();
  moveDir.addScaledVector(fwd, iz);
  moveDir.addScaledVector(right, ix);
  if(moveDir.lengthSq() > 0) moveDir.normalize();

  let speed = 4.5;
  if(keys['ShiftLeft']) speed = 7.2;
  if(player.isCrouching) speed = 2.4;
  if(player.isScoped) speed *= .4;

  const targetVX = moveDir.x * speed;
  const targetVZ = moveDir.z * speed;
  const accel = player.onGround ? 14 : 4;
  player.vel.x += (targetVX - player.vel.x) * Math.min(1, dt*accel);
  player.vel.z += (targetVZ - player.vel.z) * Math.min(1, dt*accel);

  if(!player.onGround) player.vel.y -= 25 * dt;
  if(keys['Space'] && player.onGround){
    player.vel.y = 7.5;
    player.onGround = false;
  }

  /* 分轴移动 + 碰撞 */
  const h = player.currentHeight;
  const nx = player.pos.x + player.vel.x * dt;
  if(!collides(nx, player.pos.y, player.pos.z, h)) player.pos.x = nx;
  else player.vel.x = 0;

  const nz = player.pos.z + player.vel.z * dt;
  if(!collides(player.pos.x, player.pos.y, nz, h)) player.pos.z = nz;
  else player.vel.z = 0;

  const ny = player.pos.y + player.vel.y * dt;
  if(!collides(player.pos.x, ny, player.pos.z, h)){
    player.pos.y = ny;
    if(player.vel.y < 0 && ny <= 0){
      player.pos.y = 0;
      player.vel.y = 0;
      player.onGround = true;
    }
  } else {
    if(player.vel.y < 0) player.onGround = true;
    player.vel.y = 0;
  }

  if(player.pos.y <= 0){
    player.pos.y = 0;
    if(player.vel.y < 0) player.vel.y = 0;
    player.onGround = true;
  }

  /* 脚步声 */
  if(player.onGround && (Math.abs(player.vel.x) > .5 || Math.abs(player.vel.z) > .5)){
    player.stepAcc += Math.hypot(player.vel.x, player.vel.z) * dt;
    if(player.stepAcc > 2){
      player.stepAcc = 0;
      snd('step', .06);
    }
  }

  camera.position.set(player.pos.x, player.pos.y + player.currentHeight, player.pos.z);

  if(mouseDown && WEAPON_DATA[player.weapon].auto) shoot();

  player.spread += (0 - player.spread) * Math.min(1, dt*6);
  player.recoilOffset += (0 - player.recoilOffset) * Math.min(1, dt*9);
}

/* 第一人称武器组的摆动 / 后坐 / 切枪动画 */
function updateWeapon(dt){
  const isMoving = player.onGround && (Math.abs(player.vel.x) > .5 || Math.abs(player.vel.z) > .5);
  const bobSpeed = isMoving ? (keys['ShiftLeft'] ? 14 : 9) : 2;
  player.bobTime += dt * bobSpeed;
  player.bobAmount += ((isMoving ? 1 : 0) - player.bobAmount) * Math.min(1, dt*7);

  const bx = Math.cos(player.bobTime) * .012 * player.bobAmount;
  const by = Math.sin(player.bobTime*2) * .008 * player.bobAmount;

  if(player.weaponSwitchAnim > 0) player.weaponSwitchAnim -= dt*4;
  const switchDrop = Math.max(0, player.weaponSwitchAnim) * .35;

  let tx = .18, ty = -.16, tz = -.35;
  if(player.isScoped){ tx = 0; ty = -.06; tz = -.3; }

  weaponGroup.position.x += (tx + bx - weaponGroup.position.x) * Math.min(1, dt*15);
  weaponGroup.position.y += (ty + by - switchDrop - weaponGroup.position.y) * Math.min(1, dt*15);
  weaponGroup.position.z += (tz + player.recoilOffset*.1 - weaponGroup.position.z) * Math.min(1, dt*20);
  weaponGroup.rotation.x += (player.recoilOffset*.3 - weaponGroup.rotation.x) * Math.min(1, dt*20);

  if(player.weapon === 'knife' && player.recoilOffset > 0.01){
    weaponGroup.rotation.z = -player.recoilOffset * 3;
    weaponGroup.rotation.x = -player.recoilOffset * 2;
  } else {
    weaponGroup.rotation.z += (0 - weaponGroup.rotation.z) * Math.min(1, dt*12);
  }
}
