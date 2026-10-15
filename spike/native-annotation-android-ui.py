"""Real emulator touch evidence; fixture transport is explicitly synthetic."""
import json, pathlib, re, subprocess, time, xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parent.parent
ADB='/opt/homebrew/share/android-commandlinetools/platform-tools/adb'
OUT=ROOT/'spike/090-runtime'
steps=[]
def adb(*args):
 return subprocess.check_output([ADB,*map(str,args)],text=True).strip()
def tree():
 adb('shell','uiautomator','dump','/data/local/tmp/genova-annotation.xml')
 return ET.fromstring(adb('shell','cat','/data/local/tmp/genova-annotation.xml'))
def node(key):
 for n in tree().iter('node'):
  if n.get('resource-id')==key: return n
 raise AssertionError('Missing '+key)
def bounds(n): return list(map(int,re.findall(r'\d+',n.get('bounds'))))
def tap(key):
 x,y,a,b=bounds(node(key)); adb('shell','input','tap',(x+a)//2,(y+b)//2)
def has_text(text):
 return any(text in n.get('text','') for n in tree().iter('node'))
def verify(text):
 for _ in range(5):
  if has_text(text): return
 raise AssertionError('Missing text '+text)
def stroke(tool,start,end):
 tap('annotation-tool-'+tool)
 x,y,a,b=bounds(node('annotation-drawing-surface'))
 adb('shell','input','swipe',int(x+(a-x)*start[0]),int(y+(b-y)*start[1]),int(x+(a-x)*end[0]),int(y+(b-y)*end[1]),450)
 verify('Kişisel notlar · Kaydedildi')
 steps.append({'step':tool+' touch and save','status':'PASS'})
verify('Kişisel notlar · Hazır')
stroke('pen',(.2,.3),(.5,.4))
stroke('highlighter',(.2,.5),(.6,.5))
stroke('arrow',(.6,.2),(.7,.3))
stroke('rectangle',(.65,.6),(.8,.8))
tap('annotation-tool-text');tap('annotation-text-input');adb('shell','input','text','RuntimeNote');adb('shell','input','keyevent','4')
x,y,a,b=bounds(node('annotation-drawing-surface'));adb('shell','input','tap',int(x+(a-x)*.4),int(y+(b-y)*.65))
verify('Kişisel notlar · Kaydedildi');verify('RuntimeNote');steps.append({'step':'text placement and save','status':'PASS'})
with open(OUT/'annotation-tools.png','wb') as f: subprocess.run([ADB,'exec-out','screencap','-p'],stdout=f,check=True)
tap('score-reader-next');verify('2 / 40');assert not has_text('RuntimeNote')
tap('score-reader-prev');verify('1 / 40');verify('RuntimeNote');steps.append({'step':'page isolation and return','status':'PASS'})
tap('score-reader-zoom-in');verify('125%');verify('RuntimeNote');tap('score-reader-zoom-reset');verify('100%');steps.append({'step':'zoom and reset with overlay','status':'PASS'})
tap('acceptance-toggle-conflict');verify('Transport: conflict')
tap('annotation-tool-pen');x,y,a,b=bounds(node('annotation-drawing-surface'));adb('shell','input','swipe',int(x+(a-x)*.1),int(y+(b-y)*.8),int(x+(a-x)*.5),int(y+(b-y)*.85),400)
verify('Kişisel notlar · Kaydedilemedi');verify('başka bir oturumda')
tap('score-reader-back');verify('Kişisel notlar · Kaydedilemedi');node('score-reader-screen');steps.append({'step':'conflict retains draft and blocks header exit','status':'PASS'})
adb('shell','input','keyevent','4');verify('Kişisel notlar · Kaydedilemedi');node('score-reader-screen');steps.append({'step':'conflict blocks Android hardware back','status':'PASS'})
with open(OUT/'annotation-conflict.png','wb') as f: subprocess.run([ADB,'exec-out','screencap','-p'],stdout=f,check=True)
tap('acceptance-toggle-conflict');tap('annotation-save-retry');verify('Kişisel notlar · Kaydedildi');steps.append({'step':'retry after transport recovery','status':'PASS'})
tap('annotation-undo');verify('Kişisel notlar · Kaydedildi');steps.append({'step':'undo persists successor revision','status':'PASS'})
tap('score-reader-back');verify('EXIT PASS');tap('acceptance-reopen');verify('RuntimeNote');steps.append({'step':'saved exit and reread','status':'PASS'})
pid=adb('shell','pidof','com.genesinovachoir.genova')
logs=adb('logcat','-d','--pid='+pid,'-s','ReactNativeJS:I')
trace=[line for line in logs.splitlines() if 'ANNOTATION_ACCEPTANCE_' in line]
assert any('"text","pen","highlighter","arrow","rectangle","text"' in line for line in trace)
(OUT/'annotation-android-result.json').write_text(json.dumps({'scope':'Android API36 arm64 emulator; actual native UI/PDF/Skia; synthetic revision RPC', 'steps':steps, 'trace':trace},indent=2)+'\n')
print(json.dumps({'passed':len(steps),'traceEvents':len(trace)}))
