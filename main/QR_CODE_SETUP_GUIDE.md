# Reception QR Code Setup Guide

## 🎯 What Link/Data Goes in the QR Code?

The reception QR code contains a **deep link** that opens your app:

```
main://quick-checkin
```

This is **NOT** a website URL. It's an app-specific deep link that:
- Opens your app directly to the quick check-in page
- Works even if the app is closed
- Uses the custom URL scheme defined in your `app.json`

---

## 📱 How It Works

### When a Visitor Scans the QR:

**Option 1: Scanning from WITHIN the app** (using your app's scanner)
1. User taps "Scan QR" in your app
2. Camera opens
3. User scans reception QR code
4. App reads `main://quick-checkin`
5. App navigates to `/quick-checkin` page
6. Automatic check-in happens! ✅

**Option 2: Scanning from OUTSIDE the app** (using phone's camera)
1. User opens phone camera
2. User points at reception QR code
3. Phone detects the deep link `main://quick-checkin`
4. Phone prompts: "Open in Main App?"
5. User taps "Open"
6. App launches and goes to `/quick-checkin` page
7. Automatic check-in happens! ✅

---

## 🛠️ How to Generate the Reception QR Code

### Method 1: Use Your App (Recommended)

1. **Run the app** on your phone or emulator
2. **Log in** to your account
3. **Tap profile icon** (top right corner)
4. **Select "Reception QR Code"**
5. **Screenshot or print** the displayed QR code
6. **Place it** at your reception desk

The QR code is already configured with `main://quick-checkin`

### Method 2: Online QR Generator (Alternative)

If you want to generate it separately:

1. Go to any QR code generator website (like qr-code-generator.com)
2. Choose "Text" or "URL" type
3. Enter this **exact text**:
   ```
   main://quick-checkin
   ```
4. Generate the QR code
5. Download and print it
6. Place at reception desk

---

## 🔧 Technical Details

### Deep Link Configuration

Your app is configured with:
- **Scheme:** `main` (defined in `app.json`)
- **Path:** `quick-checkin` (route in your app)
- **Full deep link:** `main://quick-checkin`

### Where It's Configured:

1. **`app.json`:**
   ```json
   {
     "expo": {
       "scheme": "main"
     }
   }
   ```

2. **`ReceptionQRCode.tsx`:**
   ```typescript
   const qrData = "main://quick-checkin";
   ```

3. **`_layout.tsx`:**
   ```typescript
   // Handles deep link when app is opened via QR
   Linking.addEventListener('url', handleDeepLink);
   ```

4. **`scan.tsx`:**
   ```typescript
   // Detects and processes the deep link
   if (data.includes("main://quick-checkin")) {
     router.push("/quick-checkin");
   }
   ```

---

## 🎨 QR Code Best Practices

### Size
- **Minimum:** 2x2 inches (5x5 cm)
- **Recommended:** 4x4 inches (10x10 cm) or larger
- **For wall posters:** 8x8 inches (20x20 cm)

### Placement
- **Eye level:** Easy to scan without bending
- **Well-lit area:** Avoid shadows
- **Flat surface:** No wrinkles or curves
- **Protected:** Consider laminating it

### Design
- **High contrast:** Black on white works best
- **Clear space:** Leave white border around QR
- **No logos over QR:** Don't obscure the pattern
- **Test it:** Scan from 1-2 feet away to verify

---

## 🔍 Testing the QR Code

### Test 1: In-App Scanner
```
1. Open your app
2. Login
3. Tap Profile → "Scan QR"
4. Scan the reception QR code
5. Should navigate to quick-checkin ✓
```

### Test 2: Phone Camera (Deep Link)
```
1. Close your app completely
2. Open phone's camera app
3. Point at reception QR code
4. Tap notification "Open in Main"
5. App should launch to quick-checkin ✓
```

### Test 3: Different Devices
- Test on Android
- Test on iOS
- Test with different camera apps

---

## 🚨 Troubleshooting

### QR Code Doesn't Scan
- **Ensure good lighting**
- **Clean the QR code** (no smudges)
- **Move closer/farther** from QR
- **Hold phone steady** for 2-3 seconds

### Deep Link Doesn't Open App
- **Check app is installed**
- **Verify scheme matches** (`main://`)
- **Try in-app scanner** as fallback
- **Rebuild app** if scheme was changed

### "Please log in first" Error
- User needs to be logged in
- Deep link requires authentication
- User should log in, then scan again

### No Previous Visit Found
- This is expected for first-time visitors
- They should use manual check-in
- QR will work on their next visit

---

## 📋 Reception Desk Setup Checklist

- [ ] Print the reception QR code (4x4 inches minimum)
- [ ] Laminate it for durability
- [ ] Place at eye level on reception desk
- [ ] Ensure good lighting on the QR code
- [ ] Add instruction sign: "Scan for Quick Check-In"
- [ ] Test with your own phone
- [ ] Train staff on the system
- [ ] Have manual check-in as backup

---

## 💡 Optional Enhancements

### Add Instructions
Create a sign next to the QR:
```
┌─────────────────────────┐
│   QUICK CHECK-IN        │
│                         │
│   [QR CODE HERE]        │
│                         │
│ 1. Open visitor app     │
│ 2. Scan this QR code    │
│ 3. Instant check-in!    │
│                         │
│ First time? Please      │
│ register at the desk    │
└─────────────────────────┘
```

### Multiple QR Codes
- Place one at entrance
- Place one at reception desk
- Place one in waiting area
- All use the same `main://quick-checkin` link

### Analytics
Track in Firebase:
- How many QR scans vs manual check-ins
- Peak scanning times
- Most frequent visitors

---

## 🎊 Summary

**The QR Code Contains:**
```
main://quick-checkin
```

**What It Does:**
- Opens your app (or navigates if already open)
- Goes to quick-checkin page
- Fetches user's previous patient name
- Creates new check-in entry automatically

**How to Get It:**
- Use app: Profile → "Reception QR Code" → Print
- Or generate online with text: `main://quick-checkin`

**Where to Place:**
- Reception desk, eye level, well-lit, laminated

**It's Ready to Use!** 🚀

