#!/usr/bin/env bash
set -euo pipefail
mkdir -p play-assets/screenshots
adb wait-for-device
adb shell wm size 1080x1920
adb shell wm density 420
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
adb shell input keyevent KEYCODE_WAKEUP
adb shell input keyevent KEYCODE_MENU
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -W -n nz.findthecash.app.debug/nz.findthecash.app.MainActivity
python3 - <<'PY'
import subprocess, time, re, xml.etree.ElementTree as ET
from pathlib import Path
def adb(*args):
    return subprocess.check_output(['adb', *args], timeout=45)
def tree():
    adb('shell','uiautomator','dump','/sdcard/ftcnz-window.xml')
    return ET.fromstring(adb('shell','cat','/sdcard/ftcnz-window.xml'))
def wait_text(text):
    deadline=time.monotonic()+240
    while time.monotonic()<deadline:
        try:
            root=tree()
            if any(text in n.get('text','') for n in root.iter('node')):
                return root
        except Exception:
            pass
        time.sleep(3)
    raise RuntimeError('App screen did not render: '+text)
def capture(name, text):
    wait_text(text)
    time.sleep(4)
    Path('play-assets/screenshots/'+name+'.png').write_bytes(adb('exec-out','screencap','-p'))
def tab(name):
    root=tree()
    node=next(n for n in root.iter('node') if n.get('content-desc')=='Open '+name+' tab')
    x1,y1,x2,y2=map(int,re.findall(r'\d+',node.get('bounds')))
    adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))
capture('01-home','Find a little joy.')
tab('Updates')
capture('02-updates','Latest updates')
tab('Hunt kit')
capture('03-hunt-kit','Your hunt kit')
tab('About')
capture('04-about','A little idea.')
PY
python3 scripts/validate-play-media.py
