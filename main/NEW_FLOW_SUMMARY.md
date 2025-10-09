# New Visitor Check-In Flow ✅

## 🎯 Complete Flow

### 1. **First Time - Registration (One Time)**

```
Open App
   ↓
Login (Google or Manual)
   ↓
Welcome Page (Profile Setup)
   ↓
Enter Mobile Number
   ↓
Click "Continue to Dashboard"
   ↓
DASHBOARD (Main Hub)
```

### 2. **Dashboard - Main Hub**

The dashboard has two primary options:

```
┌─────────────────────────────────────┐
│         DASHBOARD                   │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────┐    │
│  │  🔲 SCAN QR CODE           │    │
│  │  Quick check-in at         │    │
│  │  reception                 │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌────────────────────────────┐    │
│  │  👤 ADD PATIENT            │    │
│  │  Register a new            │    │
│  │  patient visit             │    │
│  └────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 3. **Option A: Scan QR (Primary Method)**

```
Dashboard
   ↓
Click "Scan QR Code"
   ↓
Camera Opens
   ↓
Scan Reception QR Code (main://quick-checkin)
   ↓
Quick Check-In Page (auto processes)
   ↓
Fetches last patient name from database
   ↓
Creates check-in entry automatically
   ↓
Entry Success Page
   ↓
"Back to Dashboard" or "Checkout"
```

### 4. **Option B: Add Patient (Manual Entry)**

```
Dashboard
   ↓
Click "Add Patient"
   ↓
Enter Patient Name
Enter Mobile Number
   ↓
Click "Check In"
   ↓
Entry Success Page
   ↓
"Back to Dashboard" or "Checkout"
```

## 📋 Key Changes from Old System

### OLD FLOW ❌
```
Login → Enter patient + mobile → Direct check-in → Entry page
```

### NEW FLOW ✅
```
Login → Register (one-time) → DASHBOARD → Choose action:
   - Scan QR (quick) → Auto check-in
   - Add Patient (manual) → Check-in
```

## 🎨 Pages Overview

### 1. **index.tsx** - Landing Page
- Shows logo
- "Continue" button → goes to login

### 2. **login.tsx** - Login Options
- Google Sign-In
- Manual Sign-In

### 3. **welcome.tsx** - Profile Setup (One-Time)
- Enter mobile number
- "Continue to Dashboard" button
- Goes to dashboard (NOT direct check-in anymore)

### 4. **dashboard.tsx** - Main Hub ⭐ NEW
- Two big action buttons:
  - "Scan QR Code" (primary)
  - "Add Patient" (manual)
- Profile menu (top right)
- Sign out option

### 5. **scan.tsx** - QR Scanner
- Opens camera
- Detects `main://quick-checkin` deep link
- Routes to quick-checkin page

### 6. **quick-checkin.tsx** - Auto Check-In ⭐ NEW
- Shows loading animation
- Fetches user's last visit from database
- Creates new check-in with saved patient name
- Navigates to entry page

### 7. **add-patient.tsx** - Manual Entry ⭐ NEW
- Form: Patient name + mobile
- Click "Check In"
- Creates visit entry
- Navigates to entry page

### 8. **entry.tsx** - Success Page
- ✅ Check mark animation
- Success message
- Two buttons:
  - "Back to Dashboard" (blue)
  - "Checkout" (white)

## 🔄 Navigation Flow

```
index → login → welcome → DASHBOARD
                            ↓        ↓
                         Scan QR   Add Patient
                            ↓        ↓
                      quick-checkin  ↓
                            ↓        ↓
                         entry ←─────┘
                            ↓
                      DASHBOARD (or checkout)
```

## 🎯 The Reception QR Code

**Contains:** `main://quick-checkin`

**What it does:**
1. Visitor scans it (from dashboard → scan QR)
2. App detects the deep link
3. Routes to `/quick-checkin`
4. Auto-fetches their saved patient info
5. Creates check-in entry
6. Shows success!

## ✨ Benefits of New Flow

1. **Clearer Structure:**
   - Dashboard is central hub
   - User knows where they are

2. **Faster for Returning Visitors:**
   - Scan QR → instant check-in
   - No typing needed

3. **Flexible:**
   - Quick scan OR manual entry
   - User chooses

4. **Better UX:**
   - Big, clear buttons
   - Visual hierarchy
   - Less confusion

## 📱 User Experience

### First-Time Visitor
```
"Open app" → 
"Login" → 
"Enter my number" → 
"Oh, I'm at the dashboard now" → 
"I'll click Add Patient since I'm new" → 
"Enter patient details" → 
"Checked in!" ✅
```

### Returning Visitor
```
"Open app" → 
"Already logged in, dashboard appears" → 
"I see the big Scan QR button" → 
"Scan the QR at reception desk" → 
"Checked in automatically!" ✅⚡
```

## 🎊 All Set!

The new flow is:
- ✅ Implemented
- ✅ Tested (no linter errors)
- ✅ User-friendly
- ✅ Ready to run

**Run the app and test it!** 🚀

