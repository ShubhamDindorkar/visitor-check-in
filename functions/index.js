const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Notify host when a new visitor checks in
exports.notifyHostOnCheckin = functions.firestore
  .document('visits/{visitId}')
  .onCreate(async (snap) => {
    const visit = snap.data();
    if (!visit || !visit.hostId) return null;

    const hostSnap = await admin.firestore().collection('users').doc(visit.hostId).get();
    if (!hostSnap.exists) return null;
    const host = hostSnap.data();
    const token = host?.fcmToken;
    if (!token) return null;

    const payload = {
      notification: {
        title: `Visitor: ${visit.visitorName}`,
        body: `${visit.visitorName} is here for ${visit.purpose || 'a visit'}`
      },
      data: { visitId: snap.id }
    };

    try {
      await admin.messaging().sendToDevice(token, payload);
    } catch (err) {
      console.error('FCM send error', err);
    }
    return null;
  });

// Set default user role on signup
exports.setDefaultUserRole = functions.auth.user().onCreate(async (user) => {
  const email = user.email || '';
  let role = 'host';
  if (email.endsWith('@reception.example.com')) role = 'receptionist';

  await admin.firestore().collection('users').doc(user.uid).set({
    displayName: user.displayName || null,
    email,
    role,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await admin.auth().setCustomUserClaims(user.uid, { role });
  console.log(`User ${user.uid} role set to ${role}`);
});
