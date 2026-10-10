import assert from 'node:assert/strict';
/** Require actual endpoint isolation, not only a stale HostConfig mode string. */
export function requireNetworkNone(target,image){
  assert.equal(target.Config.Image,image);assert.equal(target.HostConfig.NetworkMode,'none');
  assert.equal(target.Mounts.length,0);assert.equal(Object.keys(target.HostConfig.PortBindings||{}).length,0);
  assert.deepEqual(Object.keys(target.NetworkSettings?.Networks||{}),['none'],'Actual none endpoint required');
}
