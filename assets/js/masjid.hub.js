// ── DATA ──────────────────────────────────────────────────────────
const APP_DATA_URL = 'assets/data/masjid.hub.data.json';
const APP_DATA_VERSION = '2026-03-29-nurulhudauns';

let MOSQUES = [];
let TRANSACTIONS = [];
let EVENTS = [];
let VOUCHERS = [];
let PRODUCTS = [];
let VOLUNTEERS = [];
let ROOMS = [];
let PRAYERS = [];
let BADGES = [];
let MOSQUE_EVENT_CATALOG = {};
let DEPLOY_DEFAULT_TAKMIR = null;

// ── STATE ─────────────────────────────────────────────────────────
let selectedMosque = null;
const DEFAULT_CURRENT_USER = { name:'Ahmad Nur', role:'Mahasiswa', avatar:'A', email:'', phone:'' };
let currentUser = { ...DEFAULT_CURRENT_USER };
let currentPage = 'dashboard';
let currentTab = 'all';
let marketTab = 'all';
let streak = { current:12, longest:28, total:156 };
let financeChart, pieChart, incomeChart, expenseChart;
let mosqueMap = null;
let mosqueMarkers = [];
let filteredMosques = [];
let userGeolocation = null;
let selectedPackage = 'basic';
let isLoggedIn = false;
let activeRole = null;
let takmirSelectedPackage = 'basic';
let takmirRegistration = null;
let takmirLocationWatchId = null;
let takmirLocationWatchTimeoutId = null;
let packageModalMode = 'profile';
let selectedMosqueIdPersisted = null;
let adminPanelOpen = false;
let adminTheme = 'default';
let pendingLockedFeaturePage = null;
let jamaahAccounts = {};
let currentJamaahAccountKey = null;
let newlyUnlockedPages = [];

function renderAvatarElement(element, user = currentUser, fallback = 'J') {
  if (!element) return;

  const initials = user?.avatar || user?.name?.[0]?.toUpperCase() || fallback;
  const photo = user?.photo || '';

  if (photo) {
    element.textContent = '';
    element.style.backgroundImage = `url('${photo.replace(/'/g, "%27")}')`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
  } else {
    element.textContent = initials;
    element.style.backgroundImage = '';
    element.style.backgroundSize = '';
    element.style.backgroundPosition = '';
  }
}

const PACKAGE_PRICING = {
  basic: 29000,
  standard: 59000,
  premium: 99000
};

const PACKAGE_FEATURES = {
  basic: [
    'dashboard',
    'profile',
    'jadwal-sholat',
    'pengumuman',
    'admin-1'
  ],
  standard: [
    'dashboard',
    'profile',
    'jadwal-sholat',
    'pengumuman',
    'admin-1',
    'kajian',
    'event',
    'galeri',
    'form-kegiatan',
    'admin-3'
  ],
  premium: [
    'dashboard',
    'profile',
    'jadwal-sholat',
    'pengumuman',
    'admin-1',
    'kajian',
    'event',
    'galeri',
    'form-kegiatan',
    'admin-3',
    'dashboard-keuangan',
    'donasi',
    'laporan',
    'riwayat',
    'notifikasi',
    'booking',
    'umkm',
    'marketplace',
    'relawan',
    'streak'
  ]
};

const PACKAGE_FEATURE_DETAILS = {
  basic: {
    title: '🟢 Basic – Mulai Digital',
    price: 'Rp29.000 / bulan / masjid',
    description: 'Cocok untuk masjid yang baru mulai go digital.',
    features: [
      'Halaman masjid di dalam Masjid Hub → Menampilkan profil, alamat, dan informasi masjid',
      'Jadwal sholat → Update waktu sholat harian',
      'Pengumuman → Info kegiatan atau berita masjid',
      '1 akun admin → Bisa mengelola konten dasar'
    ],
    focus: 'Informasi masjid agar mudah diakses jamaah'
  },
  standard: {
    title: '🔵 Standard – Masjid Aktif',
    price: 'Rp59.000 / bulan / masjid',
    description: 'Cocok untuk masjid dengan kegiatan rutin.',
    features: [
      'Semua fitur Basic',
      'Kajian & event → Jadwal kajian, acara, dan kegiatan masjid',
      'Galeri masjid → Upload foto kegiatan',
      'Form kegiatan → Pendaftaran peserta acara',
      '3 akun admin → Bisa dikelola oleh beberapa pengurus'
    ],
    focus: 'Interaksi dan aktivitas jamaah'
  },
  premium: {
    title: '🟣 Premium – Masjid Modern',
    price: 'Rp99.000 / bulan / masjid',
    description: 'Cocok untuk masjid besar / pusat aktivitas.',
    features: [
      'Semua fitur Standard',
      'Dashboard keuangan → Catatan pemasukan & pengeluaran',
      'Donasi online → Memudahkan jamaah berdonasi',
      'Laporan & riwayat → Semua transaksi tercatat rapi',
      'Notifikasi (WA/Email) → Update otomatis ke jamaah',
      'Booking ruangan → Reservasi aula / tempat kegiatan',
      'UMKM Masjid → Wadah jualan jamaah',
      'Marketplace → Jual beli produk islami',
      'Relawan → Manajemen volunteer kegiatan',
      'Streak Ibadah → Fitur motivasi ibadah jamaah'
    ],
    focus: 'Sistem lengkap & transparansi'
  }
};

const PAGE_FEATURE_MAP = {
  'dashboard': 'dashboard',
  'donasi': 'donasi',
  'zcorner': 'umkm',
  'kajian': 'kajian',
  'market': 'marketplace',
  'relawan': 'relawan',
  'sholat': 'jadwal-sholat',
  'streak': 'streak',
  'laporan': 'laporan',
  'riwayat': 'riwayat',
  'booking': 'booking'
};

const FEATURE_LABELS = {
  dashboard: 'Dashboard',
  profile: 'Profil masjid',
  'jadwal-sholat': 'Jadwal sholat',
  pengumuman: 'Pengumuman',
  'admin-1': '1 akun admin',
  kajian: 'Kajian',
  event: 'Event masjid',
  galeri: 'Galeri masjid',
  'form-kegiatan': 'Form kegiatan',
  'admin-3': '3 akun admin',
  'dashboard-keuangan': 'Dashboard keuangan',
  donasi: 'Donasi online',
  laporan: 'Laporan keuangan',
  riwayat: 'Riwayat transaksi',
  notifikasi: 'Notifikasi jamaah',
  booking: 'Booking ruangan',
  umkm: 'UMKM masjid',
  marketplace: 'Marketplace',
  relawan: 'Program relawan',
  streak: 'Streak ibadah'
};

function getFeatureLabel(featureKey) {
  return FEATURE_LABELS[featureKey] || featureKey;
}

function getCurrentDonationHistory() {
  if (!Array.isArray(currentUser.donationHistory)) {
    currentUser.donationHistory = [];
  }
  return currentUser.donationHistory;
}

function createSeedDonationHistory() {
  return [
    { type:'Infaq Jumat', amount:50000, date:'26 Mar 2025', status:'success', emoji:'💚', mosqueName:'Masjid Nurul Huda' },
    { type:'Zakat Maal', amount:2500000, date:'15 Mar 2025', status:'success', emoji:'💰', mosqueName:'Masjid Agung Jawa Tengah' },
    { type:'Sedekah Jumat', amount:100000, date:'7 Mar 2025', status:'success', emoji:'🍱', mosqueName:'Masjid Al-Ikhlas' },
    { type:'Infaq Pembangunan', amount:500000, date:'1 Mar 2025', status:'success', emoji:'🏗️', mosqueName:'Masjid Baiturrahman' },
    { type:'Wakaf Produktif', amount:1000000, date:'20 Feb 2025', status:'success', emoji:'🌱', mosqueName:'Masjid Istiqlal Jakarta' },
  ];
}

function buildJamaahAccountKey(profile = {}, loginType = 'jamaah') {
  const email = String(profile.email || '').trim().toLowerCase();
  const phone = String(profile.phone || '').trim();
  const name = String(profile.name || 'jamaah').trim().toLowerCase().replace(/\s+/g, '-');

  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `${loginType}:${name}`;
}

function buildJamaahAccountData(profile = {}) {
  return {
    ...profile,
    avatar: profile.avatar || (profile.name?.[0] || 'J').toUpperCase(),
    photo: profile.photo || '',
    donationHistory: Array.isArray(profile.donationHistory) ? profile.donationHistory : createSeedDonationHistory(),
  };
}

function syncCurrentUserToJamaahAccount() {
  if (!currentJamaahAccountKey) return;
  jamaahAccounts[currentJamaahAccountKey] = buildJamaahAccountData(currentUser);
}

function loginJamaahAccount(profile = {}, loginType = 'jamaah') {
  const accountKey = buildJamaahAccountKey(profile, loginType);
  const existingAccount = jamaahAccounts[accountKey];

  currentJamaahAccountKey = accountKey;
  currentUser = existingAccount
    ? buildJamaahAccountData(existingAccount)
    : buildJamaahAccountData(profile);

  syncCurrentUserToJamaahAccount();
}

function ensureDonationHistorySeeded() {
  if (!Array.isArray(currentUser.donationHistory) || !currentUser.donationHistory.length) {
    currentUser.donationHistory = createSeedDonationHistory();
  }
  syncCurrentUserToJamaahAccount();
}

function populateHistoryFilters() {
  const mosqueSelect = document.getElementById('history-filter-mosque');
  const typeSelect = document.getElementById('history-filter-type');
  if (!mosqueSelect || !typeSelect) return;

  const history = getCurrentDonationHistory();
  const mosques = ['all', ...new Set(history.map(item => item.mosqueName).filter(Boolean))];
  const types = ['all', ...new Set(history.map(item => item.type).filter(Boolean))];
  const currentMosqueValue = mosqueSelect.value || 'all';
  const currentTypeValue = typeSelect.value || 'all';

  mosqueSelect.innerHTML = mosques.map(name => `<option value="${name}">${name === 'all' ? 'Semua Masjid' : name}</option>`).join('');
  typeSelect.innerHTML = types.map(type => `<option value="${type}">${type === 'all' ? 'Semua Jenis Donasi' : type}</option>`).join('');
  mosqueSelect.value = mosques.includes(currentMosqueValue) ? currentMosqueValue : 'all';
  typeSelect.value = types.includes(currentTypeValue) ? currentTypeValue : 'all';
}

function getUnlockedPagesForUpgrade(fromPkg, toPkg) {
  const currentFeatures = PACKAGE_FEATURES[fromPkg] || [];
  const nextFeatures = PACKAGE_FEATURES[toPkg] || [];
  const unlockedFeatures = nextFeatures.filter(feature => !currentFeatures.includes(feature));

  return [...new Set(
    Object.entries(PAGE_FEATURE_MAP)
      .filter(([, feature]) => unlockedFeatures.includes(feature))
      .map(([page]) => page)
  )];
}

function renderUnlockedFeatureIndicators() {
  document.querySelectorAll('.feature-unlocked-badge').forEach(el => el.remove());
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => el.classList.remove('feature-unlocked'));

  newlyUnlockedPages.forEach(page => {
    document.querySelectorAll(`[onclick*="navigate('${page}')"]`).forEach(el => {
      el.classList.add('feature-unlocked');
      const badge = document.createElement('span');
      badge.className = 'feature-unlocked-badge';
      badge.textContent = 'Baru';
      el.appendChild(badge);
    });
  });
}

function renderJamaahProfileSummary() {
  const mosqueEl = document.getElementById('profile-selected-mosque');
  const historyEl = document.getElementById('profile-donation-history');
  const totalDonationEl = document.getElementById('profile-total-donation');
  const totalTransactionsEl = document.getElementById('profile-total-transactions');
  if (!mosqueEl || !historyEl) return;

  ensureDonationHistorySeeded();

  if (selectedMosque) {
    mosqueEl.innerHTML = `
      <div class="profile-mini-mosque">
        <div class="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">${selectedMosque.icon}</div>
        <div class="min-w-0 flex-1">
          <p class="font-bold text-sm text-gray-800 truncate">${selectedMosque.name}</p>
          <p class="text-xs text-gray-500 mt-0.5 truncate">${selectedMosque.city}</p>
          <p class="text-[11px] text-emerald-700 mt-1">Paket ${String(selectedMosque.package || 'basic').toUpperCase()}</p>
        </div>
      </div>
    `;
  } else {
    mosqueEl.innerHTML = '<p class="text-xs text-gray-500">Belum ada masjid yang dipilih.</p>';
  }

  const totalAmount = getCurrentDonationHistory().reduce((sum, item) => sum + Number(item.amount || 0), 0);
  if (totalDonationEl) totalDonationEl.textContent = `Rp ${totalAmount.toLocaleString('id')}`;
  if (totalTransactionsEl) totalTransactionsEl.textContent = String(getCurrentDonationHistory().length);

  const history = getCurrentDonationHistory().slice(0, 4);
  if (!history.length) {
    historyEl.innerHTML = '<p class="text-xs text-gray-500">Belum ada riwayat donasi pada akun ini.</p>';
    return;
  }

  historyEl.innerHTML = history.map(item => `
    <div class="profile-mini-history-item">
      <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg flex-shrink-0">${item.emoji || '💚'}</div>
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-sm text-gray-800 truncate">${item.type}</p>
        <p class="text-[11px] text-gray-400 truncate">${item.date} · ${item.mosqueName || '-'}</p>
      </div>
      <p class="font-bold text-sm text-emerald-600">Rp ${Number(item.amount || 0).toLocaleString('id')}</p>
    </div>
  `).join('');
}

const STORAGE_KEY = 'masjidhub_state_v2';

function applyAppData(data = {}) {
  if (Array.isArray(data.mosques)) MOSQUES = data.mosques;
  if (Array.isArray(data.transactions)) TRANSACTIONS = data.transactions;
  if (Array.isArray(data.events)) EVENTS = data.events;
  if (Array.isArray(data.vouchers)) VOUCHERS = data.vouchers;
  if (Array.isArray(data.products)) PRODUCTS = data.products;
  if (Array.isArray(data.volunteers)) VOLUNTEERS = data.volunteers;
  if (Array.isArray(data.rooms)) ROOMS = data.rooms;
  if (Array.isArray(data.prayers)) PRAYERS = data.prayers;
  if (Array.isArray(data.badges)) BADGES = data.badges;
  if (data.mosqueEventCatalog && typeof data.mosqueEventCatalog === 'object') {
    MOSQUE_EVENT_CATALOG = data.mosqueEventCatalog;
  }
  if (data.defaultTakmirAdmin && typeof data.defaultTakmirAdmin === 'object') {
    DEPLOY_DEFAULT_TAKMIR = { ...data.defaultTakmirAdmin };
  }
  if (data.streak && typeof data.streak === 'object') {
    streak = {
      current: data.streak.current ?? streak.current,
      longest: data.streak.longest ?? streak.longest,
      total: data.streak.total ?? streak.total,
    };
  }

  filteredMosques = [...MOSQUES];
}

function getSerializableAppData() {
  return {
    mosques: MOSQUES,
    transactions: TRANSACTIONS,
    events: EVENTS,
    vouchers: VOUCHERS,
    products: PRODUCTS,
    volunteers: VOLUNTEERS,
    rooms: ROOMS,
    prayers: PRAYERS,
    badges: BADGES,
    streak,
    defaultTakmirAdmin: DEPLOY_DEFAULT_TAKMIR,
    mosqueEventCatalog: MOSQUE_EVENT_CATALOG,
  };
}

async function loadAppData() {
  try {
    const response = await fetch(APP_DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    applyAppData(data);
  } catch (error) {
    console.error('Gagal memuat data JSON:', error);
    showNotif('Data JSON gagal dimuat. Periksa assets/data/masjid.hub.data.json.', 'error');
  }
}

function formatRupiah(amount) {
  return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
}

function prependRecentTransactionFromFinance(item = {}, fallbackType = 'in') {
  const normalizedType = item.type === 'expense' || fallbackType === 'out' ? 'out' : 'in';
  const transactionEntry = {
    type: normalizedType,
    label: item.note || (normalizedType === 'in' ? 'Pemasukan baru' : 'Pengeluaran baru'),
    amount: Number(item.amount || 0),
    date: item.date || new Date().toLocaleDateString('id-ID'),
    time: item.time || '',
    category: normalizedType === 'in' ? 'Pemasukan Admin' : 'Pengeluaran Admin',
    icon: normalizedType === 'in' ? '📈' : '📉'
  };

  TRANSACTIONS.unshift(transactionEntry);
  TRANSACTIONS = TRANSACTIONS.slice(0, 12);
  renderRecentTx();
}

function parseTransactionDateTime(dateValue = '', timeValue = '') {
  const monthMap = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    mei: 4,
    jun: 5,
    jul: 6,
    agu: 7,
    agt: 7,
    sep: 8,
    okt: 9,
    nov: 10,
    des: 11,
  };

  const normalizedDate = String(dateValue || '').trim();
  const normalizedTime = String(timeValue || '').trim().replace('.', ':');
  const [hoursRaw, minutesRaw] = normalizedTime.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  const applyTime = (year, month, day) => new Date(
    year,
    month,
    day,
    Number.isFinite(hours) ? hours : 0,
    Number.isFinite(minutes) ? minutes : 0,
    0,
    0
  ).getTime();

  const slashMatch = normalizedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]) - 1;
    const year = Number(slashMatch[3]);
    return applyTime(year, month, day);
  }

  const shortMatch = normalizedDate.match(/(?:[A-Za-z]+,\s*)?(\d{1,2})\s+([A-Za-z]{3})/i);
  if (shortMatch) {
    const day = Number(shortMatch[1]);
    const monthKey = shortMatch[2].toLowerCase();
    const month = monthMap[monthKey];
    const year = new Date().getFullYear();
    if (Number.isInteger(month)) {
      return applyTime(year, month, day);
    }
  }

  const timestamp = Date.parse(`${normalizedDate}${normalizedTime ? ` ${normalizedTime}` : ''}`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function mapFinanceRecordToRecentTransaction(item = {}) {
  const normalizedType = item.type === 'expense' ? 'out' : 'in';
  return {
    type: normalizedType,
    label: item.note || (normalizedType === 'in' ? 'Pemasukan baru' : 'Pengeluaran baru'),
    amount: Number(item.amount || 0),
    date: item.date || new Date().toLocaleDateString('id-ID'),
    time: item.time || '',
    category: normalizedType === 'in' ? 'Pemasukan Admin' : 'Pengeluaran Admin',
    icon: normalizedType === 'in' ? '📈' : '📉'
  };
}

function buildRecentTransactionSignature(item = {}) {
  return [item.type, item.label, item.amount, item.date, item.time, item.category].join('|');
}

function getRelevantFinanceTransactions() {
  if (!takmirRegistration?.paid || !Array.isArray(takmirRegistration.financeRecords)) return [];
  if (selectedMosque && takmirRegistration.mosqueId && selectedMosque.id !== takmirRegistration.mosqueId) return [];

  return takmirRegistration.financeRecords.map(mapFinanceRecordToRecentTransaction);
}

function getRecentTransactionsFeed() {
  const merged = [...getRelevantFinanceTransactions(), ...TRANSACTIONS];
  const seen = new Set();

  return merged.filter(item => {
    const signature = buildRecentTransactionSignature(item);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  }).sort((left, right) => {
    const rightTime = parseTransactionDateTime(right.date, right.time);
    const leftTime = parseTransactionDateTime(left.date, left.time);
    return rightTime - leftTime;
  }).slice(0, 12);
}

function savePersistentState() {
  try {
    syncCurrentUserToJamaahAccount();
    const payload = {
      appDataVersion: APP_DATA_VERSION,
      appData: getSerializableAppData(),
      selectedMosqueId: selectedMosque ? selectedMosque.id : null,
      currentUser,
      jamaahAccounts,
      currentJamaahAccountKey,
      newlyUnlockedPages,
      selectedPackage,
      isLoggedIn,
      activeRole,
      takmirSelectedPackage,
      takmirRegistration,
      adminTheme,
      adminPanelOpen,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {}
}

function loadPersistentState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return;

    if (
      parsed.appData
      && typeof parsed.appData === 'object'
      && parsed.appDataVersion === APP_DATA_VERSION
    ) {
      applyAppData(parsed.appData);
    }

    jamaahAccounts = parsed.jamaahAccounts && typeof parsed.jamaahAccounts === 'object' ? parsed.jamaahAccounts : {};
    currentJamaahAccountKey = parsed.currentJamaahAccountKey || null;
    newlyUnlockedPages = Array.isArray(parsed.newlyUnlockedPages) ? parsed.newlyUnlockedPages : [];
    currentUser = parsed.currentUser || currentUser;
    if (currentJamaahAccountKey && jamaahAccounts[currentJamaahAccountKey]) {
      currentUser = buildJamaahAccountData(jamaahAccounts[currentJamaahAccountKey]);
    }
    ensureDonationHistorySeeded();
    selectedPackage = parsed.selectedPackage || selectedPackage;
    isLoggedIn = !!parsed.isLoggedIn;
    activeRole = parsed.activeRole || null;
    takmirSelectedPackage = parsed.takmirSelectedPackage || takmirSelectedPackage;
    takmirRegistration = parsed.takmirRegistration || null;
    selectedMosqueIdPersisted = parsed.selectedMosqueId || null;
    adminTheme = parsed.adminTheme || 'default';
    adminPanelOpen = !!parsed.adminPanelOpen;

    if (selectedMosqueIdPersisted) {
      selectedMosque = MOSQUES.find(m => m.id === selectedMosqueIdPersisted) || null;
    }

    renderUnlockedFeatureIndicators();
  } catch (_) {}
}

function buildSeedTakmirRegistration() {
  const configuredAdmin = DEPLOY_DEFAULT_TAKMIR && typeof DEPLOY_DEFAULT_TAKMIR === 'object'
    ? DEPLOY_DEFAULT_TAKMIR
    : null;
  const preferredMosqueId = Number(configuredAdmin?.mosqueId);
  const premiumMosque = Number.isFinite(preferredMosqueId)
    ? MOSQUES.find(mosque => Number(mosque.id) === preferredMosqueId)
    : MOSQUES.find(mosque => mosque.package === 'premium');
  if (!premiumMosque) return null;

  return {
    mosqueId: premiumMosque.id,
    mosqueName: configuredAdmin?.mosqueName || premiumMosque.name,
    city: configuredAdmin?.city || premiumMosque.city,
    address: configuredAdmin?.address || premiumMosque.address,
    adminName: configuredAdmin?.adminName || 'Ust Raffi Atalla',
    email: configuredAdmin?.email || 'takmir.premium@masjidhub.id',
    phone: configuredAdmin?.phone || '081390001122',
    password: configuredAdmin?.password || 'Takmir123!',
    package: configuredAdmin?.package || premiumMosque.package || 'premium',
    paid: configuredAdmin?.paid ?? true,
    lat: Number.isFinite(Number(configuredAdmin?.lat)) ? Number(configuredAdmin.lat) : premiumMosque.lat,
    lng: Number.isFinite(Number(configuredAdmin?.lng)) ? Number(configuredAdmin.lng) : premiumMosque.lng,
    mosqueData: { ...premiumMosque },
    financeRecords: Array.isArray(configuredAdmin?.financeRecords) ? configuredAdmin.financeRecords : [
      {
        amount: 15000000,
        note: 'Infaq Jumat Pekan Ini',
        date: '28/03/2026',
        type: 'income',
        time: '12.30'
      },
      {
        amount: 3250000,
        note: 'Operasional Harian Masjid',
        date: '27/03/2026',
        type: 'expense',
        time: '09.15'
      }
    ],
    customEvents: Array.isArray(configuredAdmin?.customEvents)
      ? [...configuredAdmin.customEvents]
      : Array.isArray(MOSQUE_EVENT_CATALOG[premiumMosque.id])
      ? [...MOSQUE_EVENT_CATALOG[premiumMosque.id]]
      : [],
  };
}

function isTakmirRegistrationUsable(registration = takmirRegistration) {
  return !!(
    registration
    && typeof registration === 'object'
    && String(registration.email || '').trim()
    && String(registration.password || '').trim()
    && (registration.paid === true || registration.paid === false)
  );
}

function ensureSeedTakmirAccount() {
  if (isTakmirRegistrationUsable()) return;
  const seededTakmir = buildSeedTakmirRegistration();
  if (!seededTakmir) return;

  takmirRegistration = seededTakmir;
  takmirSelectedPackage = seededTakmir.package;
}

function syncTakmirPaymentUI() {
  const panel = document.getElementById('takmir-payment-panel');
  const bill = document.getElementById('takmir-bill-amount');
  const status = document.getElementById('takmir-payment-status');
  const action = document.getElementById('go-admin-btn');
  const upgradeAction = document.getElementById('upgrade-package-btn');

  if (!panel || !bill || !status || !action) return;

  if (!takmirRegistration) {
    panel.classList.add('hidden');
    status.textContent = 'Belum Bayar';
    status.className = 'badge badge-red';
    action.classList.add('hidden');
    if (upgradeAction) upgradeAction.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');
  bill.textContent = `${formatRupiah(PACKAGE_PRICING[takmirRegistration.package] || PACKAGE_PRICING.basic)}/bulan`;
  if (upgradeAction) {
    const isPremium = (takmirRegistration.package || 'basic') === 'premium';
    upgradeAction.classList.toggle('hidden', isPremium);
    upgradeAction.textContent = isPremium ? 'Paket Tertinggi Aktif' : 'Upgrade Paket';
  }

  if (takmirRegistration.paid) {
    status.textContent = 'Lunas';
    status.className = 'badge badge-green';
    action.classList.remove('hidden');
  } else {
    status.textContent = 'Belum Bayar';
    status.className = 'badge badge-red';
    action.classList.add('hidden');
  }
}

function getDeployDefaultTakmir() {
  const seededTakmir = buildSeedTakmirRegistration();
  return seededTakmir && typeof seededTakmir === 'object' ? seededTakmir : null;
}

function hydrateDefaultTakmirLoginInfo() {
  const defaultTakmir = getDeployDefaultTakmir();
  if (!defaultTakmir) return;

  const mosqueEl = document.getElementById('default-admin-mosque');
  const emailEl = document.getElementById('default-admin-email');
  const passwordEl = document.getElementById('default-admin-password');

  if (mosqueEl) mosqueEl.textContent = defaultTakmir.mosqueName || '-';
  if (emailEl) emailEl.textContent = defaultTakmir.email || '-';
  if (passwordEl) passwordEl.textContent = defaultTakmir.password || '-';
}

function hydrateTakmirForm() {
  hydrateDefaultTakmirLoginInfo();

  if (!takmirRegistration) {
    setTakmirPackage(takmirSelectedPackage || 'basic');
    updateTakmirLocationUI();
    syncTakmirPaymentUI();
    return;
  }

  document.getElementById('reg-mosque-name').value = takmirRegistration.mosqueName || '';
  document.getElementById('reg-mosque-city').value = takmirRegistration.city || '';
  document.getElementById('reg-mosque-address').value = takmirRegistration.address || '';
  document.getElementById('reg-admin-name').value = takmirRegistration.adminName || '';
  document.getElementById('reg-admin-email').value = takmirRegistration.email || '';
  document.getElementById('reg-admin-phone').value = takmirRegistration.phone || '';
  document.getElementById('reg-admin-password').value = takmirRegistration.password || '';
  if (document.getElementById('takmir-login-email')) {
    document.getElementById('takmir-login-email').value = takmirRegistration.email || '';
  }
  if (document.getElementById('takmir-login-password')) {
    document.getElementById('takmir-login-password').value = takmirRegistration.password || '';
  }
  updateTakmirLocationUI();
  setTakmirPackage(takmirRegistration.package || 'basic');
  syncTakmirPaymentUI();
}

function updateTakmirLocationUI() {
  const lat = Number(takmirRegistration?.lat);
  const lng = Number(takmirRegistration?.lng);
  const accuracy = Number(takmirRegistration?.locationAccuracyMeters);
  const statusEl = document.getElementById('reg-location-status');
  const coordsEl = document.getElementById('reg-location-coords');
  const btnEl = document.getElementById('reg-location-btn');

  if (statusEl) {
    statusEl.textContent = Number.isFinite(lat) && Number.isFinite(lng)
      ? `Lokasi perangkat sudah terverifikasi${Number.isFinite(accuracy) ? ` (akurasi sekitar ${Math.round(accuracy)} m)` : ''}.`
      : 'Lokasi perangkat belum diambil.';
  }

  if (coordsEl) {
    coordsEl.textContent = Number.isFinite(lat) && Number.isFinite(lng)
      ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      : '-';
  }

  if (btnEl) {
    btnEl.textContent = Number.isFinite(lat) && Number.isFinite(lng)
      ? 'Perbarui Lokasi Device'
      : 'Ambil Lokasi Device';
    btnEl.disabled = takmirLocationWatchId !== null;
    btnEl.classList.toggle('opacity-60', takmirLocationWatchId !== null);
    btnEl.classList.toggle('cursor-not-allowed', takmirLocationWatchId !== null);
  }
}

function hasValidCoordinates(lat, lng) {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

function getSafeMosqueImage(mosque = {}) {
  const image = String(mosque.image || '').trim();
  if (image) return image;

  const fallbackLabel = encodeURIComponent(String(mosque.name || 'Masjid').trim() || 'Masjid');
  return `https://placehold.co/1200x675/065f46/ffffff?text=${fallbackLabel}`;
}

function clearTakmirLocationWatcher() {
  if (takmirLocationWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(takmirLocationWatchId);
  }
  if (takmirLocationWatchTimeoutId !== null) {
    clearTimeout(takmirLocationWatchTimeoutId);
  }
  takmirLocationWatchId = null;
  takmirLocationWatchTimeoutId = null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function autofillTakmirAddressFromReverseGeocode(payload = {}) {
  const cityInput = document.getElementById('reg-mosque-city');
  const addressInput = document.getElementById('reg-mosque-address');

  if (!cityInput && !addressInput) return;

  const cityCandidate = [
    payload.city,
    payload.town,
    payload.village,
    payload.municipality,
    payload.county,
    payload.state,
  ].find(Boolean) || '';

  const addressCandidate = [
    payload.road,
    payload.suburb,
    cityCandidate,
    payload.state,
    payload.postcode,
  ].filter(Boolean).join(', ');

  let changed = false;
  if (cityInput && !cityInput.value.trim() && cityCandidate) {
    cityInput.value = cityCandidate;
    changed = true;
  }
  if (addressInput && !addressInput.value.trim() && addressCandidate) {
    addressInput.value = addressCandidate;
    changed = true;
  }

  if (changed) {
    showNotif('Kota/alamat awal terisi otomatis dari lokasi perangkat.', 'success');
  }
}

async function reverseGeocodeLocation(lat, lng) {
  const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&accept-language=id`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Reverse geocode gagal: HTTP ${response.status}`);
  }

  const result = await response.json();
  const address = result?.address || {};
  autofillTakmirAddressFromReverseGeocode(address);
}

function buildMosqueMapPopupHtml(mosque = {}) {
  const pkg = String(mosque.package || 'basic').toUpperCase();
  const image = getSafeMosqueImage(mosque);
  return `
    <div class="map-popup-card">
      <div class="map-popup-media-wrap">
        <img class="map-popup-media" src="${escapeHtml(image)}" alt="Foto ${escapeHtml(mosque.name || 'Masjid')}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${escapeHtml(getSafeMosqueImage({ name: mosque.name }))}'">
        <span class="map-popup-package">${escapeHtml(pkg)}</span>
      </div>
      <p class="map-popup-title">${escapeHtml(mosque.icon)} ${escapeHtml(mosque.name)}</p>
      <p class="map-popup-address">${escapeHtml(mosque.address)}</p>
      <p class="map-popup-meta">${escapeHtml(mosque.city)}${mosque.verified ? ' · Terverifikasi' : ''}</p>
      <div class="map-popup-actions">
        <button class="map-popup-btn map-popup-btn-ghost" onclick="viewMosqueProfileFromMap(${Number(mosque.id)})">Lihat Profil</button>
        <button class="map-popup-btn map-popup-btn-primary" onclick="selectMosque(${Number(mosque.id)})">Pilih Masjid</button>
      </div>
    </div>
  `;
}

function requestTakmirDeviceLocation() {
  if (!navigator.geolocation) {
    showNotif('Perangkat tidak mendukung GPS/geolocation.', 'error');
    return;
  }

  if (!takmirRegistration || typeof takmirRegistration !== 'object') {
    takmirRegistration = takmirRegistration || {
      package: takmirSelectedPackage || 'basic',
      paid: false,
      financeRecords: [],
    };
  }

  const statusEl = document.getElementById('reg-location-status');
  clearTakmirLocationWatcher();

  let bestPosition = null;
  const finishCapture = async (shouldNotifyError = false) => {
    clearTakmirLocationWatcher();

    if (!bestPosition) {
      if (statusEl) statusEl.textContent = 'Gagal mengambil lokasi. Izinkan akses lokasi lalu coba lagi.';
      updateTakmirLocationUI();
      if (shouldNotifyError) {
        showNotif('Akses lokasi ditolak atau GPS belum stabil. Mohon coba lagi di area terbuka.', 'error');
      }
      return;
    }

    takmirRegistration.lat = bestPosition.coords.latitude;
    takmirRegistration.lng = bestPosition.coords.longitude;
    takmirRegistration.locationAccuracyMeters = bestPosition.coords.accuracy;
    takmirRegistration.locationUpdatedAt = Date.now();
    takmirRegistration.locationSource = 'device-gps';

    try {
      await reverseGeocodeLocation(takmirRegistration.lat, takmirRegistration.lng);
    } catch (_) {}

    updateTakmirLocationUI();
    savePersistentState();
    showNotif(`Lokasi perangkat disimpan dengan akurasi sekitar ${Math.round(bestPosition.coords.accuracy)} meter.`, 'success');
  };

  if (statusEl) statusEl.textContent = 'Mencari titik GPS paling akurat...';
  updateTakmirLocationUI();

  takmirLocationWatchId = navigator.geolocation.watchPosition(
    position => {
      const nextAccuracy = Number(position?.coords?.accuracy);
      const bestAccuracy = Number(bestPosition?.coords?.accuracy);

      if (!bestPosition || (Number.isFinite(nextAccuracy) && (!Number.isFinite(bestAccuracy) || nextAccuracy < bestAccuracy))) {
        bestPosition = position;
      }

      if (statusEl) {
        statusEl.textContent = Number.isFinite(nextAccuracy)
          ? `GPS terdeteksi, menyempurnakan akurasi (${Math.round(nextAccuracy)} m)...`
          : 'GPS terdeteksi, menyempurnakan akurasi...';
      }

      if (Number.isFinite(nextAccuracy) && nextAccuracy <= 35) {
        finishCapture(false);
      }
    },
    () => {
      finishCapture(true);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );

  takmirLocationWatchTimeoutId = setTimeout(() => {
    finishCapture(bestPosition === null);
  }, 9000);
}

function hasAdminWriteAccess() {
  return activeRole === 'takmir' && !!takmirRegistration?.paid;
}

function ensureAdminWriteAccess() {
  if (hasAdminWriteAccess()) return true;
  showNotif('Aksi ini hanya bisa dilakukan oleh admin takmir.', 'error');
  return false;
}

function getActiveRoleMeta() {
  if (activeRole === 'takmir') {
    return { label: 'Pengurus', className: 'role-takmir' };
  }
  if (activeRole === 'jamaah') {
    return { label: 'Jamaah', className: 'role-jamaah' };
  }
  return { label: 'Publik', className: 'role-public' };
}

function updateRoleBadgeUI() {
  const badge = document.getElementById('active-role-badge');
  if (!badge) return;

  const roleMeta = getActiveRoleMeta();
  badge.textContent = roleMeta.label;
  badge.classList.remove('role-jamaah', 'role-takmir', 'role-public');
  badge.classList.add(roleMeta.className);
}

function resetRoleTransitionState() {
  pendingLockedFeaturePage = null;
  adminPanelOpen = false;
  currentPage = 'dashboard';
  selectedMosque = null;

  closeModal('locked-feature-modal');
  closeJamaahProfile();
  closePackageModal();

  const mobileSidebar = document.getElementById('mobile-sidebar-el');
  if (mobileSidebar) mobileSidebar.classList.remove('open');
  const mobileOverlay = document.getElementById('mobile-overlay');
  if (mobileOverlay) mobileOverlay.classList.add('hidden');
}

function updateAuthUI() {
  const btn = document.getElementById('mosque-login-btn');
  if (btn) {
    if (isLoggedIn) {
      btn.innerHTML = `<i class="fas fa-user-check mr-1"></i>${currentUser.name || 'Akun'}`;
    } else {
      btn.innerHTML = '<i class="fas fa-sign-in-alt mr-1"></i>Login';
    }
  }
  updateRoleBadgeUI();
}

function toRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180;
}

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistanceLabel(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return '-';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

function enrichMosquesWithUserDistance(lat, lng) {
  return MOSQUES.map(mosque => {
    const mosqueLat = Number(mosque.lat);
    const mosqueLng = Number(mosque.lng);
    const hasCoords = hasValidCoordinates(mosqueLat, mosqueLng);
    const distanceKm = hasCoords ? calculateDistanceKm(lat, lng, mosqueLat, mosqueLng) : Number.POSITIVE_INFINITY;

    return {
      ...mosque,
      distanceKm,
      distance: hasCoords ? formatDistanceLabel(distanceKm) : (mosque.distance || '-'),
    };
  }).sort((left, right) => {
    const leftDistance = Number.isFinite(left.distanceKm) ? left.distanceKm : Number.POSITIVE_INFINITY;
    const rightDistance = Number.isFinite(right.distanceKm) ? right.distanceKm : Number.POSITIVE_INFINITY;
    return leftDistance - rightDistance;
  });
}

function focusMapOnMosque(mosqueId, options = {}) {
  if (!mosqueMap || !mosqueMarkers.length) return;

  const { zoom = 15, openPopup = true } = options;
  const markerEntry = mosqueMarkers.find(item => Number(item.id) === Number(mosqueId));
  if (!markerEntry) return;

  const latLng = markerEntry.marker.getLatLng();
  mosqueMap.setView(latLng, zoom, { animate: true });
  if (openPopup) markerEntry.marker.openPopup();
}

function getAdminPanelContext(page = currentPage) {
  const contexts = {
    dashboard: {
      key: 'dashboard',
      title: 'Kelola Dashboard Keuangan',
      description: 'Input pemasukan, pengeluaran, dan tema dashboard langsung dari panel ini.',
      features: ['dashboard-keuangan'],
      showTheme: true,
      buttonLabel: 'Panel Dashboard',
      iconClass: 'fas fa-chart-line'
    },
    kajian: {
      key: 'kajian',
      title: 'Kelola Kajian & Event',
      description: 'Saat halaman Kajian aktif, hanya pengaturan kajian dan event yang ditampilkan.',
      features: ['kajian'],
      showTheme: false,
      buttonLabel: 'Panel Kajian',
      iconClass: 'fas fa-calendar-check'
    }
  };

  return contexts[page] || {
    key: 'profile',
    title: 'Kelola Profil Masjid',
    description: 'Halaman ini menggunakan pengaturan profil masjid agar panel tetap ringkas dan tidak menutupi konten.',
    features: ['profile'],
    showTheme: false,
    buttonLabel: 'Panel Profil',
    iconClass: 'fas fa-mosque'
  };
}

function updateAdminModeUI() {
  const toggle = document.getElementById('admin-live-toggle');
  const panel = document.getElementById('admin-live-panel');
  const appScreen = document.getElementById('app-screen');
  const isAdmin = activeRole === 'takmir' && !!takmirRegistration?.paid;
  const context = getAdminPanelContext();
  const contextTitle = document.getElementById('admin-live-context-title');
  const contextDesc = document.getElementById('admin-live-context-desc');
  const contextIcon = document.getElementById('admin-live-context-icon');

  if (toggle) {
    toggle.classList.toggle('hidden', !isAdmin);
    toggle.classList.toggle('inline-flex', isAdmin);
    toggle.innerHTML = adminPanelOpen
      ? '<i class="fas fa-sliders-h"></i><span>Tutup Panel</span>'
      : `<i class="fas fa-sliders-h"></i><span>${context.buttonLabel}</span>`;
  }
  if (contextTitle) contextTitle.textContent = context.title;
  if (contextDesc) contextDesc.textContent = context.description;
  if (contextIcon) {
    contextIcon.innerHTML = `<i class="${context.iconClass}"></i>`;
    contextIcon.setAttribute('data-context', context.key);
  }
  if (panel) {
    panel.classList.toggle('hidden', !(isAdmin && adminPanelOpen));
    if (isAdmin && adminPanelOpen) {
      updateAdminPanelFeatureVisibility();
    }
  }

  ['dashboard', 'kajian', 'profile'].forEach(tabKey => {
    const tab = document.getElementById(`admin-tab-${tabKey}`);
    if (!tab) return;
    tab.classList.toggle('active', tabKey === context.key);
  });

  if (appScreen) {
    appScreen.classList.toggle('admin-panel-open', isAdmin && adminPanelOpen);
    appScreen.classList.remove('theme-ocean', 'theme-sunset');
    if (adminTheme === 'ocean') appScreen.classList.add('theme-ocean');
    if (adminTheme === 'sunset') appScreen.classList.add('theme-sunset');
  }
}

function updateAdminPanelFeatureVisibility() {
  const panel = document.getElementById('admin-live-panel');
  if (!takmirRegistration?.paid || !panel) return;
  const pkg = takmirRegistration.package || 'basic';
  const features = PACKAGE_FEATURES[pkg] || [];
  const context = getAdminPanelContext();
  const allowedContextFeatures = context.features || [];
  let visibleCount = 0;

  panel.querySelectorAll('[data-feature]').forEach(card => {
    const feature = card.getAttribute('data-feature');
    const canAccessByPackage = features.includes(feature);
    const matchesContext = allowedContextFeatures.includes(feature);
    const shouldShow = canAccessByPackage && matchesContext;
    card.classList.toggle('hidden', !shouldShow);
    if (shouldShow) visibleCount += 1;
  });

  const themePanel = document.getElementById('admin-panel-theme');
  if (themePanel) {
    themePanel.classList.toggle('hidden', !context.showTheme);
  }

  const emptyState = document.getElementById('admin-live-empty');
  if (emptyState) {
    emptyState.classList.toggle('hidden', visibleCount > 0);
  }
}

function updateMosquePackageInfoDisplay() {
  const infoSection = document.getElementById('mosque-package-info');
  
  if (!infoSection) return;
  
  if (isLoggedIn && activeRole === 'jamaah' && selectedMosque && selectedMosque.package) {
    const pkg = selectedMosque.package;
    const pkgName = pkg.charAt(0).toUpperCase() + pkg.slice(1);
    const pkgDetails = PACKAGE_FEATURE_DETAILS[pkg] || {};
    
    document.getElementById('mosque-package-name').textContent = pkgName;
    document.getElementById('mosque-package-desc').textContent = pkgDetails.description || 'Paket masjid';
    infoSection.classList.remove('hidden');
  } else {
    infoSection.classList.add('hidden');
  }
}

function toggleAdminLivePanel() {
  if (!(activeRole === 'takmir' && takmirRegistration?.paid)) return;
  adminPanelOpen = !adminPanelOpen;
  updateAdminModeUI();
  savePersistentState();
}

function applyAdminTheme(theme) {
  adminTheme = theme;
  updateAdminModeUI();
  savePersistentState();
}

// ── GENERIC MODAL FUNCTIONS ──────────────────────────────────────
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.toggle('hidden');
}

function openLoginPortal() {
  resetRoleTransitionState();
  isLoggedIn = false;
  currentUser = { ...DEFAULT_CURRENT_USER };
  activeRole = null;
  savePersistentState();
  updateAuthUI();
  updateAdminModeUI();
  showScreen('role-screen');
}

function buildTakmirMosqueData() {
  if (!takmirRegistration) return null;
  const previous = takmirRegistration.mosqueData || {};
  const registrationLat = Number(takmirRegistration.lat);
  const registrationLng = Number(takmirRegistration.lng);
  const id = takmirRegistration.mosqueId || Date.now();
  const sourceMosque = MOSQUES.find(m => m.id === id) || previous;
  const icon = sourceMosque.icon || '🕌';
  return {
    id,
    name: takmirRegistration.mosqueName,
    address: takmirRegistration.address,
    city: takmirRegistration.city,
    icon,
    color: sourceMosque.color || 'emerald',
    members: sourceMosque.members || 320,
    distance: sourceMosque.distance || '0 km',
    rating: sourceMosque.rating || 4.7,
    verified: sourceMosque.verified ?? true,
    package: takmirRegistration.package || 'basic',
    lat: Number.isFinite(registrationLat)
      ? registrationLat
      : (Number.isFinite(Number(previous.lat)) ? Number(previous.lat) : -6.995),
    lng: Number.isFinite(registrationLng)
      ? registrationLng
      : (Number.isFinite(Number(previous.lng)) ? Number(previous.lng) : 110.425),
    image: getSafeMosqueImage({ image: sourceMosque.image || previous.image, name: takmirRegistration.mosqueName }),
    description: sourceMosque.description || 'Masjid binaan takmir yang baru bergabung di MasjidHub dan sedang mengaktifkan layanan digital jamaah.',
    tags: Array.isArray(sourceMosque.tags) && sourceMosque.tags.length ? sourceMosque.tags : ['Masjid Baru', 'Komunitas', 'Digitalisasi'],
    balance: sourceMosque.balance || 25000000,
    income: sourceMosque.income || 8500000,
    expense: sourceMosque.expense || 4200000,
    locationAccuracyMeters: Number.isFinite(Number(takmirRegistration.locationAccuracyMeters))
      ? Number(takmirRegistration.locationAccuracyMeters)
      : Number(previous.locationAccuracyMeters),
  };
}

function ensureRegisteredMosqueInList() {
  if (!takmirRegistration) return;
  const mosque = buildTakmirMosqueData();
  if (!mosque) return;

  takmirRegistration.mosqueId = mosque.id;
  takmirRegistration.mosqueData = mosque;
  const idx = MOSQUES.findIndex(m => m.id === mosque.id);
  if (idx >= 0) {
    MOSQUES[idx] = { ...MOSQUES[idx], ...mosque };
  } else {
    MOSQUES.push(mosque);
  }
  filteredMosques = [...MOSQUES];

  if (!Array.isArray(takmirRegistration.customEvents) || !takmirRegistration.customEvents.length) {
    takmirRegistration.customEvents = MOSQUE_EVENT_CATALOG[mosque.id] || [
      { title: 'Kajian Perdana Takmir', time: 'Sabtu, 19:00', type: 'Kajian' },
      { title: 'Program Silaturahmi Jamaah', time: 'Ahad, 08:00', type: 'Komunitas' },
    ];
  }
  MOSQUE_EVENT_CATALOG[mosque.id] = [...takmirRegistration.customEvents];
}

// ── JAMAAH FEATURE GATING ────────────────────────────────────────
function getJamaahAvailableFeatures() {
  if (!selectedMosque) return [];
  const pkg = selectedMosque.package || 'basic';
  return PACKAGE_FEATURES[pkg] || [];
}

function updateJamaahUIByPackage() {
  if (!selectedMosque) return;
  const features = getJamaahAvailableFeatures();
  
  const requirements = {
    'donasi': 'premium',
    'zcorner': 'premium',
    'market': 'premium',
    'relawan': 'premium',
    'laporan': 'premium',
    'riwayat': 'premium',
    'booking': 'premium',
    'streak': 'premium',
    'kajian': 'standard'
  };
  
  Object.keys(requirements).forEach(page => {
    const requiredPkg = requirements[page];
    const canAccess = features.includes(PAGE_FEATURE_MAP[page] || page);
    
    document.querySelectorAll(`[onclick*="navigate('${page}')"]`).forEach(el => {
      if (!canAccess) {
        el.style.opacity = '0.3';
        el.style.pointerEvents = 'none';
        el.setAttribute('data-locked', 'true');
        el.title = `Hanya tersedia di paket ${requiredPkg.toUpperCase()}`;
      } else {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.removeAttribute('data-locked');
        el.title = '';
      }
    });
    
    const section = document.getElementById(`page-${page}`);
    if (section) {
      section.classList.toggle('hidden', !canAccess);
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────────
setTimeout(async () => {
  await loadAppData();
  loadPersistentState();
  ensureSeedTakmirAccount();
  ensureRegisteredMosqueInList();
  if (!selectedMosque && selectedMosqueIdPersisted) {
    selectedMosque = MOSQUES.find(m => m.id === selectedMosqueIdPersisted) || null;
  }
  hydrateTakmirForm();
  ensureMosqueSelectorReady();
  updateAuthUI();

  if (activeRole === 'takmir') {
    if (takmirRegistration && takmirRegistration.paid) {
      ensureRegisteredMosqueInList();
      selectedMosque = MOSQUES.find(m => m.id === takmirRegistration.mosqueId) || selectedMosque;
      currentUser = {
        name: takmirRegistration.adminName || 'Admin Takmir',
        role: 'Admin Masjid',
        avatar: (takmirRegistration.adminName?.[0] || 'A').toUpperCase(),
        email: '',
        phone: takmirRegistration.phone || '',
      };
      isLoggedIn = true;
      initApp();
      initAdminDashboard();
      showScreen('app-screen');
    } else {
      showScreen('takmir-screen');
    }
  } else if (isLoggedIn) {
    if (selectedMosque) {
      initApp();
      showScreen('app-screen');
    } else {
      showScreen('mosque-screen');
    }
  } else {
    showScreen('mosque-screen');
  }

  updateAdminModeUI();
  initSholatTime();
}, 1800);

// ── PWA REGISTRATION ──────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE='masjidhub-v1';
    self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./'])));});
    self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
  `;
  const blob = new Blob([swCode], { type:'application/javascript' });
  const swURL = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swURL).catch(()=>{});
}

// ── SCREEN MANAGEMENT ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('hidden', s.id !== id);
  });
}

function ensureMosqueSelectorReady() {
  filteredMosques = [...MOSQUES];
  renderMosques(filteredMosques);
  initMosqueMap();
  updateMosqueMap(filteredMosques);
}

function startJamaahFlow() {
  resetRoleTransitionState();
  isLoggedIn = false;
  currentUser = { ...DEFAULT_CURRENT_USER };
  activeRole = 'jamaah';
  savePersistentState();
  updateAuthUI();
  updateAdminModeUI();
  showScreen('login-screen');
}

function startTakmirFlow() {
  resetRoleTransitionState();
  isLoggedIn = false;
  currentUser = { ...DEFAULT_CURRENT_USER };
  activeRole = 'takmir';
  hydrateTakmirForm();
  savePersistentState();
  updateAuthUI();
  updateAdminModeUI();
  showScreen('takmir-screen');
}

function backToRole() {
  resetRoleTransitionState();
  isLoggedIn = false;
  currentUser = { ...DEFAULT_CURRENT_USER };
  activeRole = null;
  savePersistentState();
  updateAuthUI();
  updateAdminModeUI();
  showScreen('mosque-screen');
}

function openJamaahProfile() {
  if (!isLoggedIn) {
    showNotif('Silakan login terlebih dahulu.', 'error');
    openLoginPortal();
    return;
  }
  document.getElementById('profile-name').value = currentUser.name || '';
  document.getElementById('profile-email').value = currentUser.email || '';
  document.getElementById('profile-phone').value = currentUser.phone || '';
  document.getElementById('profile-photo').value = currentUser.photo || '';
  document.getElementById('profile-preview-name').textContent = currentUser.name || 'Jamaah';
  document.getElementById('profile-preview-email').textContent = currentUser.email || currentUser.phone || '-';
  renderAvatarElement(document.getElementById('profile-avatar-preview'));
  renderJamaahProfileSummary();
  document.getElementById('jamaah-profile-modal').classList.remove('hidden');
}

function closeJamaahProfile() {
  document.getElementById('jamaah-profile-modal').classList.add('hidden');
}

function saveJamaahProfile() {
  const previousAccountKey = currentJamaahAccountKey;
  const name = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  const photo = document.getElementById('profile-photo').value.trim();

  if (!name) {
    showNotif('Nama jamaah wajib diisi.', 'error');
    return;
  }

  currentUser.name = name;
  currentUser.email = email;
  currentUser.phone = phone;
  currentUser.photo = photo;
  currentUser.avatar = (name[0] || 'J').toUpperCase();
  currentJamaahAccountKey = buildJamaahAccountKey(currentUser, 'jamaah');
  if (previousAccountKey && previousAccountKey !== currentJamaahAccountKey) {
    delete jamaahAccounts[previousAccountKey];
  }
  syncCurrentUserToJamaahAccount();

  savePersistentState();
  if (selectedMosque) initApp();
  updateAuthUI();
  closeJamaahProfile();
  showNotif('Profil jamaah berhasil diperbarui.', 'success');
}

function logoutFromProfile() {
  closeJamaahProfile();
  logout();
}

function loginTakmirAdmin() {
  const email = document.getElementById('takmir-login-email').value.trim().toLowerCase();
  const password = document.getElementById('takmir-login-password').value;

  if (!takmirRegistration) {
    showNotif('Belum ada data pendaftaran masjid.', 'error');
    return;
  }

  const validEmail = email && email === String(takmirRegistration.email || '').toLowerCase();
  const validPassword = password && password === takmirRegistration.password;

  if (!validEmail || !validPassword) {
    showNotif('Email atau password takmir tidak sesuai.', 'error');
    return;
  }

  activeRole = 'takmir';
  savePersistentState();
  openAdminDashboard();
}

// ── MOSQUE SELECTION ──────────────────────────────────────────────
function renderMosques(list) {
  const container = document.getElementById('mosque-list-container');
  if (!list.length) {
    container.innerHTML = `<div class="text-center py-16 text-gray-400"><div class="text-4xl mb-3">🔍</div><p class="font-semibold">Masjid tidak ditemukan</p><p class="text-sm">Coba kata kunci lain</p></div>`;
    return;
  }
  container.innerHTML = `<div class="space-y-3 stagger">${list.map(m => mosqueTpl(m)).join('')}</div>`;
}

function mosqueTpl(m) {
  return `
  <div class="mosque-card">
    <div class="p-4 flex items-start gap-4">
      <div class="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);">${m.icon}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <h3 class="font-bold text-gray-800 text-sm">${m.name}</h3>
        </div>
        <p class="text-xs text-gray-500 mb-2">${m.address}</p>
        <div class="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span><i class="fas fa-users text-emerald-500 mr-1"></i>${m.members.toLocaleString('id')} jamaah</span>
          <span><i class="fas fa-location-arrow text-blue-400 mr-1"></i>${m.distance}</span>
          <span>${m.rating} ★</span>
        </div>
        <div class="flex gap-1.5 mt-2 flex-wrap">
          ${m.tags.map(t=>`<span class="badge badge-green">${t}</span>`).join('')}
        </div>
        <div class="flex gap-2 mt-3 flex-wrap">
          <button onclick="viewMosqueProfileFromList(${m.id})" class="btn-outline px-3 py-2 text-xs rounded-xl" style="border:none;cursor:pointer;font-family:'Outfit',sans-serif;">Profil</button>
          <button onclick="selectMosque(${m.id})" class="btn-primary px-4 py-2 text-xs rounded-xl" style="border:none;cursor:pointer;font-family:'Outfit',sans-serif;">Pilih Masjid</button>
        </div>
      </div>
    </div>
  </div>`;
}

function filterMosques(q) {
  const filtered = q ? MOSQUES.filter(m =>
    m.name.toLowerCase().includes(q.toLowerCase()) ||
    m.address.toLowerCase().includes(q.toLowerCase()) ||
    m.city.toLowerCase().includes(q.toLowerCase())
  ) : MOSQUES;
  filteredMosques = [...filtered];
  renderMosques(filtered);
  updateMosqueMap(filtered);
}

function getSortableDistanceKm(mosque = {}) {
  if (Number.isFinite(Number(mosque.distanceKm))) return Number(mosque.distanceKm);

  const raw = String(mosque.distance || '').trim().toLowerCase();
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  if (raw.includes(' m')) return value / 1000;
  return value;
}

function setTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentTab = tab;
  let list = [...MOSQUES];
  if (tab === 'nearby') list.sort((a,b) => getSortableDistanceKm(a) - getSortableDistanceKm(b));
  if (tab === 'popular') list.sort((a,b) => b.members - a.members);
  if (tab === 'favorite') list = list.filter(m => m.rating >= 4.8);
  filteredMosques = [...list];
  renderMosques(list);
  updateMosqueMap(list);
}

function locateMe() {
  if (!mosqueMap) initMosqueMap();

  showNotif('Mengambil lokasi Anda dan mencari masjid terdekat...', 'success');

  if (!navigator.geolocation) {
    showNotif('Perangkat tidak mendukung geolokasi. Menampilkan urutan terdekat dari data default.', 'error');
    const fallback = [...MOSQUES].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    filteredMosques = [...fallback];
    currentTab = 'nearby';
    renderMosques(fallback);
    updateMosqueMap(fallback, { focusMosqueId: fallback[0]?.id, zoom: 13, openPopup: true });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = Number(position?.coords?.latitude);
      const lng = Number(position?.coords?.longitude);
      if (!hasValidCoordinates(lat, lng)) {
        showNotif('Lokasi tidak valid. Coba aktifkan GPS lalu ulangi.', 'error');
        return;
      }

      userGeolocation = { lat, lng, accuracy: Number(position?.coords?.accuracy) || null };
      const sorted = enrichMosquesWithUserDistance(lat, lng);
      const nearest = sorted[0];

      filteredMosques = [...sorted];
      currentTab = 'nearby';
      renderMosques(sorted);
      updateMosqueMap(sorted, { focusMosqueId: nearest?.id, zoom: 15, openPopup: true });

      if (nearest) {
        showNotif(`Masjid terdekat: ${nearest.name} (${nearest.distance})`, 'success');
      }
    },
    () => {
      showNotif('Gagal mengakses lokasi. Menampilkan urutan terdekat dari data default.', 'error');
      const fallback = [...MOSQUES].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      filteredMosques = [...fallback];
      currentTab = 'nearby';
      renderMosques(fallback);
      updateMosqueMap(fallback, { focusMosqueId: fallback[0]?.id, zoom: 13, openPopup: true });
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
}

function selectMosque(id) {
  selectedMosque = MOSQUES.find(m => m.id === id);
  if (!selectedMosque) return;

  if (isLoggedIn && activeRole !== 'takmir') {
    activeRole = 'jamaah';
  }
  adminPanelOpen = false;
  savePersistentState();
  initApp();
  updateAdminModeUI();
  showScreen('app-screen');
  showNotif(
    isLoggedIn
      ? `${selectedMosque.name} berhasil dipilih. Fitur interaktif siap digunakan.`
      : `${selectedMosque.name} dibuka dalam mode publik. Login diperlukan untuk donasi dan aksi fitur lainnya.`,
    'success'
  );
}

function viewMosqueProfileFromList(id) {
  const mosqueId = Number(id);
  const mosque = MOSQUES.find(item => Number(item.id) === mosqueId);
  if (!mosque) return;
  selectedMosque = mosque;
  openPackageModal('profile');
}

function initMosqueMap() {
  if (typeof L === 'undefined') return;
  const mapEl = document.getElementById('mosque-map');
  if (!mapEl || mosqueMap) return;

  mosqueMap = L.map('mosque-map', {
    zoomControl: true,
    scrollWheelZoom: false,
    touchZoom: false,
    dragging: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
  }).setView([-6.995, 110.425], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mosqueMap);

  setTimeout(() => mosqueMap.invalidateSize(), 200);
  window.addEventListener('resize', () => {
    if (mosqueMap) mosqueMap.invalidateSize();
  });
}

function updateMosqueMap(list, options = {}) {
  if (!mosqueMap) return;

  const { focusMosqueId = null, zoom = 15, openPopup = false } = options;

  mosqueMarkers.forEach(entry => {
    if (entry?.marker?.remove) {
      entry.marker.remove();
    }
  });
  mosqueMarkers = [];

  const points = [];
  list.forEach(m => {
    const lat = Number(m.lat);
    const lng = Number(m.lng);
    if (!hasValidCoordinates(lat, lng)) return;
    const markerIcon = L.divIcon({
      className: '',
      html: `<div class="mosque-pin ${m.members >= 3000 ? 'premium' : ''}" title="${m.name}">${m.icon}</div>`,
      iconSize: [34, 46],
      iconAnchor: [17, 42],
      popupAnchor: [0, -36]
    });
    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(mosqueMap);
    marker.bindPopup(buildMosqueMapPopupHtml(m));
    mosqueMarkers.push({ id: Number(m.id), marker });
    points.push([lat, lng]);
  });

  if (points.length === 1) {
    mosqueMap.setView(points[0], 13);
    if (focusMosqueId !== null && focusMosqueId !== undefined) {
      focusMapOnMosque(focusMosqueId, { zoom, openPopup });
    }
    return;
  }
  if (points.length > 1) {
    mosqueMap.fitBounds(points, { padding: [24, 24], maxZoom: 12 });
  }

  if (focusMosqueId !== null && focusMosqueId !== undefined) {
    focusMapOnMosque(focusMosqueId, { zoom, openPopup });
  }
}

function viewMosqueProfileFromMap(id) {
  const mosqueId = Number(id);
  const mosque = MOSQUES.find(item => Number(item.id) === mosqueId);
  if (!mosque) return;
  selectedMosque = mosque;
  openPackageModal('profile');
}

function openPackageModal(mode = 'profile') {
  if (!selectedMosque) return;
  packageModalMode = mode;
  document.getElementById('package-mosque-name').textContent = selectedMosque.name;
  const titleEl = document.getElementById('package-modal-title');
  const iconEl = document.getElementById('package-modal-icon');
  const selectionPanel = document.getElementById('package-selection-panel');
  const imageEl = document.getElementById('package-mosque-image');
  const descEl = document.getElementById('package-mosque-description');
  const factsEl = document.getElementById('package-mosque-facts');
  const tagsEl = document.getElementById('package-mosque-tags');
  const eventsEl = document.getElementById('package-mosque-events');

  if (titleEl) {
    titleEl.textContent = packageModalMode === 'profile' ? 'Profil Masjid' : 'Pilih Paket Masjid';
  }
  if (iconEl) {
    iconEl.textContent = packageModalMode === 'profile' ? '🕌' : '📦';
  }
  if (selectionPanel) {
    selectionPanel.classList.toggle('hidden', packageModalMode === 'profile');
  }

  if (imageEl) {
    imageEl.src = getSafeMosqueImage(selectedMosque);
    imageEl.alt = `Foto ${selectedMosque.name}`;
    imageEl.onerror = () => {
      imageEl.onerror = null;
      imageEl.src = getSafeMosqueImage({ name: selectedMosque.name });
    };
  }
  if (descEl) {
    descEl.textContent = selectedMosque.description || 'Masjid aktif dengan beragam program ibadah dan pemberdayaan jamaah.';
  }
  if (factsEl) {
    factsEl.innerHTML = `
      <span><i class="fas fa-map-marker-alt text-emerald-600 mr-1"></i>${selectedMosque.city}</span>
      <span><i class="fas fa-users text-emerald-600 mr-1"></i>${selectedMosque.members.toLocaleString('id-ID')} jamaah</span>
      <span><i class="fas fa-location-arrow text-emerald-600 mr-1"></i>${selectedMosque.distance}</span>
      <span><i class="fas fa-star text-amber-500 mr-1"></i>${selectedMosque.rating} / 5</span>
    `;
  }
  if (tagsEl) {
    tagsEl.innerHTML = selectedMosque.tags.map(t => `<span class="badge badge-green">${t}</span>`).join('');
  }
  if (eventsEl) {
    const events = MOSQUE_EVENT_CATALOG[selectedMosque.id] || [];
    if (!events.length) {
      eventsEl.innerHTML = '<p class="text-xs text-gray-500">Belum ada event terjadwal.</p>';
    } else {
      eventsEl.innerHTML = events.map(e => `
        <div class="package-event-item">
          <p class="font-semibold text-gray-800 text-xs">${e.title}</p>
          <p class="text-[11px] text-gray-500 mt-0.5">${e.time}</p>
          <span class="package-event-type">${e.type}</span>
        </div>
      `).join('');
    }
  }

  if (packageModalMode !== 'profile') {
    setPackage('basic');
  }
  document.getElementById('package-modal').classList.remove('hidden');
}

function closePackageModal() {
  packageModalMode = 'profile';
  document.getElementById('package-modal').classList.add('hidden');
}

function setPackage(type) {
  selectedPackage = type;
  document.querySelectorAll('[data-package-option]').forEach(el => {
    el.classList.toggle('active', el.dataset.packageOption === type);
    if (el.dataset.packageOption === type) {
      el.classList.remove('package-animate');
      void el.offsetWidth;
      el.classList.add('package-animate');
    }
  });

  updatePackageSummary();
}

function updatePackageSummary() {
  const summary = document.getElementById('package-summary');
  if (!summary) return;

  if (selectedPackage === 'basic') {
    summary.textContent = `Basic (${formatRupiah(PACKAGE_PRICING.basic)}/bulan): fokus informasi masjid.`;
    return;
  }

  if (selectedPackage === 'standard') {
    summary.textContent = `Standard (${formatRupiah(PACKAGE_PRICING.standard)}/bulan): fokus interaksi dan aktivitas jamaah.`;
    return;
  }

  summary.textContent = `Premium (${formatRupiah(PACKAGE_PRICING.premium)}/bulan): fokus sistem lengkap dan transparansi.`;
}

function confirmPackageSelection() {
  if (!selectedMosque) return;
  const labelMap = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
  const packageLabel = labelMap[selectedPackage] || 'Basic';
  // Update login screen
  document.getElementById('login-mosque-name').textContent = selectedMosque.name;
  document.getElementById('login-mosque-addr').textContent = selectedMosque.address;
  document.getElementById('login-mosque-icon').textContent = selectedMosque.icon;
  document.getElementById('login-selected-package').textContent = `Paket: ${packageLabel} (${formatRupiah(PACKAGE_PRICING[selectedPackage] || PACKAGE_PRICING.basic)}/bulan)`;
  closePackageModal();
  showScreen('login-screen');
  showNotif(`Paket ${packageLabel} dipilih untuk ${selectedMosque.name}`, 'success');
}

function changeMosque() {
  closePackageModal();
  showScreen('mosque-screen');
  ensureMosqueSelectorReady();
}

function promptLoginForSelectedMosque(actionLabel = 'melanjutkan aktivitas ini') {
  if (!selectedMosque) {
    openLoginPortal();
    return;
  }

  const loginName = document.getElementById('login-mosque-name');
  const loginAddr = document.getElementById('login-mosque-addr');
  const loginIcon = document.getElementById('login-mosque-icon');
  const loginPackage = document.getElementById('login-selected-package');

  if (loginName) loginName.textContent = selectedMosque.name;
  if (loginAddr) loginAddr.textContent = selectedMosque.address;
  if (loginIcon) loginIcon.textContent = selectedMosque.icon;
  if (loginPackage) {
    const pkg = String(selectedMosque.package || 'basic').toUpperCase();
    loginPackage.textContent = `Masjid terpilih: ${selectedMosque.name} • Paket ${pkg}`;
  }

  showScreen('login-screen');
  showNotif(`Login jamaah terlebih dahulu untuk ${actionLabel} di ${selectedMosque.name}.`, 'info');
}

// ── LOGIN ─────────────────────────────────────────────────────────
function doLogin(type) {
  const labels = { google:'Google', umum:'OTP', guest:'Tamu' };
  showLoading(`Login via ${labels[type]}...`);
  setTimeout(() => {
    hideLoading();
    const defaults = {
      google: { name: 'Ahmad Nur', role: 'Pengguna Google', email: 'ahmad@example.com', phone: '081234567890' },
      umum: { name: 'Ahmad Nur', role: 'Jamaah Umum', email: '', phone: '081298765432' },
      guest: { name: 'Tamu Jamaah', role: 'Guest', email: '', phone: '' },
    };
    const picked = defaults[type] || defaults.guest;
    const avatar = (picked.name[0] || 'J').toUpperCase();
    loginJamaahAccount({ name:picked.name, role:picked.role, avatar, email:picked.email, phone:picked.phone }, type);
    isLoggedIn = true;
    activeRole = 'jamaah';
    adminPanelOpen = false;
    savePersistentState();
    updateAuthUI();
    updateAdminModeUI();
    if (selectedMosque) {
      initApp();
      showScreen('app-screen');
      showNotif(`Selamat datang, ${currentUser.name}. Anda masuk ke ${selectedMosque.name}.`, 'success');
    } else {
      ensureMosqueSelectorReady();
      showScreen('mosque-screen');
      showNotif(`Selamat datang, ${currentUser.name}. Pilih masjid untuk melanjutkan.`, 'success');
    }
  }, 1500);
}

function logout() {
  syncCurrentUserToJamaahAccount();
  resetRoleTransitionState();
  selectedPackage = 'basic';
  isLoggedIn = false;
  activeRole = null;
  currentJamaahAccountKey = null;
  currentUser = { ...DEFAULT_CURRENT_USER };
  savePersistentState();
  updateAuthUI();
  updateAdminModeUI();
  showScreen('mosque-screen');
  showNotif('Anda telah logout', 'success');
}

function setTakmirPackage(type) {
  takmirSelectedPackage = type;
  document.querySelectorAll('[data-takmir-package]').forEach(el => {
    el.classList.toggle('active', el.dataset.takmirPackage === type);
  });

  const labels = {
    basic: `Basic (${formatRupiah(PACKAGE_PRICING.basic)}/bulan)`,
    standard: `Standard (${formatRupiah(PACKAGE_PRICING.standard)}/bulan)`,
    premium: `Premium (${formatRupiah(PACKAGE_PRICING.premium)}/bulan)`
  };
  const summary = document.getElementById('takmir-package-summary');
  if (summary) summary.textContent = `Paket ${labels[type]} dipilih.`;
  savePersistentState();
}

function submitTakmirRegistration() {
  const mosqueName = document.getElementById('reg-mosque-name').value.trim();
  const city = document.getElementById('reg-mosque-city').value.trim();
  const address = document.getElementById('reg-mosque-address').value.trim();
  const adminName = document.getElementById('reg-admin-name').value.trim();
  const email = document.getElementById('reg-admin-email').value.trim().toLowerCase();
  const phone = document.getElementById('reg-admin-phone').value.trim();
  const password = document.getElementById('reg-admin-password').value;
  const lat = Number(takmirRegistration?.lat);
  const lng = Number(takmirRegistration?.lng);

  if (!mosqueName || !city || !address || !adminName || !email || !phone || !password) {
    showNotif('Lengkapi data masjid, akun takmir, dan penanggung jawab terlebih dahulu.', 'error');
    return;
  }

  if (!email.endsWith('@gmail.com')) {
    showNotif('Gunakan alamat Gmail untuk akun takmir.', 'error');
    return;
  }

  if (password.length < 6) {
    showNotif('Password takmir minimal 6 karakter.', 'error');
    return;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    showNotif('Ambil lokasi device masjid terlebih dahulu sebelum mendaftar.', 'error');
    return;
  }

  takmirRegistration = {
    mosqueName,
    city,
    address,
    adminName,
    email,
    phone,
    password,
    lat,
    lng,
    package: takmirSelectedPackage,
    paid: true,
    financeRecords: takmirRegistration?.financeRecords || [],
  };

  ensureRegisteredMosqueInList();
  selectedMosque = MOSQUES.find(m => m.id === takmirRegistration.mosqueId) || selectedMosque;
  currentUser = {
    name: adminName,
    role: 'Admin Masjid',
    avatar: (adminName[0] || 'A').toUpperCase(),
    email,
    phone,
  };
  isLoggedIn = true;
  activeRole = 'takmir';
  adminPanelOpen = true;

  ensureMosqueSelectorReady();
  syncTakmirPaymentUI();
  initApp();
  initAdminDashboard();
  updateAuthUI();
  updateAdminModeUI();
  updateNavItemsVisibility();
  savePersistentState();

  showScreen('app-screen');
  showNotif('Masjid berhasil didaftarkan. Dashboard admin aktif dan bisa langsung diedit.', 'success');
}

function openAdminDashboard() {
  if (activeRole !== 'takmir') {
    showNotif('Dashboard admin hanya untuk pengurus/takmir.', 'error');
    return;
  }
  if (!takmirRegistration) {
    showNotif('Masjid belum terdaftar.', 'error');
    return;
  }
  if (!takmirRegistration.paid) {
    showNotif('Dashboard admin belum aktif. Selesaikan pembayaran paket bulanan.', 'error');
    showScreen('takmir-screen');
    return;
  }

  ensureRegisteredMosqueInList();
  selectedMosque = MOSQUES.find(m => m.id === takmirRegistration.mosqueId) || selectedMosque;
  currentUser = {
    name: takmirRegistration.adminName || 'Admin Takmir',
    role: 'Admin Masjid',
    avatar: (takmirRegistration.adminName?.[0] || 'A').toUpperCase(),
    email: takmirRegistration.email || '',
    phone: takmirRegistration.phone || '',
  };
  isLoggedIn = true;
  activeRole = 'takmir';
  adminPanelOpen = true;

  initApp();
  initAdminDashboard();
  updateAuthUI();
  updateAdminModeUI();
  updateNavItemsVisibility();
  savePersistentState();
  showScreen('app-screen');
}

function initAdminDashboard() {
  if (!takmirRegistration) return;

  document.getElementById('admin-mosque-name').textContent = takmirRegistration.mosqueName;
  document.getElementById('admin-mosque-city').textContent = takmirRegistration.city;
  document.getElementById('admin-package-name').textContent = `${takmirRegistration.package.toUpperCase()} - ${formatRupiah(PACKAGE_PRICING[takmirRegistration.package])}/bulan`;

  const rank = { basic: 1, standard: 2, premium: 3 };
  const current = rank[takmirRegistration.package] || 1;

  document.querySelectorAll('.admin-feature-card').forEach(card => {
    const required = card.dataset.requiredPackage || 'basic';
    const requiredRank = rank[required] || 1;
    const unlocked = takmirRegistration.paid && current >= requiredRank;
    card.classList.toggle('locked', !unlocked);
    const statusEl = card.querySelector('[data-status]');
    if (statusEl) statusEl.textContent = unlocked ? 'Aktif' : `Terkunci (${required})`;
  });

  const mosqueDesc = takmirRegistration.mosqueData?.description || '';

  document.getElementById('admin-edit-name').value = takmirRegistration.mosqueName || '';
  document.getElementById('admin-edit-city').value = takmirRegistration.city || '';
  document.getElementById('admin-edit-address').value = takmirRegistration.address || '';
  document.getElementById('admin-edit-description').value = mosqueDesc;

  const liveName = document.getElementById('admin-live-name');
  const liveCity = document.getElementById('admin-live-city');
  const liveAddress = document.getElementById('admin-live-address');
  const liveDescription = document.getElementById('admin-live-description');
  if (liveName) liveName.value = takmirRegistration.mosqueName || '';
  if (liveCity) liveCity.value = takmirRegistration.city || '';
  if (liveAddress) liveAddress.value = takmirRegistration.address || '';
  if (liveDescription) liveDescription.value = mosqueDesc;

  renderAdminIncomeHistory();
  renderAdminEventEditor();
  updateAdminPanelFeatureVisibility();

  savePersistentState();
}

function renderAdminEventEditor() {
  const container = document.getElementById('admin-event-list');
  const liveContainer = document.getElementById('admin-live-event-list');
  if (!takmirRegistration) return;

  const mosqueId = takmirRegistration.mosqueId;
  if (!mosqueId) {
    if (container) container.innerHTML = '<p class="text-xs text-gray-400">Masjid belum siap untuk mengelola event.</p>';
    if (liveContainer) liveContainer.innerHTML = '<p class="text-xs text-gray-400">Masjid belum siap untuk mengelola event.</p>';
    return;
  }

  const events = Array.isArray(takmirRegistration.customEvents)
    ? takmirRegistration.customEvents
    : (MOSQUE_EVENT_CATALOG[mosqueId] || []);

  takmirRegistration.customEvents = [...events];
  MOSQUE_EVENT_CATALOG[mosqueId] = [...events];

  if (!events.length) {
    if (container) container.innerHTML = '<p class="text-xs text-gray-400">Belum ada event. Tambahkan event pertama Anda.</p>';
    if (liveContainer) liveContainer.innerHTML = '<p class="text-xs text-gray-400">Belum ada event. Tambahkan event pertama Anda.</p>';
    return;
  }

  if (container) {
    container.innerHTML = events.map((event, idx) => `
      <div class="border border-gray-200 rounded-xl p-2.5 bg-gray-50 space-y-2">
        <input id="admin-event-title-${idx}" class="input-field" value="${event.title.replace(/"/g, '&quot;')}" placeholder="Judul event">
        <input id="admin-event-time-${idx}" class="input-field" value="${event.time.replace(/"/g, '&quot;')}" placeholder="Waktu event">
        <input id="admin-event-type-${idx}" class="input-field" value="${event.type.replace(/"/g, '&quot;')}" placeholder="Kategori event">
        <div class="grid grid-cols-2 gap-2">
          <button onclick="saveAdminEvent(${idx})" class="btn-primary py-2 text-xs">Simpan</button>
          <button onclick="deleteAdminEvent(${idx})" class="btn-outline py-2 text-xs">Hapus</button>
        </div>
      </div>
    `).join('');
  }

  if (liveContainer) {
    liveContainer.innerHTML = events.map((event, idx) => `
      <div class="border border-gray-200 rounded-xl p-2.5 bg-gray-50">
        <p class="text-xs font-semibold text-gray-800">${event.title}</p>
        <p class="text-[11px] text-gray-500 mt-0.5">${event.time} · ${event.type}</p>
        <button onclick="deleteAdminEvent(${idx})" class="btn-outline mt-2 px-2 py-1 text-[11px]">Hapus</button>
      </div>
    `).join('');
  }
}

function addAdminEvent() {
  if (!ensureAdminWriteAccess()) return;

  const title = document.getElementById('admin-event-title').value.trim();
  const time = document.getElementById('admin-event-time').value.trim();
  const type = document.getElementById('admin-event-type').value.trim() || 'Kajian';

  if (!title || !time) {
    showNotif('Judul dan waktu event wajib diisi.', 'error');
    return;
  }

  if (!Array.isArray(takmirRegistration.customEvents)) takmirRegistration.customEvents = [];
  takmirRegistration.customEvents.unshift({ title, time, type });
  if (takmirRegistration.mosqueId) {
    MOSQUE_EVENT_CATALOG[takmirRegistration.mosqueId] = [...takmirRegistration.customEvents];
  }

  document.getElementById('admin-event-title').value = '';
  document.getElementById('admin-event-time').value = '';
  document.getElementById('admin-event-type').value = '';

  savePersistentState();
  renderAdminEventEditor();
  renderEvents();
  showNotif('Event berhasil ditambahkan.', 'success');
}

function addAdminEventLive() {
  if (!ensureAdminWriteAccess()) return;

  const titleEl = document.getElementById('admin-live-event-title');
  const dateEl = document.getElementById('admin-live-event-date');
  const timeEl = document.getElementById('admin-live-event-time');
  const typeEl = document.getElementById('admin-live-event-type');
  
  const title = titleEl?.value.trim() || '';
  const date = dateEl?.value || '';
  const time = timeEl?.value || '';
  const type = typeEl?.value.trim() || 'Kajian';

  if (!title || !date || !time) {
    showNotif('Judul, tanggal, dan waktu event wajib diisi.', 'error');
    return;
  }

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const eventTime = `${formattedDate}, ${time}`;

  if (!Array.isArray(takmirRegistration.customEvents)) takmirRegistration.customEvents = [];
  takmirRegistration.customEvents.unshift({ title, time: eventTime, type, date, rawTime: time });
  if (takmirRegistration.mosqueId) {
    MOSQUE_EVENT_CATALOG[takmirRegistration.mosqueId] = [...takmirRegistration.customEvents];
  }

  if (titleEl) titleEl.value = '';
  if (dateEl) dateEl.value = '';
  if (timeEl) timeEl.value = '';
  if (typeEl) typeEl.value = '';

  savePersistentState();
  renderAdminEventEditor();
  renderEvents();
  showNotif('✅ Event berhasil ditambahkan dan langsung tampil di halaman kajian.', 'success');
}

function saveAdminEvent(index) {
  if (!ensureAdminWriteAccess()) return;
  if (!Array.isArray(takmirRegistration.customEvents)) return;
  if (!takmirRegistration.customEvents[index]) return;

  const title = document.getElementById(`admin-event-title-${index}`)?.value.trim() || '';
  const time = document.getElementById(`admin-event-time-${index}`)?.value.trim() || '';
  const type = document.getElementById(`admin-event-type-${index}`)?.value.trim() || 'Kajian';

  if (!title || !time) {
    showNotif('Judul dan waktu event wajib diisi.', 'error');
    return;
  }

  takmirRegistration.customEvents[index] = { title, time, type };
  if (takmirRegistration.mosqueId) {
    MOSQUE_EVENT_CATALOG[takmirRegistration.mosqueId] = [...takmirRegistration.customEvents];
  }

  savePersistentState();
  renderAdminEventEditor();
  renderEvents();
  showNotif('Event berhasil diperbarui.', 'success');
}

function deleteAdminEvent(index) {
  if (!ensureAdminWriteAccess()) return;
  if (!Array.isArray(takmirRegistration.customEvents)) return;
  if (!takmirRegistration.customEvents[index]) return;

  takmirRegistration.customEvents.splice(index, 1);
  if (takmirRegistration.mosqueId) {
    MOSQUE_EVENT_CATALOG[takmirRegistration.mosqueId] = [...takmirRegistration.customEvents];
  }

  savePersistentState();
  renderAdminEventEditor();
  renderEvents();
  showNotif('Event berhasil dihapus.', 'success');
}

function saveAdminMosqueProfile() {
  if (!ensureAdminWriteAccess()) return;

  const name = document.getElementById('admin-edit-name').value.trim();
  const city = document.getElementById('admin-edit-city').value.trim();
  const address = document.getElementById('admin-edit-address').value.trim();
  const description = document.getElementById('admin-edit-description').value.trim();

  if (!name || !city || !address) {
    showNotif('Nama masjid, kota, dan alamat wajib diisi.', 'error');
    return;
  }

  takmirRegistration.mosqueName = name;
  takmirRegistration.city = city;
  takmirRegistration.address = address;
  takmirRegistration.mosqueData = {
    ...(takmirRegistration.mosqueData || {}),
    name,
    city,
    address,
    description: description || 'Profil masjid dikelola oleh admin takmir.',
  };

  ensureRegisteredMosqueInList();
  ensureMosqueSelectorReady();
  initApp();
  initAdminDashboard();
  savePersistentState();
  showNotif('Profil masjid berhasil diperbarui.', 'success');
}

function saveAdminMosqueProfileLive() {
  if (!ensureAdminWriteAccess()) return;

  const name = document.getElementById('admin-live-name')?.value.trim() || '';
  const city = document.getElementById('admin-live-city')?.value.trim() || '';
  const address = document.getElementById('admin-live-address')?.value.trim() || '';
  const description = document.getElementById('admin-live-description')?.value.trim() || '';

  if (!name || !city || !address) {
    showNotif('Nama masjid, kota, dan alamat wajib diisi.', 'error');
    return;
  }

  takmirRegistration.mosqueName = name;
  takmirRegistration.city = city;
  takmirRegistration.address = address;
  takmirRegistration.mosqueData = {
    ...(takmirRegistration.mosqueData || {}),
    name,
    city,
    address,
    description: description || 'Profil masjid dikelola oleh admin takmir.',
  };

  ensureRegisteredMosqueInList();
  ensureMosqueSelectorReady();
  initApp();
  initAdminDashboard();
  savePersistentState();
  showNotif('Profil masjid langsung diperbarui di dashboard jamaah.', 'success');
}

function addAdminIncome() {
  if (!ensureAdminWriteAccess()) return;

  const amount = Number(document.getElementById('admin-income-amount').value);
  const note = document.getElementById('admin-income-note').value.trim();

  if (!amount || amount <= 0) {
    showNotif('Nominal pemasukan tidak valid.', 'error');
    return;
  }

  const item = {
    amount,
    note: note || 'Pemasukan tanpa keterangan',
    date: new Date().toLocaleDateString('id-ID'),
  };

  if (!Array.isArray(takmirRegistration.financeRecords)) {
    takmirRegistration.financeRecords = [];
  }
  takmirRegistration.financeRecords.unshift(item);
  prependRecentTransactionFromFinance(item, 'in');

  takmirRegistration.mosqueData = {
    ...(takmirRegistration.mosqueData || {}),
    balance: (takmirRegistration.mosqueData?.balance || 0) + amount,
    income: (takmirRegistration.mosqueData?.income || 0) + amount,
  };

  ensureRegisteredMosqueInList();
  ensureMosqueSelectorReady();
  renderAdminIncomeHistory();
  if (selectedMosque) {
    document.getElementById('stat-saldo').textContent = fmtRp(selectedMosque.balance);
    document.getElementById('stat-masuk').textContent = fmtRp(selectedMosque.income);
  }
  savePersistentState();

  document.getElementById('admin-income-amount').value = '';
  document.getElementById('admin-income-note').value = '';
  showNotif('Pemasukan berhasil ditambahkan.', 'success');
}

function addAdminIncomeLive() {
  if (!ensureAdminWriteAccess()) return;

  const amount = Number(document.getElementById('admin-live-income-amount')?.value);
  const note = document.getElementById('admin-live-income-note')?.value.trim() || '';
  const date = document.getElementById('admin-live-income-date')?.value;

  if (!amount || amount <= 0) {
    showNotif('Nominal pemasukan tidak valid.', 'error');
    return;
  }

  const dateStr = date ? new Date(date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID');
  const item = {
    amount,
    note: note || 'Pemasukan (sumber tidak disebutkan)',
    date: dateStr,
    type: 'income',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  if (!Array.isArray(takmirRegistration.financeRecords)) takmirRegistration.financeRecords = [];
  takmirRegistration.financeRecords.unshift(item);
  prependRecentTransactionFromFinance(item, 'in');

  takmirRegistration.mosqueData = {
    ...(takmirRegistration.mosqueData || {}),
    balance: (takmirRegistration.mosqueData?.balance || 0) + amount,
    income: (takmirRegistration.mosqueData?.income || 0) + amount,
  };

  ensureRegisteredMosqueInList();
  ensureMosqueSelectorReady();
  renderAdminIncomeHistory();
  updateRealtimeDashboardStats();
  savePersistentState();

  document.getElementById('admin-live-income-amount').value = '';
  document.getElementById('admin-live-income-note').value = '';
  document.getElementById('admin-live-income-date').value = '';
  showNotif('✅ Pemasukan ditambahkan! Saldo dashboard langsung terupdate.', 'success');
}

function addAdminExpenseLive() {
  if (!ensureAdminWriteAccess()) return;

  const amount = Number(document.getElementById('admin-live-expense-amount')?.value);
  const note = document.getElementById('admin-live-expense-note')?.value.trim() || '';
  const date = document.getElementById('admin-live-expense-date')?.value;

  if (!amount || amount <= 0) {
    showNotif('Nominal pengeluaran tidak valid.', 'error');
    return;
  }

  const dateStr = date ? new Date(date).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID');
  const item = {
    amount,
    note: note || 'Pengeluaran (tujuan tidak disebutkan)',
    date: dateStr,
    type: 'expense',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  if (!Array.isArray(takmirRegistration.financeRecords)) takmirRegistration.financeRecords = [];
  takmirRegistration.financeRecords.unshift(item);
  prependRecentTransactionFromFinance(item, 'out');

  takmirRegistration.mosqueData = {
    ...(takmirRegistration.mosqueData || {}),
    balance: (takmirRegistration.mosqueData?.balance || 0) - amount,
    expense: (takmirRegistration.mosqueData?.expense || 0) + amount,
  };

  ensureRegisteredMosqueInList();
  ensureMosqueSelectorReady();
  renderAdminIncomeHistory();
  updateRealtimeDashboardStats();
  savePersistentState();

  document.getElementById('admin-live-expense-amount').value = '';
  document.getElementById('admin-live-expense-note').value = '';
  document.getElementById('admin-live-expense-date').value = '';
  showNotif('✅ Pengeluaran dicatat! Saldo dashboard langsung terupdate.', 'success');
}

function updateRealtimeDashboardStats() {
  if (!selectedMosque) return;
  document.getElementById('stat-saldo').textContent = fmtRp(selectedMosque.balance);
  document.getElementById('stat-masuk').textContent = fmtRp(selectedMosque.income);
  document.getElementById('stat-keluar').textContent = fmtRp(selectedMosque.expense);
}

function renderAdminIncomeHistory() {
  const container = document.getElementById('admin-income-history');
  const liveContainer = document.getElementById('admin-live-finance-history');
  if (!takmirRegistration) return;
  const rows = Array.isArray(takmirRegistration.financeRecords) ? takmirRegistration.financeRecords : [];

  if (!rows.length) {
    const emptyMsg = '<p class="text-xs text-gray-400 text-center py-2">Belum ada transaksi keuangan</p>';
    if (container) container.innerHTML = emptyMsg;
    if (liveContainer) liveContainer.innerHTML = emptyMsg;
    return;
  }

  const html = rows.slice(0, 8).map(r => {
    const isIncome = r.type === 'income' || (r.type !== 'expense' && r.amount > 0);
    const icon = isIncome ? '📈' : '📉';
    const color = isIncome ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50';
    const borderColor = isIncome ? 'border-emerald-200' : 'border-red-200';
    const sign = isIncome ? '+' : '-';
    return `
      <div class="border ${borderColor} rounded-lg p-2.5 ${color}">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-gray-800 truncate">${icon} ${r.note}</p>
            <p class="text-[10px] text-gray-600 mt-0.5">📅 ${r.date}${r.time ? ' ⏰ ' + r.time : ''}</p>
          </div>
          <p class="text-sm font-bold whitespace-nowrap ${isIncome ? 'text-emerald-700' : 'text-red-700'}">${sign}${formatRupiah(r.amount)}</p>
        </div>
      </div>
    `;
  }).join('');

  if (container) container.innerHTML = html;
  if (liveContainer) liveContainer.innerHTML = html;
}

// ── APP INIT ──────────────────────────────────────────────────────
function initApp() {
  if (!selectedMosque) return;
  // Update mosque displays
  document.getElementById('app-mosque-name').textContent = selectedMosque.name;
  document.getElementById('app-mosque-icon').textContent = selectedMosque.icon;
  document.getElementById('sidebar-mosque-name').textContent = selectedMosque.name;
  document.getElementById('sidebar-mosque-city').textContent = selectedMosque.city;
  document.getElementById('sidebar-mosque-icon').textContent = selectedMosque.icon;
  // User
  renderAvatarElement(document.getElementById('sidebar-avatar'));
  document.getElementById('sidebar-username').textContent = currentUser.name;
  document.getElementById('sidebar-role').textContent = currentUser.role;
  document.getElementById('sidebar-contact').textContent = currentUser.email || currentUser.phone || '-';
  renderAvatarElement(document.getElementById('user-avatar-btn'));
  // Dashboard stats
  document.getElementById('stat-saldo').textContent = fmtRp(selectedMosque.balance);
  document.getElementById('stat-masuk').textContent = fmtRp(selectedMosque.income);
  document.getElementById('stat-keluar').textContent = fmtRp(selectedMosque.expense);
  document.getElementById('dashboard-mosque-subtitle').textContent = `Keuangan ${selectedMosque.name}`;
  document.getElementById('donasi-mosque-name').textContent = selectedMosque.name;
  document.getElementById('kajian-mosque-name').textContent = selectedMosque.name;
  document.getElementById('laporan-mosque-name').textContent = selectedMosque.name;
  document.getElementById('checkin-mosque-name').textContent = selectedMosque.name;
  // Initialize charts and data
  setTimeout(() => {
    initCharts();
    renderRecentTx();
    renderCampaigns();
    renderVouchers();
    renderEvents();
    renderMarket('all');
    renderVolunteers();
    renderRooms();
    renderPrayers();
    renderStreak();
    renderLeaderboard();
    renderHistory();
    renderLaporan();
  }, 100);
  updateNavItemsVisibility();
  updateJamaahUIByPackage();
  updateMosquePackageInfoDisplay();
  renderUnlockedFeatureIndicators();
  navigate('dashboard');
}

// ── FEATURE GATING ────────────────────────────────────────────────
function canAccessFeature(featureName) {
  if (!takmirRegistration) return false;
  if (!takmirRegistration.paid) return false;
  const pkg = takmirRegistration.package || 'basic';
  const features = PACKAGE_FEATURES[pkg] || [];
  return features.includes(featureName);
}

function getLockedFeatureMessage(page) {
  const featureName = PAGE_FEATURE_MAP[page];
  const currentPkg = takmirRegistration?.package || 'basic';
  let requiredPkg = 'basic';
  
  if (['donasi', 'laporan', 'riwayat', 'booking'].includes(page)) requiredPkg = 'premium';
  else if (['zcorner', 'market', 'relawan', 'streak'].includes(page)) requiredPkg = 'premium';
  else if (['kajian'].includes(page)) requiredPkg = 'standard';
  
  const currentPrice = PACKAGE_PRICING[currentPkg];
  const requiredPrice = PACKAGE_PRICING[requiredPkg];
  
  return `Fitur "${page}" hanya tersedia di paket ${requiredPkg.toUpperCase()}. Upgrade paket Anda sekarang!`;
}

function showLockedFeatureModal(page) {
  const modal = document.getElementById('locked-feature-modal');
  if (!modal) return;
  pendingLockedFeaturePage = page;
  
  let requiredPkg = 'basic';
  
  if (['donasi', 'laporan', 'riwayat', 'booking'].includes(page)) requiredPkg = 'premium';
  else if (['zcorner', 'market', 'relawan', 'streak'].includes(page)) requiredPkg = 'premium';
  else if (['kajian'].includes(page)) requiredPkg = 'standard';
  
  const msgEl = document.getElementById('locked-feature-message');
  const detailsEl = document.getElementById('locked-feature-details');
  const upgradeActions = document.getElementById('locked-feature-upgrade-actions');
  const order = ['basic', 'standard', 'premium'];
  const currentPkg = takmirRegistration?.package || 'basic';
  const currentIndex = order.indexOf(currentPkg);
  const upgradeOptions = order.filter((pkg, index) => index > currentIndex);
  
  if (msgEl) msgEl.textContent = `Fitur ini terkunci di paket ${currentPkg.toUpperCase()}. Pilih upgrade untuk membukanya.`;
  
  if (detailsEl) {
    detailsEl.innerHTML = upgradeOptions.map(pkgKey => {
      const pkg = PACKAGE_FEATURE_DETAILS[pkgKey];
      const isRecommended = pkgKey === requiredPkg;
      const currentFeatures = PACKAGE_FEATURES[currentPkg] || [];
      const targetFeatures = PACKAGE_FEATURES[pkgKey] || [];
      const unlockedFeatures = targetFeatures.filter(feature => !currentFeatures.includes(feature)).map(getFeatureLabel);
      return `
        <div class="border border-gray-200 rounded-xl bg-white p-3 ${pkgKey !== upgradeOptions[upgradeOptions.length - 1] ? 'mb-3' : ''}">
          <div class="flex items-center justify-between gap-2 mb-2">
            <p class="font-bold text-gray-800">${pkg.title}</p>
            ${isRecommended ? '<span class="badge badge-green text-[10px]">Disarankan</span>' : ''}
          </div>
          <p class="text-sm text-gray-600 mb-2">${pkg.description}</p>
          <p class="text-sm text-emerald-700 font-bold mb-2">${pkg.price}</p>
          <p class="text-xs text-gray-500 mb-2"><strong>Fokus:</strong> ${pkg.focus}</p>
          <div class="profile-compare-grid">
            <div class="profile-compare-box">
              <p class="text-amber-700">Belum Ada Sekarang</p>
              <ul>
                ${unlockedFeatures.slice(0, 5).map(label => `<li>• ${label}</li>`).join('') || '<li>• Tidak ada tambahan baru</li>'}
              </ul>
            </div>
            <div class="profile-compare-box">
              <p class="text-emerald-700">Terbuka Setelah Upgrade</p>
              <ul>
                ${unlockedFeatures.slice(0, 5).map(label => `<li>✓ ${label}</li>`).join('') || '<li>✓ Semua fitur tetap aktif</li>'}
              </ul>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  if (upgradeActions) {
    if (!(activeRole === 'takmir' && takmirRegistration)) {
      upgradeActions.innerHTML = '<p class="text-xs text-gray-500 text-center">Login sebagai takmir untuk melakukan upgrade paket.</p>';
    } else {
      upgradeActions.innerHTML = upgradeOptions.map(pkgKey => {
        const pkg = PACKAGE_FEATURE_DETAILS[pkgKey];
        return `
          <button class="locked-upgrade-btn" onclick="handleLockedFeatureUpgrade('${pkgKey}')">
            <strong>Upgrade ke ${pkgKey.toUpperCase()}</strong>
            <span>${pkg.price} • ${pkg.focus}</span>
          </button>
        `;
      }).join('');
    }
  }
  
  openModal('locked-feature-modal');
}

function handleLockedFeatureUpgrade(targetPkg) {
  closeModal('locked-feature-modal');
  upgradeTakmirPackage(targetPkg);
}

function showUpgradePackageFlow(targetPkg) {
  if (!(activeRole === 'takmir' && takmirRegistration)) return;
  setTakmirPackage(targetPkg);
  openModal('package-modal');
}

function upgradeTakmirPackage(targetPkg) {
  if (!(activeRole === 'takmir' && takmirRegistration)) {
    showNotif('Login sebagai takmir untuk upgrade paket.', 'error');
    return;
  }

  const order = ['basic', 'standard', 'premium'];
  const currentPkg = takmirRegistration.package || 'basic';
  const currentIndex = order.indexOf(currentPkg);
  let nextPkg = targetPkg;

  if (!nextPkg) {
    nextPkg = order[Math.min(currentIndex + 1, order.length - 1)];
  }

  if (!nextPkg || nextPkg === currentPkg) {
    showNotif('Paket Anda sudah berada di tingkat tertinggi.', 'info');
    return;
  }

  const unlockedPages = getUnlockedPagesForUpgrade(currentPkg, nextPkg);

  takmirRegistration.package = nextPkg;
  takmirSelectedPackage = nextPkg;
  takmirRegistration.paid = true;
  takmirRegistration.mosqueData = {
    ...(takmirRegistration.mosqueData || {}),
    package: nextPkg,
  };

  ensureRegisteredMosqueInList();
  selectedMosque = MOSQUES.find(m => m.id === takmirRegistration.mosqueId) || selectedMosque;
  if (selectedMosque) selectedMosque.package = nextPkg;
  ensureMosqueSelectorReady();
  newlyUnlockedPages = [...new Set([...newlyUnlockedPages, ...unlockedPages])];
  syncTakmirPaymentUI();
  updateNavItemsVisibility();
  updateAdminPanelFeatureVisibility();
  initAdminDashboard();
  renderUnlockedFeatureIndicators();
  if (selectedMosque) {
    updateJamaahUIByPackage();
    updateMosquePackageInfoDisplay();
  }
  savePersistentState();
  showNotif(`Paket berhasil di-upgrade ke ${nextPkg.toUpperCase()}.`, 'success');

  if (pendingLockedFeaturePage) {
    const pageToOpen = pendingLockedFeaturePage;
    pendingLockedFeaturePage = null;
    navigate(pageToOpen);
  }
}

function updateNavItemsVisibility() {
  if (!(activeRole === 'takmir' && takmirRegistration?.paid)) return;
  
  const pkg = takmirRegistration.package || 'basic';
  const rank = { basic: 1, standard: 2, premium: 3 };
  const currentRank = rank[pkg] || 1;
  
  const requirements = {
    'dashboard': 1,
    'sholat': 1,
    'kajian': 2,
    'donasi': 3,
    'laporan': 3,
    'riwayat': 3,
    'booking': 3,
    'zcorner': 3,
    'market': 3,
    'relawan': 3,
    'streak': 3
  };
  
  Object.keys(requirements).forEach(page => {
    const requiredRank = requirements[page];
    const canAccess = currentRank >= requiredRank;
    
    document.querySelectorAll(`[onclick*="navigate('${page}')"]`).forEach(el => {
      if (!canAccess) {
        el.style.opacity = '0.4';
        el.style.pointerEvents = 'auto';
        el.setAttribute('data-locked', 'true');
        el.title = 'Fitur terkunci - upgrade paket untuk akses';
      } else {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.removeAttribute('data-locked');
        el.title = '';
      }
    });
  });
}

// ── NAVIGATION ────────────────────────────────────────────────────
function navigate(page) {
  const featureKey = PAGE_FEATURE_MAP[page];

  if (newlyUnlockedPages.includes(page)) {
    newlyUnlockedPages = newlyUnlockedPages.filter(item => item !== page);
    renderUnlockedFeatureIndicators();
    savePersistentState();
  }
  
  // Admin feature gating
  if (featureKey && activeRole === 'takmir' && takmirRegistration?.paid) {
    if (!canAccessFeature(featureKey)) {
      showLockedFeatureModal(page);
      return;
    }
  }
  
  // Jamaah feature gating (based on mosque package)
  if (selectedMosque && activeRole !== 'takmir') {
    const jamaahFeatures = getJamaahAvailableFeatures();
    const featureRequired = PAGE_FEATURE_MAP[page] || page;
    if (!jamaahFeatures.includes(featureRequired)) {
      showNotif(`📢 Fitur \"${page}\" tidak tersedia di paket masjid ini.`, 'info');
      return;
    }
  }
  
  currentPage = page;
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('page-'+page);
  if (el) el.classList.add('active');
  // Desktop nav active
  document.querySelectorAll('.sidebar-desktop .nav-item').forEach(n => {
    n.classList.toggle('active', n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${page}'`));
  });
  // Bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(n => {
    n.classList.toggle('active', n.id === 'bn-'+page);
  });
  // Mobile sidebar nav
  document.querySelectorAll('.mobile-nav-item').forEach(n => {
    const onClick = n.getAttribute('onclick') || '';
    n.classList.toggle('active', onClick.includes(`navigate('${page}')`));
  });
  // Page title
  const titles = { dashboard:'Dashboard', donasi:'Donasi', zcorner:'UMKM Masjid', kajian:'Kajian & Acara', market:'Marketplace', relawan:'Relawan', sholat:'Waktu Sholat', streak:'Streak Kebaikan', laporan:'Laporan Keuangan', riwayat:'Riwayat Donasi', booking:'Booking Ruangan' };
  document.getElementById('page-title').textContent = titles[page] || '';
  updateAdminModeUI();
  
    // Update mosque package info for jamaah
    updateMosquePackageInfoDisplay();
  
  // Close mobile sidebar
  document.getElementById('mobile-sidebar-el').classList.remove('open');
  document.getElementById('mobile-overlay').classList.add('hidden');
}

// ── CHARTS ────────────────────────────────────────────────────────
function initCharts() {
  // Finance line chart
  const fCtx = document.getElementById('finance-chart');
  if (fCtx) {
    if (financeChart) financeChart.destroy();
    financeChart = new Chart(fCtx, {
      type:'line',
      data:{
        labels:['Okt','Nov','Des','Jan','Feb','Mar'],
        datasets:[
          { label:'Pemasukan', data:[32,38,42,35,40,45], borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.1)', tension:.4, fill:true, borderWidth:2 },
          { label:'Pengeluaran', data:[18,22,25,15,20,18], borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.05)', tension:.4, fill:true, borderWidth:2 },
        ]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{font:{family:'Outfit'},boxWidth:12}}}, scales:{y:{beginAtZero:true, grid:{color:'#f3f4f6'}, ticks:{font:{family:'Outfit'},callback:v=>'Rp '+v+'jt'} }, x:{grid:{display:false},ticks:{font:{family:'Outfit'}}} } }
    });
  }
  // Pie chart
  const pCtx = document.getElementById('pie-chart');
  if (pCtx) {
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pCtx, {
      type:'doughnut',
      data:{
        labels:['Infaq','Zakat','Donasi Online','Wakaf'],
        datasets:[{ data:[45,25,20,10], backgroundColor:['#10b981','#3b82f6','#f59e0b','#8b5cf6'], borderWidth:0 }]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom',labels:{font:{family:'Outfit'},boxWidth:10,padding:8}}} }
    });
  }
  // Income bar
  const iCtx = document.getElementById('income-chart');
  if (iCtx) {
    if (incomeChart) incomeChart.destroy();
    incomeChart = new Chart(iCtx, {
      type:'bar',
      data:{
        labels:['Infaq','Zakat','Donasi','Wakaf','Lainnya'],
        datasets:[{ data:[45,22,18,8,7], backgroundColor:'rgba(16,185,129,.8)', borderRadius:8 }]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:'#f3f4f6'},ticks:{font:{family:'Outfit'}}},x:{grid:{display:false},ticks:{font:{family:'Outfit'}}}} }
    });
  }
  // Expense bar
  const eCtx = document.getElementById('expense-chart');
  if (eCtx) {
    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(eCtx, {
      type:'bar',
      data:{
        labels:['Operasional','Program','Honor','Renovasi','Lainnya'],
        datasets:[{ data:[40,28,20,8,4], backgroundColor:'rgba(239,68,68,.75)', borderRadius:8 }]
      },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,grid:{color:'#f3f4f6'},ticks:{font:{family:'Outfit'}}},x:{grid:{display:false},ticks:{font:{family:'Outfit'}}}} }
    });
  }
}

// ── RENDER FUNCTIONS ──────────────────────────────────────────────
function renderRecentTx() {
  const el = document.getElementById('recent-tx');
  if (!el) return;
  el.innerHTML = getRecentTransactionsFeed().map(tx => `
    <div class="tx-item">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style="background:${tx.type==='in'?'#d1fae5':'#fee2e2'}">${tx.icon}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-gray-800 truncate">${tx.label}</p>
        <p class="text-xs text-gray-400">${tx.date} · ${tx.category}</p>
      </div>
      <p class="font-bold text-sm flex-shrink-0 ${tx.type==='in'?'text-emerald-600':'text-red-500'}">
        ${tx.type==='in'?'+':'-'}Rp ${fmtRp(tx.amount)}
      </p>
    </div>`).join('');
}

function renderCampaigns() {
  const campaigns = [
    { name:'Pembangunan Menara Masjid', target:500000000, raised:312000000, emoji:'🏗️', days:45 },
    { name:'Beasiswa Santri Dhuafa', target:100000000, raised:67000000, emoji:'🎓', days:30 },
    { name:'Renovasi Toilet Masjid', target:50000000, raised:48000000, emoji:'🔧', days:10 },
  ];
  const el = document.getElementById('campaign-list');
  if (!el) return;
  el.innerHTML = campaigns.map(c => {
    const pct = Math.min(100, Math.round(c.raised/c.target*100));
    return `
    <div class="p-4 border border-gray-100 rounded-2xl hover:border-emerald-200 transition">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-2xl">${c.emoji}</span>
        <div class="flex-1"><p class="font-semibold text-sm">${c.name}</p><p class="text-xs text-gray-400">${c.days} hari tersisa</p></div>
        <span class="badge badge-green">${pct}%</span>
      </div>
      <div class="progress-bar mb-2"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="flex justify-between text-xs text-gray-500">
        <span>Terkumpul: Rp ${fmtRp(c.raised)}</span>
        <span>Target: Rp ${fmtRp(c.target)}</span>
      </div>
    </div>`;
  }).join('');
}

function renderVouchers() {
  const el = document.getElementById('voucher-list');
  if (!el) return;
  el.innerHTML = VOUCHERS.map(v => `
    <div class="voucher-card p-5">
      <div class="flex items-start gap-3 mb-3">
        <span class="text-3xl">${v.emoji}</span>
        <div>
          <p class="font-bold text-amber-900">${v.name}</p>
          <p class="text-sm text-amber-700 mt-1">${v.desc}</p>
        </div>
      </div>
      <div class="flex items-center justify-between mt-3">
        <div>
          <p class="text-xs text-gray-500">Berlaku: <span class="font-semibold text-amber-700">${v.valid}</span></p>
          <p class="text-xs text-gray-500">Sisa kuota: <span class="font-bold text-amber-600">${v.left}</span></p>
        </div>
        <button onclick="claimVoucher('${v.name}')" class="btn-gold px-4 py-2 text-sm rounded-xl">Klaim</button>
      </div>
    </div>`).join('');
}

function renderEvents() {
  const el = document.getElementById('event-list');
  if (!el) return;

  const activeEvents = selectedMosque && MOSQUE_EVENT_CATALOG[selectedMosque.id]
    ? MOSQUE_EVENT_CATALOG[selectedMosque.id].map((ev, i) => ({
        title: ev.title,
        ustadz: ev.ustadz || 'Pengurus Masjid',
        time: ev.time,
        type: (ev.type || 'Kajian').toLowerCase(),
        icon: ev.icon || '📖',
        registered: !!ev.registered,
        quota: ev.quota || 100,
        filled: ev.filled || Math.min(75 + i * 5, 98),
      }))
    : EVENTS;

  el.innerHTML = activeEvents.map((ev,i) => {
    const pct = Math.round(ev.filled/ev.quota*100);
    const typeColors = { kajian:'bg-purple-100 text-purple-700', sholat:'bg-blue-100 text-blue-700', sosial:'bg-green-100 text-green-700', workshop:'bg-orange-100 text-orange-700', tahsin:'bg-pink-100 text-pink-700', akbar:'bg-yellow-100 text-yellow-700', event:'bg-slate-100 text-slate-700', komunitas:'bg-emerald-100 text-emerald-700', pelatihan:'bg-cyan-100 text-cyan-700', pendidikan:'bg-indigo-100 text-indigo-700', wisata:'bg-amber-100 text-amber-700' };
    return `
    <div class="event-card">
      <div class="h-2" style="background:linear-gradient(90deg,#10b981,#059669)"></div>
      <div class="p-4">
        <div class="flex items-start gap-3 mb-3">
          <span class="text-2xl">${ev.icon}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm text-gray-800">${ev.title}</p>
            <p class="text-xs text-gray-500">${ev.ustadz}</p>
          </div>
          <span class="badge ${typeColors[ev.type]||'badge-green'} text-[10px]">${ev.type}</span>
        </div>
        <p class="text-xs text-emerald-600 mb-3 flex items-center gap-1"><i class="fas fa-clock"></i> ${ev.time}</p>
        <div class="progress-bar mb-1"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="flex justify-between text-xs text-gray-400 mb-3"><span>${ev.filled}/${ev.quota} peserta</span><span>${pct}%</span></div>
        <button onclick="registerEvent(${i})" class="${ev.registered?'w-full py-2 text-xs rounded-xl bg-gray-100 text-gray-500 font-semibold':'btn-primary w-full py-2 text-xs rounded-xl'}" style="border:none;cursor:pointer;font-family:'Outfit',sans-serif;">
          ${ev.registered?'✓ Terdaftar':'Daftar Sekarang'}
        </button>
      </div>
    </div>`;
  }).join('');
}

function renderMarket(tab) {
  const el = document.getElementById('market-list');
  if (!el) return;
  const filtered = tab === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === tab);
  el.innerHTML = filtered.map(p => `
    <div class="market-card">
      <div class="h-28 flex items-center justify-center text-4xl" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7)">${p.emoji}</div>
      <div class="p-3">
        <p class="font-semibold text-sm text-gray-800 truncate">${p.name}</p>
        <p class="text-xs text-gray-400 mb-1">${p.seller}</p>
        <p class="font-bold text-emerald-600 text-sm">Rp ${p.price.toLocaleString('id')}</p>
        <p class="text-xs text-gray-400 mb-2">Terjual ${p.sold}x</p>
        <button onclick="buyProduct('${p.name}')" class="btn-primary w-full py-2 text-xs rounded-xl">Beli</button>
      </div>
    </div>`).join('');
}

function setMarketTab(btn, tab) {
  document.querySelectorAll('#page-market .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  marketTab = tab;
  renderMarket(tab);
}

function renderVolunteers() {
  const el = document.getElementById('relawan-list');
  if (!el) return;
  el.innerHTML = VOLUNTEERS.map(v => `
    <div class="card p-5">
      <div class="flex items-start gap-3 mb-4">
        <span class="text-3xl">${v.emoji}</span>
        <div class="flex-1">
          <p class="font-bold text-gray-800">${v.role}</p>
          <p class="text-sm text-gray-500 mt-1">${v.desc}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        ${v.skills.map(s=>`<span class="badge badge-green">${s}</span>`).join('')}
      </div>
      <div class="flex items-center justify-between">
        <p class="text-xs text-gray-500">${v.open} posisi tersedia · ${v.applied} mendaftar</p>
        <button onclick="applyVolunteer('${v.role}')" class="btn-primary px-4 py-2 text-sm rounded-xl">Daftar</button>
      </div>
    </div>`).join('');
}

function renderRooms() {
  const el = document.getElementById('room-list');
  if (!el) return;
  el.innerHTML = ROOMS.map(r => `
    <div class="room-card ${r.booked?'booked':''}">
      <div class="h-20 flex items-center justify-center text-3xl" style="background:${r.booked?'#fee2e2':'#f0fdf4'}">${r.emoji}</div>
      <div class="p-4">
        <div class="flex items-center gap-2 mb-1">
          <p class="font-bold text-sm text-gray-800">${r.name}</p>
          ${r.booked?'<span class="badge badge-red">Terpakai</span>':'<span class="badge badge-green">Tersedia</span>'}
        </div>
        <p class="text-xs text-gray-500 mb-2">${r.desc}</p>
        <p class="text-xs text-gray-400 mb-2"><i class="fas fa-users mr-1"></i>Kapasitas: ${r.capacity} orang</p>
        <div class="flex flex-wrap gap-1 mb-3">
          ${r.features.map(f=>`<span class="badge badge-green text-[10px]">${f}</span>`).join('')}
        </div>
        <button onclick="${r.booked?'':'bookRoom(\"'+r.name+'\")'}" class="${r.booked?'w-full py-2 text-xs rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed':'btn-primary w-full py-2 text-xs rounded-xl'}" style="border:none;font-family:'Outfit',sans-serif;">
          ${r.booked?'Tidak Tersedia':'Pesan Sekarang'}
        </button>
      </div>
    </div>`).join('');
}

function renderPrayers() {
  const el = document.getElementById('prayer-list');
  if (!el) return;
  const now = new Date();
  const nowMin = now.getHours()*60+now.getMinutes();
  let nextIdx = 0;
  PRAYERS.forEach((p,i) => {
    const [h,m] = p.time.split(':').map(Number);
    if (h*60+m <= nowMin) nextIdx = i+1;
  });
  nextIdx = nextIdx % PRAYERS.length;
  const next = PRAYERS[nextIdx];
  document.getElementById('next-prayer-name').textContent = next.name;
  document.getElementById('next-prayer-time').textContent = next.time + ' WIB';
  document.getElementById('next-prayer-header').textContent = `${next.name} ${next.time}`;
  el.innerHTML = PRAYERS.map((p,i) => `
    <div class="card p-4 flex items-center gap-4 ${i===nextIdx?'ring-2 ring-emerald-400':''}">
      <span class="text-2xl">${p.icon}</span>
      <div class="flex-1">
        <p class="font-bold text-gray-800">${p.name}</p>
        <p class="text-xs text-gray-400">Iqamah: ${p.iqamah}</p>
      </div>
      <div class="text-right">
        <p class="font-bold text-gray-800 text-lg">${p.time}</p>
        ${i===nextIdx?'<span class="badge badge-green text-[10px]">Berikutnya</span>':''}
      </div>
    </div>`).join('');
}

function renderStreak() {
  document.getElementById('streak-count').textContent = streak.current;
  document.getElementById('streak-longest').textContent = streak.longest;
  document.getElementById('streak-total').textContent = streak.total;
  const el = document.getElementById('badge-list');
  if (!el) return;
  el.innerHTML = BADGES.map(b => `
    <div class="text-center p-2 rounded-2xl ${b.unlocked?'bg-emerald-50 border-2 border-emerald-200':'bg-gray-50 border-2 border-gray-200 opacity-50'}">
      <p class="text-2xl mb-1">${b.emoji}</p>
      <p class="text-[10px] font-semibold text-gray-700 leading-tight">${b.name}</p>
    </div>`).join('');
}

function renderLeaderboard() {
  const data = [
    { rank:1, name:'Ahmad Fauzi', streak:28, avatar:'A', isMe:true },
    { rank:2, name:'Siti Nurhaliza', streak:25, avatar:'S', isMe:false },
    { rank:3, name:'Muhammad Rizki', streak:21, avatar:'M', isMe:false },
    { rank:4, name:'Fatimah Az-Zahra', streak:18, avatar:'F', isMe:false },
    { rank:5, name:'Abdullah Azzam', streak:15, avatar:'A', isMe:false },
  ];
  const el = document.getElementById('leaderboard');
  if (!el) return;
  el.innerHTML = data.map(u => `
    <div class="flex items-center gap-3 p-3 rounded-2xl ${u.rank<=3?'rank-'+u.rank:u.isMe?'bg-emerald-50 border-2 border-emerald-200':'bg-gray-50'}">
      <span class="font-black text-lg w-6 text-center ${u.rank<=3?'text-yellow-500':'text-gray-400'}">${u.rank<=3?['🥇','🥈','🥉'][u.rank-1]:u.rank}</span>
      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">${u.avatar}</div>
      <div class="flex-1">
        <p class="font-semibold text-sm">${u.name} ${u.isMe?'<span class="text-xs text-emerald-500">(Anda)</span>':''}</p>
        <p class="text-xs text-gray-500">🔥 ${u.streak} hari streak</p>
      </div>
    </div>`).join('');
}

function renderHistory() {
  const el = document.getElementById('history-list');
  if (!el) return;
  ensureDonationHistorySeeded();
  populateHistoryFilters();
  const history = getCurrentDonationHistory();
  const mosqueFilter = document.getElementById('history-filter-mosque')?.value || 'all';
  const typeFilter = document.getElementById('history-filter-type')?.value || 'all';
  const filteredHistory = history.filter(item => {
    const mosqueMatch = mosqueFilter === 'all' || item.mosqueName === mosqueFilter;
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    return mosqueMatch && typeMatch;
  });
  if (!filteredHistory.length) {
    el.innerHTML = '<p class="text-sm text-gray-500">Belum ada riwayat donasi untuk akun ini.</p>';
    return;
  }
  el.innerHTML = filteredHistory.map(h => `
    <div class="tx-item">
      <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">${h.emoji}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-gray-800">${h.type}</p>
        <p class="text-xs text-gray-400">${h.date} · ${h.mosqueName || selectedMosque?.name || '-'}</p>
      </div>
      <div class="text-right">
        <p class="font-bold text-emerald-600 text-sm">Rp ${h.amount.toLocaleString('id')}</p>
        <span class="badge badge-green text-[10px]">✓ Diterima</span>
      </div>
    </div>`).join('');
}

function renderLaporan() {
  const el = document.getElementById('monthly-report');
  if (!el) return;
  const months = ['Maret 2025','Februari 2025','Januari 2025','Desember 2024','November 2024','Oktober 2024'];
  el.innerHTML = `<div class="space-y-2">${months.map((m,i) => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 transition">
      <div class="flex items-center gap-3">
        <span class="text-xl">📄</span>
        <div>
          <p class="font-semibold text-sm text-gray-800">Laporan ${m}</p>
          <p class="text-xs text-gray-400">Telah diaudit</p>
        </div>
      </div>
      <button onclick="showNotif('Laporan ${m} diunduh','success')" class="btn-primary px-3 py-1.5 text-xs rounded-lg">
        <i class="fas fa-download mr-1"></i>Unduh
      </button>
    </div>`).join('')}</div>`;
}

// ── MODALS ────────────────────────────────────────────────────────
function openDonationModal(type) {
  if (!selectedMosque) {
    showNotif('Pilih masjid terlebih dahulu.', 'error');
    showScreen('mosque-screen');
    return;
  }
  if (!isLoggedIn || activeRole !== 'jamaah') {
    promptLoginForSelectedMosque('berdonasi');
    return;
  }
  document.getElementById('modal-donate-title').textContent = type;
  document.getElementById('modal-donate-mosque').textContent = selectedMosque?.name;
  const icons = { 'Zakat Maal':'💰', 'Infaq Pembangunan':'🕌', 'Sedekah Jumat':'🍱', 'Wakaf Produktif':'🌱' };
  document.getElementById('modal-donate-icon').textContent = icons[type]||'💚';
  document.getElementById('donate-amount').value = '';
  document.getElementById('donation-modal').classList.remove('hidden');
}
function closeDonationModal() { document.getElementById('donation-modal').classList.add('hidden'); }

function setAmount(val) {
  document.getElementById('donate-amount').value = val || '';
}

function submitDonation() {
  const amount = parseInt(document.getElementById('donate-amount').value);
  if (!amount || amount < 1000) { showNotif('Nominal minimum Rp 1.000', 'error'); return; }
  showLoading('Memproses donasi...');
  setTimeout(() => {
    const donationType = document.getElementById('modal-donate-title').textContent || 'Donasi';
    const donationIcons = { 'Zakat Maal':'💰', 'Infaq Pembangunan':'🕌', 'Sedekah Jumat':'🍱', 'Wakaf Produktif':'🌱' };
    getCurrentDonationHistory().unshift({
      type: donationType,
      amount,
      date: new Date().toLocaleDateString('id-ID'),
      status: 'success',
      emoji: donationIcons[donationType] || '💚',
      mosqueName: selectedMosque?.name || '-',
    });
    syncCurrentUserToJamaahAccount();
    savePersistentState();
    renderHistory();
    renderJamaahProfileSummary();
    hideLoading();
    closeDonationModal();
    showNotif(`🎉 Donasi Rp ${amount.toLocaleString('id')} berhasil! JazakAllah Khairan.`, 'success');
  }, 1500);
}

function openCheckInModal() {
  document.getElementById('manual-code').value = '';
  document.getElementById('checkin-modal').classList.remove('hidden');
}
function closeCheckInModal() { document.getElementById('checkin-modal').classList.add('hidden'); }

function simulateQR() {
  showLoading('Memproses QR...');
  setTimeout(() => {
    hideLoading();
    closeCheckInModal();
    processCheckIn('Kajian Tafsir Al-Quran');
  }, 1200);
}

function submitManualCheckin() {
  const code = document.getElementById('manual-code').value.toUpperCase();
  const codes = { 'KAJ001':'Kajian Tafsir Al-Quran', 'SHL001':'Sholat Dzuhur Berjamaah', 'SOC001':'Bakti Sosial Jumat', 'WRK001':'Workshop Digital' };
  if (!code || code.length !== 6) { showNotif('Kode harus 6 karakter', 'error'); return; }
  if (!codes[code]) { showNotif('Kode tidak valid atau kadaluarsa', 'error'); return; }
  showLoading('Memverifikasi kode...');
  setTimeout(() => {
    hideLoading();
    closeCheckInModal();
    processCheckIn(codes[code]);
  }, 1000);
}

function processCheckIn(activity) {
  streak.current++;
  if (streak.current > streak.longest) streak.longest = streak.current;
  streak.total++;
  document.getElementById('success-activity-name').textContent = activity;
  document.getElementById('success-streak-count').textContent = streak.current;
  document.getElementById('success-modal').classList.remove('hidden');
  renderStreak();
  showNotif('Check-in berhasil! 🔥 Streak bertambah!', 'success');
}

function closeSuccessModal() { document.getElementById('success-modal').classList.add('hidden'); }

function registerEvent(idx) {
  if (!selectedMosque) {
    showNotif('Pilih masjid terlebih dahulu.', 'error');
    showScreen('mosque-screen');
    return;
  }
  if (!getJamaahAvailableFeatures().includes('kajian')) {
    showNotif(`Kajian belum tersedia di paket ${String(selectedMosque.package || 'basic').toUpperCase()} untuk ${selectedMosque.name}.`, 'info');
    return;
  }
  if (!isLoggedIn || activeRole !== 'jamaah') {
    promptLoginForSelectedMosque('mengikuti kajian');
    return;
  }

  const usingMosqueCatalog = selectedMosque && MOSQUE_EVENT_CATALOG[selectedMosque.id];

  if (usingMosqueCatalog) {
    const event = MOSQUE_EVENT_CATALOG[selectedMosque.id][idx];
    if (!event || event.registered) return;
    event.registered = true;
    event.filled = (event.filled || 0) + 1;
    savePersistentState();
    renderEvents();
    showNotif(`✅ Berhasil daftar: ${event.title}. Jangan lupa check-in saat hadir!`, 'success');
    return;
  }

  if (EVENTS[idx].registered) return;
  EVENTS[idx].registered = true;
  EVENTS[idx].filled++;
  renderEvents();
  showNotif(`✅ Berhasil daftar: ${EVENTS[idx].title}. Jangan lupa check-in saat hadir!`, 'success');
}

function claimVoucher(name) {
  showLoading('Memproses klaim...');
  setTimeout(() => {
    hideLoading();
    showNotif(`🎫 Voucher "${name}" berhasil diklaim! Silakan tunjukkan kepada panitia.`, 'success');
  }, 1000);
}

function buyProduct(name) {
  showNotif(`🛒 Produk "${name}" ditambahkan ke keranjang!`, 'success');
}

function applyVolunteer(role) {
  showLoading('Mendaftarkan...');
  setTimeout(() => {
    hideLoading();
    showNotif(`✅ Berhasil mendaftar sebagai "${role}"! Panitia akan menghubungi Anda.`, 'success');
  }, 1000);
}

function bookRoom(name) {
  if (!selectedMosque) {
    showNotif('Pilih masjid terlebih dahulu.', 'error');
    showScreen('mosque-screen');
    return;
  }
  if (!getJamaahAvailableFeatures().includes('booking')) {
    showNotif(`Booking ruangan belum tersedia di paket ${String(selectedMosque.package || 'basic').toUpperCase()} untuk ${selectedMosque.name}.`, 'info');
    return;
  }
  if (!isLoggedIn || activeRole !== 'jamaah') {
    promptLoginForSelectedMosque('booking ruangan');
    return;
  }
  showNotif(`📅 Permintaan booking "${name}" dikirim! Menunggu konfirmasi pengurus.`, 'success');
}

// ── MOBILE SIDEBAR ────────────────────────────────────────────────
function toggleMobileSidebar() {
  const sidebar = document.getElementById('mobile-sidebar-el');
  const overlay = document.getElementById('mobile-overlay');
  const isOpen = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('hidden', isOpen);
}

// ── UTILITY ───────────────────────────────────────────────────────
function fmtRp(n) {
  if (n >= 1000000000) return (n/1000000000).toFixed(1) + ' M';
  if (n >= 1000000) return (n/1000000).toFixed(1) + ' jt';
  if (n >= 1000) return (n/1000).toFixed(0) + ' rb';
  return n.toLocaleString('id');
}

function showLoading(text = 'Memuat...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading').classList.remove('hidden');
}
function hideLoading() { document.getElementById('loading').classList.add('hidden'); }

function showNotif(msg, type = 'success') {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.className = `notif ${type}`;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}

function initSholatTime() {
  const now = new Date();
  document.getElementById('sholat-date').textContent = now.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
