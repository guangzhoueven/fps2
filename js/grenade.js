/* ==================================================================
 *  手雷 —— 投掷 / 物理 / 爆炸
 * ================================================================== */
'use strict';

function throwGrenade(){
  if(!isPlaying || player.isDead) return;
  if(player.grenades <= 0) return;
  if(performance.now() < player.nextGrenade) return;

  player.grenades--;
  player.nextGrenade = performance.now() + 1000;

  const model = createGrenadeModel();
  const start = camera.position.clone();
  const fwd = new THREE.Vector3();
  camera.getWorldDirection(fwd);
  model.position.copy(start).add(fwd.clone().multiplyScalar(.5));
  scene.add(model);

  const vel = fwd.clone().multiplyScalar(20);
  vel.y += 5;

  grenades.push({ mesh: model, vel, timer: 3.0 });
  snd('throw', .15);
  updateHUD();
}

function updateGrenades(dt){
  for(let i=grenades.length-1;i>=0;i--){
    const g = grenades[i];
    g.timer -= dt;
    if(g.timer <= 0){ explodeGrenade(g); grenades.splice(i,1); continue; }

    g.vel.y -= 25 * dt;
    g.mesh.position.addScaledVector(g.vel, dt);
    g.mesh.rotation.x += g.vel.z * dt * 2;
    g.mesh.rotation.z += g.vel.x * dt * 2;

    if(g.mesh.position.y < .15){
      g.mesh.position.y = .15;
      g.vel.y *= -.4;
      g.vel.x *= .8;
      g.vel.z *= .8;
    }

    for(const b of colliders){
      if(b.containsPoint(g.mesh.position)){
        g.vel.multiplyScalar(-.5);
        g.mesh.position.addScaledVector(g.vel, dt*2);
        break;
      }
    }
  }
}

function explodeGrenade(g){
  const pos = g.mesh.position.clone();
  spawnParticles(pos, 80, 0xff5500, 15, .3, .8);
  spawnParticles(pos, 50, 0xffff00, 8, .15, .5);
  spawnParticles(pos, 30, 0x333333, 4, .4, 1.2);

  const light = new THREE.PointLight(0xff5500, 20, 25);
  light.position.copy(pos);
  scene.add(light);
  setTimeout(()=> scene.remove(light), 300);

  snd('explosion', .8);
  shakeTime = .5;
  shakeAmount = .35;

  const d = camera.position.distanceTo(pos);
  if(d < 12){
    const dmg = Math.max(10, 130 - d * 11);
    damagePlayer(dmg, Math.atan2(pos.z - player.pos.z, pos.x - player.pos.x));
  }

  /* 对敌人造成伤害（隔墙无效）；迭代副本，因为击杀可能触发补员 */
  const eChest = new THREE.Vector3();
  for(const e of [...enemies]){
    if(e.dead) continue;
    const ed = e.mesh.position.distanceTo(pos);
    eChest.set(e.mesh.position.x, e.mesh.position.y + 1.2, e.mesh.position.z);
    if(ed < 12 && hasLineOfSight(pos, eChest)){
      damageEnemy(e, Math.max(20, 160 - ed*14), false);
    }
  }

  scene.remove(g.mesh);
}
