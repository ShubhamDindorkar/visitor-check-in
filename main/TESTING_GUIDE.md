# Testing Guide - APK with Firebase Setup

## 📱 Download Your Test APK

**Latest working build:**
```
https://expo.dev/accounts/shubhamdindorkar/projects/main/builds/6d53f15a-fe39-4bf7-9840-883ea67f1116
```

Or scan this QR code with your phone (shown in the EAS build page)

---

## ✅ Firebase Setup Completed?

Before testing, make sure you've completed:

- [ ] Added SHA-1 to Firebase Console
- [ ] Added SHA-256 to Firebase Console  
- [ ] Created/Updated Android OAuth Client in Google Cloud Console
- [ ] Downloaded new google-services.json (optional for this build, needed for next build)

---

## 🧪 How to Test:

### 1. **Install the APK**

**On your Android phone:**
- Download the APK from the link above
- Open it (you may need to allow "Install from unknown sources")
- Install the app

### 2. **Test Google Sign-In**

- Open the app
- Click "Sign in with Google"
- Choose your Google account
- **Expected result:** ✅ Should sign in successfully (no error 10 or developer error)

### 3. **Test Visitor QR Scanning**

**Note:** The QR code fix we made today is NOT in this build. This will work after November 1st rebuild.

**Current behavior in this build:**
- Reception QR code (`main://quick-checkin`) → ✅ Works
- Any other QR → ✅ Goes to quick check-in

### 4. **Test Enquiry QR Scanning**

- Log in as enquiry user
- Scan any QR code
- **Expected result:** ✅ Should log enquiry successfully

---

## 🐛 Troubleshooting:

### Sign-in fails with "Error 10" or "Developer Error"
- **Wait 5-10 minutes** after adding SHA fingerprints (Google needs time to propagate)
- Verify SHA-1 is correctly added to **both** Firebase AND Google Cloud Console
- Check package name is exactly: `com.visitormanagement`

### QR scanning goes to wrong page
- This is expected - wait for next month's rebuild with the fix
- OR upgrade EAS plan to rebuild now

### App won't install
- Check "Install from unknown sources" is enabled
- Try uninstalling old version first

---

## 📊 What's Working:

✅ App installation  
✅ Google Sign-In (after Firebase setup)  
✅ Basic visitor flow  
✅ Enquiry QR scanning  
✅ Manual sign-in  
✅ Firebase data storage  

## 🔄 What Needs Next Build:

⏳ Improved visitor QR scanning (code fixed, needs rebuild)  
⏳ Latest bug fixes  

---

## 📅 Next Steps:

1. **Test this build thoroughly**
2. **Note any issues**
3. **On November 1st, 2025:**
   ```bash
   eas build --platform android --profile preview
   ```
4. **Get new APK with QR fixes**
5. **Test again**
6. **Deploy to Play Store** (production build)

---

## 🎯 Your Release SHA Fingerprints:

**For reference:**

```
SHA-1:    F9:59:FD:EB:AF:9A:D3:46:3C:7F:38:67:95:23:9C:44:A0:36:B8:0B
SHA-256:  6F:50:5D:56:43:A2:B0:C3:E0:A6:CF:60:13:7A:65:F6:61:A0:42:17:34:0D:32:6E:3F:C4:9E:7C:DA:D9:88:8A
MD5:      9D:01:C4:A2:6B:EA:29:A7:9C:88:22:F7:CF:67:BD:AE
```

Package: `com.visitormanagement`
Keystore: Build Credentials W94OvPadmH (EAS managed)

---

**Good luck with testing! 🚀**

