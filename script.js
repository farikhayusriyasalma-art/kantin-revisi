// ============================================================
//  FT UGM EATS & SEATS — script.js v3.0
//  Revisi berdasarkan feedback responden kuisioner:
//  1. Konfirmasi modal sebelum pesan
//  2. Harga makanan ditampilkan
//  3. Search bar kantin & menu
//  4. Fitur pengingat kedaluwarsa bahan baku
//  5. Simulasi notifikasi WhatsApp pengelola
//  6. Tooltip penjelasan fitur
//  7. Fix bug template literal stok tipis
// ============================================================

// ---------- DATABASE MENU ----------
const databaseMenuNormal = {
    "Kantin SGLC Hub":              ["Nasi Ayam Geprek","Mie Ayam Pangsit","Soto Ayam Kampung","Nasi Goreng Telur","Bakso Sapi Urat","Siomay Bandung","Es Teh Manis","Es Jeruk Peras","Kopi Susu Dingin","Gorengan Campur"],
    "Kantin Sipil & Lingkungan":    ["Soto Daging Sapi","Nasi Rames Sayur","Mie Goreng Jawa","Gado-Gado Suroboyo","Ayam Bakar Madu","Kupat Tahu","Es Teh Manis","Es Kelapa Muda","Kopi Hitam","Tempe Mendoan"],
    "Kantin Mesin & Industri":      ["Ayam Geprek Sambal Ijo","Nasi Gila Pedas","Mie Ayam Bakso","Nasi Telur Dadar","Sate Ayam Madura","Batagor Garing","Es Teh Manis","Es Milo Susu","Kopi Espresso Local","Tahu Bakar"],
    "Kantin DTETI":                 ["Nasi Ayam Crispy","Burger Sapi Keju","Mie Kuah Pedas","Nasi Goreng Cornet","Sandwich Telur","Kebab Daging","Es Teh Manis","Es Matcha Latte","Kopi Susu Gula Aren","Roti Bakar Cokelat"],
    "Kantin Arsitektur":            ["Nasi Pecel Madiun","Ayam Penyet Lalapan","Soto Madura","Spaghetti Bolognese","Sandwich Tuna","Lumpia Semarang","Es Teh Manis","Es Cappuccino","Teh Tarik Dingin","Waffle Madu"],
    "Kantin Geodesi":               ["Nasi Padang Rendang","Bakso Solo Urat","Mie Goreng Seafood","Sate Kambing","Kupat Tahu Magelang","Pempek Palembang","Es Teh Manis","Es Sirup Cocopandan","Jus Alpukat","Keripik Singkong"],
    "Kantin Geologi":               ["Soto Lamongan Kuah","Ayam Goreng Kalasan","Mie Ayam Jamur","Nasi Goreng Kambing","Sup Iga Sapi","Siomay Ikan Tenggiri","Es Teh Manis","Es Blewah Segar","Jus Mangga","Tahu Gejrot"],
    "Kantin Kimia":                 ["Nasi Ayam Kremes","Mie Kuah Bakso","Ayam Geprek Mozzarella","Soto Kudus","Nasi Goreng Sosis","Batagor Kuah","Es Teh Manis","Es Lemon Tea","Soda Gembira","Cireng Bumbu Rujak"],
    "Kantin Nuklir & Fisika":       ["Nasi Pecel Lele","Ayam Bakar Kalasan","Mie Jawa Rebus","Nasi Goreng Ati Ampela","Bakso Telur Semar","Tahu Kupat Jogja","Es Teh Manis","Es Melon Serut","Jus Jeruk","Pisang Goreng Keju"]
};

// Harga realistis per menu (index sesuai urutan menu di atas)
const databaseHarga = {
    "Kantin SGLC Hub":              [13000,12000,12000,11000,13000,10000,4000,5000,8000,5000],
    "Kantin Sipil & Lingkungan":    [14000,11000,11000,12000,15000,10000,4000,7000,5000,4000],
    "Kantin Mesin & Industri":      [14000,13000,12000,10000,15000,9000,4000,7000,9000,5000],
    "Kantin DTETI":                 [13000,18000,12000,12000,13000,16000,4000,10000,9000,8000],
    "Kantin Arsitektur":            [12000,14000,13000,20000,14000,12000,4000,9000,8000,13000],
    "Kantin Geodesi":               [16000,13000,13000,17000,11000,13000,4000,5000,8000,6000],
    "Kantin Geologi":               [14000,13000,12000,14000,18000,11000,4000,6000,7000,6000],
    "Kantin Kimia":                 [13000,12000,15000,12000,11000,10000,4000,6000,7000,6000],
    "Kantin Nuklir & Fisika":       [13000,14000,11000,13000,13000,11000,4000,6000,7000,8000]
};

// Database bahan baku + tanggal kedaluwarsa (per kantin)
const templateBahanBaku = [
    { nama: "Ayam Segar",       hariSisa: () => Math.floor(Math.random() * 3) + 1 },
    { nama: "Tempe & Tahu",     hariSisa: () => Math.floor(Math.random() * 3) + 1 },
    { nama: "Sayur Kangkung",   hariSisa: () => Math.floor(Math.random() * 4) + 1 },
    { nama: "Mie Kering",       hariSisa: () => Math.floor(Math.random() * 20) + 10 },
    { nama: "Beras 5kg",        hariSisa: () => Math.floor(Math.random() * 15) + 7 },
    { nama: "Santan Kemasan",   hariSisa: () => Math.floor(Math.random() * 6) + 2 },
    { nama: "Saus Botolan",     hariSisa: () => Math.floor(Math.random() * 30) + 10 },
    { nama: "Telur Ayam",       hariSisa: () => Math.floor(Math.random() * 7) + 3 },
];

const listNamaKantin = Object.keys(databaseMenuNormal);
let GlobalDatabase = {};
let currentActiveNode = "Kantin SGLC Hub";
let antreanDelivery = [];

// State modal pesan
let pendingOrderIdx = -1;
let pendingOrderName = "";
let pendingOrderPrice = 0;

// ---------- INIT DATABASE ----------
listNamaKantin.forEach(name => {
    const today = new Date();
    const bahanBaku = templateBahanBaku.map(b => {
        const sisa = b.hariSisa();
        const tgl = new Date(today);
        tgl.setDate(today.getDate() + sisa);
        return {
            nama: b.nama,
            hariSisa: sisa,
            tanggal: tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        };
    });

    GlobalDatabase[name] = {
        sensor: { suhu: 24 + Math.random() * 3, kelembapan: 45 + Math.random() * 15, cahaya: 250 + Math.random() * 150, suara: 50 + Math.random() * 20 },
        kursi: Array.from({ length: 40 }, () => Math.random() > 0.5 ? "ready" : "occupied"),
        menu: databaseMenuNormal[name].map((mName, i) => ({
            nama: mName,
            stok: Math.floor(Math.random() * 15) + 3,
            harga: databaseHarga[name][i]
        })),
        totalOrderCount: Math.floor(Math.random() * 35) + 10,
        bahanBaku: bahanBaku
    };
});

// ---------- WINDOW ON LOAD ----------
window.onload = function () {
    buildSidebar();
    buildBarChartElements();
    refreshLayout();
    initTooltips();
    startClock();

    setInterval(engineLiveTelemetry, 2000);
    setInterval(engineDeliveryStatusTracker, 3000);
    setInterval(updateTickerFeed, 4000);
    setInterval(startClock, 1000);
};

// ---------- CLOCK ----------
function startClock() {
    const el = document.getElementById("live-clock");
    if (el) el.textContent = new Date().toLocaleTimeString('id-ID');
}

// ---------- SIDEBAR ----------
function buildSidebar() {
    const container = document.getElementById("kantin-list");
    listNamaKantin.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name.replace("Kantin ", "");
        li.dataset.name = name;
        if (name === currentActiveNode) li.classList.add("active");
        li.onclick = () => switchKantin(name);
        container.appendChild(li);
    });
}

function switchKantin(name) {
    currentActiveNode = name;
    document.querySelectorAll("#kantin-list li").forEach(li => li.classList.remove("active"));
    const target = document.querySelector(`#kantin-list li[data-name="${name}"]`);
    if (target) target.classList.add("active");
    document.getElementById("active-kantin-title").textContent = name;
    refreshLayout();
}

function filterKantin(query) {
    const q = query.toLowerCase();
    document.querySelectorAll("#kantin-list li").forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
    });
}

// ---------- BAR CHART ELEMENTS ----------
function buildBarChartElements() {
    const wrapper = document.getElementById("bar-chart-wrapper");
    wrapper.innerHTML = "";
    listNamaKantin.forEach((name, idx) => {
        const kode = name.replace("Kantin ", "").substring(0, 4).toUpperCase();
        const div = document.createElement("div");
        div.classList.add("bar-wrapper");
        div.innerHTML = `
            <span class="bar-val" id="bar-val-${idx}">0</span>
            <div class="bar-pipe" id="bar-pipe-${idx}" style="height:3px;"></div>
            <span class="bar-label">${kode}</span>
        `;
        wrapper.appendChild(div);
    });
}

// ---------- REFRESH LAYOUT ----------
function refreshLayout() {
    const db = GlobalDatabase[currentActiveNode];

    // SENSOR
    document.getElementById("txt-suhu").textContent = db.sensor.suhu.toFixed(1);
    document.getElementById("txt-kelembapan").textContent = Math.round(db.sensor.kelembapan);
    document.getElementById("txt-cahaya").textContent = Math.round(db.sensor.cahaya);
    document.getElementById("txt-suara").textContent = Math.round(db.sensor.suara);
    evaluasiSensor(db.sensor);

    // KURSI
    const grid = document.getElementById("layout-kursi");
    grid.innerHTML = "";
    let occupied = 0;
    db.kursi.forEach((status, i) => {
        const node = document.createElement("div");
        node.classList.add("kursi-node", status);
        node.textContent = String(i + 1).padStart(2, "0");
        node.title = `Kursi ${i + 1}: ${status === "occupied" ? "Terisi" : "Kosong"}`;
        if (status === "occupied") occupied++;
        grid.appendChild(node);
    });
    document.getElementById("txt-kursi-count").textContent = `${occupied}/40`;

    // BADGE STATUS
    const rate = (occupied / 40) * 100;
    const crowdBadge = document.getElementById("badge-crowd");
    const dlvBadge = document.getElementById("badge-delivery");
    if (rate >= 80) {
        crowdBadge.textContent = "PENUH"; crowdBadge.className = "status-pill bg-penuh";
        dlvBadge.textContent = "DELIVERY OVERLOAD ⚠️"; dlvBadge.className = "status-pill bg-overload-dlv";
    } else if (rate >= 45) {
        crowdBadge.textContent = "RAMAI"; crowdBadge.className = "status-pill bg-ramai";
        dlvBadge.textContent = "DELIVERY NORMAL"; dlvBadge.className = "status-pill bg-normal-dlv";
    } else {
        crowdBadge.textContent = "SEPI"; crowdBadge.className = "status-pill bg-sepi";
        dlvBadge.textContent = "DELIVERY CEPAT"; dlvBadge.className = "status-pill bg-normal-dlv";
    }

    // MENU
    renderMenu();

    // EXPIRY
    renderExpiry();

    // CHARTS
    refreshMacroCharts();
    renderDeliveryTracker();
}

// ---------- RENDER MENU ----------
function renderMenu() {
    const db = GlobalDatabase[currentActiveNode];
    const container = document.getElementById("daftar-menu");
    container.innerHTML = "";

    db.menu.forEach((item, index) => {
        const row = document.createElement("div");
        row.classList.add("menu-row");
        row.dataset.menuname = item.nama.toLowerCase();

        let sClass = "s-aman", sText = `Stok: ${item.stok}`;
        let isDisable = false;
        if (item.stok === 0) {
            sClass = "s-habis"; sText = "HABIS"; isDisable = true;
        } else if (item.stok < 5) {
            // FIX BUG: gunakan backtick bukan tanda kutip biasa
            sClass = "s-tipis"; sText = `Sisa ${item.stok}`;
        }

        const hargaFormatted = `Rp ${item.harga.toLocaleString('id-ID')}`;

        row.innerHTML = `
            <div class="m-title">
                <h5>${item.nama}</h5>
                <div class="m-price">${hargaFormatted}</div>
                <span class="m-sub">ID: FT-${100 + index}</span>
            </div>
            <div class="action-block">
                <span class="stok-lbl ${sClass}">${sText}</span>
                <button class="btn-order" ${isDisable ? "disabled" : ""}
                    onclick="bukaModalPesan('${item.nama.replace(/'/g, "\\'")}', ${index}, ${item.harga})">
                    PESAN
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function filterMenu(query) {
    const q = query.toLowerCase();
    document.querySelectorAll(".menu-row").forEach(row => {
        const match = row.dataset.menuname && row.dataset.menuname.includes(q);
        row.classList.toggle("hidden-menu", !match);
    });
}

// ---------- MODAL KONFIRMASI PESAN ----------
function bukaModalPesan(nama, idx, harga) {
    pendingOrderIdx = idx;
    pendingOrderName = nama;
    pendingOrderPrice = harga;

    document.getElementById("modal-item-name").textContent = nama;
    document.getElementById("modal-item-price").textContent = `Rp ${harga.toLocaleString('id-ID')}`;
    document.getElementById("modal-overlay").classList.remove("hidden");
}

function tutupModal() {
    document.getElementById("modal-overlay").classList.add("hidden");
    pendingOrderIdx = -1;
}

function konfirmasiPesan() {
    if (pendingOrderIdx < 0) return;
    const db = GlobalDatabase[currentActiveNode];
    const item = db.menu[pendingOrderIdx];

    if (item.stok > 0) {
        item.stok--;
        db.totalOrderCount++;

        const orderId = Math.floor(Math.random() * 900) + 100;
        antreanDelivery.unshift({
            id: orderId,
            kantin: currentActiveNode,
            namaMenu: pendingOrderName,
            harga: pendingOrderPrice,
            step: "dapur"
        });
        if (antreanDelivery.length > 3) antreanDelivery.pop();
    }

    tutupModal();
    refreshLayout();
}

// ---------- DELIVERY TRACKER ----------
function engineDeliveryStatusTracker() {
    antreanDelivery.forEach(order => {
        if (order.step === "dapur") order.step = "pengantaran";
        else if (order.step === "pengantaran") order.step = "selesai";
    });
    renderDeliveryTracker();
}

function renderDeliveryTracker() {
    const container = document.getElementById("live-delivery-tracker");
    if (!container) return;
    if (antreanDelivery.length === 0) {
        container.innerHTML = `<p class="empty-tracker">Belum ada order aktif.</p>`;
        return;
    }
    container.innerHTML = "";
    antreanDelivery.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("dlv-card");
        let badgeText = "", badgeClass = "";
        if (order.step === "dapur") { badgeText = "🍳 Diproses Dapur"; badgeClass = "step-dapur"; }
        else if (order.step === "pengantaran") { badgeText = "🛵 Dalam Pengantaran"; badgeClass = "step-kurir"; }
        else { badgeText = "✅ Selesai"; badgeClass = "step-selesai"; }

        div.innerHTML = `
            <div class="dlv-info">
                <h6>#${order.id} — ${order.namaMenu}</h6>
                <p>${order.kantin} · Rp ${order.harga.toLocaleString('id-ID')}</p>
            </div>
            <span class="dlv-step-badge ${badgeClass}">${badgeText}</span>
        `;
        container.appendChild(div);
    });
}

// ---------- EXPIRY / KEDALUWARSA ----------
function renderExpiry() {
    const db = GlobalDatabase[currentActiveNode];
    const container = document.getElementById("expiry-grid");
    if (!container) return;
    container.innerHTML = "";

    db.bahanBaku.forEach(b => {
        const card = document.createElement("div");
        card.classList.add("expiry-card");

        let statusClass = "exp-aman", sisaLabel = `${b.hariSisa} hari lagi`;
        if (b.hariSisa <= 2) { statusClass = "exp-kritis"; sisaLabel = `⚠️ ${b.hariSisa} hari lagi!`; }
        else if (b.hariSisa <= 5) { statusClass = "exp-waspada"; }

        card.classList.add(statusClass);
        card.innerHTML = `
            <span class="exp-name">📦 ${b.nama}</span>
            <span class="exp-date">Exp: ${b.tanggal}</span>
            <span class="exp-sisa">${sisaLabel}</span>
        `;
        container.appendChild(card);
    });
}

// ---------- NOTIFIKASI WHATSAPP SIMULASI ----------
function simulasiNotifWA() {
    const db = GlobalDatabase[currentActiveNode];
    const kritis = db.bahanBaku.filter(b => b.hariSisa <= 2);
    const waspada = db.bahanBaku.filter(b => b.hariSisa > 2 && b.hariSisa <= 5);

    const timeStr = new Date().toLocaleString('id-ID');
    let msg = `🔔 *Notifikasi Otomatis — ${currentActiveNode}*\n📅 ${timeStr}\n\n`;

    if (kritis.length > 0) {
        msg += `🚨 *KRITIS (≤2 hari):*\n`;
        kritis.forEach(b => { msg += `• ${b.nama} → exp: ${b.tanggal}\n`; });
        msg += "\n";
    }
    if (waspada.length > 0) {
        msg += `⚠️ *WASPADA (3–5 hari):*\n`;
        waspada.forEach(b => { msg += `• ${b.nama} → exp: ${b.tanggal}\n`; });
        msg += "\n";
    }
    if (kritis.length === 0 && waspada.length === 0) {
        msg += `✅ Semua bahan baku dalam kondisi aman.\nTidak ada yang mendekati kedaluwarsa.`;
    } else {
        msg += `Segera restok atau gunakan bahan di atas.`;
    }

    document.getElementById("wa-message-text").textContent = msg;
    document.getElementById("modal-wa-overlay").classList.remove("hidden");
}

function tutupModalWA() {
    document.getElementById("modal-wa-overlay").classList.add("hidden");
}

// ---------- SENSOR EVALUASI ----------
function evaluasiSensor(sensor) {
    // Suhu
    const cardSuhu = document.getElementById("card-suhu");
    const lblSuhu = document.getElementById("status-suhu");
    const barSuhu = document.getElementById("bar-suhu");
    const pctSuhu = Math.min(((sensor.suhu - 22) / (32 - 22)) * 100, 100);
    barSuhu.style.width = `${pctSuhu}%`;
    if (sensor.suhu >= 24 && sensor.suhu <= 27) {
        lblSuhu.textContent = "OPTIMAL / NYAMAN"; cardSuhu.className = "sensor-box status-normal";
    } else if (sensor.suhu > 27 && sensor.suhu <= 29) {
        lblSuhu.textContent = "AGAK HANGAT"; cardSuhu.className = "sensor-box status-warning";
    } else {
        lblSuhu.textContent = "WARNING GERAH"; cardSuhu.className = "sensor-box status-danger";
    }

    // Kelembapan
    const cardKlm = document.getElementById("card-kelembapan");
    const lblKlm = document.getElementById("status-kelembapan");
    const barKlm = document.getElementById("bar-kelembapan");
    barKlm.style.width = `${Math.min(((sensor.kelembapan - 30) / (75 - 30)) * 100, 100)}%`;
    if (sensor.kelembapan >= 40 && sensor.kelembapan <= 60) {
        lblKlm.textContent = "IDEAL / SEGAR"; cardKlm.className = "sensor-box status-normal";
    } else if ((sensor.kelembapan >= 30 && sensor.kelembapan < 40) || (sensor.kelembapan > 60 && sensor.kelembapan <= 70)) {
        lblKlm.textContent = "AGAK LEMBAP"; cardKlm.className = "sensor-box status-warning";
    } else {
        lblKlm.textContent = "PENGAP EXTREME"; cardKlm.className = "sensor-box status-danger";
    }

    // Cahaya
    const cardCh = document.getElementById("card-cahaya");
    const lblCh = document.getElementById("status-cahaya");
    const barCh = document.getElementById("bar-cahaya");
    barCh.style.width = `${Math.min(((sensor.cahaya - 100) / (550 - 100)) * 100, 100)}%`;
    if (sensor.cahaya >= 200 && sensor.cahaya <= 500) {
        lblCh.textContent = "CUKUP / SNI OK"; cardCh.className = "sensor-box status-normal";
    } else if (sensor.cahaya < 200) {
        lblCh.textContent = "REDUP / KURANG"; cardCh.className = "sensor-box status-warning";
    } else {
        lblCh.textContent = "TERLALU SILAU"; cardCh.className = "sensor-box status-danger";
    }

    // Suara
    const cardSr = document.getElementById("card-suara");
    const lblSr = document.getElementById("status-suara");
    const barSr = document.getElementById("bar-suara");
    barSr.style.width = `${Math.min(((sensor.suara - 40) / (85 - 40)) * 100, 100)}%`;
    if (sensor.suara < 65) {
        lblSr.textContent = "KONDUSIF / TENANG"; cardSr.className = "sensor-box status-normal";
    } else if (sensor.suara <= 75) {
        lblSr.textContent = "BISING / RAMAI"; cardSr.className = "sensor-box status-warning";
    } else {
        lblSr.textContent = "SANGAT BISING"; cardSr.className = "sensor-box status-danger";
    }
}

// ---------- MACRO CHARTS ----------
function refreshMacroCharts() {
    let sepi = 0, ramai = 0, penuh = 0;
    listNamaKantin.forEach((name, idx) => {
        const db = GlobalDatabase[name];
        const occ = db.kursi.filter(k => k === "occupied").length;
        const rate = (occ / 40) * 100;
        if (rate >= 80) penuh++; else if (rate >= 45) ramai++; else sepi++;

        const pipe = document.getElementById(`bar-pipe-${idx}`);
        const val = document.getElementById(`bar-val-${idx}`);
        if (pipe) { pipe.style.height = `${Math.min(db.totalOrderCount * 1.2, 100)}px`; }
        if (val) val.textContent = db.totalOrderCount;
    });

    const total = listNamaKantin.length;
    const pSepi = (sepi / total) * 100;
    const pRamai = (ramai / total) * 100;
    const pie = document.getElementById("pie-chart");
    if (pie) {
        pie.style.background = `conic-gradient(#10b981 0% ${pSepi}%, #f59e0b ${pSepi}% ${pSepi + pRamai}%, #ef4444 ${pSepi + pRamai}% 100%)`;
    }
    document.getElementById("pie-sepi").textContent = sepi;
    document.getElementById("pie-ramai").textContent = ramai;
    document.getElementById("pie-penuh").textContent = penuh;
}

// ---------- LIVE TELEMETRY ----------
function engineLiveTelemetry() {
    listNamaKantin.forEach(name => {
        const db = GlobalDatabase[name];
        db.sensor.suhu = Math.min(30.2, Math.max(22.5, db.sensor.suhu + (Math.random() - 0.5) * 0.4));
        db.sensor.kelembapan = Math.min(75, Math.max(35, db.sensor.kelembapan + (Math.random() - 0.5) * 4));
        db.sensor.cahaya = Math.min(550, Math.max(140, db.sensor.cahaya + (Math.random() - 0.5) * 25));
        db.sensor.suara = Math.min(82, Math.max(42, db.sensor.suara + (Math.random() - 0.5) * 6));

        const rSeat = Math.floor(Math.random() * 40);
        db.kursi[rSeat] = db.kursi[rSeat] === "ready" ? "occupied" : "ready";

        const rMenu = Math.floor(Math.random() * 10);
        if (db.menu[rMenu].stok > 0) {
            if (Math.random() > 0.8) db.menu[rMenu].stok--;
        } else {
            db.menu[rMenu].stok = Math.floor(Math.random() * 10) + 5;
        }
    });
    refreshLayout();
}

// ---------- TICKER ----------
function updateTickerFeed() {
    const container = document.getElementById("ticker-container");
    if (!container) return;
    const kantin = listNamaKantin[Math.floor(Math.random() * listNamaKantin.length)];
    const menu = databaseMenuNormal[kantin][Math.floor(Math.random() * 10)];
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const span = document.createElement("span");
    span.textContent = `[${time}] Pesanan masuk: "${menu}" via Delivery di ${kantin} •  `;
    container.insertBefore(span, container.firstChild);
    if (container.children.length > 4) container.removeChild(container.lastChild);
}

// ---------- TOOLTIP SYSTEM ----------
function initTooltips() {
    const tooltip = document.getElementById("global-tooltip");

    document.querySelectorAll("[data-tooltip]").forEach(el => {
        el.addEventListener("mouseenter", (e) => {
            tooltip.textContent = el.dataset.tooltip;
            tooltip.classList.remove("hidden");
        });
        el.addEventListener("mousemove", (e) => {
            tooltip.style.left = (e.clientX + 14) + "px";
            tooltip.style.top = (e.clientY - 10) + "px";
        });
        el.addEventListener("mouseleave", () => {
            tooltip.classList.add("hidden");
        });
    });
}
