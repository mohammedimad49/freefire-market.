// ============================================
// FREE FIRE MARKETPLACE - MAIN SCRIPT
// ============================================

// Global State
let currentUser = null;
let listings = [];
let tournaments = [];
let userListings = [];
let userPurchases = [];
let userBets = [];
let transactions = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadUserFromStorage();
    initializeMockData();
    renderHome();
    updateAuthButton();
});

// ============================================
// STORAGE & USER MANAGEMENT
// ============================================

function saveUserToStorage(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    currentUser = user;
}

function loadUserFromStorage() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
    }
}

function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    if (currentUser) {
        authBtn.textContent = `${currentUser.username} (لوحة التحكم)`;
        authBtn.onclick = () => openDashboard();
    } else {
        authBtn.textContent = 'دخول';
        authBtn.onclick = () => handleAuthClick();
    }
}

// ============================================
// MOCK DATA INITIALIZATION
// ============================================

function initializeMockData() {
    // Load from localStorage or create default data
    const storedListings = localStorage.getItem('listings');
    const storedTournaments = localStorage.getItem('tournaments');
    const storedTransactions = localStorage.getItem('transactions');

    if (storedListings) {
        listings = JSON.parse(storedListings);
    } else {
        listings = [
            {
                id: 1,
                title: 'حساب مستوى 75 مع سكنات نادرة',
                description: 'حساب عالي المستوى مع جميع السكنات النادرة والأسلحة المميزة',
                price: 450,
                level: 75,
                seller: 'ProGamer123',
                sellerId: 'user2',
                status: 'available',
                images: ['🎮'],
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'حساب مستوى 60 للمبتدئين',
                description: 'حساب جديد مناسب للاعبين الجدد',
                price: 150,
                level: 60,
                seller: 'NewbieHelper',
                sellerId: 'user3',
                status: 'available',
                images: ['🎮'],
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'حساب مستوى 85 احترافي',
                description: 'حساب احترافي مع جميع الإنجازات والسكنات الحصرية',
                price: 800,
                level: 85,
                seller: 'ProPlayer99',
                sellerId: 'user4',
                status: 'available',
                images: ['🎮'],
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('listings', JSON.stringify(listings));
    }

    if (storedTournaments) {
        tournaments = JSON.parse(storedTournaments);
    } else {
        tournaments = [
            {
                id: 1,
                title: 'بطولة الأسبوع - المرحلة الأولى',
                description: 'بطولة أسبوعية مثيرة مع جوائز كبيرة',
                entryFee: 50,
                prizePool: 5000,
                startDate: new Date(Date.now() + 86400000).toISOString(),
                participants: [],
                status: 'upcoming',
                maxParticipants: 100
            },
            {
                id: 2,
                title: 'بطولة الشهر الكبرى',
                description: 'أكبر بطولة شهرية مع جوائز فاخرة',
                entryFee: 100,
                prizePool: 20000,
                startDate: new Date(Date.now() + 604800000).toISOString(),
                participants: [],
                status: 'upcoming',
                maxParticipants: 500
            }
        ];
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
    }

    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
    
    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
        
        // Load page-specific content
        if (page === 'home') {
            renderHome();
        } else if (page === 'marketplace') {
            renderMarketplace();
        } else if (page === 'tournaments') {
            renderTournaments();
        } else if (page === 'bets') {
            renderBets();
        }
    }
}

// ============================================
// HOME PAGE
// ============================================

function renderHome() {
    // Update stats
    document.getElementById('userCount').textContent = (1247 + Math.floor(Math.random() * 100)).toLocaleString();
    document.getElementById('listingCount').textContent = listings.length.toLocaleString();
    document.getElementById('totalVolume').textContent = '$' + (2.5 + Math.random() * 2).toFixed(1) + 'M';

    // Render latest listings
    const latestListings = listings.slice(0, 3);
    const latestListingsHtml = latestListings.map(listing => createListingCard(listing)).join('');
    document.getElementById('latest-listings').innerHTML = latestListingsHtml;

    // Render latest tournaments
    const latestTournaments = tournaments.slice(0, 2);
    const latestTournamentsHtml = latestTournaments.map(tournament => createTournamentCard(tournament)).join('');
    document.getElementById('latest-tournaments').innerHTML = latestTournamentsHtml;
}

function createListingCard(listing) {
    return `
        <div class="border border-cyan-500/30 p-4 hover:border-cyan-400 transition cursor-pointer" onclick="showListingDetails(${listing.id})">
            <div class="text-2xl mb-2">${listing.images[0] || '🎮'}</div>
            <h3 class="text-lg font-bold text-cyan-400 mb-2">${listing.title}</h3>
            <p class="text-sm text-cyan-300 mb-3">${listing.description.substring(0, 50)}...</p>
            <div class="flex justify-between items-center">
                <span class="text-magenta-400 font-bold">$${listing.price}</span>
                <span class="text-cyan-300 text-sm">المستوى: ${listing.level}</span>
            </div>
            <p class="text-xs text-cyan-300 mt-2">البائع: ${listing.seller}</p>
        </div>
    `;
}

function createTournamentCard(tournament) {
    return `
        <div class="border border-magenta-500/30 p-4 hover:border-magenta-400 transition">
            <h3 class="text-lg font-bold text-magenta-400 mb-2">${tournament.title}</h3>
            <p class="text-sm text-magenta-300 mb-3">${tournament.description}</p>
            <div class="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                    <p class="text-cyan-300">رسوم الدخول</p>
                    <p class="text-magenta-400 font-bold">$${tournament.entryFee}</p>
                </div>
                <div>
                    <p class="text-cyan-300">الجوائز</p>
                    <p class="text-magenta-400 font-bold">$${tournament.prizePool}</p>
                </div>
            </div>
            <button onclick="registerTournament(${tournament.id})" class="w-full bg-magenta-500 text-black font-bold p-2 rounded hover:bg-magenta-400 transition text-sm">سجل الآن</button>
        </div>
    `;
}

// ============================================
// MARKETPLACE PAGE
// ============================================

function renderMarketplace() {
    renderListingsGrid(listings);
}

function renderListingsGrid(listingsToRender) {
    const html = listingsToRender.map(listing => `
        <div class="border border-cyan-500/30 p-4 hover:border-cyan-400 transition cursor-pointer" onclick="showListingDetails(${listing.id})">
            <div class="text-3xl mb-3">${listing.images[0] || '🎮'}</div>
            <h3 class="text-lg font-bold text-cyan-400 mb-2">${listing.title}</h3>
            <p class="text-sm text-cyan-300 mb-3">${listing.description}</p>
            <div class="flex justify-between items-center mb-3">
                <span class="text-magenta-400 font-bold text-lg">$${listing.price}</span>
                <span class="text-cyan-300 text-sm">المستوى: ${listing.level}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
                <span class="text-cyan-300">البائع: ${listing.seller}</span>
                <span class="text-green-400">${listing.status === 'available' ? '✓ متاح' : '✗ مباع'}</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('marketplace-listings').innerHTML = html;
}

function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const priceFilter = document.getElementById('priceFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;

    let filtered = listings.filter(listing => {
        // Search filter
        if (searchText && !listing.title.toLowerCase().includes(searchText) && 
            !listing.description.toLowerCase().includes(searchText)) {
            return false;
        }

        // Price filter
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(v => v === '+' ? Infinity : parseInt(v));
            if (listing.price < min || listing.price > max) {
                return false;
            }
        }

        // Level filter
        if (levelFilter) {
            const [min, max] = levelFilter.split('-').map(v => parseInt(v));
            if (listing.level < min || listing.level > max) {
                return false;
            }
        }

        return true;
    });

    renderListingsGrid(filtered);
}

function showListingDetails(listingId) {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    const html = `
        <div class="space-y-4">
            <div class="text-5xl text-center mb-4">${listing.images[0] || '🎮'}</div>
            <div>
                <p class="text-cyan-300 text-sm">العنوان</p>
                <p class="text-xl font-bold text-cyan-400">${listing.title}</p>
            </div>
            <div>
                <p class="text-cyan-300 text-sm">الوصف</p>
                <p class="text-cyan-300">${listing.description}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-cyan-300 text-sm">السعر</p>
                    <p class="text-2xl font-bold text-magenta-400">$${listing.price}</p>
                </div>
                <div>
                    <p class="text-cyan-300 text-sm">المستوى</p>
                    <p class="text-2xl font-bold text-cyan-400">${listing.level}</p>
                </div>
            </div>
            <div>
                <p class="text-cyan-300 text-sm">معلومات البائع</p>
                <p class="text-lg font-bold text-cyan-400">${listing.seller}</p>
            </div>
            <div class="border-t border-cyan-500/30 pt-4 space-y-2">
                ${currentUser ? `
                    <button onclick="purchaseListing(${listing.id})" class="w-full bg-cyan-500 text-black font-bold p-3 rounded hover:bg-cyan-400 transition">شراء الآن</button>
                ` : `
                    <button onclick="showLoginModal()" class="w-full bg-cyan-500 text-black font-bold p-3 rounded hover:bg-cyan-400 transition">سجل الدخول للشراء</button>
                `}
                <button onclick="closeModal('listing-details-modal')" class="w-full border border-cyan-500 text-cyan-400 p-3 rounded hover:bg-cyan-500/10 transition">إغلاق</button>
            </div>
        </div>
    `;

    document.getElementById('listing-details-content').innerHTML = html;
    document.getElementById('listing-details-modal').classList.remove('hidden');
}

// ============================================
// TOURNAMENTS PAGE
// ============================================

function renderTournaments() {
    const html = tournaments.map(tournament => `
        <div class="border border-magenta-500/30 p-6 hover:border-magenta-400 transition">
            <h3 class="text-2xl font-bold text-magenta-400 mb-3">${tournament.title}</h3>
            <p class="text-magenta-300 mb-4">${tournament.description}</p>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="border border-magenta-500/20 p-3">
                    <p class="text-cyan-300 text-sm">رسوم الدخول</p>
                    <p class="text-xl font-bold text-magenta-400">$${tournament.entryFee}</p>
                </div>
                <div class="border border-magenta-500/20 p-3">
                    <p class="text-cyan-300 text-sm">الجوائز</p>
                    <p class="text-xl font-bold text-magenta-400">$${tournament.prizePool}</p>
                </div>
                <div class="border border-magenta-500/20 p-3">
                    <p class="text-cyan-300 text-sm">المشاركون</p>
                    <p class="text-xl font-bold text-cyan-400">${tournament.participants.length}/${tournament.maxParticipants}</p>
                </div>
                <div class="border border-magenta-500/20 p-3">
                    <p class="text-cyan-300 text-sm">الحالة</p>
                    <p class="text-xl font-bold text-green-400">${tournament.status === 'upcoming' ? 'قادمة' : 'جارية'}</p>
                </div>
            </div>
            <button onclick="registerTournament(${tournament.id})" class="w-full bg-magenta-500 text-black font-bold p-3 rounded hover:bg-magenta-400 transition">سجل الآن</button>
        </div>
    `).join('');

    document.getElementById('tournaments-list').innerHTML = html;
}

function registerTournament(tournamentId) {
    if (!currentUser) {
        showLoginModal();
        return;
    }

    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    if (currentUser.balance < tournament.entryFee) {
        alert('رصيدك غير كافي للتسجيل في هذه البطولة');
        return;
    }

    if (tournament.participants.includes(currentUser.id)) {
        alert('أنت مسجل بالفعل في هذه البطولة');
        return;
    }

    // Deduct entry fee
    currentUser.balance -= tournament.entryFee;
    tournament.participants.push(currentUser.id);

    // Save changes
    saveUserToStorage(currentUser);
    localStorage.setItem('tournaments', JSON.stringify(tournaments));

    // Add transaction
    addTransaction({
        type: 'tournament_registration',
        amount: tournament.entryFee,
        description: `تسجيل في بطولة: ${tournament.title}`,
        date: new Date().toISOString()
    });

    alert('تم التسجيل بنجاح في البطولة!');
    renderTournaments();
}

// ============================================
// BETS PAGE
// ============================================

function renderBets() {
    // Render matches for betting
    const matches = [
        {
            id: 1,
            team1: 'Team Alpha',
            team2: 'Team Beta',
            odds1: 1.8,
            odds2: 2.1,
            tournament: 'بطولة الأسبوع'
        },
        {
            id: 2,
            team1: 'Team Gamma',
            team2: 'Team Delta',
            odds1: 1.9,
            odds2: 2.0,
            tournament: 'بطولة الأسبوع'
        }
    ];

    const matchesHtml = matches.map(match => `
        <div class="border border-cyan-500/30 p-4 hover:border-cyan-400 transition">
            <p class="text-cyan-300 text-sm mb-2">${match.tournament}</p>
            <div class="flex justify-between items-center mb-4">
                <span class="font-bold text-cyan-400">${match.team1}</span>
                <span class="text-magenta-400">VS</span>
                <span class="font-bold text-cyan-400">${match.team2}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 mb-4">
                <button onclick="placeBet(${match.id}, 1, ${match.odds1})" class="bg-cyan-500/20 border border-cyan-500 text-cyan-400 p-2 rounded hover:bg-cyan-500/30 transition text-sm">
                    ${match.team1} @ ${match.odds1}
                </button>
                <button onclick="placeBet(${match.id}, 2, ${match.odds2})" class="bg-magenta-500/20 border border-magenta-500 text-magenta-400 p-2 rounded hover:bg-magenta-500/30 transition text-sm">
                    ${match.team2} @ ${match.odds2}
                </button>
            </div>
        </div>
    `).join('');

    document.getElementById('bets-matches').innerHTML = matchesHtml;

    // Render bets history
    const betsHistoryHtml = userBets.map(bet => `
        <div class="border border-cyan-500/20 p-3 text-sm">
            <p class="text-cyan-400 font-bold">$${bet.amount}</p>
            <p class="text-cyan-300 text-xs">${bet.match}</p>
            <p class="text-magenta-300 text-xs">${new Date(bet.date).toLocaleDateString('ar-SA')}</p>
        </div>
    `).join('');

    document.getElementById('bets-history').innerHTML = betsHistoryHtml || '<p class="text-cyan-300 text-sm">لا توجد رهانات حتى الآن</p>';
}

function placeBet(matchId, teamId, odds) {
    if (!currentUser) {
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

    currentUser.balance -= betAmount;
    userBets.push({
        matchId,
        teamId,
        amount: betAmount,
        odds,
        match: `Match ${matchId}`,
        date: new Date().toISOString()
    });

    saveUserToStorage(currentUser);

    addTransaction({
        type: 'bet',
        amount: betAmount,
        description: `رهان على مباراة برأس مال ${betAmount}`,
        date: new Date().toISOString()
    });

    alert('تم تسجيل الرهان بنجاح!');
    renderBets();
}

// ============================================
// AUTHENTICATION
// ============================================

function handleAuthClick() {
    if (currentUser) {
        openDashboard();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function showSignupModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('signup-modal').classList.remove('hidden');
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }

    // Mock login - in real app, this would connect to Firebase
    const user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        username: email.split('@')[0],
        balance: 100,
        createdAt: new Date().toISOString()
    };

    saveUserToStorage(user);
    updateAuthButton();
    closeModal('login-modal');
    alert('تم تسجيل الدخول بنجاح!');
}

function handleSignup() {
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

    // Mock signup - in real app, this would connect to Firebase
    const user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        username,
        balance: 50,
        createdAt: new Date().toISOString()
    };

    saveUserToStorage(user);
    updateAuthButton();
    closeModal('signup-modal');
    alert('تم إنشاء الحساب بنجاح! تم إضافة رصيد ترحيبي بقيمة $50');
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateAuthButton();
    closeModal('dashboard-modal');
    navigateTo('home');
    alert('تم تسجيل الخروج بنجاح');
}

// ============================================
// DASHBOARD
// ============================================

function openDashboard() {
    if (!currentUser) {
        showLoginModal();
        return;
    }

    document.getElementById('dashboard-modal').classList.remove('hidden');
    loadDashboardData();
}

function loadDashboardData() {
    document.getElementById('currentBalance').textContent = '$' + currentUser.balance.toFixed(2);

    // Calculate total sales
    const totalSales = userListings
        .filter(l => l.status === 'sold')
        .reduce((sum, l) => sum + l.price, 0);
    document.getElementById('totalSales').textContent = '$' + totalSales.toFixed(2);

    // Load user listings
    const userListingsHtml = userListings.map(listing => `
        <div class="border border-cyan-500/30 p-3">
            <p class="font-bold text-cyan-400">${listing.title}</p>
            <p class="text-sm text-cyan-300">السعر: $${listing.price}</p>
            <p class="text-xs text-magenta-300">الحالة: ${listing.status === 'available' ? 'متاح' : 'مباع'}</p>
        </div>
    `).join('');
    document.getElementById('user-listings').innerHTML = userListingsHtml || '<p class="text-cyan-300">لا توجد حسابات معروضة</p>';

    // Load user purchases
    const userPurchasesHtml = userPurchases.map(purchase => `
        <div class="border border-magenta-500/30 p-3">
            <p class="font-bold text-magenta-400">${purchase.title}</p>
            <p class="text-sm text-magenta-300">السعر المدفوع: $${purchase.price}</p>
            <p class="text-xs text-cyan-300">التاريخ: ${new Date(purchase.date).toLocaleDateString('ar-SA')}</p>
        </div>
    `).join('');
    document.getElementById('user-purchases').innerHTML = userPurchasesHtml || '<p class="text-cyan-300">لم تقم بأي عمليات شراء</p>';
}

function switchDashboardTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.dashboard-tab').forEach(el => el.classList.remove('active', 'border-b-2', 'border-cyan-400'));

    // Show selected tab
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.remove('hidden');
    }

    // Update tab button
    event.target.classList.add('active', 'border-b-2', 'border-cyan-400');
}

function handleAddListing(event) {
    event.preventDefault();

    if (!currentUser) {
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

    const listing = {
        id: listings.length + 1,
        title,
        description,
        price,
        level,
        seller: currentUser.username,
        sellerId: currentUser.id,
        status: 'available',
        images: ['🎮'],
        createdAt: new Date().toISOString()
    };

    listings.push(listing);
    userListings.push(listing);

    localStorage.setItem('listings', JSON.stringify(listings));

    // Clear form
    document.getElementById('listingTitle').value = '';
    document.getElementById('listingDescription').value = '';
    document.getElementById('listingPrice').value = '';
    document.getElementById('listingLevel').value = '';

    alert('تم إضافة الحساب بنجاح!');
    loadDashboardData();
}

function purchaseListing(listingId) {
    if (!currentUser) {
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
        // Deduct from buyer
        currentUser.balance -= listing.price;

        // Add to purchases
        userPurchases.push({
            ...listing,
            date: new Date().toISOString()
        });

        // Mark listing as sold
        listing.status = 'sold';

        // Save changes
        saveUserToStorage(currentUser);
        localStorage.setItem('listings', JSON.stringify(listings));

        // Add transaction
        addTransaction({
            type: 'purchase',
            amount: listing.price,
            description: `شراء حساب: ${listing.title}`,
            date: new Date().toISOString()
        });

        alert('تم الشراء بنجاح! تحقق من لوحة التحكم للتفاصيل');
        closeModal('listing-details-modal');
        renderMarketplace();
    }
}

function showAddBalanceModal() {
    document.getElementById('add-balance-modal').classList.remove('hidden');
}

function handleAddBalance() {
    const amount = parseFloat(document.getElementById('balanceAmount').value);

    if (!amount || amount <= 0) {
        alert('أدخل مبلغاً صحيحاً');
        return;
    }

    currentUser.balance += amount;
    saveUserToStorage(currentUser);

    addTransaction({
        type: 'deposit',
        amount,
        description: `إضافة رصيد: $${amount}`,
        date: new Date().toISOString()
    });

    document.getElementById('balanceAmount').value = '';
    closeModal('add-balance-modal');
    alert('تم إضافة الرصيد بنجاح!');
    loadDashboardData();
}

// ============================================
// UTILITIES
// ============================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function addTransaction(transaction) {
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('fixed') && e.target.classList.contains('bg-black/80')) {
        e.target.classList.add('hidden');
    }
});

// Prevent modal close when clicking inside
document.querySelectorAll('[class*="modal"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
