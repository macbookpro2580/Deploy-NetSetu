# NetSetu Android Build & Integration Guide

## 1. Prerequisites
- **Android Studio**: Iguana (2023.2.1) or Ladybug (2024.2.1)+
- **JDK**: OpenJDK 17 or higher
- **Android SDK**: API Level 34 (Android 14) installed
- **Test Devices**:
  - Provider: Android phone running on cellular mobile data (e.g. Ncell / NTC in Biratnagar)
  - Receiver: Android phone (in Saptari) with Wi-Fi or local network

---

## 2. Building the APK with Gradle
From your local terminal with Android SDK configured:

```bash
cd android-project
./gradlew assembleDebug
```

The compiled APK will be generated at:
`android-project/app/build/outputs/apk/debug/app-debug.apk`

To install directly to a connected test phone via ADB:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Operating Procedure: Biratnagar to Saptari Flow

### On Provider Phone (Biratnagar):
1. Launch NetSetu.
2. Select **Provider (Biratnagar)** tab.
3. Tap **Start Sharing Mobile Internet**.
4. The app starts `NetSetuProviderService` as a persistent foreground service with an unkillable ongoing notification.
5. Note the 6-character single-use pairing code (e.g. `9X4K2P`).

### On Receiver Phone (Saptari):
1. Launch NetSetu.
2. Select **Receiver (Saptari)** tab.
3. Enter the 6-character code (`9X4K2P`).
4. Tap **Connect via Provider Mobile Exit**.
5. Android system displays the standard VPN permission prompt: `"NetSetu wants to set up a VPN connection that allows it to monitor network traffic."`
6. Tap **OK / Allow**.
7. NetSetu initializes `NetSetuVpnService`, establishes the TUN interface, routes all device traffic through the tun2socks bridge, and exits via the Biratnagar phone's mobile connection.
