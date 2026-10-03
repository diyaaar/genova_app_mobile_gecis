// Follow-up questions see original redacted passages; primary receives typed results only.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { collect, metadata, chunks, evaluate, topics } from './conversation-audit.mjs';
const dir='docs/reports/jev-conversation-audit';
const inventory=JSON.parse(fs.readFileSync(dir+'/inventory.json'));
const scans=fs.readdirSync(dir).filter(x=>/^scan-\d+-response.json$/.test(x)).map(x=>JSON.parse(fs.readFileSync(dir+'/'+x)));
const choice=(instructions,criteria)=>({type:'choice',instructions,criteria});
const packet=(state,questions)=>({model:'jev-1.13.0',state,questions});
const keySource=await collect(metadata('01a0f6aa-6fb1-7e20-9aed-0a49f5a6d109'));
assert.equal(keySource.keys.size,1);let key=[...keySource.keys][0];
const chronology=inventory.threads.map(t=>({threadId:t.id,title:t.title,first:t.first,last:t.last,parts:scans.filter(r=>r.provenance.threadId===t.id).map(r=>({part:r.provenance.part,findings:Object.fromEntries(Object.entries(r.answers).filter(([id,a])=>!['absent','assistant_only'].includes(a.choice)).map(([id,a])=>[id,{answer:a.choice,p:a.probabilities[a.choice],confidence:a.confidence}]))}))}));
const findings=JSON.stringify({topics,chronology},null,2);
if(fs.existsSync(dir+'/structured-findings.json'))assert.equal(fs.readFileSync(dir+'/structured-findings.json','utf8'),findings);
else fs.writeFileSync(dir+'/structured-findings.json',findings,{flag:'wx'});
const matchingLines=(messages,pattern)=>messages.filter(m=>m.role==='user').flatMap(m=>m.text.split('\n').map((text,i)=>({id:m.id+':line'+i,role:m.role,timestamp:m.timestamp,text})).filter(x=>pattern.test(x.text)));
const rows=chunks(keySource.messages);
const checks=[
 ['followup-scope',{conversation:rows[11],note:'A scan said native_breadth was rejected. Do not equate refusal of manual QA with cancellation of mobile features.'},{
  cancelled:choice('Does the USER explicitly cancel native chat, homework and home screen as final product requirements?',{yes:'Explicitly cancels these features',no:'No cancellation; only workflow/testing/UI discussion',unclear:'Cannot establish either'}),
  test_owner:choice('Who should perform the mobile tests according to the latest user statements?',{agent:'Agent via computer use/automation',human:'User manually',unknown:'Not established'}),
 }],
 ['followup-nfc',{conversation:(await collect(metadata('01a0f14b-e9f6-7d80-a9d9-7303311f291c'))).messages},{
  domain:choice('Is the requested deliverable a feature of the choir SaaS/mobile product, or a separate NFC/Google-card instruction brochure?',{choir:'Explicit choir application feature',separate:'Separate customer instruction brochure; exclude from mobile product scope',unknown:'Unclear'})
 }],
 ['followup-decisions',{conversation:[...matchingLines(keySource.messages,/şef not|silme|vazgeç|web sitesi|database|Flutter|React Native/i),...matchingLines((await collect(metadata('01a0d7b1-d6a2-7f93-9abb-fa54ec82ced7'))).messages,/operatör|self.serv|kayıt akışı|onboarding/i)],note:'Structured question replies embedded in a user message are the users own answers; question text itself is not endorsement. Latest correction wins. These are exact selected lines, not primary-agent paraphrases.'},{
  onboarding:choice('What registration path did the user choose for first version?',{assisted:'Operator-assisted first version, self-service later',self_service:'Immediate self-service',unknown:'Not established'}),
  notes:choice('What is the latest decision about deleting old conductor notes?',{keep:'Deletion withdrawn; keep notes and continue needed work',delete:'Delete original live notes',synthetic:'Delete synthetic only',unknown:'Not established'}),
  website:choice('What is the latest sibling website direction?',{detached:'Do not modify it; user says it no longer uses this database',shared:'Repair website because it shares DB',unknown:'Not established'}),
  stack:choice('Which mobile stack did the user actually choose?',{rn:'React Native/Expo retained, Flutter alternative only',flutter:'Migrate to Flutter now',unknown:'Not established'})
 }]
];
const followups=[];
for(const[name,state,questions]of checks){const p=packet(state,questions);let r;const saved=dir+'/'+name+'-response.json';if(fs.existsSync(saved)){r=JSON.parse(fs.readFileSync(saved));const{createHash}=await import('node:crypto');assert.equal(r.requestSha256,createHash('sha256').update(JSON.stringify(p)).digest('hex'));}else r=await evaluate(p,key,name,{stage:'focused contradiction check',source:'local redacted transcript, references kept in scan inventory'});followups.push({name,answers:r.answers});console.log(JSON.stringify({name,answers:r.answers,usage:r.usage,estimatedUsd:r.estimatedUsd}));}
const compact=chronology.map(t=>({...t,parts:t.parts.filter(p=>Object.keys(p.findings).some(k=>!['domain','progress','friction','anchor'].includes(k)))}));
const facts={
 asOf:'2026-10-03',revision:'2652584',
 source:'Read-only current repository and git ls-remote checks, no new product tests or hosted service inspection in this audit.',
 remote:'Live GitHub main a13f696, local main2652584 is363 commits ahead. Production Vercel revision was a13f696 in prior report; not freshly inspected here. Bulk push may deploy unrelated unfinished work.',
 good:'Current source has shared active-choir contracts, native AuthStore, secure file capability/revocation, native repertoire/PDF/audio/chat foundations, permanent WebView routes. Android inline PDF full automated consent/cancel/share-dismiss/cache-clear/A-B refusal passed3Oct local synthetic emulator; mobile465 and web1178 tests passed in prior same-day run, not rerun now.',
 gaps:'Whole090 and R1 release gate open. Current inline-PDF candidate needs grouped iOS integration. Browser-only API audit/backport, independent review and fresh server/client recovery preflight precede hosted release. Historical R1 caught legacy Next signature-only reader bypass; local repair exists, no hosted proof.',
 storage:'Dated reports:42 private R2 copies60969062bytes verified;49MP3/192361428bytes remain. Copy activation, flags and old Drive access withdrawal open; no fresh provider check.',
 featureBreadth:'Current ShellScreen exposes repertoire/chat/four permanent web destinations; no native assignments/home. ScoreReader renders read-only annotations; native write/sync/offline open. Chat stars implemented locally051; remaining social/media/admin open; push provider delivery open.',
 commercial:'Multi-choir remediation WF013 partial step5; operator/catalog admin and complete independent-choir lifecycle not accepted. Five-free pricing lifecycle, limits, retention/deletion and last-chef rules open. Full end-to-end installed beta/store release not evidenced.',
 process:'AGENTS now records agent-owned Android/iOS QA. Recent evidence confirms automated Android flow. Whole migration row in MIGRATION still says stars pending although051 and actual star gateway exist. Older plan paragraph still references both-site rehearsal while latest owner correction excludes sibling site.',
 invariant:'Keep RNExpo/Supabase/permanent WebViews, existing features, two-store destination, accepted next-online-request revocation. Beta is same product intermediate milestone. Current task is an audit and plan, not permission for new live writes.'
};
const questions={
 direction:choice('Combining conversation findings and verified repository facts, is development direction aligned with the user?',{aligned_but_delivery_gap:'Core product/architecture direction aligned; tangible beta delivery and full-product gap remain',fully_met:'Desired usable commercial two-store product is already delivered',wrong_stack:'Stack change/rewrite is necessary',unknown:'Evidence insufficient'}),
 bottleneck:choice('Which is the strongest CURRENT delivery bottleneck supported by facts?',{release_integration:'Convert accumulated local fixes into one compatible deployable release and real end-to-end beta',missing_tests:'Simply add many more unit tests before anything else',new_architecture:'Start new infrastructure or framework rewrite',complete:'No meaningful blocker',unknown:'Cannot choose'}),
 immediate:choice('Best next bounded action BEFORE any new hosted operation, given current required gates?',{finish_ios_candidate:'Finish same-source iOS file integration and current candidate compatibility; then freeze one release package',new_chat_feature:'Build another small chat feature first',bulk_push:'Immediately bulk push363commits to production',rewrite:'Switch to Flutter/Railway',unknown:'Need more evidence'}),
 next_milestone:choice('Which visible milestone should organize subsequent engineering work?',{android_beta:'Usable installed Android beta with declared features, actual compatible backend, file/data isolation and automated agent testing',brief_count:'Maximize closed brief count',all_features_first:'Finish every future feature before any usable beta',unknown:'Not established'}),
 scope:choice('Should the narrower beta silently replace full feature preservation/two-store final destination?',{no:'No, preserve complete final roadmap and explicit remaining feature matrix',yes:'Yes, current PDF demo is the final product',unknown:'Unclear'}),
 qa:choice('How should upcoming iOS/Android acceptance be executed?',{agent:'Agent automation; owner only needed for unavoidable account/hardware access or product choices',manual:'Ask owner to click each test step again',skip:'Skip platform runtime checks',unknown:'Unclear'}),
 safety:choice('How should local security evidence affect deployment?',{release_gates:'Retain tenant/revocation contract; inspect exact compatibility/recovery and current hosted state before controlled release',ignore:'Ignore tenant isolation to ship faster',ai_authorizes:'Jev confidence itself authorizes deployment',unknown:'Unclear'}),
 daily:choice('Best progress metric for this user?',{user_flow:'New complete usable user flow, tested environment, remaining beta blocker, next concrete exit',tests:'Unit test count or number of commits',activity:'Hours/tools/token usage alone',unknown:'Unclear'}),
 docs:choice('Do repository facts support a documentation consistency problem?',{yes:'Some status pointers conflict with newer source/decisions and should be reconciled',no:'Every current status is perfectly synchronized',unknown:'Cannot establish'}),
 missing_axis:choice('Which important planning dimension is easiest to lose if focusing only on PDF/security tests?',{whole_product:'Independent choir onboarding, member roles, actual beta usability, remaining rehearsal features and commercial operations',pdf_only:'Only another synthetic PDF size',model:'Switching AI models repeatedly',unknown:'Unclear'})
};
const synthesis=packet({transcriptFindings:compact,focusedChecks:followups,verifiedRepository:facts,topics},questions);
// Findings may exceed bound: retain user-intent changes and concerns, drop routine local claims.
for(const t of synthesis.state.transcriptFindings)for(const p of t.parts)for(const k of['anchor','domain','progress'])delete p.findings[k];
const result=await evaluate(synthesis,key,'synthesis',{stage:'Jev comparison and plan selection',currentRevision:'2652584',scanCalls:100,scope:'structured Jev findings + independently checked repository facts'});
key='';fs.writeFileSync(dir+'/repository-facts.json',JSON.stringify(facts,null,2),{flag:'wx'});
console.log(JSON.stringify({name:'synthesis',answers:result.answers,usage:result.usage,estimatedUsd:result.estimatedUsd}));
