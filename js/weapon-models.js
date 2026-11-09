/* ==================================================================
 *  第一人称武器模型 —— 纯几何体拼装，挂在相机子节点
 * ================================================================== */
'use strict';

function buildM4Model(){
  const g = new THREE.Group();
  const matMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: .85, roughness: .35 });
  const matDark  = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: .5, roughness: .6 });
  const matGrip  = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: .2, roughness: .9 });

  const receiver = new THREE.Mesh(new THREE.BoxGeometry(.08,.12,.42), matMetal);
  receiver.position.z = -.2;
  g.add(receiver);

  const rail = new THREE.Mesh(new THREE.BoxGeometry(.06,.02,.36), matDark);
  rail.position.set(0,.08,-.2);
  g.add(rail);
  for(let i=0;i<8;i++){
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(.065,.015,.015), matDark);
    tooth.position.set(0,.09,-.34+i*.045);
    g.add(tooth);
  }

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.32,10), matDark);
  barrel.rotation.x = Math.PI/2;
  barrel.position.set(0,.02,-.52);
  g.add(barrel);

  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.06,10), matMetal);
  muzzle.rotation.x = Math.PI/2;
  muzzle.position.set(0,.02,-.68);
  g.add(muzzle);

  const handguard = new THREE.Mesh(new THREE.BoxGeometry(.065,.065,.26), matGrip);
  handguard.position.set(0,.01,-.38);
  g.add(handguard);
  for(let i=0;i<5;i++){
    const vent = new THREE.Mesh(new THREE.BoxGeometry(.07,.012,.02), matDark);
    vent.position.set(0,.01,-.48+i*.05);
    g.add(vent);
  }

  const mag = new THREE.Mesh(new THREE.BoxGeometry(.045,.17,.09), matDark);
  mag.position.set(0,-.13,-.16);
  mag.rotation.x = -.15;
  g.add(mag);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(.045,.11,.065), matGrip);
  grip.position.set(0,-.1,.02);
  grip.rotation.x = .35;
  g.add(grip);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(.05,.09,.22), matGrip);
  stock.position.set(0,-.02,.18);
  g.add(stock);
  const butt = new THREE.Mesh(new THREE.BoxGeometry(.05,.12,.04), matDark);
  butt.position.set(0,-.02,.31);
  g.add(butt);

  const sight = new THREE.Mesh(new THREE.BoxGeometry(.03,.05,.08), matDark);
  sight.position.set(0,.11,-.22);
  g.add(sight);

  const muzzlePoint = new THREE.Object3D();
  muzzlePoint.position.set(0,.02,-.72);
  g.add(muzzlePoint);
  g.userData.muzzle = muzzlePoint;

  return g;
}

function buildDeagleModel(){
  const g = new THREE.Group();
  const matSilver = new THREE.MeshStandardMaterial({ color: 0xbfc4cc, metalness: .95, roughness: .2 });
  const matDark   = new THREE.MeshStandardMaterial({ color: 0x222428, metalness: .6, roughness: .5 });
  const matGrip   = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, metalness: .3, roughness: .8 });

  const slide = new THREE.Mesh(new THREE.BoxGeometry(.075,.085,.32), matSilver);
  slide.position.set(0,.03,-.16);
  g.add(slide);
  for(let i=0;i<6;i++){
    const groove = new THREE.Mesh(new THREE.BoxGeometry(.078,.06,.008), matDark);
    groove.position.set(0,.03,-.06-i*.03);
    g.add(groove);
  }

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.26,12), matSilver);
  barrel.rotation.x = Math.PI/2;
  barrel.position.set(0,.04,-.42);
  g.add(barrel);
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,.03,12), matDark);
  muzzle.rotation.x = Math.PI/2;
  muzzle.position.set(0,.04,-.56);
  g.add(muzzle);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(.06,.16,.075), matGrip);
  grip.position.set(0,-.1,.04);
  grip.rotation.x = .28;
  g.add(grip);

  const guard = new THREE.Mesh(new THREE.TorusGeometry(.035,.008,8,16,Math.PI), matDark);
  guard.rotation.z = Math.PI;
  guard.position.set(0,-.02,-.04);
  g.add(guard);

  const sight = new THREE.Mesh(new THREE.BoxGeometry(.02,.02,.02), matDark);
  sight.position.set(0,.085,-.06);
  g.add(sight);

  const muzzlePoint = new THREE.Object3D();
  muzzlePoint.position.set(0,.04,-.6);
  g.add(muzzlePoint);
  g.userData.muzzle = muzzlePoint;

  return g;
}

function buildKnifeModel(){
  const g = new THREE.Group();
  const matSteel = new THREE.MeshStandardMaterial({ color: 0xdde4ee, metalness: 1, roughness: .15 });
  const matGrip  = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: .8 });
  const matGuard = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: .8, roughness: .3 });

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.lineTo(.04, -.05);
  bladeShape.lineTo(.05, -.35);
  bladeShape.lineTo(.02, -.42);
  bladeShape.lineTo(-.02, -.35);
  bladeShape.lineTo(-.03, -.05);
  bladeShape.closePath();
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: .01, bevelEnabled: false });
  const blade = new THREE.Mesh(bladeGeo, matSteel);
  blade.rotation.x = Math.PI/2;
  blade.position.set(0,.02,-.08);
  g.add(blade);

  const groove = new THREE.Mesh(new THREE.BoxGeometry(.008,.008,.3), matSteel);
  groove.position.set(0,.01,-.25);
  g.add(groove);

  const guard = new THREE.Mesh(new THREE.BoxGeometry(.08,.02,.03), matGuard);
  guard.position.set(0,0,-.06);
  g.add(guard);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(.035,.04,.14), matGrip);
  grip.position.set(0,-.01,.02);
  g.add(grip);
  for(let i=0;i<4;i++){
    const wrap = new THREE.Mesh(new THREE.BoxGeometry(.037,.045,.01), matGrip);
    wrap.position.set(0,-.01,-.03+i*.035);
    g.add(wrap);
  }

  const muzzlePoint = new THREE.Object3D();
  muzzlePoint.position.set(0,0,-.3);
  g.add(muzzlePoint);
  g.userData.muzzle = muzzlePoint;

  return g;
}

function buildAWM(){
  const g = new THREE.Group();
  const matGreen = new THREE.MeshStandardMaterial({ color: 0x1a2a1c, metalness: .3, roughness: .7 });
  const matDark  = new THREE.MeshStandardMaterial({ color: 0x0d130e, metalness: .6, roughness: .4 });
  const matScope = new THREE.MeshStandardMaterial({ color: 0x111811, metalness: .8, roughness: .3 });
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x3399cc, metalness: .9, roughness: .05, emissive: 0x113355, emissiveIntensity: .5 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(.09,.13,.5), matGreen);
  body.position.z = -.15;
  g.add(body);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.5,12), matDark);
  barrel.rotation.x = Math.PI/2;
  barrel.position.set(0,.02,-.6);
  g.add(barrel);

  const brake = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.1,12), matDark);
  brake.rotation.x = Math.PI/2;
  brake.position.set(0,.02,-.88);
  g.add(brake);
  for(let i=0;i<3;i++){
    const port = new THREE.Mesh(new THREE.BoxGeometry(.08,.02,.015), matDark);
    port.position.set(0,.02,-.92+i*.03);
    g.add(port);
  }

  const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.3,16), matScope);
  scopeBody.rotation.x = Math.PI/2;
  scopeBody.position.set(0,.12,-.12);
  g.add(scopeBody);
  const lens1 = new THREE.Mesh(new THREE.CircleGeometry(.038,16), matGlass);
  lens1.position.set(0,.12,-.27);
  g.add(lens1);
  const lens2 = new THREE.Mesh(new THREE.CircleGeometry(.038,16), matGlass);
  lens2.rotation.y = Math.PI;
  lens2.position.set(0,.12,.03);
  g.add(lens2);
  for(const z of [-.04,-.2]){
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.05,.008,8,16), matDark);
    ring.position.set(0,.12,z);
    g.add(ring);
  }

  const mag = new THREE.Mesh(new THREE.BoxGeometry(.05,.15,.1), matDark);
  mag.position.set(0,-.13,-.05);
  g.add(mag);

  const grip = new THREE.Mesh(new THREE.BoxGeometry(.05,.11,.07), matGreen);
  grip.position.set(0,-.1,.08);
  grip.rotation.x = .3;
  g.add(grip);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(.06,.1,.28), matGreen);
  stock.position.set(0,-.02,.25);
  g.add(stock);

  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.08,8), matDark);
  bolt.rotation.z = Math.PI/2;
  bolt.position.set(.08,.02,.02);
  g.add(bolt);
  const boltHandle = new THREE.Mesh(new THREE.SphereGeometry(.02,8,8), matDark);
  boltHandle.position.set(.14,.02,.02);
  g.add(boltHandle);

  const muzzlePoint = new THREE.Object3D();
  muzzlePoint.position.set(0,.02,-.95);
  g.add(muzzlePoint);
  g.userData.muzzle = muzzlePoint;

  return g;
}

/* 创建全部四种武器模型，加入相机下的武器组 */
function buildAllWeaponModels(){
  weaponGroup = new THREE.Group();
  camera.add(weaponGroup);
  scene.add(camera);

  weaponModels.m4 = buildM4Model();
  weaponModels.deagle = buildDeagleModel();
  weaponModels.knife = buildKnifeModel();
  weaponModels.awm = buildAWM();

  for(const k in weaponModels){
    weaponModels[k].visible = false;
    weaponGroup.add(weaponModels[k]);
  }
  weaponModels.m4.visible = true;
  currentWeaponModel = weaponModels.m4;

  weaponGroup.position.set(.18, -.16, -.35);
}
