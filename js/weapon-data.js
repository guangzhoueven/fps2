/* ==================================================================
 *  武器数据表
 * ================================================================== */
'use strict';

const WEAPON_DATA = {
  m4: { name: 'M4A1-雷神', damage: 33, fireRate: 95, magSize: 30, spread: 0.012, auto: true, reloadTime: 1500, range: 100, recoil: 0.018, isScope: false },
  deagle: { name: '沙漠之鹰-修罗', damage: 68, fireRate: 320, magSize: 7, spread: 0.02, auto: false, reloadTime: 1300, range: 80, recoil: 0.035, isScope: false },
  knife: { name: '尼泊尔军刀', damage: 100, fireRate: 420, magSize: 0, spread: 0, auto: false, reloadTime: 0, range: 3, recoil: 0, isScope: false },
  awm: { name: 'AWM-无影', damage: 130, fireRate: 1400, magSize: 5, spread: 0.002, auto: false, reloadTime: 2600, range: 200, recoil: 0.06, isScope: true }
};
