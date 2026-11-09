/* ==================================================================
 *  three.js 场景 / 相机 / 渲染器初始化
 * ================================================================== */
'use strict';

function initThree(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c12);
  scene.fog = new THREE.Fog(0x0a0c12, 20, 70);

  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.05, 500);
  camera.rotation.order = 'YXZ';
  camera.position.set(SAFE_SPAWN.x, SAFE_SPAWN.y + 1.7, SAFE_SPAWN.z);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('game').appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x556677, 0.5));

  const sun = new THREE.DirectionalLight(0xffeedd, 0.9);
  sun.position.set(20, 35, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  scene.add(new THREE.HemisphereLight(0xaaccff, 0x223344, 0.6));

  enemyGroup = new THREE.Group();
  grenadeGroup = new THREE.Group();
  particleGroup = new THREE.Group();
  scene.add(enemyGroup, grenadeGroup, particleGroup);

  buildTextures();
  buildMap();
  buildAllWeaponModels();

  addEventListener('resize', onResize);
}

function onResize(){
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
