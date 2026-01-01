// ============================================
// FIREBASE INTEGRATION WITH MAIN SCRIPT
// ============================================
// هذا الملف يربط بين script.js و firebase-config.js

// ============================================
// UPDATE LOGIN FUNCTION
// ============================================

/**
 * تحديث دالة تسجيل الدخول لاستخدام Firebase
 */
async function handleLoginWithFirebase() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('الرجاء ملء جميع الحقول');
    return;
  }

  try {
    // تسجيل الدخول عبر Firebase
    const user = await firebaseLogin(email, password);
    
    // جلب بيانات المستخدم من Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    currentUser = {
      ...userData,
      firebaseUid: user.uid
    };

    saveUserToStorage(currentUser);
    updateAuthButton();
    closeModal('login-modal');
    alert('✅ تم تسجيل الدخول بنجاح!');
    navigateTo('home');
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

/**
 * تحديث دالة إنشاء الحساب لاستخدام Firebase
 */
async function handleSignupWithFirebase() {
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  if (!username || !email || !password || !confirmPassword) {
    alert('الرجاء ملء جميع الحقول');
    return;
  }

  if (password !== confirmPassword) {
    alert('كلمات المرور غير متطابقة');
    return;
  }

  try {
    // إنشاء حساب عبر Firebase
    const user = await firebaseSignup(email, password, username);

    currentUser = {
      uid: user.uid,
      email: email,
      username: username,
      balance: 50,
      role: 'user',
      firebaseUid: user.uid
    };

    saveUserToStorage(currentUser);
    updateAuthButton();
    closeModal('signup-modal');
    alert('✅ تم إنشاء الحساب بنجاح! تم إضافة رصيد ترحيبي بقيمة $50');
    navigateTo('home');
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

/**
 * تحديث دالة تسجيل الخروج لاستخدام Firebase
 */
async function handleLogoutWithFirebase() {
  try {
    await firebaseLogout();
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateAuthButton();
    closeModal('dashboard-modal');
    navigateTo('home');
    alert('✅ تم تسجيل الخروج بنجاح');
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

// ============================================
// UPDATE MARKETPLACE FUNCTIONS
// ============================================

/**
 * تحديث دالة إضافة حساب للبيع
 */
async function handleAddListingWithFirebase(event) {
  event.preventDefault();

  if (!currentUser || !currentUser.firebaseUid) {
    showLoginModal();
    return;
  }

  const title = document.getElementById('listingTitle').value;
  const description = document.getElementById('listingDescription').value;
  const price = parseFloat(document.getElementById('listingPrice').value);
  const level = parseInt(document.getElementById('listingLevel').value);

  if (!title || !description || !price || !level) {
    alert('الرجاء ملء جميع الحقول');
    return;
  }

  try {
    // إضافة الحساب إلى Firebase
    const listingId = await firebaseAddListing({
      title,
      description,
      price,
      level,
      images: ['🎮']
    });

    // مسح النموذج
    document.getElementById('listingTitle').value = '';
    document.getElementById('listingDescription').value = '';
    document.getElementById('listingPrice').value = '';
    document.getElementById('listingLevel').value = '';

    alert('✅ تم إضافة الحساب بنجاح!');
    loadDashboardData();
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

/**
 * تحديث دالة الشراء
 */
async function purchaseListingWithFirebase(listingId) {
  if (!currentUser || !currentUser.firebaseUid) {
    showLoginModal();
    return;
  }

  const listing = listings.find(l => l.id === listingId);
  if (!listing) return;

  if (currentUser.balance < listing.price) {
    alert('رصيدك غير كافي للشراء');
    return;
  }

  if (confirm(`هل تريد شراء هذا الحساب بسعر $${listing.price}؟`)) {
    try {
      // تنفيذ الشراء عبر Firebase
      await firebasePurchaseListing(listingId, listing.price);
      
      alert('✅ تم الشراء بنجاح! تحقق من لوحة التحكم للتفاصيل');
      closeModal('listing-details-modal');
      
      // تحديث البيانات المحلية
      listing.status = 'sold';
      renderMarketplace();
      loadDashboardData();
    } catch (error) {
      alert('❌ خطأ: ' + error.message);
    }
  }
}

/**
 * تحديث دالة إضافة الرصيد
 */
async function handleAddBalanceWithFirebase() {
  const amount = parseFloat(document.getElementById('balanceAmount').value);

  if (!amount || amount <= 0) {
    alert('أدخل مبلغاً صحيحاً');
    return;
  }

  try {
    // إضافة الرصيد عبر Firebase
    await firebaseAddBalance(amount);

    document.getElementById('balanceAmount').value = '';
    closeModal('add-balance-modal');
    alert('✅ تم إضافة الرصيد بنجاح!');
    loadDashboardData();
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

/**
 * تحديث دالة التسجيل في البطولات
 */
async function registerTournamentWithFirebase(tournamentId) {
  if (!currentUser || !currentUser.firebaseUid) {
    showLoginModal();
    return;
  }

  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) return;

  if (currentUser.balance < tournament.entryFee) {
    alert('رصيدك غير كافي للتسجيل في هذه البطولة');
    return;
  }

  try {
    // التسجيل عبر Firebase
    await firebaseRegisterTournament(tournamentId, tournament.entryFee);
    
    alert('✅ تم التسجيل بنجاح في البطولة!');
    renderTournaments();
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

/**
 * تحديث دالة وضع الرهان
 */
async function placeBetWithFirebase(matchId, teamId, odds) {
  if (!currentUser || !currentUser.firebaseUid) {
    showLoginModal();
    return;
  }

  const amount = prompt('أدخل مبلغ الرهان:');
  if (!amount || isNaN(amount) || amount <= 0) return;

  const betAmount = parseFloat(amount);
  if (currentUser.balance < betAmount) {
    alert('رصيدك غير كافي');
    return;
  }

  try {
    // وضع الرهان عبر Firebase
    const betId = await firebasePlaceBet(matchId, betAmount, odds);
    
    alert('✅ تم تسجيل الرهان بنجاح!');
    renderBets();
  } catch (error) {
    alert('❌ خطأ: ' + error.message);
  }
}

// ============================================
// LOAD DATA FROM FIREBASE
// ============================================

/**
 * تحميل الحسابات من Firebase
 */
async function loadListingsFromFirebase() {
  try {
    listings = await firebaseGetListings();
    renderMarketplace();
  } catch (error) {
    console.error('❌ خطأ في تحميل الحسابات:', error.message);
  }
}

/**
 * تحميل بيانات لوحة التحكم من Firebase
 */
async function loadDashboardDataFromFirebase() {
  if (!currentUser || !currentUser.firebaseUid) return;

  try {
    // جلب سجل المعاملات
    const transactions = await firebaseGetTransactions();
    
    // حساب إجمالي المبيعات
    const totalSales = transactions
      .filter(t => t.type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('currentBalance').textContent = '$' + currentUser.balance.toFixed(2);
    document.getElementById('totalSales').textContent = '$' + totalSales.toFixed(2);

    // تحديث سجل المشتريات
    const purchases = transactions.filter(t => t.type === 'purchase');
    const purchasesHtml = purchases.map(p => `
      <div class="border border-magenta-500/30 p-3">
        <p class="font-bold text-magenta-400">شراء</p>
        <p class="text-sm text-magenta-300">المبلغ: $${p.amount}</p>
        <p class="text-xs text-cyan-300">${new Date(p.createdAt).toLocaleDateString('ar-SA')}</p>
      </div>
    `).join('');
    document.getElementById('user-purchases').innerHTML = purchasesHtml || '<p class="text-cyan-300">لم تقم بأي عمليات شراء</p>';
  } catch (error) {
    console.error('❌ خطأ في تحميل بيانات لوحة التحكم:', error.message);
  }
}

// ============================================
// REPLACE FUNCTIONS IN MAIN SCRIPT
// ============================================

// استبدل استدعاءات الدوال القديمة بالجديدة:
// handleLogin → handleLoginWithFirebase
// handleSignup → handleSignupWithFirebase
// handleLogout → handleLogoutWithFirebase
// handleAddListing → handleAddListingWithFirebase
// purchaseListing → purchaseListingWithFirebase
// handleAddBalance → handleAddBalanceWithFirebase
// registerTournament → registerTournamentWithFirebase
// placeBet → placeBetWithFirebase
// loadDashboardData → loadDashboardDataFromFirebase

console.log('✅ تم تحميل Firebase Integration بنجاح');
