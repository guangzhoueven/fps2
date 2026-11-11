/* ==================================================================
 *  补给品 —— 定时刷新医疗包 / 弹药箱 / 手雷，靠近拾取
 * ================================================================== */
'use strict';

const PICKUP_EFFECT = {
  hp:      ()=>{ player.hp = Math.min(player.maxHp, player.hp + 50); },
  ammo:    ()=>{ player.reserve.m4 += 60; player.reserve.deagle += 14; player.reserve.awm += 10; },
  grenade: ()=>{ player.grenades = Math.min(5, player.grenades + 2); },
};

function spawnPickup(){
  let x = 0, z = -20;
  for(let i=0;i<40;i++){
    x = (Math.random()-.5) * MAP_SIZE*1.7;
    z = (Math.random()-.5) * MAP_SIZE*1.7;
    if(!collidesEnemy(x, 0, z)) break;
  }

  const r = Math.random();
  const type = r < .4 ? 'hp' : r < .8 ? 'ammo' : 'grenade';
  const g = new THREE.Group();

  if(type === 'hp'){
    /* 医疗包：红盒 + 白十字 */
    const box = new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.5),
      new THREE.MeshStandardMaterial({ color: 0xaa2222, emissive: 0x661111, emissiveIntensity: .4, roughness: .6 }));
    g.add(box);
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: .6 });
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(.34,.09,.03), crossMat);
    c1.position.set(0,.05,.26);
    g.add(c1);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(.09,.34,.03), crossMat);
    c2.position.set(0,.05,.26);
    g.add(c2);
  } else if(type === 'ammo'){
    /* 弹药箱：军绿盒 + 黄色条纹 */
    const box = new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.5),
      new THREE.MeshStandardMaterial({ color: 0x5a6b2f, emissive: 0x2a3314, emissiveIntensity: .4, roughness: .6 }));
    g.add(box);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0x998800, emissiveIntensity: .5 });
    for(let i=0;i<3;i++){
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.02), stripeMat);
      stripe.position.set(0, -.1 + i*.11, .26);
      g.add(stripe);
    }
  } else {
    /* 手雷：放大版手雷模型 */
    const nade = createGrenadeModel();
    nade.scale.setScalar(1.6);
    g.add(nade);
  }

  /* 地面光圈提示 */
  const ringColor = type === 'hp' ? 0x33ff66 : type === 'ammo' ? 0xffcc00 : 0x88ccff;
  const glow = new THREE.Mesh(
    new THREE.RingGeometry(.35, .6, 24),
    new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false })
  );
  glow.rotation.x = -Math.PI/2;
  g.add(glow);

  g.position.set(x, .45, z);
  g.userData.spin = Math.random()*6;
  scene.add(g);
  pickups.push({ type, mesh: g, life: 30 });
}

function updatePickups(dt){
  /* 定时刷新，场上最多同时 3 个 */
  pickupTimer -= dt;
  if(pickupTimer <= 0){
    pickupTimer = 10 + Math.random()*8;
    if(pickups.length < 3) spawnPickup();
  }

  for(let i=pickups.length-1;i>=0;i--){
    const p = pickups[i];
    p.life -= dt;

    /* 旋转 + 上下浮动 */
    p.mesh.userData.spin += dt*2;
    p.mesh.rotation.y = p.mesh.userData.spin;
    p.mesh.position.y = .45 + Math.sin(p.mesh.userData.spin*1.5)*.12;

    if(p.life <= 0){ scene.remove(p.mesh); pickups.splice(i,1); continue; }

    /* 靠近拾取 */
    const d = Math.hypot(player.pos.x - p.mesh.position.x, player.pos.z - p.mesh.position.z);
    if(d < 1.2){
      PICKUP_EFFECT[p.type]();
      updateHUD();
      snd('pickup', .3);
      spawnParticles(p.mesh.position.clone(), 14, 0xaaff66, 2.5, .06, .5);
      scene.remove(p.mesh);
      pickups.splice(i,1);
    }
  }
}

function clearPickups(){
  for(const p of pickups) scene.remove(p.mesh);
  pickups.length = 0;
}
