/* ==================================================================
 *  粒子 / 特效 —— 枪口火焰、血液、火花、弹孔、弹壳、手雷模型
 * ================================================================== */
'use strict';

/* 生成一组简单粒子（Points），带随机速度 */
function spawnParticles(pos, count, color, speed, size, life){
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count*3);
  const vels = [];
  for(let i=0;i<count;i++){
    positions[i*3] = pos.x;
    positions[i*3+1] = pos.y;
    positions[i*3+2] = pos.z;
    vels.push(new THREE.Vector3(
      (Math.random()-.5)*speed,
      (Math.random()-.5)*speed + speed*.2,
      (Math.random()-.5)*speed
    ));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 1, depthWrite: false });
  const pts = new THREE.Points(geo, mat);
  particleGroup.add(pts);
  particles.push({ mesh: pts, vels, life, maxLife: life });
}

function spawnMuzzleFlash(){
  const mp = new THREE.Vector3();
  currentWeaponModel.userData.muzzle.getWorldPosition(mp);
  spawnParticles(mp, 6, 0xffcc44, 3, .06, .06);
  const light = new THREE.PointLight(0xffaa00, 3, 4);
  light.position.copy(mp);
  scene.add(light);
  setTimeout(()=> scene.remove(light), 50);
}

function spawnBlood(pos){
  spawnParticles(pos, 10, 0xaa0000, 2, .05, .5);
  spawnParticles(pos, 5, 0x660000, 1.2, .07, .7);
}

function spawnSpark(pos){
  spawnParticles(pos, 6, 0xffcc44, 2, .025, .25);
}

function spawnBulletHole(pos, normal){
  const geo = new THREE.CircleGeometry(.06, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .85, depthWrite: false });
  const hole = new THREE.Mesh(geo, mat);
  hole.position.copy(pos).add(normal.clone().multiplyScalar(.01));
  hole.lookAt(pos.clone().add(normal));
  scene.add(hole);
  bulletHoles.push(hole);
  if(bulletHoles.length > 60){
    const old = bulletHoles.shift();
    scene.remove(old);
  }
}

function createGrenadeModel(){
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d4c1e, metalness: .3, roughness: .7 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: .9, roughness: .2 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(.12,16,16), bodyMat);
  body.scale.y = 1.2;
  body.castShadow = true;
  g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.07,8), metalMat);
  top.position.y = .15;
  g.add(top);
  const pin = new THREE.Mesh(new THREE.TorusGeometry(.04,.01,8,16), metalMat);
  pin.position.set(.06,.15,0);
  pin.rotation.y = Math.PI/2;
  g.add(pin);
  const lever = new THREE.Mesh(new THREE.BoxGeometry(.04,.02,.06), metalMat);
  lever.position.set(.06,.15,.04);
  g.add(lever);
  return g;
}

/* 每帧更新：粒子 + 弹壳 */
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.life -= dt;
    if(p.life <= 0){
      particleGroup.remove(p.mesh);
      particles.splice(i,1);
      continue;
    }
    const pos = p.mesh.geometry.attributes.position.array;
    for(let j=0;j<p.vels.length;j++){
      const v = p.vels[j];
      v.y -= 9.8 * dt;
      pos[j*3] += v.x * dt;
      pos[j*3+1] += v.y * dt;
      pos[j*3+2] += v.z * dt;
      if(pos[j*3+1] < 0){ pos[j*3+1] = 0; v.y *= -.3; }
    }
    p.mesh.geometry.attributes.position.needsUpdate = true;
    p.mesh.material.opacity = p.life / p.maxLife;
  }

  for(let i=shellCasings.length-1;i>=0;i--){
    const s = shellCasings[i];
    s.life -= dt;
    if(s.life <= 0){ scene.remove(s.mesh); shellCasings.splice(i,1); continue; }
    s.vel.y -= 20 * dt;
    s.mesh.position.addScaledVector(s.vel, dt);
    s.mesh.rotation.x += dt*12;
    s.mesh.rotation.z += dt*12;
    if(s.mesh.position.y < .02){ s.mesh.position.y = .02; s.vel.y *= -.3; }
  }
}
