ionic version : 5.2.7
node version : 10.16.0
npm version : 6.9.0
cordova version: 9.0.0

username - alumnimatchco@gmail.com
pass is S00ner23982398\*

MD5: 41:F4:BC:DE:8D:97:A2:E0:C3:97:7F:4C:4B:5B:8E:3E
SHA1: E2:9D:4A:50:B6:95:A0:C3:2A:F5:37:6E:E0:1F:AC:C2:E5:0A:09:EE
SHA256: 0E:81:95:33:BB:19:50:C3:F4:50:40:6C:95:2A:0E:8A:1F:05:EC:C0:8E:92:97:DD:C1:C2:90:69:86:3E:80:D6

hash key: hRvGSRi27qZdKamGWXu25QfLjQo= 4p1KULaVoMMq9Tdu4B+swuUKCe4=

##### apk steps for build

```

ionic cordova build android --prod --release

cp platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk am-unsigned.apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./../doc/alumnimatch.jks am-unsigned.apk alumnimatch

~/Library/Android/sdk/build-tools/30.0.1/zipalign -v 4 am-unsigned.apk am.apk

~/Library/Android/sdk/build-tools/30.0.1/apksigner verify am.apk

```
