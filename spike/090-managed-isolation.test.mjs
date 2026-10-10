import test from 'node:test';
import assert from 'node:assert/strict';
import {requireNetworkNone} from './090-managed-isolation.mjs';
const fixture=()=>({Config:{Image:'fixed'},HostConfig:{NetworkMode:'none',PortBindings:{}},Mounts:[],NetworkSettings:{Networks:{none:{}}}});
test('accept exact network-none endpoint only',()=>assert.doesNotThrow(()=>requireNetworkNone(fixture(),'fixed')));
test('stale none HostConfig cannot conceal attached internal bridge',()=>{const t=fixture();t.NetworkSettings.Networks={internal:{}};assert.throws(()=>requireNetworkNone(t,'fixed'));});
test('reject none plus any extra network',()=>{const t=fixture();t.NetworkSettings.Networks.bridge={};assert.throws(()=>requireNetworkNone(t,'fixed'));});
test('reject image, mount, published port or missing endpoint drift',()=>{
  for(const mutate of [t=>t.Config.Image='other',t=>t.Mounts.push({}),t=>t.HostConfig.PortBindings={'5432/tcp':[]},t=>t.NetworkSettings.Networks={}]){
    const t=fixture();mutate(t);assert.throws(()=>requireNetworkNone(t,'fixed'));}
});
