# ✅ Enquiry Permissions - FIXED!

## 🎯 Problem

**Error:**
```
Error fetching enquiries: [Error: [firestore/permission-denied] 
The caller does not have permission to execute the specified operation.]
```

**Location:** `enquiry-dashboard.tsx` → `fetchRecentEnquiries()`

**Cause:** Firestore security rules didn't allow users to read enquiries collection

---

## 🔧 Solution Applied

### **Updated Firestore Rules:**

**Before:**
```javascript
match /enquiries/{enqId} {
  // Required branchId field (not used in our app)
  allow read: if isSuperAdmin() || 
              (isSignedIn() && request.auth.token.branchId == resource.data.branchId);
}
```

**After:**
```javascript
match /enquiries/{enqId} {
  // Allow any signed-in user to create enquiries
  allow create: if isSignedIn();
  
  // Allow users to read their own enquiries, or admins to read all
  allow read: if isSignedIn() && 
                 (resource.data.createdBy == request.auth.uid || 
                  isSuperAdmin() || isBranchAdmin() || isStaff());
  
  // Allow users to update their own enquiries (e.g., add replies), or admins to update any
  allow update: if isSignedIn() && 
                   (resource.data.createdBy == request.auth.uid || 
                    isSuperAdmin() || isBranchAdmin() || isStaff());
  
  // Only admins can delete
  allow delete: if isSuperAdmin();
}
```

---

## ✅ What Changed

### **1. Create Permission**
- ✅ Any signed-in user can create enquiries
- ✅ No branchId requirement (simplified for visitor app)

### **2. Read Permission**
- ✅ Users can read their own enquiries (`createdBy == request.auth.uid`)
- ✅ Admins can read all enquiries
- ✅ Based on Firebase Authentication UID

### **3. Update Permission**
- ✅ Users can update their own enquiries (for adding replies/comments)
- ✅ Admins can update any enquiry (for status changes, responses)

### **4. Delete Permission**
- ✅ Only super admins can delete enquiries
- ✅ Regular users cannot delete

---

## 📊 How It Works Now

### **Enquiry Dashboard Query:**

```typescript
// This query now works! ✅
const snapshot = await firestore()
  .collection('enquiries')
  .where('createdBy', '==', user.uid)  // Fetch only user's own enquiries
  .limit(3)
  .get();
```

**Security Check:**
1. User is signed in? ✅
2. `createdBy` field matches `request.auth.uid`? ✅
3. Permission granted! ✅

---

## 🧪 Testing

### **Test 1: Fetch Enquiries**
1. Open app
2. Login
3. Choose "Enquiry"
4. Enquiry dashboard loads
5. ✅ No permission errors in console!

### **Test 2: Create Enquiry (When Implemented)**
```typescript
await firestore().collection('enquiries').add({
  subject: "Test Question",
  description: "My question here",
  createdBy: user.uid,
  createdAt: firestore.FieldValue.serverTimestamp(),
  status: "pending"
});
// ✅ Should succeed!
```

### **Test 3: Read Own Enquiries**
```typescript
await firestore()
  .collection('enquiries')
  .where('createdBy', '==', user.uid)
  .get();
// ✅ Should succeed!
```

### **Test 4: Read Other User's Enquiries**
```typescript
await firestore()
  .collection('enquiries')
  .where('createdBy', '==', 'different-user-uid')
  .get();
// ❌ Should fail (no permission)
```

---

## 📝 Expected Console Output

### **Before Fix:**
```
❌ ERROR Error fetching enquiries: [Error: [firestore/permission-denied] 
   The caller does not have permission to execute the specified operation.]
```

### **After Fix:**
```
✅ LOG  Recent enquiries loaded successfully
or
✅ LOG  No enquiries found (if user hasn't created any yet)
```

---

## 🔒 Security Summary

### **What Users CAN Do:**
- ✅ Create new enquiries
- ✅ Read their own enquiries
- ✅ Update their own enquiries
- ✅ View enquiry dashboard

### **What Users CANNOT Do:**
- ❌ Read other users' enquiries
- ❌ Update other users' enquiries
- ❌ Delete any enquiries
- ❌ Access enquiries without authentication

### **What Admins CAN Do:**
- ✅ Read all enquiries
- ✅ Update all enquiries
- ✅ Delete enquiries (super admin only)

---

## 🚀 Deployment Status

**Firestore Rules:** ✅ Deployed successfully

**Command Used:**
```bash
firebase deploy --only firestore:rules
```

**Result:**
```
+ cloud.firestore: rules file firestore.rules compiled successfully
+ firestore: released rules firestore.rules to cloud.firestore
+ Deploy complete!
```

---

## 📚 Related Files

- `firestore.rules` - Updated security rules
- `main/app/enquiry-dashboard.tsx` - Uses enquiries collection
- Future: `main/app/new-enquiry.tsx` - Will create enquiries
- Future: `main/app/my-enquiries.tsx` - Will list enquiries

---

## ✅ Summary

**Problem:** Permission denied when fetching enquiries  
**Cause:** Rules required `branchId` and didn't allow user access  
**Solution:** Updated rules to allow users to access their own enquiries  
**Status:** ✅ **FIXED AND DEPLOYED**

**The enquiry dashboard should now load without errors!** 🎉

Users can now:
- View the enquiry dashboard
- See their recent enquiries (when they create some)
- No permission errors in console

