const EDGE = 'http://127.0.0.1:8000';
export const AUDIO_FIXTURE = 'http://127.0.0.1:18092';
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
/** Acceptance wording identifies only the observed runtime; it grants no other platform gate. */
export function connectedAudioAcceptanceSummary(platform:string):string {
  if(platform==='android')return 'ALL PASS connected local Android audio; not hosted/iOS/audibility';
  if(platform==='ios')return 'ALL PASS connected local iOS audio; not Android/hosted/audibility';
  throw Error('Connected audio acceptance requires Android or iOS.');
}
export function read090ConnectedAudioConfig(env: Record<string,string|undefined>) {
  if (env.EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO !== '1' || env.EXPO_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54491' ||
      !env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ['EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE','EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE',
        'EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE','EXPO_PUBLIC_GENOVA_093_ACCEPTANCE','EXPO_PUBLIC_GENOVA_026_ACCEPTANCE',
        'EXPO_PUBLIC_GENOVA_033_ACCEPTANCE'].some(key=>env[key]==='1')) throw Error('090 connected audio requires exact isolated local Auth configuration.');
  return {endpoint:`${AUDIO_FIXTURE}/090/audio-ticket`,fixtureUrl:`${AUDIO_FIXTURE}/090/audio-fixture`};
}
export interface ConnectedAudioFixture {
  email:string;password:string;choirA:string;choirB:string;fileId:string;songId:string;audioSha256:string;legacyUrl:string;
}
function ticketUrl(value:string,fileId?:string,allowRelay=false) {
  const url=new URL(value);
  const allowedTransport=(url.origin===EDGE&&url.pathname==='/')||
    (allowRelay&&url.origin===AUDIO_FIXTURE&&url.pathname==='/090/audio-ticket');
  if(!allowedTransport||url.username||url.password||url.hash||
    !UUID.test(url.searchParams.get('fileId')??'')||!url.searchParams.get('ticket')||
    [...url.searchParams.keys()].sort().join(',')!=='fileId,ticket'||
    (fileId&&url.searchParams.get('fileId')!==fileId))throw Error('Unexpected connected audio transport.');
  return url;
}
/** Runtime-only synthetic credentials, never public build variables or retained state. */
export function validate090ConnectedAudioFixture(input:unknown):ConnectedAudioFixture {
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid audio fixture.');
  const v=input as Record<string,unknown>,keys=['email','password','choirA','choirB','fileId','songId','audioSha256','legacyUrl'];
  if(Object.keys(v).length!==keys.length||keys.some(k=>typeof v[k]!=='string'))throw Error('Invalid audio fixture shape.');
  const fixture=v as unknown as ConnectedAudioFixture;
  if(!/^shared-091-[a-f0-9-]+@example\.invalid$/.test(fixture.email)||!/^[A-Za-z0-9_-]{32}$/.test(fixture.password)||
    ![fixture.choirA,fixture.choirB,fixture.fileId,fixture.songId].every(id=>UUID.test(id))||fixture.choirA===fixture.choirB||
    !/^[a-f0-9]{64}$/.test(fixture.audioSha256))throw Error('Invalid isolated audio values.');
  ticketUrl(fixture.legacyUrl,fixture.fileId);return fixture;
}
/** Observation-only loopback relay preserves the signed query unchanged. */
export function observed090AudioUrl(input:string):string {
  const url=ticketUrl(input,undefined,true);return `${AUDIO_FIXTURE}/090/audio-read${url.search}`;
}
