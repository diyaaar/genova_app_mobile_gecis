import { read090ConnectedAudioConfig,validate090ConnectedAudioFixture,observed090AudioUrl } from '../090_connected-audio-config';
const env={EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO:'1',EXPO_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54491',EXPO_PUBLIC_SUPABASE_ANON_KEY:'synthetic-local'};
const fixture={email:'shared-091-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa@example.invalid',password:'a'.repeat(32),
  choirA:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',choirB:'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  fileId:'cccccccc-cccc-cccc-cccc-cccccccccccc',songId:'dddddddd-dddd-dddd-dddd-dddddddddddd',audioSha256:'a'.repeat(64),
  legacyUrl:'http://127.0.0.1:8000/?fileId=cccccccc-cccc-cccc-cccc-cccccccccccc&ticket=synthetic%2Fsigned%3D'};
describe('090 connected audio isolated configuration',()=>{
  it('accepts exact local runtime metadata and preserves query bytes',()=>{
    expect(read090ConnectedAudioConfig(env).endpoint).toBe('http://127.0.0.1:18092/090/audio-ticket');
    expect(validate090ConnectedAudioFixture(fixture)).toEqual(fixture);
    expect(observed090AudioUrl(fixture.legacyUrl)).toBe(fixture.legacyUrl.replace('http://127.0.0.1:8000/','http://127.0.0.1:18092/090/audio-read'));
  });
  it('maps relay-issued URLs without changing signed query bytes',()=>{
    const issued=fixture.legacyUrl.replace('http://127.0.0.1:8000/','http://127.0.0.1:18092/090/audio-ticket');
    expect(observed090AudioUrl(issued)).toBe(issued.replace('/090/audio-ticket','/090/audio-read'));
    expect(()=>observed090AudioUrl(issued.replace('/audio-ticket','/foreign'))).toThrow();
    expect(()=>validate090ConnectedAudioFixture({...fixture,legacyUrl:issued})).toThrow();
  });
  it.each([{EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO:'0'},{EXPO_PUBLIC_SUPABASE_URL:'https://example.com'},
    {EXPO_PUBLIC_SUPABASE_URL:'http://user:secret@127.0.0.1:54491'},{EXPO_PUBLIC_SUPABASE_ANON_KEY:''},
    {EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE:'1'},{EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE:'1'},
    {EXPO_PUBLIC_GENOVA_026_ACCEPTANCE:'1'},{EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE:'1'},
    {EXPO_PUBLIC_GENOVA_093_ACCEPTANCE:'1'},{EXPO_PUBLIC_GENOVA_033_ACCEPTANCE:'1'}])('rejects hosted/conflicting public config %#',patch=>{
    expect(()=>read090ConnectedAudioConfig({...env,...patch})).toThrow();
  });
  it.each([{email:'real@example.com'},{password:''},{choirB:fixture.choirA},{fileId:'bad'},
    {audioSha256:'bad'},{serviceKey:'forbidden'},{legacyUrl:fixture.legacyUrl+'&extra=1'},
    {legacyUrl:fixture.legacyUrl.replace(':8000/',':8000/foreign')},{legacyUrl:fixture.legacyUrl+'#secret'},
    {legacyUrl:fixture.legacyUrl.replace('127.0.0.1','example.com')}])('rejects malformed/foreign input %#',patch=>{
    expect(()=>validate090ConnectedAudioFixture({...fixture,...patch})).toThrow();
  });
});
