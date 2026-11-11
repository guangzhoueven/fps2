/* ==================================================================
 *  粒子 / 特效 —— 枪口火焰、血液、火花、弹孔、弹壳、弹道、手雷模型
 *  性能：弹壳/弹道/灯光全部池化，弹孔共享几何体
 * ================================================================== */
'use strict';

/* ------------------------------------------------------------------
 *  共享几何体 / 材质
 * ------------------------------------------------------------------ */
const _shellGeo = new THREE.CylinderGeometry(.008,.008,.03,6);
const _shellMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: .9, roughness: .2 });
const _shellFree = [];          // 弹壳对象池

const _holeGeo = new THREE.CircleGeometry(.06, 8);
const _holeMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .85, depthWrite: false });

const tracers = [];             // 活动中的弹道
const _tracerFree = [];         // 弹道 Line 池
const TRACER_MAX = 24;

/* 枪口灯光（池化复用） */
let _flashLight = null, _flashTimer = 0;

/* 取得当前武器枪口世界坐标 */
function getMuzzleWorld(){
  const mp = new THREE.Vector3();
  currentWeaponModel.userData.muzzle.getWorldPosition(mp);
  return mp;
}

/* ------------------------------------------------------------------
 *  粒子
 * ------------------------------------------------------------------ */
function spawnParticles(pos, count, color, speed, size, life){
  if(particles.length >= 120) return;   // 爆发数量上限，防止卡顿
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
  const mp = getMuzzleWorld();
  spawnParticles(mp, 6, 0xffcc44, 3, .06, .06);
  if(!_flashLight){
    _flashLight = new THREE.PointLight(0xffaa00, 3, 4);
    _flashLight.visible = false;
    scene.add(_flashLight);
  }
  _flashLight.position.copy(mp);
  _flashLight.visible = true;
  clearTimeout(_flashTimer);
  _flashTimer = setTimeout(()=> _flashLight.visible = false, 45);
}

function spawnBlood(pos){
  spawnParticles(pos, 10, 0xaa0000, 2, .05, .5);
  spawnParticles(pos, 5, 0x660000, 1.2, .07, .7);
}

function spawnSpark(pos){
  spawnParticles(pos, 6, 0xffcc44, 2, .025, .25);
}

/* 弹孔：共享几何体/材质，最多保留 60 个 */
function spawnBulletHole(pos, normal){
  const hole = new THREE.Mesh(_holeGeo, _holeMat);
  hole.position.copy(pos).add(normal.clone().multiplyScalar(.01));
  hole.lookAt(pos.clone().add(normal));
  scene.add(hole);
  bulletHoles.push(hole);
  if(bulletHoles.length > 60){
    scene.remove(bulletHoles.shift());
  }
}

/* 弹壳：对象池取用，寿命结束只隐藏不销毁 */
function spawnShell(){
  let mesh = _shellFree.pop();
  if(!mesh){
    mesh = new THREE.Mesh(_shellGeo, _shellMat);
    scene.add(mesh);
  }
  mesh.visible = true;
  mesh.position.copy(getMuzzleWorld());
  mesh.position.x += .1;
  const vel = new THREE.Vector3(.8 + Math.random()*.5, 1.5 + Math.random()*.5, (Math.random()-.5)*.5).normalize().multiplyScalar(2.5);
  shellCasings.push({ mesh, vel, life: 2 });
}

/* ------------------------------------------------------------------
 *  弹道曳光：从枪口到命中点的发光细线
 * ------------------------------------------------------------------ */
function spawnTracer(from, to, color, life){
  if(tracers.length >= TRACER_MAX){
    const old = tracers.shift();
    old.mesh.visible = false;
    _tracerFree.push(old.mesh);
  }
  let mesh = _tracerFree.pop();
  if(!mesh){
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    mesh = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75, depthWrite: false }));
    particleGroup.add(mesh);
  }
  const arr = mesh.geometry.attributes.position.array;
  arr[0]=from.x; arr[1]=from.y; arr[2]=from.z;
  arr[3]=to.x;   arr[4]=to.y;   arr[5]=to.z;
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.material.color.setHex(color);
  mesh.material.opacity = .75;
  mesh.visible = true;
  tracers.push({ mesh, life, maxLife: life });
}

/* ------------------------------------------------------------------
 *  手雷模型
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
 *  每帧更新：粒子 + 弹壳 + 弹道
 * ------------------------------------------------------------------ */
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
    if(s.life <= 0){
      s.mesh.visible = false;
      _shellFree.push(s.mesh);
      shellCasings.splice(i,1);
      continue;
    }
    s.vel.y -= 20 * dt;
    s.mesh.position.addScaledVector(s.vel, dt);
    s.mesh.rotation.x += dt*12;
    s.mesh.rotation.z += dt*12;
    if(s.mesh.position.y < .02){ s.mesh.position.y = .02; s.vel.y *= -.3; }
  }

  for(let i=tracers.length-1;i>=0;i--){
    const t = tracers[i];
    t.life -= dt;
    if(t.life <= 0){
      t.mesh.visible = false;
      _tracerFree.push(t.mesh);
      tracers.splice(i,1);
      continue;
    }
    t.mesh.material.opacity = .75 * t.life / t.maxLife;
  }
}

/* 一局重置：清空所有临时特效实体 */
function clearFx(){
  for(const p of particles) particleGroup.remove(p.mesh);
  particles.length = 0;

  for(const t of tracers){
    t.mesh.visible = false;
    particleGroup.remove(t.mesh);
    _tracerFree.push(t.mesh);
  }
  tracers.length = 0;

  for(const s of shellCasings){
    s.mesh.visible = false;
    _shellFree.push(s.mesh);
  }
  shellCasings.length = 0;

  for(const b of bulletHoles) scene.remove(b);
  bulletHoles.length = 0;
}
