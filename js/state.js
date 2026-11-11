/* ==================================================================
 *  全局状态（所有模块共享）
 * ================================================================== */
'use strict';

/* --- three.js 核心对象（initThree 中赋值） --- */
let scene, camera, renderer;
const clock = new THREE.Clock();

/* --- 游戏运行状态 --- */
let isPlaying = false;
let gameTime = 0;
let menuState = 'start';

/* --- 视角 --- */
let yaw = 0, pitch = 0;

/* --- 屏幕震动 --- */
let shakeTime = 0, shakeAmount = 0;

/* --- 输入 --- */
const keys = {};
let mouseDown = false;

/* --- 玩家 --- */
const player = {
  pos: SAFE_SPAWN.clone(),
  vel: new THREE.Vector3(),
  height: 1.7,
  crouchHeight: 1.0,
  currentHeight: 1.7,
  hp: 100, maxHp: 100,
  armor: 100,
  kills: 0, deaths: 0,
  isDead: false,
  onGround: true,
  weapon: 'm4',
  ammo:   { m4: 30, deagle: 7, knife: 0, awm: 5 },
  reserve:{ m4: 120, deagle: 35, knife: 0, awm: 25 },
  reloading: false,
  nextShot: 0,
  recoilOffset: 0,
  spread: 0,
  bobTime: 0, bobAmount: 0,
  grenades: 3,
  nextGrenade: 0,
  isScoped: false,
  isCrouching: false,
  stepAcc: 0,
  weaponSwitchAnim: 0,
  stats: { shots: 0, hits: 0, headshots: 0 }   // 战绩：开枪数/命中数/爆头数
};

/* --- 场景分组与模型容器 --- */
let weaponGroup, enemyGroup, grenadeGroup, particleGroup;
let currentWeaponModel = null;
const weaponModels = {};

/* --- 实体集合 --- */
const enemies = [];
const grenades = [];
const particles = [];
const shellCasings = [];
const bulletHoles = [];

/* --- 碰撞体 --- */
const colliders = [];
const wallMeshes = [];

/* --- 拾取物 --- */
const pickups = [];
let pickupTimer = 6;   // 首个补给 6 秒后刷新
