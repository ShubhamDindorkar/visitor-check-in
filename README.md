# Visitor Check-In App 📱

A React Native app built with Expo that allows visitors to check in using Google Sign-In authentication with Firebase integration.

## Features

- 🔐 Google Sign-In authentication
- 🔥 Firebase integration for user management
- 📱 Cross-platform (iOS & Android)
- 🎨 Modern UI with professional design
- ⚡ Real-time authentication state management

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

4. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### For Android Development

5. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API level 24 or higher)
   - Set up Android emulator or connect physical device

6. **Java Development Kit (JDK)**
   - Install JDK 11 or higher
   - Set `JAVA_HOME` environment variable

### For iOS Development (macOS only)

7. **Xcode**
   - Download from Mac App Store
   - Install iOS Simulator
   - Install Xcode Command Line Tools: `xcode-select --install`

8. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd visitor-check-in/main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication and Google Sign-In provider
4. Download configuration files:
   - **Android**: `google-services.json` → place in `android/app/` directory
   - **iOS**: `GoogleService-Info.plist` → place in `ios/` directory

### 4. Google Sign-In Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials:
   - **Web Client ID**: For Firebase authentication
   - **Android Client ID**: For Android app
   - **iOS Client ID**: For iOS app
3. Update `webClientId` in `src/components/auth/google-auth.tsx`:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
   });
   ```

### 5. Android SDK Configuration

1. Set up Android SDK path in `android/local.properties`:
   ```
   sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
   ```

2. Set environment variable:
   ```bash
   # Windows (PowerShell)
   $env:ANDROID_HOME = "C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk"
   
   # Windows (Command Prompt)
   set ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
   
   # macOS/Linux
   export ANDROID_HOME=$HOME/Library/Android/sdk
   ```

### 6. Build Native Code

```bash
npx expo prebuild
```

### 7. Start Development Server

```bash
npx expo start
```

## Running the App

### Android

1. **Using Emulator:**
   ```bash
   npx expo run:android
   ```

2. **Using Physical Device:**
   - Enable Developer Options and USB Debugging
   - Connect device via USB
   - Run: `npx expo run:android`

### iOS (macOS only)

1. **Using Simulator:**
   ```bash
   npx expo run:ios
   ```

2. **Using Physical Device:**
   - Connect iOS device
   - Trust developer certificate
   - Run: `npx expo run:ios`

### Web

```bash
npx expo start --web
```

## Project Structure

```
main/
├── app/                    # App screens and routing
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Home screen
├── src/
│   └── components/
│       └── auth/
│           └── google-auth.tsx  # Google authentication component
├── android/               # Android native code
├── ios/                   # iOS native code (after prebuild)
├── assets/                # Images and static files
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Key Dependencies

- **@react-native-firebase/app**: Firebase core
- **@react-native-firebase/auth**: Firebase authentication
- **@react-native-google-signin/google-signin**: Google Sign-In
- **expo-router**: File-based routing
- **expo-build-properties**: Build configuration

## Troubleshooting

### Common Issues

1. **Android SDK not found:**
   - Verify `ANDROID_HOME` environment variable
   - Check `android/local.properties` file
   - Ensure Android SDK is installed

2. **Google Sign-In not working:**
   - Verify `webClientId` is correct
   - Check Firebase configuration files
   - Ensure Google Sign-In is enabled in Firebase Console

3. **Build errors:**
   - Run `npx expo prebuild --clean`
   - Clear cache: `npx expo start --clear`
   - Delete `node_modules` and reinstall

4. **iOS build issues:**
   - Run `cd ios && pod install`
   - Clean Xcode build folder
   - Check iOS deployment target

### Getting Help

- Check [Expo Documentation](https://docs.expo.dev/)
- Visit [Firebase Documentation](https://firebase.google.com/docs)
- Review [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/android)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both platforms
5. Submit a pull request

## License

This project is licensed under the MIT License.
