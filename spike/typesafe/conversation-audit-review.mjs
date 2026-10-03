import fs from 'node:fs';
import assert from 'node:assert/strict';
import { collect, metadata, evaluate } from './conversation-audit.mjs';
const data=await collect(metadata('01a0f6aa-6fb1-7e20-9aed-0a49f5a6d109'));
assert.equal(data.keys.size,1);
const conversation=data.messages.filter(m=>['L11132','L11151'].includes(m.id));
assert.equal(conversation.length,2);
const replies=conversation.map(m=>{const match=m.text.match(/<send_user_message_question_reply>([\s\S]*?)<\/send_user_message_question_reply>/);return match?{id:m.id,time:m.timestamp,replies:JSON.parse(match[1])}:m;});
const packet={model:'jev-1.13.0',state:{conversation:replies,policy:'Only interpret the latest direct user answer. Turkish spelling errors do not cancel a clear negative instruction. Historical question wording is not the users answer.'},questions:{
 latest_notes:{type:'choice',instructions:'What does the latest user reply mean about old conductor notes?',criteria:{keep:'User changes mind and says do NOT delete; continue necessary work.',delete:'User still requests deletion.',ambiguous:'Cannot interpret the answer.'}},
 evidence:{type:'choice',instructions:'Which supplied user passage most directly establishes the latest decision?',criteria:{L11132:'Earlier passage L11132',L11151:'Later passage L11151',none:'Neither'}}
}};
const r=await evaluate(packet,[...data.keys][0],'followup-notes-latest',{threadId:'01a0f6aa-6fb1-7e20-9aed-0a49f5a6d109',messageIds:['L11132','L11151'],stage:'source anchored correction, user answer decoded in-process'});
console.log(JSON.stringify({answers:r.answers,usage:r.usage,estimatedUsd:r.estimatedUsd}));
const dir='docs/reports/jev-conversation-audit';
const records=fs.readdirSync(dir).filter(x=>x.endsWith('-response.json')).map(x=>JSON.parse(fs.readFileSync(dir+'/'+x)));
const totals={calls:records.length,inputTokens:records.reduce((n,x)=>n+x.usage.input_tokens,0),outputTokens:records.reduce((n,x)=>n+x.usage.output_tokens,0),estimatedUsd:records.reduce((n,x)=>n+x.estimatedUsd,0),model:[...new Set(records.map(x=>x.model))],questions:records.reduce((n,x)=>n+Object.keys(x.answers).length,0),providerRetries:0};
fs.writeFileSync(dir+'/usage-total.json',JSON.stringify(totals,null,2),{flag:'wx'});console.log(totals);
