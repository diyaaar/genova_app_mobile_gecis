import { useEffect,useMemo,useRef,useState } from 'react';
import { SafeAreaView,Text } from 'react-native';
import { ProtectedFileRequestError,requestProtectedRepertoireFileTicket } from '@shared/repertuvar/protected-file-client';
import { AuthProvider,useAuth } from '../auth/AuthProvider';
import { getGenovaClient } from '../auth/supabase-client';
import { AudioPlaybackProvider,useAudioPlayback } from '../repertoire/AudioPlaybackProvider';
import { createNativeAudioSourceGateway } from '../repertoire/audio-source-gateway';
import type { NativeAudioSession } from '../repertoire/audio-contract';
import type { ProtectedRepertoireFileTicket } from '@shared/repertuvar/protected-file-client';
import { observed090AudioUrl,read090ConnectedAudioConfig,validate090ConnectedAudioFixture,
  type ConnectedAudioFixture } from './090_connected-audio-config';

const config=read090ConnectedAudioConfig({
  EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO:process.env.EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO,
  EXPO_PUBLIC_SUPABASE_URL:process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY:process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE:process.env.EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE:process.env.EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE:process.env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_093_ACCEPTANCE:process.env.EXPO_PUBLIC_GENOVA_093_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_026_ACCEPTANCE:process.env.EXPO_PUBLIC_GENOVA_026_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_033_ACCEPTANCE:process.env.EXPO_PUBLIC_GENOVA_033_ACCEPTANCE,
});
const client=getGenovaClient();
type PublicFixture=Omit<ConnectedAudioFixture,'email'|'password'>;
type Trace=(message:string)=>void;

function Playback({fixture,trace}:{fixture:PublicFixture;trace:Trace}) {
  const auth=useAuth(),authRef=useRef(auth);authRef.current=auth;
  const opens=useRef(0),saved=useRef<ProtectedRepertoireFileTicket|null>(null);
  const gateway=useMemo(()=>createNativeAudioSourceGateway({endpoint:config.endpoint,
    session:{async getAccessToken(){const {data,error}=await client.auth.getSession();if(error)throw Error('Local session unavailable');return data.session?.access_token??null;}},
    async requestTicket(input){
      const count=++opens.current;if(input.fileId!==fixture.fileId||count>4)throw Error('Audio retry bound');
      if(count===4){if(!saved.current)throw Error('Missing earlier ticket');trace('source4 injected previously-issued actual v2 in B');return saved.current;}
      const ticket=await requestProtectedRepertoireFileTicket(input);
      const url=observed090AudioUrl(count===1?fixture.legacyUrl:ticket.url);
      const result={...ticket,url,expiresAt:count===2?Date.now()+1000:ticket.expiresAt};
      if(count===3)saved.current=result;
      trace(`source${count} real POST200 ${count===1?'injected signed v1':count===2?'v2/client deadline fault':'v2'}`);
      return result;
    },
  }),[fixture,trace]);
  return <AudioPlaybackProvider gateway={gateway}><Automation fixture={fixture} opens={opens}
    saved={saved} authRef={authRef} trace={trace}/></AudioPlaybackProvider>;
}
function Automation({fixture,opens,saved,authRef,trace}:{fixture:PublicFixture;opens:{current:number};
  saved:{current:ProtectedRepertoireFileTicket|null};authRef:{current:ReturnType<typeof useAuth>};trace:Trace}) {
  const playback=useAudioPlayback(),latest=useRef(playback);latest.current=playback;
  const started=useRef(false);
  useEffect(()=>{
    if(started.current)return;started.current=true;let cancelled=false;
    async function until(test:()=>boolean,stage:string){const end=Date.now()+15000;
      while(!cancelled&&!test()&&Date.now()<end)await new Promise(r=>setTimeout(r,100));
      if(cancelled||!test())throw Error(`${stage} timeout`);
    }
    void(async()=>{
      // signIn resolves before AuthStore's membership hydration; the product UI
      // likewise exposes its choir picker only after that asynchronous boundary.
      await until(()=>['selection-required','ready'].includes(authRef.current.phase)&&
        [fixture.choirA,fixture.choirB].every(id=>authRef.current.choirs.some(c=>c.choir_id===id)),'membership hydration');
      await authRef.current.selectChoir(fixture.choirA);
      await until(()=>authRef.current.phase==='ready'&&authRef.current.activeChoir?.choir_id===fixture.choirA,'selectA');
      trace('real AuthStore A selection PASS');
      const {data:files,error}=await client.from('repertoire_files').select('*').eq('id',fixture.fileId).eq('song_id',fixture.songId);
      if(error||files?.length!==1||files[0].mime_type!=='audio/wav'||files[0].file_size_bytes!==160044)throw Error('RLS audio metadata');
      const session:NativeAudioSession={songId:fixture.songId,songTitle:'090 connected synthetic audio',
        tracks:[{supported:true,label:'Connected tone',file:files[0]}]};
      await latest.current.openSession(session);
      await until(()=>latest.current.loaded&&opens.current===2,'v1 recovery');trace('native v1 refusal/one real v2 renewal PASS opens2');
      await latest.current.seekTo(4);await until(()=>Math.abs(latest.current.currentTime-4)<0.4,'seek4');trace('native seek4 PASS');
      await until(()=>Date.now()>=(latest.current.ticketExpiresAt??Infinity),'client deadline');
      await latest.current.togglePlayback();
      await until(()=>opens.current===3&&latest.current.playing&&latest.current.currentTime>=4.2,'expiry resume');
      trace('declared client deadline/real renewal/resume>=4.2 PASS opens3');
      await latest.current.togglePlayback();await until(()=>!latest.current.playing,'pause');
      await latest.current.seekTo(2);await until(()=>Math.abs(latest.current.currentTime-2)<0.4,'seek2');
      await latest.current.togglePlayback();await until(()=>latest.current.playing&&latest.current.currentTime>=2.2,'resume2');
      if(opens.current!==3)throw Error('unexpected renewal');trace('pause/seek2/resume PASS');
      await authRef.current.selectChoir(fixture.choirB);
      await until(()=>authRef.current.phase==='ready'&&authRef.current.activeChoir?.choir_id===fixture.choirB&&
        !latest.current.session&&!latest.current.playing&&latest.current.ticketExpiresAt===null,'B teardown');
      trace('real AuthStore B selection/player teardown PASS');
      if(!saved.current||(await fetch(saved.current.url,{method:'HEAD'})).status!==403)throw Error('old A read still allowed');
      try{const {data}=await client.auth.getSession();await requestProtectedRepertoireFileTicket({endpoint:config.endpoint,fileId:fixture.fileId,
        accessToken:data.session?.access_token??''});throw Error('new A POST allowed');}
      catch(error){if(!(error instanceof ProtectedFileRequestError)||error.status!==403)throw Error('new A POST refusal');}
      trace('old A HEAD403/new A POST403 PASS');
      await latest.current.openSession(session);
      await until(()=>latest.current.error?.includes('erişim yetkisi sona erdi')===true&&latest.current.ticketExpiresAt===null,'native403');
      if((opens.current as number)!==4)throw Error('403 retried');trace('native old-v2 body403/probe/no renewal PASS opens4');
      latest.current.close();
      const response=await fetch('http://127.0.0.1:18092/090/audio-evidence',{method:'POST'});
      if(response.status!==200)throw Error('server audio evidence');
      trace('ALL PASS connected local Android audio; not hosted/iOS/audibility');
    })().catch(error=>{if(!cancelled)trace(`FAIL ${error instanceof Error?error.message:'local audio'}`);});
    return()=>{cancelled=true;};
  },[authRef,fixture,opens,saved,trace]);
  return <Text>{playback.loaded?'loaded':'loading'} · {playback.currentTime.toFixed(2)}s · {playback.error??'no error'}</Text>;
}
function Runtime({trace}:{trace:Trace}) {
  const auth=useAuth(),started=useRef(false),[fixture,setFixture]=useState<PublicFixture|null>(null);
  useEffect(()=>{if(auth.phase!=='signed-out'||started.current)return;started.current=true;
    void(async()=>{const response=await fetch(config.fixtureUrl,{method:'POST'});if(response.status!==200)throw Error('fixture unavailable');
      const input=validate090ConnectedAudioFixture(await response.json());
      if((await fetch(config.fixtureUrl,{method:'POST'})).status!==410)throw Error('fixture reusable');
      const result=await auth.signIn(input.email,input.password);input.email='';input.password='';
      if(result.error)throw Error('sign-in');const {choirA,choirB,fileId,songId,audioSha256,legacyUrl}=input;
      trace('real Auth sign-in/one-use runtime credentials PASS');setFixture({choirA,choirB,fileId,songId,audioSha256,legacyUrl});
    })().catch(()=>trace('FAIL local one-use Auth'));},[auth,trace]);
  return fixture?<Playback fixture={fixture} trace={trace}/>:<Text>Local Auth · {auth.phase}</Text>;
}
export default function ConnectedAudioAcceptance(){
  const [events,setEvents]=useState<string[]>([]);
  const trace=useMemo(()=>((message:string)=>{console.info(`[090_CONNECTED_AUDIO] ${message}`);setEvents(v=>[...v.slice(-10),message]);}),[]);
  return <SafeAreaView style={{flex:1,padding:28,backgroundColor:'#e0f2fe'}}>
    <Text>090 · CONNECTED LOCAL AUTH / SIGNED LOOPBACK OBJECT</Text><Text>{events.join('\n')}</Text>
    <AuthProvider><Runtime trace={trace}/></AuthProvider>
  </SafeAreaView>;
}
