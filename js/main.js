/* ==================================================================
 *  入口 —— 主循环 + 启动
 * ================================================================== */
'use strict';

let minimapAcc = 0;

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());

  if(isPlaying){
    gameTime += dt;
    updatePlayer(dt);
    updateEnemies(dt);
    updateGrenades(dt);
    updateParticles(dt);
    updatePickups(dt);
    updateWeapon(dt);

    /* 小地图按 0.08s 节流刷新，减轻 DOM 绘制压力 */
    minimapAcc += dt;
    if(minimapAcc >= .08){
      minimapAcc = 0;
      updateMinimap();
    }

    if(comboTimer > 0){
      comboTimer -= dt;
      if(comboTimer <= 0) comboCount = 0;
    }
  }

  if(shakeTime > 0){
    shakeTime -= dt;
    const s = shakeAmount * (shakeTime / .5);
    camera.position.x += (Math.random()-.5) * s;
    camera.position.y += (Math.random()-.5) * s;
  }

  renderer.render(scene, camera);
}

/* 启动 */
initThree();
animate();
