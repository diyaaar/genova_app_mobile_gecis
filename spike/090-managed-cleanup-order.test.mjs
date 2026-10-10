import test from 'node:test';
import assert from 'node:assert/strict';
import {requireManagedCleanupOrder} from './090-managed-cleanup-order.mjs';
const fixture=()=>({current:{status:'CURRENT_REAL_READ_FLOW_PASS_LEGACY_SUPPORT_OWNER_RETIRED'},
  legacy:{status:'OLD_LEGACY_ONLINE_REVOCATION_PASS_OFFLINE_AND_R2_COMPATIBILITY_FAIL'},
  invariants:{status:'POST_TEST_17_CATALOG_GROUPS_AND_PROTECTED_SOURCE_UNCHANGED',catalogGroups:17,noGrantRoleRlsTriggerSchemaRelaxation:true,recordedAt:'2026-10-10T06:00:02Z'},
  currentMtime:Date.parse('2026-10-10T06:00:00Z'),legacyMtime:Date.parse('2026-10-10T06:00:01Z')});
test('completed final audit after both receipts admits teardown',()=>assert.doesNotThrow(()=>requireManagedCleanupOrder(fixture())));
test('audit that predates either completed browser receipt is rejected',()=>{for(const k of ['currentMtime','legacyMtime']){const f=fixture();f[k]+=3000;assert.throws(()=>requireManagedCleanupOrder(f));}});
test('failed/missing/malformed final audit cannot admit cleanup',()=>{
  for(const mutation of [f=>f.invariants.status='FAIL',f=>f.invariants.catalogGroups=16,f=>f.invariants.recordedAt='invalid',f=>f.invariants.noGrantRoleRlsTriggerSchemaRelaxation=false]){
    const f=fixture();mutation(f);assert.throws(()=>requireManagedCleanupOrder(f));}
});
test('partial or failed current browser proof cannot admit cleanup',()=>{const f=fixture();f.current.status='FAIL_NOT_ACCEPTED';assert.throws(()=>requireManagedCleanupOrder(f));});
