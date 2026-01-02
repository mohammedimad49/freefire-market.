// ============================================
// FF MARKETPLACE - PRO ENGINE v2.0
// ============================================

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();
    if(currentUser) loadDashboardData();
    renderHome();
});

// --- نظام التنقل بين الصفحات ---
function navigateTo(page) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    document.getElementById(`${page}-page`).classList.remove('hidden');
}

// --- نظام التبديل داخل لوحة التحكم ---
function switchDashboardTab(tabId) {
    document.querySelectorAll('.dashboard-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active', 'border-b-2', 'border-cyan-400'));
    
    document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    event.currentTarget.classList.add('active', 'border-b-2', 'border-cyan-400');
}

// --- تحديث أزرار الدخول ---
function updateAuthButton() {
    const btn = document.getElementById('authBtn');
    if (currentUser) {
        btn.innerHTML = `<span class="text-green-400">●</span> حسابي`;
        btn.onclick = () => document.getElementById('dashboard-modal').classList.remove('hidden');
    }
}

// --- نظام الربح من الإعلانات (المكافأة) ---
function showRewardAd() {
    if (!currentUser) return alert("سجل دخولك أولاً للربح!");
    
    alert("جاري تحميل الإعلان... (هنا يتم ربط AdMob/Unity)");
    
    // محاكاة انتهاء الإعلان
    setTimeout(() => {
        currentUser.earnings = (currentUser.earnings || 0) + 0.01;
        saveAndRefresh();
        alert("مبروك! تم إضافة $0.01 لرصيد أرباحك");
    }, 2000);
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

    if (!name || !file) return alert("الرجاء إدخال الاسم ورفع الصورة");

    currentUser.kycStatus = "pending";
    saveAndRefresh();
    alert("تم إرسال هويتك بنجاح. سيتم مراجعتها من قبل الإدارة خلال 24 ساعة.");
}

// --- نظام الشحن اليدوي (منع الغش) ---
function showAddBalanceModal() {
    document.getElementById('add-balance-modal').classList.remove('hidden');
}

function requestBalance() {
    const amount = document.getElementById('balanceAmount').value;
    const proof = document.getElementById('paymentProof').files[0];

    if (!amount || !proof) return alert("الرجاء إدخال المبلغ ورفع صورة الوصل");

    alert(`تم إرسال طلب شحن بقيمة $${amount}. سيتم إضافة الرصيد بعد تأكدنا من التحويل.`);
    closeModal('add-balance-modal');
}

// --- نظام الإحالة (Referral) ---
function copyRef() {
    const refLink = `https://ff-market.com/?ref=${currentUser.id}`;
    navigator.clipboard.writeText(refLink);
    alert("تم نسخ رابط الإحالة! شاركه واربح 10%");
}

// --- وظائف المساعدة ---
function saveAndRefresh() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    loadDashboardData();
}

function loadDashboardData() {
    if (!currentUser) return;
    document.getElementById('currentBalance').textContent = `$${(currentUser.balance || 0).toFixed(2)}`;
    document.getElementById('withdrawableBalance').textContent = `$${(currentUser.earnings || 0).toFixed(2)}`;
    
    // تحديث رابط الإحالة في الواجهة
    const refText = document.getElementById('referralLink');
    if(refText) refText.textContent = `https://ff-market.com/?ref=${currentUser.id.substring(0,6)}`;

    // تفعيل زر السحب فقط إذا كانت الهوية مؤكدة والأرباح > 5
    const withdrawBtn = document.getElementById('withdrawBtn');
    if (currentUser.kycStatus === "verified" && currentUser.earnings >= 5) {
        withdrawBtn.disabled = false;
        withdrawBtn.classList.remove('text-gray-600', 'cursor-not-allowed');
        withdrawBtn.classList.add('bg-green-600', 'text-white');
    }
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// --- تسجيل الدخول (تجريبي) ---
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    if(!email) return alert("أدخل البريد");
    
    currentUser = {
        id: "USR" + Math.floor(Math.random() * 10000),
        email: email,
        balance: 0,
        earnings: 0,
        kycStatus: "none"
    };
    saveAndRefresh();
    updateAuthButton();
    closeModal('login-modal');
}
