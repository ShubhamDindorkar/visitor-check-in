# 🎯 New User Flow - Visitor vs Enquiry

## ✅ Implementation Complete!

**Updated:** Post-login flow now presents two options: Visitor and Enquiry

---

## 📊 Flow Diagram

```
App Start (/)
    ↓
Login/Google Sign-In
    ↓
Profile Setup (welcome.tsx)
    ↓
User Type Selection (user-type.tsx) ← NEW!
    ↓
   ┌─────────────────┴──────────────────┐
   │                                    │
   ▼                                    ▼
Visitor Path                       Enquiry Path
   │                                    │
   ▼                                    ▼
Visitor Dashboard              Enquiry Dashboard
   │                                    │
   ├─ Scan QR                          ├─ New Enquiry (coming soon)
   ├─ Add Patient                      ├─ My Enquiries (coming soon)
   └─ View Dashboard                   └─ Support (help-and-support)
```

---

## 🎨 New Screens

### **1. User Type Selection (`user-type.tsx`)**

**Purpose:** Choose between Visitor or Enquiry mode after login

**Features:**
- ✅ Beautiful animated entrance
- ✅ Two large cards: Visitor & Enquiry
- ✅ Feature lists for each option
- ✅ Smooth navigation

**UI:**
```
┌────────────────────────────────────┐
│       Welcome! 👤                  │
│  How would you like to proceed?    │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │  👥  Visitor                 │  │
│  │  Check in patients           │  │
│  │  • Scan QR                   │  │
│  │  • Add Patient               │  │
│  │  • View Dashboard            │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  ❓  Enquiry                 │  │
│  │  Submit enquiries            │  │
│  │  • New Enquiry               │  │
│  │  • My Enquiries              │  │
│  │  • Support                   │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

### **2. Visitor Dashboard (`visitor-dashboard.tsx`)**

**Changes:**
- ✅ Renamed from `dashboard.tsx`
- ✅ Added header with back button
- ✅ Profile icon moved to header
- ✅ Returns to user-type on back

**Features:**
- Scan QR Code
- Add Patient
- Help & Support
- Sign Out

### **3. Enquiry Dashboard (`enquiry-dashboard.tsx`)**

**Purpose:** Dedicated dashboard for enquiry-related activities

**Features:**
- ✅ New Enquiry button (placeholder - coming soon)
- ✅ My Enquiries list (placeholder - coming soon)
- ✅ Support button (navigates to help-and-support)
- ✅ Recent enquiries display (fetches from Firestore)
- ✅ Status badges (Pending, In Progress, Resolved)
- ✅ Profile menu with sign out
- ✅ Back button to user-type

**UI:**
```
┌────────────────────────────────────┐
│ ← Enquiry Dashboard           👤  │
├────────────────────────────────────┤
│                                    │
│  Welcome to Enquiry Portal 💬      │
│  Submit your questions             │
│                                    │
│  Quick Actions                     │
│                                    │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ 📝 New      │  │ 📋 My       │  │
│  │  Enquiry    │  │  Enquiries  │  │
│  └─────────────┘  └─────────────┘  │
│                                    │
│  ┌─────────────────────────────┐   │
│  │ 💬 Support                  │   │
│  └─────────────────────────────┘   │
│                                    │
│  Recent Enquiries                  │
│  ┌─────────────────────────────┐   │
│  │ Question about...  [Pending]│   │
│  │ 📅 Oct 9, 2025              │   │
│  └─────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

---

## 🔄 Updated Routing

### **_layout.tsx Changes:**

```typescript
// After login with complete profile
router.replace('/user-type'); // ← Changed from '/dashboard'

// Protected screens now include
- user-type
- visitor-dashboard
- enquiry-dashboard
- (all existing screens)
```

### **welcome.tsx Changes:**

```typescript
// After profile setup
router.replace('/user-type'); // ← Changed from '/dashboard'
```

### **entry.tsx & quick-checkin.tsx Changes:**

```typescript
// "Back to Dashboard" buttons
router.replace('/visitor-dashboard'); // ← Changed from '/dashboard'
```

---

## 📁 File Changes

### **New Files:**
1. ✅ `main/app/user-type.tsx` - User type selection screen
2. ✅ `main/app/enquiry-dashboard.tsx` - Enquiry dashboard
3. ✅ `main/NEW_USER_FLOW.md` - This documentation

### **Renamed Files:**
1. ✅ `main/app/dashboard.tsx` → `main/app/visitor-dashboard.tsx`

### **Updated Files:**
1. ✅ `main/app/_layout.tsx` - Updated routing logic
2. ✅ `main/app/welcome.tsx` - Navigate to user-type
3. ✅ `main/app/entry.tsx` - Navigate to visitor-dashboard
4. ✅ `main/app/quick-checkin.tsx` - Navigate to visitor-dashboard
5. ✅ `main/app/visitor-dashboard.tsx` - Added header with back button

---

## 🎯 User Experience

### **First-Time User:**
1. Launch app
2. Sign in with Google
3. Enter patient details (one-time setup)
4. **Choose: Visitor or Enquiry** ← NEW!
5. Navigate to selected dashboard

### **Returning User:**
1. Launch app
2. Auto-login
3. **Choose: Visitor or Enquiry** ← Shows every time after login
4. Navigate to selected dashboard

### **Navigation:**
- ✅ Both dashboards have back buttons
- ✅ Back from either dashboard returns to user-type
- ✅ Can switch between Visitor/Enquiry anytime
- ✅ Profile menu with sign out in both dashboards

---

## ✨ Design Highlights

### **User Type Screen:**
- 🎨 Smooth entrance animations
- 🎨 Color-coded cards (Blue for Visitor, Orange for Enquiry)
- 🎨 Icon-based feature lists
- 🎨 Professional modern design

### **Enquiry Dashboard:**
- 🎨 Consistent header design
- 🎨 Status badges with color coding:
  - 🟠 Orange = Pending
  - 🔵 Blue = In Progress
  - 🟢 Green = Resolved
- 🎨 Quick action cards
- 🎨 Recent enquiries list
- 🎨 Info card for guidance

### **Visitor Dashboard:**
- 🎨 Updated header with back button
- 🎨 Maintains existing functionality
- 🎨 Consistent design with enquiry dashboard

---

## 🔮 Future Enhancements

### **Enquiry Features (Coming Soon):**

1. **New Enquiry Form:**
   - Subject field
   - Description/message
   - Category selection
   - Attachment upload
   - Submit to Firestore

2. **My Enquiries List:**
   - View all submitted enquiries
   - Filter by status
   - Search functionality
   - View details
   - Add replies/comments

3. **Enquiry Details Page:**
   - Full enquiry information
   - Timeline of updates
   - Status changes
   - Admin responses
   - File attachments

---

## 📊 Data Structure

### **Enquiries Collection (Firestore):**

```javascript
enquiries/{enquiryId}
{
  subject: "Question about...",
  description: "Full message here...",
  status: "pending" | "in_progress" | "resolved",
  createdBy: "user-uid",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  category: "general" | "billing" | "technical" | "other",
  priority: "low" | "medium" | "high",
  assignedTo: "admin-uid" (optional),
  responses: [
    {
      message: "Response text",
      createdBy: "user-uid",
      createdAt: Timestamp
    }
  ]
}
```

### **Security Rules (To Add):**

```javascript
match /enquiries/{enquiryId} {
  allow create: if isSignedIn();
  allow read: if isSignedIn() && 
                 (resource.data.createdBy == request.auth.uid || 
                  isAdmin());
  allow update: if isSignedIn() && 
                   (resource.data.createdBy == request.auth.uid || 
                    isAdmin());
  allow delete: if isAdmin();
}
```

---

## ✅ Testing Checklist

- [ ] ✅ Login redirects to user-type
- [ ] ✅ User-type screen displays properly
- [ ] ✅ Visitor button navigates to visitor dashboard
- [ ] ✅ Enquiry button navigates to enquiry dashboard
- [ ] ✅ Both dashboards have functional back buttons
- [ ] ✅ Back buttons return to user-type
- [ ] ✅ Visitor dashboard functions work (Scan QR, Add Patient)
- [ ] ✅ Enquiry dashboard displays correctly
- [ ] ✅ Support button in enquiry dashboard works
- [ ] ✅ Sign out works from both dashboards
- [ ] ✅ Navigation is smooth and intuitive

---

## 🎊 Summary

**What Changed:**
1. ✅ Added user-type selection screen
2. ✅ Created enquiry dashboard
3. ✅ Renamed dashboard to visitor-dashboard
4. ✅ Updated all routing references
5. ✅ Added back buttons to both dashboards
6. ✅ Consistent header design across screens

**Benefits:**
- 🎯 Clear separation of Visitor and Enquiry workflows
- 🎯 Better user experience with explicit choices
- 🎯 Easier to add enquiry features in the future
- 🎯 More professional and organized app structure
- 🎯 Flexible navigation (can switch between modes)

**The new flow is complete and ready to use!** 🚀

Users will now see a beautiful choice screen after login, making it clear whether they want to manage visits or submit enquiries.

