// ============================================
// FF MARKETPLACE - PROFESSIONAL ENGINE v2.5
// ============================================

// حالة المستخدم الحالية
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();
    if (currentUser) {
        loadDashboardData();
        checkReferral(); // التحقق إذا كان المستخدم دخل عبر رابط إحالة
    }
    renderHome();
});

// --- نظام التنقل الرئيسي ---
function navigateTo(page) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) targetPage.classList.remove('hidden');
}

// --- تبديل الأقسام داخل لوحة التحكم ---
function switchDashboardTab(tabId) {
    document.querySelectorAll('.dashboard-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.dashboard-tab').forEach(t => {
        t.classList.remove('active', 'border-b-2', 'border-cyan-400');
    });
    
    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        event.currentTarget.classList.add('active', 'border-b-2', 'border-cyan-400');
    }
}

// --- إدارة الدخول والحساب ---
function updateAuthButton() {
    const btn = document.getElementById('authBtn');
    if (currentUser) {
        btn.innerHTML = `<span class="text-green-400">●</span> ${currentUser.username || 'حسابي'}`;
        btn.onclick = () => document.getElementById('dashboard-modal').classList.remove('hidden');
    } else {
        btn.textContent = 'دخول';
        btn.onclick = () => document.getElementById('login-modal').classList.remove('hidden');
    }
}

// --- نظام الربح من الإعلانات (موقوف حالياً) ---
function showRewardAd() {
    if (!currentUser) return alert("الرجاء تسجيل الدخول أولاً!");
    alert("📢 هذا العرض سيتوفر قريباً جداً!\nنحن حالياً في مرحلة التعاقد مع شركات الإعلانات لضمان أفضل عائد لكم.");
}

// --- نظام الربح من مشاركة الموقع (Referral) ---
function copyRef() {
    if (!currentUser) return;
    // إنشاء رابط إحالة بناءً على معرف المستخدم
    const userIdShort = currentUser.id.substring(0, 6);
    const refLink = `${window.location.origin}${window.location.pathname}?ref=${userIdShort}`;
    
    navigator.clipboard.writeText(refLink).then(() => {
        alert("✅ تم نسخ رابط الإحالة الخاص بك!\n\nشارك الرابط مع أصدقائك واربح 10% عمولة عن كل عملية شحن يقومون بها.");
    });
}

// التحقق من الإحالة (لحساب عدد المسجلين عن طريق المستخدم)
function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref && !localStorage.getItem('referredBy')) {
        localStorage.setItem('referredBy', ref);
        console.log("سجل المستخدم عبر إحالة من: " + ref);
    }
}

// --- نظام تأكيد الهوية (KYC) ---
function previewID(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('idPreview');
            preview.classList.remove('hidden');
            preview.querySelector('img').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function submitKYC() {
    const name = document.getElementById('idFullName').value;
    const file = document.getElementById('idCardImage').files[0];

    if (!name || !file) return alert("الرجاء إدخال اسمك الكامل ورفع صورة البطاقة.");

    currentUser.kycStatus = "pending";
    saveAndRefresh();
    alert("تم استلام بياناتك بنجاح! سيتم مراجعة هويتك من قبل الإدارة لتفعيل خاصية السحب.");
}

// --- نظام الشحن اليدوي (طلب الشحن) ---
function showAddBalanceModal() {
    document.getElementById('add-balance-modal').classList.remove('hidden');
}

function requestBalance() {
    const amount = document.getElementById('balanceAmount').value;
    const proof = document.getElementById('paymentProof').files[0];

    if (!amount || amount <= 0 || !proof) {
        return alert("الرجاء إدخال مبلغ صحيح ورفع صورة الوصل (Screenshot).");
    }

    alert(`تم إرسال طلب شحن بقيمة $${amount}.\nستتم إضافة الرصيد لحسابك فور تأكد الإدارة من وصول التحويل.`);
    closeModal('add-balance-modal');
}

// --- تحديث البيانات وحفظها ---
function saveAndRefresh() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadDashboardData();
}

function loadDashboardData() {
    if (!currentUser) return;
    
    // تحديث الأرقام في لوحة التحكم
    const balanceEl = document.getElementById('currentBalance');
    const earningsEl = document.getElementById('withdrawableBalance');
    const withdrawBtn = document.getElementById('withdrawBtn');

    if (balanceEl) balanceEl.textContent = `$${(currentUser.balance || 0).toFixed(2)}`;
    if (earningsEl) earningsEl.textContent = `$${(currentUser.earnings || 0).toFixed(2)}`;
    
    // تحديث رابط الإحالة الظاهري
    const refText = document.getElementById('referralLink');
    if (refText) {
        const userIdShort = currentUser.id.substring(0, 6);
        refText.textContent = `${window.location.origin.substring(0,15)}.../?ref=${userIdShort}`;
    }

    // إدارة زر السحب
    if (withdrawBtn) {
        if (currentUser.kycStatus === "verified" && (currentUser.earnings || 0) >= 5) {
            withdrawBtn.disabled = false;
            withdrawBtn.classList.replace('text-gray-600', 'bg-green-600');
            withdrawBtn.classList.replace('cursor-not-allowed', 'text-white');
        }
    }
}

// --- وظائف إغلاق النوافذ ---
function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// --- تسجيل الدخول (محاكاة) ---
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("الرجاء إدخال البريد الإلكتروني.");
    
    // إنشاء مستخدم جديد ببيانات افتراضية
    currentUser = {
        id: "USR" + Math.floor(Math.random() * 90000 + 10000),
        username: email.split('@')[0],
        email: email,
        balance: 0,
        earnings: 0,
        kycStatus: "none",
        referredCount: 0
    };
    
    saveAndRefresh();
    updateAuthButton();
    closeModal('login-modal');
    alert("مرحباً بك مجدداً!");
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.reload();
}

// --- عرض بيانات الصفحة الرئيسية (وهمية) ---
function renderHome() {
    const listingsDiv = document.getElementById('marketplace-listings');
    if (listingsDiv) {
        listingsDiv.innerHTML = `
            <div class="border border-gray-800 p-4 text-center">
                <p class="text-cyan-400">حساب فاير باس نادر</p>
                <p class="text-xs text-gray-500">مستوى 65 - سكنات قديمة</p>
                <p class="font-bold text-magenta-500 mt-2">$45.00</p>
                <button class="bg-cyan-900/50 text-cyan-400 text-[10px] px-2 py-1 mt-2">عرض التفاصيل</button>
            </div>
            `;
    }
}
