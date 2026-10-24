#!/usr/bin/env bash
# Capture real in-app screens from an Android emulator, not manufactured mockups.
set -euo pipefail
mkdir -p play-assets/screenshots
adb wait-for-device
adb shell wm size 1080x1920
adb shell wm density 420
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n nz.findthecash.app.debug/nz.findthecash.app.MainActivity
sleep 5
adb exec-out screencap -p > play-assets/screenshots/01-home.png
# Five equally-spaced native app tabs: Home, Updates, Map, Kit, About.
adb shell input tap 324 1790
sleep 9
adb exec-out screencap -p > play-assets/screenshots/02-updates.png
adb shell input tap 540 1790
sleep 9
adb exec-out screencap -p > play-assets/screenshots/03-location-map.png
adb shell input tap 756 1790
sleep 3
adb exec-out screencap -p > play-assets/screenshots/04-hunt-kit.png
adb shell input tap 972 1790
sleep 3
adb exec-out screencap -p > play-assets/screenshots/05-about.png
python3 scripts/validate-play-media.py
