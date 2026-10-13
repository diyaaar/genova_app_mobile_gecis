// Owner's 9 October scoped waiver of the usual 10 GiB floor, not a global policy.
export function selectAttempt(value){
  if(value===undefined)return '20261009-fidelity';
  if(!['20261009-fidelity','20261009-compatibility','20261010-managed-web','20261010-managed-final','20261010-managed-families','20261013-managed-families'].includes(value))throw Error('Unknown scoped attempt refused');
  return value;
}
export const ATTEMPT=selectAttempt(process.env.GENOVA_090_ATTEMPT);
export function requireUnusedAttempt(attempt,names){
  selectAttempt(attempt);
  if(!Array.isArray(names)||names.some(name=>typeof name!=='string'||name.includes(attempt)))
    throw Error('Previously recorded attempt identity refused before allocation');
}
export function restoreReceiptNames(attempt=ATTEMPT){
  selectAttempt(attempt);
  const suffix=attempt==='20261009-fidelity'?'':'-'+attempt;
  return {summary:'restore-summary'+suffix+'.json',failure:'restore-failure'+suffix+'.log'};
}
export function capacityMiB(attempt){selectAttempt(attempt);return ['20261010-managed-families','20261013-managed-families'].includes(attempt)?5888:attempt==='20261010-managed-final'?6144:6656;}
export const CAPACITY_MIB=capacityMiB(ATTEMPT);
export const MIN_FREE_KIB=512*1024;
export const LIVE_STOP_KIB=MIN_FREE_KIB+128*1024;
export const RESERVE_KIB=(CAPACITY_MIB+220+512+64)*1024;
export function checkLiveBudget(free,allocated){
  if(!Number.isSafeInteger(free)||!Number.isSafeInteger(allocated)||allocated<0||free<LIVE_STOP_KIB||allocated>(CAPACITY_MIB-64)*1024)
    throw Error('Scoped live resource budget refused');
}
export function checkAllocation(free){
  if(!Number.isSafeInteger(free)||free-RESERVE_KIB<MIN_FREE_KIB)throw Error('Scoped allocation reserve refused');
  return free-RESERVE_KIB;
}
