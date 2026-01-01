// ============================================
// FIREBASE CONFIGURATION
// ============================================
// استبدل البيانات الافتراضية بمفاتيحك الحقيقية من Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx", // استبدل بـ API Key الخاص بك
  authDomain: "your-project-id.firebaseapp.com", // استبدل بـ Auth Domain
  projectId: "your-project-id", // استبدل بـ Project ID
  storageBucket: "your-project-id.appspot.com", // استبدل بـ Storage Bucket
  messagingSenderId: "123456789012", // استبدل بـ Messaging Sender ID
  appId: "1:123456789012:web:abcdef1234567890" // استبدل بـ App ID
};

// ============================================
// INITIALIZE FIREBASE
// ============================================
firebase.initializeApp(firebaseConfig);

// الحصول على مراجع الخدمات
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ============================================
// FIREBASE AUTHENTICATION FUNCTIONS
// ============================================

/**
 * تسجيل مستخدم جديد
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @param {string} username - اسم المستخدم
 */
async function firebaseSignup(email, password, username) {
  try {
    // إنشاء حساب في Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // حفظ بيانات المستخدم في Firestore
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: email,
      username: username,
      balance: 50, // رصيد ترحيبي
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // تحديث الملف الشخصي
    await user.updateProfile({
      displayName: username
    });

    console.log('✅ تم إنشاء حساب بنجاح:', user.uid);
    return user;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الحساب:', error.message);
    throw error;
  }
}

/**
 * تسجيل دخول المستخدم
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 */
async function firebaseLogin(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('✅ تم تسجيل الدخول بنجاح:', user.uid);
    return user;
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error.message);
    throw error;
  }
}

/**
 * تسجيل الخروج
 */
async function firebaseLogout() {
  try {
    await auth.signOut();
    console.log('✅ تم تسجيل الخروج بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تسجيل الخروج:', error.message);
    throw error;
  }
}

/**
 * الاستماع لتغييرات حالة المستخدم
 */
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('👤 المستخدم الحالي:', user.uid);
    
    // جلب بيانات المستخدم من Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      currentUser = {
        ...userData,
        firebaseUid: user.uid
      };
      saveUserToStorage(currentUser);
      updateAuthButton();
    }
  } else {
    console.log('❌ لا يوجد مستخدم مسجل دخول');
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthButton();
  }
});

// ============================================
// FIREBASE FIRESTORE FUNCTIONS
// ============================================

/**
 * إضافة حساب جديد للبيع
 */
async function firebaseAddListing(listingData) {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const listing = {
      ...listingData,
      sellerUid: currentUser.firebaseUid,
      seller: currentUser.username,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // إضافة الحساب إلى Firestore
    const docRef = await db.collection('listings').add(listing);
    
    console.log('✅ تم إضافة الحساب بنجاح:', docRef.id);
    
    // إرسال إشعار للمالك
    await notifyOwner({
      type: 'new_listing',
      title: `حساب جديد: ${listing.title}`,
      seller: listing.seller,
      price: listing.price,
      timestamp: new Date().toISOString()
    });

    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إضافة الحساب:', error.message);
    throw error;
  }
}

/**
 * جلب جميع الحسابات المتاحة
 */
async function firebaseGetListings() {
  try {
    const snapshot = await db.collection('listings')
      .where('status', '==', 'available')
      .orderBy('createdAt', 'desc')
      .get();

    const listings = [];
    snapshot.forEach(doc => {
      listings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('✅ تم جلب الحسابات:', listings.length);
    return listings;
  } catch (error) {
    console.error('❌ خطأ في جلب الحسابات:', error.message);
    throw error;
  }
}

/**
 * شراء حساب
 */
async function firebasePurchaseListing(listingId, listingPrice) {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    if (currentUser.balance < listingPrice) {
      throw new Error('رصيدك غير كافي');
    }

    const batch = db.batch();

    // 1. تحديث حالة الحساب
    const listingRef = db.collection('listings').doc(listingId);
    batch.update(listingRef, {
      status: 'sold',
      buyerUid: currentUser.firebaseUid,
      buyer: currentUser.username,
      soldAt: new Date().toISOString()
    });

    // 2. خصم المبلغ من رصيد المشتري
    const buyerRef = db.collection('users').doc(currentUser.firebaseUid);
    batch.update(buyerRef, {
      balance: currentUser.balance - listingPrice,
      updatedAt: new Date().toISOString()
    });

    // 3. إضافة المبلغ لرصيد البائع
    const sellerRef = db.collection('users').doc(await getSellerUid(listingId));
    batch.update(sellerRef, {
      balance: firebase.firestore.FieldValue.increment(listingPrice * 0.9), // خصم 10% عمولة
      updatedAt: new Date().toISOString()
    });

    // 4. تسجيل المعاملة
    await batch.commit();

    // 5. إضافة سجل المعاملة
    await db.collection('transactions').add({
      type: 'purchase',
      buyerUid: currentUser.firebaseUid,
      buyer: currentUser.username,
      listingId: listingId,
      amount: listingPrice,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    // 6. إرسال إشعار للمالك
    await notifyOwner({
      type: 'purchase_completed',
      title: 'عملية شراء جديدة',
      buyer: currentUser.username,
      amount: listingPrice,
      timestamp: new Date().toISOString()
    });

    console.log('✅ تم الشراء بنجاح');
    currentUser.balance -= listingPrice;
    saveUserToStorage(currentUser);
    return true;
  } catch (error) {
    console.error('❌ خطأ في الشراء:', error.message);
    throw error;
  }
}

/**
 * إضافة رصيد للمستخدم
 */
async function firebaseAddBalance(amount) {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const userRef = db.collection('users').doc(currentUser.firebaseUid);
    await userRef.update({
      balance: firebase.firestore.FieldValue.increment(amount),
      updatedAt: new Date().toISOString()
    });

    // تسجيل المعاملة
    await db.collection('transactions').add({
      type: 'deposit',
      userUid: currentUser.firebaseUid,
      username: currentUser.username,
      amount: amount,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    currentUser.balance += amount;
    saveUserToStorage(currentUser);

    console.log('✅ تم إضافة الرصيد بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في إضافة الرصيد:', error.message);
    throw error;
  }
}

/**
 * التسجيل في بطولة
 */
async function firebaseRegisterTournament(tournamentId, entryFee) {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    if (currentUser.balance < entryFee) {
      throw new Error('رصيدك غير كافي');
    }

    const batch = db.batch();

    // 1. إضافة المستخدم إلى قائمة المشاركين
    const tournamentRef = db.collection('tournaments').doc(tournamentId);
    batch.update(tournamentRef, {
      participants: firebase.firestore.FieldValue.arrayUnion(currentUser.firebaseUid),
      updatedAt: new Date().toISOString()
    });

    // 2. خصم رسوم الدخول
    const userRef = db.collection('users').doc(currentUser.firebaseUid);
    batch.update(userRef, {
      balance: currentUser.balance - entryFee,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();

    // 3. تسجيل المعاملة
    await db.collection('transactions').add({
      type: 'tournament_registration',
      userUid: currentUser.firebaseUid,
      username: currentUser.username,
      tournamentId: tournamentId,
      amount: entryFee,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    currentUser.balance -= entryFee;
    saveUserToStorage(currentUser);

    console.log('✅ تم التسجيل في البطولة بنجاح');
    return true;
  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error.message);
    throw error;
  }
}

/**
 * وضع رهان
 */
async function firebasePlaceBet(matchId, amount, odds) {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    if (currentUser.balance < amount) {
      throw new Error('رصيدك غير كافي');
    }

    // خصم مبلغ الرهان
    const userRef = db.collection('users').doc(currentUser.firebaseUid);
    await userRef.update({
      balance: currentUser.balance - amount,
      updatedAt: new Date().toISOString()
    });

    // تسجيل الرهان
    const betRef = await db.collection('bets').add({
      userUid: currentUser.firebaseUid,
      username: currentUser.username,
      matchId: matchId,
      amount: amount,
      odds: odds,
      potentialWinning: amount * odds,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // تسجيل المعاملة
    await db.collection('transactions').add({
      type: 'bet',
      userUid: currentUser.firebaseUid,
      username: currentUser.username,
      betId: betRef.id,
      amount: amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    currentUser.balance -= amount;
    saveUserToStorage(currentUser);

    console.log('✅ تم تسجيل الرهان بنجاح');
    return betRef.id;
  } catch (error) {
    console.error('❌ خطأ في وضع الرهان:', error.message);
    throw error;
  }
}

/**
 * جلب سجل المعاملات
 */
async function firebaseGetTransactions() {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const snapshot = await db.collection('transactions')
      .where('userUid', '==', currentUser.firebaseUid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return transactions;
  } catch (error) {
    console.error('❌ خطأ في جلب المعاملات:', error.message);
    throw error;
  }
}

// ============================================
// FIREBASE STORAGE FUNCTIONS
// ============================================

/**
 * رفع صورة إلى Firebase Storage
 */
async function firebaseUploadImage(file) {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const fileName = `listings/${currentUser.firebaseUid}/${Date.now()}_${file.name}`;
    const storageRef = storage.ref(fileName);
    
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();

    console.log('✅ تم رفع الصورة بنجاح');
    return downloadURL;
  } catch (error) {
    console.error('❌ خطأ في رفع الصورة:', error.message);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * الحصول على UID البائع
 */
async function getSellerUid(listingId) {
  const listingDoc = await db.collection('listings').doc(listingId).get();
  return listingDoc.data().sellerUid;
}

/**
 * إرسال إشعار للمالك
 */
async function notifyOwner(notification) {
  try {
    await db.collection('notifications').add({
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    });
    console.log('✅ تم إرسال الإشعار');
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعار:', error.message);
  }
}

/**
 * تحديث بيانات المستخدم
 */
async function firebaseUpdateUserProfile(updates) {
  try {
    if (!currentUser || !currentUser.firebaseUid) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const userRef = db.collection('users').doc(currentUser.firebaseUid);
    await userRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ تم تحديث الملف الشخصي');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تحديث الملف الشخصي:', error.message);
    throw error;
  }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
// يمكنك استخدام هذه الدوال في script.js الرئيسي
