// Database 9 Kantin FT UGM - Menggunakan Menu Biasa yang Realistis & Wajar
const databaseMenuNormal = {
    "Kantin SGLC Hub": ["Nasi Ayam Geprek", "Mie Ayam Pangsit", "Soto Ayam Kampung", "Nasi Goreng Telur", "Bakso Sapi Urat", "Siomay Bandung", "Es Teh Manis", "Es Jeruk Peras", "Kopi Susu Dingin", "Gorengan Campur"],
    "Kantin Sipil & Lingkungan": ["Soto Daging Sapi", "Nasi Rames Sayur", "Mie Goreng Jawa", "Gado-Gado Suroboyo", "Ayam Bakar Madu", "Kupat Tahu", "Es Teh Manis", "Es Kelapa Muda", "Kopi Hitam", "Tempe Mendoan"],
    "Kantin Mesin & Industri": ["Ayam Geprek Sambal Ijo", "Nasi Gila Pedas", "Mie Ayam Bakso", "Nasi Telur Dadar", "Sate Ayam Madura", "Batagor Garing", "Es Teh Manis", "Es Milo Susu", "Kopi Espresso Local", "Tahu Bakar"],
    "Kantin DTETI": ["Nasi Ayam Crispy", "Burger Sapi Keju", "Mie Kuah Pedas", "Nasi Goreng Cornet", "Sandwich Telur", "Kebab Daging", "Es Teh Manis", "Es Matcha Latte", "Kopi Susu Gula Aren", "Roti Bakar Cokelat"],
    "Kantin Arsitektur": ["Nasi Pecel Madiun", "Ayam Penyet Lalapan", "Soto Madura", "Spaghetti Bolognese", "Sandwich Tuna", "Lumpia Semarang", "Es Teh Manis", "Es Cappuccino", "Teh Tarik Dingin", "Waffle Madu"],
    "Kantin Geodesi": ["Nasi Padang Rendang", "Bakso Solo Urat", "Mie Goreng Seafood", "Sate Kambing", "Kupat Tahu Magelang", "Pempek Palembang", "Es Teh Manis", "Es Sirup Cocopandan", "Jus Alpukat", "Keripik Singkong"],
    "Kantin Geologi": ["Soto Lamongan Kuah", "Ayam Goreng Kalasan", "Mie Ayam Jamur", "Nasi Goreng Kambing", "Sup Iga Sapi", "Siomay Ikan Tenggiri", "Es Teh Manis", "Es Blewah Segar", "Jus Mangga", "Tahu Gejrot"],
    "Kantin Kimia": ["Nasi Ayam Kremes", "Mie Kuah Bakso", "Ayam Geprek Mozzarella", "Soto Kudus", "Nasi Goreng Sosis", "Batagor Kuah", "Es Teh Manis", "Es Lemon Tea", "Soda Gembira", "Cireng Bumbu Rujak"],
    "Kantin Nuklir & Fisika": ["Nasi Pecel Lele", "Ayam Bakar Kalasan", "Mie Jawa Rebus", "Nasi Goreng Ati Ampela", "Bakso Telur Semar", "Tahu Kupat Jogja", "Es Teh Manis", "Es Melon Serut", "Jus Jeruk", "Pisang Goreng Keju"]
};

const listNamaKantin = Object.keys(databaseMenuNormal);
let GlobalDatabase = {};
let currentActiveNode = "Kantin SGLC Hub";
let antreanDeliveryShopee = []; // Menyimpan list order delivery aktif ala ShopeeFood

// Pembuatan State Database Awal Sistem
listNamaKantin.forEach(name => {
    GlobalDatabase[name] = {
        sensor: { suhu: 25.2, kelembapan: 52, cahaya: 340, suara: 58 },
        kursi: Array.from({ length: 40 }, () => Math.random() > 0.5 ? "ready" : "occupied"),
        menu: databaseMenuNormal[name].map(mName => ({ nama: mName, stok: Math.floor(Math.random() * 15) + 3 })),
        totalOrderCount: Math.floor(Math.random() * 35) + 10 
    };
});

window.onload = function() {
    buildSidebar();
    buildBarChartElements();
    refreshLayout();
    
    // Interval update real-time sensor & status pengantaran
    setInterval(engineLiveTelemetry, 2000);
    setInterval(engineDeliveryStatusTracker, 3000); // Menggerakkan tahapan ShopeeFood setiap 3 detik
    setInterval(updateTickerFeed, 4000);
};

function buildSidebar() {
    const container = document.getElementById("kantin-list");
    listNamaKantin.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name.replace("Kantin ", "");
        if(name === currentActiveNode) li.classList.add("active");
        li.onclick = function() {
            currentActiveNode = name;
            document.querySelectorAll("#kantin-list li").forEach(item => item.classList.remove("active"));
            li.classList.add("active");
            document.getElementById("active-kantin-title").textContent = name;
            refreshLayout();
        };
        container.appendChild(li);
    });
}

function buildBarChartElements() {
    const wrapper = document.getElementById("bar-chart-wrapper");
    wrapper.innerHTML = "";
    listNamaKantin.forEach((name, idx) => {
        const kode = name.replace("Kantin ", "").substring(0, 4);
        const barWrapper = document.createElement("div");
        barWrapper.classList.add("bar-wrapper");
        barWrapper.innerHTML = `
            <span class="bar-val" id="bar-val-${idx}">0</span>
            <div class="bar-pipe" id="bar-pipe-${idx}" style="height: 0px;"></div>
            <span class="bar-label">${kode}</span>
        `;
        wrapper.appendChild(barWrapper);
    });
}

function refreshLayout() {
    const db = GlobalDatabase[currentActiveNode];
    
    // 1. Kirim Nilai Sensor Fisik ke Komponen Layar
    document.getElementById("txt-suhu").textContent = db.sensor.suhu.toFixed(1);
    document.getElementById("txt-kelembapan").textContent = db.sensor.kelembapan;
    document.getElementById("txt-cahaya").textContent = db.sensor.cahaya;
    document.getElementById("txt-suara").textContent = db.sensor.suara;
    evaluasiAmbangBatasSensor(db.sensor);

    // 2. Render Denah Kedudukan Kursi
    const gridContainer = document.getElementById("layout-kursi");
    gridContainer.innerHTML = "";
    let occupiedCounter = 0;
    
    db.kursi.forEach((status, i) => {
        const node = document.createElement("div");
        node.classList.add("kursi-node", status);
        node.textContent = (i + 1) < 10 ? `0${i+1}` : i + 1;
        if(status === "occupied") occupiedCounter++;
        gridContainer.appendChild(node);
    });
    document.getElementById("txt-kursi-count").textContent = `${occupiedCounter}/40 KURSI TERISI`;

    // 3. Rumusan Badges Kepadatan Kantin & Delivery Status
    const crowdBadge = document.getElementById("badge-crowd");
    const dlvBadge = document.getElementById("badge-delivery");
    const occupancyRate = (occupiedCounter / 40) * 100;

    if (occupancyRate >= 80) {
        crowdBadge.textContent = "KAPASITAS: PENUH"; crowdBadge.className = "status-pill bg-penuh";
        dlvBadge.textContent = "DELIVERY: OVERLOAD ⚠️"; dlvBadge.className = "status-pill bg-overload-dlv";
    } else if (occupancyRate >= 45) {
        crowdBadge.textContent = "KAPASITAS: RAMAI"; crowdBadge.className = "status-pill bg-ramai";
        dlvBadge.textContent = "DELIVERY: NORMAL RUN"; dlvBadge.className = "status-pill bg-normal-dlv";
    } else {
        crowdBadge.textContent = "KAPASITAS: SEPI"; crowdBadge.className = "status-pill bg-sepi";
        dlvBadge.textContent = "DELIVERY: FAST RUN"; dlvBadge.className = "status-pill bg-normal-dlv";
    }

    // 4. Render Logistik Item Menu & Tombol Beli Online
    const menuContainer = document.getElementById("daftar-menu");
    menuContainer.innerHTML = "";
    
    db.menu.forEach((item, index) => {
        const row = document.createElement("div");
        row.classList.add("menu-row");
        
        let sClass = "s-aman", sText = `STOK: ${item.stok}`;
        let isDisable = false;
        
        if(item.stok === 0) { sClass = "s-habis"; sText = "HABIS"; isDisable = true; }
        else if(item.stok < 5) { sClass = "s-tipis"; sText = "SISA ${item.stok}"; }

        row.innerHTML = `
            <div class="m-title">
                <h5>${item.nama}</h5>
                <span>ID_ITEM: FT-${100 + index}</span>
            </div>
            <div class="action-block">
                <span class="stok-lbl ${sClass}">${sText}</span>
                <button class="btn-order" ${isDisable ? 'disabled' : ''} onclick="pesanMakananShopeeStyle('${item.nama}', ${index})">PESAN</button>
            </div>
        `;
        menuContainer.appendChild(row);
    });

    // 5. Update Visual Komponen Grafik Makro
    refreshMacroCharts();
    renderShopeeTrackerWidget();
}

// Logika Pemetaan Ambang Batas Sensor Menggunakan Standar Keamanan & Indikator Warna Kontras
function evaluasiAmbangBatasSensor(sensor) {
    const cardSuhu = document.getElementById("card-suhu");
    const lblSuhu = document.getElementById("status-suhu");
    if (sensor.suhu >= 24 && sensor.suhu <= 27) {
        lblSuhu.textContent = "OPTIMAL / NYAMAN"; cardSuhu.className = "sensor-box status-normal";
    } else if (sensor.suhu > 27 && sensor.suhu <= 29) {
        lblSuhu.textContent = "RAMAI / AGAK HANGAT"; cardSuhu.className = "sensor-box status-warning";
    } else {
        lblSuhu.textContent = "WARNING / GERAH OVERHEAT"; cardSuhu.className = "sensor-box status-danger";
    }

    const cardKelembapan = document.getElementById("card-kelembapan");
    const lblKelembapan = document.getElementById("status-kelembapan");
    if (sensor.kelembapan >= 40 && sensor.kelembapan <= 60) {
        lblKelembapan.textContent = "IDEAL / SEGAR"; cardKelembapan.className = "sensor-box status-normal";
    } else if ((sensor.kelembapan >= 30 && sensor.kelembapan < 40) || (sensor.kelembapan > 60 && sensor.kelembapan <= 70)) {
        lblKelembapan.textContent = "AGAK LEMBAP/KERING"; cardKelembapan.className = "sensor-box status-warning";
    } else {
        lblKelembapan.textContent = "WARNING / PENGAP EXTREME"; cardKelembapan.className = "sensor-box status-danger";
    }

    const cardCahaya = document.getElementById("card-cahaya");
    const lblCahaya = document.getElementById("status-cahaya");
    if (sensor.cahaya >= 200 && sensor.cahaya <= 500) {
        lblCahaya.textContent = "CUKUP Sesuai SNI"; cardCahaya.className = "sensor-box status-normal";
    } else if (sensor.cahaya < 200) {
        lblCahaya.textContent = "REDUP / KURANG CAHAYA"; cardCahaya.className = "sensor-box status-warning";
    } else {
        lblCahaya.textContent = "TERLALU SILAU"; cardCahaya.className = "sensor-box status-danger";
    }

    const cardSuara = document.getElementById("card-suara");
    const lblSuara = document.getElementById("status-suara");
    if (sensor.suara < 65) {
        lblSuara.textContent = "KONDUSIF / TENANG"; cardSuara.className = "sensor-box status-normal";
    } else if (sensor.suara >= 65 && sensor.suara <= 75) {
        lblSuara.textContent = "BISING NORMAL / RAMAI"; cardSuara.className = "sensor-box status-warning";
    } else {
        lblSuara.textContent = "CRITICAL / SANGAT BISING"; cardSuara.className = "sensor-box status-danger";
    }
}

// Logika Transisi Order ShopeeFood (Dapur -> Pengantaran -> Selesai)
function pesanMakananShopeeStyle(menuName, idx) {
    const db = GlobalDatabase[currentActiveNode];
    if (db.menu[idx].stok > 0) {
        db.menu[idx].stok--;
        db.totalOrderCount++; 

        // Buat objek antrean order baru masuk
        const orderId = Math.floor(Math.random() * 800) + 100;
        const orderBaru = {
            id: orderId,
            kantin: currentActiveNode,
            namaMenu: menuName,
            step: "dapur" // Tahapan awal
        };
        
        antreanDeliveryShopee.unshift(orderBaru); // Masukkan di paling atas list tracker
        if (antreanDeliveryShopee.length > 3) antreanDeliveryShopee.pop(); // Batasi max 3 biar tidak membludak di panel

        alert(`[PESANAN MASUK] #${orderId} - ${menuName}\nSedang diproses oleh pihak dapur.`);
        refreshLayout();
    }
}

function engineDeliveryStatusTracker() {
    // Jalankan siklus otomatis perubahan step pengantaran layaknya ShopeeFood
    antreanDeliveryShopee.forEach(order => {
        if (order.step === "dapur") {
            order.step = "pengantaran"; // Dari dapur pindah ke kurir motor
        } else if (order.step === "pengantaran") {
            order.step = "selesai"; // Kurir sampai tujuan, order selesai
        }
    });
    renderShopeeTrackerWidget();
}

function renderShopeeTrackerWidget() {
    const container = document.getElementById("live-delivery-tracker");
    if (!container) return;

    if (antreanDeliveryShopee.length === 0) {
        container.innerHTML = `<p class="empty-tracker">Belum ada order pengantaran aktif.</p>`;
        return;
    }

    container.innerHTML = "";
    antreanDeliveryShopee.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("dlv-card");

        let badgeText = "", badgeClass = "";
        if (order.step === "dapur") { badgeText = "🍳 ON-PROCESS DAPUR"; badgeClass = "step-dapur"; }
        else if (order.step === "pengantaran") { badgeText = "🛵 DALAM PENGANTARAN"; badgeClass = "step-kurir"; }
        else { badgeText = "✅ SELESAI"; badgeClass = "step-selesai"; }

        div.innerHTML = `
            <div class="dlv-info">
                <h6>Order #${order.id} - ${order.namaMenu}</h6>
                <p>Asal: ${order.kantin}</p>
            </div>
            <span class="dlv-step-badge ${badgeClass}">${badgeText}</span>
        `;
        container.appendChild(div);
    });
}

function refreshMacroCharts() {
    let sepiCount = 0, ramaiCount = 0, penuhCount = 0;
    
    listNamaKantin.forEach((name, idx) => {
        const db = GlobalDatabase[name];
        let occ = db.kursi.filter(k => k === "occupied").length;
        let rate = (occ / 40) * 100;
        if(rate >= 80) penuhCount++; else if (rate >= 45) ramaiCount++; else sepiCount++;

        // Render Tinggi Grafik Batang
        const pipe = document.getElementById(`bar-pipe-${idx}`);
        const valTxt = document.getElementById(`bar-val-${idx}`);
        if(pipe) {
            pipe.style.height = `${Math.min(db.totalOrderCount, 100)}px`;
            valTxt.textContent = db.totalOrderCount;
        }
    });

    // Render Ulang Formula Grafik Lingkaran (Pie Chart Kepadatan Seluruh Kantin)
    const total = listNamaKantin.length;
    const pSepi = (sepiCount / total) * 100;
    const pRamai = (ramaiCount / total) * 100;
    
    const pie = document.getElementById("pie-chart");
    if(pie) {
        pie.style.background = `conic-gradient(
            #10b981 0% ${pSepi}%, 
            #f59e0b ${pSepi}% ${pSepi + pRamai}%, 
            #ef4444 ${pSepi + pRamai}% 100%
        )`;
    }
    document.getElementById("pie-sepi").textContent = sepiCount;
    document.getElementById("pie-ramai").textContent = ramaiCount;
    document.getElementById("pie-penuh").textContent = penuhCount;
}

function engineLiveTelemetry() {
    listNamaKantin.forEach(name => {
        let db = GlobalDatabase[name];
        
        // Simulasi fluktuasi angka sensor secara natural (Tanpa Bug Minus)
        db.sensor.suhu += (Math.random() - 0.5) * 0.4;
        db.sensor.kelembapan += Math.floor((Math.random() - 0.5) * 4);
        db.sensor.cahaya += Math.floor((Math.random() - 0.5) * 25);
        db.sensor.suara += Math.floor((Math.random() - 0.5) * 6);

        // Batasi rentang angka agar tetap logis & akurat secara ilmu Fisika
        if(db.sensor.suhu < 22.5) db.sensor.suhu = 22.5; if(db.sensor.suhu > 30.2) db.sensor.suhu = 30.2;
        if(db.sensor.kelembapan < 35) db.sensor.kelembapan = 35; if(db.sensor.kelembapan > 75) db.sensor.kelembapan = 75;
        if(db.sensor.cahaya < 140) db.sensor.cahaya = 140; if(db.sensor.cahaya > 550) db.sensor.cahaya = 550;
        if(db.sensor.suara < 42) db.sensor.suara = 42; if(db.sensor.suara > 82) db.sensor.suara = 82;

        // Simulasi Pergerakan Kursi Masuk/Keluar
        let rSeatIdx = Math.floor(Math.random() * 40);
        db.kursi[rSeatIdx] = db.kursi[rSeatIdx] === "ready" ? "occupied" : "ready";

        // Pengurangan stok penjualan normal berkala
        let rMenuIdx = Math.floor(Math.random() * 10);
        if(db.menu[rMenuIdx].stok > 0) {
            db.menu[rMenuIdx].stok -= Math.random() > 0.8 ? 1 : 0;
        } else {
            db.menu[rMenuIdx].stok = Math.floor(Math.random() * 10) + 5; 
        }
    });
    refreshLayout();
}

function updateTickerFeed() {
    const container = document.getElementById("ticker-container");
    if (!container) return;

    const kantinAcak = listNamaKantin[Math.floor(Math.random() * listNamaKantin.length)];
    const menuList = databaseMenuNormal[kantinAcak];
    const menuAcak = menuList[Math.floor(Math.random() * menuList.length)];
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const span = document.createElement("span");
    span.innerHTML = `[${timeStr}] NOTIFIKASI: Seseorang baru saja membeli "${menuAcak}" via Delivery Jastip Kampus di ${kantinAcak} • `;
    
    container.insertBefore(span, container.firstChild);
    if (container.children.length > 3) {
        container.removeChild(container.lastChild);
    }
}