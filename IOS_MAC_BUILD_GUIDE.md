# 📱 Sonoray ERP - iOS Mac & Device Build Guide (Option A)

This guide describes how to run and test the Sonoray ERP iOS mobile app on a physical iPhone or the iOS Simulator using a Mac computer—**completely for free, without needing a paid Apple Developer Account!**

---

## 🛠️ Step 1: Install Prerequisites on Your Mac

Make sure you have these tools installed on your macOS machine:
1. **Node.js**: Installed (v18 or higher).
2. **Xcode**: Install Xcode from the Mac App Store.
3. **CocoaPods**: The dependency manager for iOS:
   ```bash
   sudo gem install cocoapods
   ```

---

## 🏗️ Step 2: Initialize iOS inside Your Project

If your project doesn't have an iOS container directory yet, we can easily initialize one using **Capacitor** directly inside the `frontend` folder:

1. Open the Terminal on your Mac and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install Capacitor CLI and iOS wrapper tools:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios --legacy-peer-deps
   ```
3. Initialize your Capacitor config file:
   ```bash
   npx cap init SonorayERP com.sonoray.erp --web-dir=out
   ```
4. Build your Next.js frontend assets:
   ```bash
   npm run build
   ```
5. Create the native iOS Xcode project folder:
   ```bash
   npx cap add ios
   ```
6. Sync the web assets into the iOS folder:
   ```bash
   npx cap sync ios
   ```

---

## 💻 Step 3: Run the App on the iOS Simulator

1. Launch Xcode and open the iOS project folder:
   ```bash
   npx cap open ios
   ```
   *This will automatically launch Xcode and open the `App.xcworkspace` project.*
2. At the top left of Xcode, select a simulated Apple device (e.g. **iPhone 15 Pro**).
3. Click the **Play button (Run)** at the top left of Xcode!
4. The iOS Simulator will boot up and load your Sonoray ERP app instantly!

---

## 📲 Step 4: Run the App on Your Physical iPhone (Free Personal Team)

Apple allows you to install and test apps on your personal iPhone using a free Apple ID:

1. Connect your iPhone to your Mac computer via USB.
2. Inside Xcode, select your **connected physical iPhone** from the target list at the top.
3. In the left sidebar of Xcode, click on the **App** project root node.
4. Open the **Signing & Capabilities** tab.
5. Check **"Automatically manage signing"**.
6. In the **Team** dropdown, select **Add an Account...** and sign in with your personal Apple ID (your normal iCloud email & password).
7. Select your personal Apple ID as the **Team**.
8. Click the **Play button (Run)** at the top left of Xcode!
9. **First Time trust on iPhone**:
   * If a message says "Untrusted Developer", grab your iPhone.
   * Go to **Settings > General > VPN & Device Management**.
   * Under your Developer Account, tap **"Trust"**.
10. Click Run again, and the app will boot up in real time on your phone!
