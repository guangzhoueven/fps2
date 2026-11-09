/* ==================================================================
 *  地图构建 —— 60×60 竞技场：围墙 + 障碍箱体 + 圆柱
 * ================================================================== */
'use strict';

/* 添加一个静态几何体并注册为碰撞体 */
function addStaticBox(w, h, d, x, y, z, mat, collide=true, cast=true){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if(collide){
    mesh.updateMatrixWorld(true);
    colliders.push(new THREE.Box3().setFromObject(mesh));
    wallMeshes.push(mesh);
  }
  return mesh;
}

function buildMap(){
  const floorMat = new THREE.MeshStandardMaterial({ map: TEX.floor, roughness: .9, metalness: .1 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(MAP_SIZE*2, MAP_SIZE*2), floorMat);
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughness: .85 });
  const woodMat = new THREE.MeshStandardMaterial({ map: TEX.wood, roughness: .9 });
  const metalMat = new THREE.MeshStandardMaterial({ map: TEX.metal, roughness: .5, metalness: .7 });

  /* 四面围墙 */
  addStaticBox(MAP_SIZE*2, WALL_HEIGHT, 1, 0, WALL_HEIGHT/2, -MAP_SIZE, wallMat);
  addStaticBox(MAP_SIZE*2, WALL_HEIGHT, 1, 0, WALL_HEIGHT/2,  MAP_SIZE, wallMat);
  addStaticBox(1, WALL_HEIGHT, MAP_SIZE*2, -MAP_SIZE, WALL_HEIGHT/2, 0, wallMat);
  addStaticBox(1, WALL_HEIGHT, MAP_SIZE*2,  MAP_SIZE, WALL_HEIGHT/2, 0, wallMat);

  /* 内部障碍布局 */
  const layout = [
    { w:5, h:3, d:5, x:0, z:0, mat:woodMat },
    { w:6, h:4, d:4, x:-10, z:-10, mat:wallMat },
    { w:6, h:4, d:4, x: 10, z:-10, mat:wallMat },
    { w:6, h:4, d:4, x:-10, z: 10, mat:wallMat },
    { w:6, h:4, d:4, x: 10, z: 10, mat:wallMat },
    { w:8, h:2.5, d:1, x:-15, z:0, mat:wallMat },
    { w:8, h:2.5, d:1, x: 15, z:0, mat:wallMat },
    { w:1, h:2.5, d:8, x:0, z:-15, mat:wallMat },
    { w:1, h:2.5, d:8, x:0, z: 15, mat:wallMat },
    { w:2, h:2, d:2, x:-4, z:-4, mat:woodMat },
    { w:2, h:2, d:2, x: 4, z:-4, mat:woodMat },
    { w:2, h:2, d:2, x:-4, z: 4, mat:woodMat },
    { w:2, h:2, d:2, x: 4, z: 4, mat:woodMat },
    { w:2, h:2, d:2, x:-8, z: 6, mat:woodMat },
    { w:2, h:2, d:2, x: 8, z:-6, mat:woodMat },
    { w:6, h:3, d:2.5, x:-18, z:-18, mat:metalMat },
    { w:6, h:3, d:2.5, x: 18, z: 18, mat:metalMat },
    { w:2.5, h:3, d:6, x: 18, z:-18, mat:metalMat },
    { w:2.5, h:3, d:6, x:-18, z: 18, mat:metalMat },
  ];
  layout.forEach(b=> addStaticBox(b.w, b.h, b.d, b.x, b.h/2, b.z, b.mat));

  /* 四根圆柱 */
  const pillarMat = new THREE.MeshStandardMaterial({ map: TEX.concrete, roughness: .7 });
  [[-6,-14],[6,-14],[-6,14],[6,14]].forEach(([x,z])=>{
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,WALL_HEIGHT,16), pillarMat);
    mesh.position.set(x, WALL_HEIGHT/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.updateMatrixWorld(true);
    colliders.push(new THREE.Box3().setFromObject(mesh));
    wallMeshes.push(mesh);
  });
}
