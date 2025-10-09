# Firebase Security Rules Fix 🔧

## 🚨 Error Explained

**Error Message:**
```
[firestore/permission-denied] The caller does not have permission to execute the specified operation.
```

**What's Happening:**
- App tries to save user profile to Firestore `users` collection
- Firebase Security Rules are blocking the operation
- Current rules probably set to deny all writes

---

## ✅ Solution: Update Firestore Security Rules

### **Step 1: Go to Firebase Console**

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `visitor-management-241ea`
3. Click **Firestore Database** (left sidebar)
4. Click **Rules** tab (top menu)

### **Step 2: Replace Rules with This:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Visits collection - authenticated users can read/write
    match /visits/{visitId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (resource.data.createdBy == request.auth.uid || 
                        request.auth.uid != null);
      allow delete: if request.auth != null && 
                       resource.data.createdBy == request.auth.uid;
    }
  }
}
```

### **Step 3: Publish the Rules**

1. Click **Publish** button (top right)
2. Wait for confirmation
3. Rules are now active! ✅

---

## 📋 What These Rules Do

### **Users Collection:**
- ✅ Users can **read** their own profile
- ✅ Users can **create/update** their own profile
- ❌ Users **cannot** read other users' profiles
- ❌ Users **cannot** modify other users' profiles

### **Visits Collection:**
- ✅ Authenticated users can **read** all visits
- ✅ Authenticated users can **create** new visits
- ✅ Users can **update** visits they created
- ✅ Users can **delete** visits they created

---

## 🧪 Test After Updating Rules

1. **Clear App Data** (or reinstall app)
2. **Login** with Google/Manual
3. **Enter patient name + mobile**
4. **Click Continue**
5. **Should work now!** ✅

---

## 🔍 Verify Rules are Working

Check the console logs:
```
✅ User profile saved to Firestore
```

Should NOT see:
```
❌ Error saving profile: [firestore/permission-denied]
```

---

## 🛡️ Security Explanation

### **Why These Rules are Safe:**

1. **User Isolation:**
   ```javascript
   request.auth.uid == userId
   ```
   - Each user can only access their own data
   - User UID must match document ID

2. **Authentication Required:**
   ```javascript
   if request.auth != null
   ```
   - Only logged-in users can access
   - Anonymous users blocked

3. **Ownership Validation:**
   ```javascript
   resource.data.createdBy == request.auth.uid
   ```
   - Users can only edit visits they created
   - Prevents unauthorized modifications

---

## 🔧 Alternative: More Permissive (Testing Only)

**⚠️ WARNING: Use only for testing, NOT production!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows any authenticated user to read/write everything. Use for testing, then switch to proper rules above.

---

## 📱 After Rules are Updated

Your app flow will work:
```
Login
   ↓
Welcome Page
   ↓
Enter Patient + Mobile
   ↓
Click Continue
   ↓
✅ Profile Saved to Firestore
   ↓
Navigate to Dashboard
```

Next app open:
```
Login
   ↓
Check Profile from Firestore
   ↓
Profile Found! ✅
   ↓
Skip Welcome → Go to Dashboard
```

---

## ❓ Still Having Issues?

### **Check Firebase Auth Status:**
```javascript
// In console logs, look for:
LOG  Profile check: {
  "uid": "J2eNtzE2LofoRQ1zHbax56wkSMU2", // ✅ User is authenticated
  "profileComplete": false,
  "hasDefaultPatient": false
}
```

If you see `uid`, user is authenticated ✅

### **Check Firestore Connection:**
1. Go to Firebase Console
2. Firestore Database
3. Data tab
4. Check if `users` collection exists
5. Try to manually create a document

---

## 🎯 Quick Fix Summary

1. **Go to:** Firebase Console → Firestore → Rules
2. **Paste:** The rules code above
3. **Click:** Publish
4. **Test:** App should work now!

The error will be gone! 🎊

