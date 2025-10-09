const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// When a visitor doc is created -> add timeline event
exports.onVisitCreate = functions.firestore
  .document('visitors/{visitId}')
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    const timelineRef = snap.ref.collection('timeline').doc();
    await timelineRef.set({
      event: 'Visitor logged in',
      actor: data.visitorId || 'visitor',
      branchId: data.branchId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return null;
  });

// When visitor status changes to checked_out -> add timeline event
exports.onVisitUpdate = functions.firestore
  .document('visitors/{visitId}')
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.status !== after.status) {
      const timelineRef = change.after.ref.collection('timeline').doc();
      await timelineRef.set({
        event: `Status changed to ${after.status}`,
        actor: ctx.auth ? ctx.auth.uid : 'system',
        branchId: after.branchId || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    return null;
  });

// When an enquiry is created -> add timeline event
exports.onEnquiryCreate = functions.firestore
  .document('enquiries/{enqId}')
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    const timelineRef = snap.ref.collection('timeline').doc();
    await timelineRef.set({
      event: 'Enquiry created',
      actor: data.createdBy || 'visitor',
      branchId: data.branchId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return null;
  });

// Scheduler: every 3 days find open enquiries and notify owners (requires Blaze for deploy)
exports.reminderScheduler = functions.pubsub.schedule('every 72 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const cutoff = admin.firestore.Timestamp.fromMillis(now.toMillis() - (3 * 24 * 3600 * 1000));
  const snap = await db.collection('enquiries').where('status', '==', 'open').get();

  const ownersSnap = await db.collection('users').where('role', '==', 'super_admin').get();
  const ownerTokens = [];
  ownersSnap.forEach(o => { if (o.data().fcmToken) ownerTokens.push(o.data().fcmToken); });

  const batch = db.batch();
  for (const doc of snap.docs) {
    const enq = doc.data();
    // Send notification to owners (if tokens exist)
    if (ownerTokens.length) {
      const payload = {
        notification: {
          title: `Reminder: Open Enquiry`,
          body: `${enq.enquiryName} is still open`
        },
        data: { enquiryId: doc.id }
      };
      try { await admin.messaging().sendToDevice(ownerTokens, payload); } catch (e) { console.error(e); }
    }
    // update lastReminder and add timeline event
    const evRef = doc.ref.collection('timeline').doc();
    batch.set(evRef, {
      event: 'Reminder sent to owner',
      actor: 'system',
      branchId: enq.branchId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    batch.update(doc.ref, { lastReminder: admin.firestore.FieldValue.serverTimestamp() });
  }
  await batch.commit();
  return null;
});
