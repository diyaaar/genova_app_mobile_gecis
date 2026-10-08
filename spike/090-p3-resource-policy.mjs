// Owner's 9 October scoped waiver of the usual 10 GiB floor, not a global policy.
export const ATTEMPT='20261009';
export const CAPACITY_MIB=6656;
export const MIN_FREE_KIB=512*1024;
export const LIVE_STOP_KIB=MIN_FREE_KIB+128*1024;
export const RESERVE_KIB=(CAPACITY_MIB+220+512+64)*1024;
export function checkAllocation(free){
  if(!Number.isSafeInteger(free)||free-RESERVE_KIB<MIN_FREE_KIB)throw Error('Scoped allocation reserve refused');
  return free-RESERVE_KIB;
}
