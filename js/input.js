/* ==================================================================
 *  输入 —— 鼠标视角 / 开火 / 开镜 / 键盘
 * ================================================================== */
'use strict';

document.addEventListener('mousemove', (e)=>{
  if(!isPlaying || document.pointerLockElement !== renderer.domElement) return;
  const sens = 0.0022 * (player.isScoped ? 0.45 : 1);
  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, pitch));
  camera.rotation.set(pitch, yaw, 0);
});

document.addEventListener('mousedown', (e)=>{
  if(!isPlaying || document.pointerLockElement !== renderer.domElement) return;
  if(e.button === 0){
    mouseDown = true;
    shoot();
  }
  if(e.button === 2) toggleScope(true);
});

document.addEventListener('mouseup', (e)=>{
  if(e.button === 0) mouseDown = false;
  if(e.button === 2 && player.isScoped) toggleScope(false);
});

document.addEventListener('contextmenu', e=> e.preventDefault());

document.addEventListener('keydown', (e)=>{
  keys[e.code] = true;
  if(!isPlaying) return;

  if(e.code === 'KeyR') reload();
  if(e.code === 'KeyG') throwGrenade();
  if(e.code === 'Digit1') switchWeapon('m4');
  if(e.code === 'Digit2') switchWeapon('deagle');
  if(e.code === 'Digit3') switchWeapon('knife');
  if(e.code === 'Digit4') switchWeapon('awm');
  if(e.code === 'Space') e.preventDefault();
});

document.addEventListener('keyup', (e)=>{
  keys[e.code] = false;
});

/* 窗口失焦时清空按键，防止切走后移动/开火卡死 */
addEventListener('blur', ()=>{
  for(const k in keys) keys[k] = false;
  mouseDown = false;
});

/* 退出指针锁（按 ESC）时进入暂停菜单 */
document.addEventListener('pointerlockchange', ()=>{
  if(document.pointerLockElement !== renderer.domElement && isPlaying){
    isPlaying = false;
    if(!player.isDead){
      showMenu('暂 停', '继 续 战 斗', '', 'pause');
    }
  }
});
