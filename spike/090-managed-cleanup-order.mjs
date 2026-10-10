import assert from 'node:assert/strict';
/** Final teardown cannot race a yielded/in-flight acceptance or catalogue audit. */
export function requireManagedCleanupOrder({current,legacy,invariants,currentMtime,legacyMtime}){
  assert.equal(current.status,'CURRENT_REAL_READ_FLOW_PASS_LEGACY_SUPPORT_OWNER_RETIRED');
  assert.equal(legacy.status,'OLD_LEGACY_ONLINE_REVOCATION_PASS_OFFLINE_AND_R2_COMPATIBILITY_FAIL');
  assert.equal(invariants.status,'POST_TEST_17_CATALOG_GROUPS_AND_PROTECTED_SOURCE_UNCHANGED');
  assert.equal(invariants.catalogGroups,17);assert.equal(invariants.noGrantRoleRlsTriggerSchemaRelaxation,true);
  const completed=Date.parse(invariants.recordedAt);
  assert(Number.isFinite(completed)&&Number.isFinite(currentMtime)&&Number.isFinite(legacyMtime));
  assert(completed>=Math.max(currentMtime,legacyMtime),'Final audit must finish after BOTH browser receipts are completely written');
}
