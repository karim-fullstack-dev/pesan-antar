/* =====================================================
   PENGATURAN: EDIT BAGIAN INI SAJA
   ===================================================== */

const PENGATURAN = {
    namaUsaha: "ZEALO Food",

    // Format: 62 + nomor tanpa 0 di depan. Contoh: 6281234567890
    nomorWhatsApp: "6283146357084",

    alamat: "Isi alamat tempat ambil pesanan di sini",
    jamBuka: "Setiap hari, 09.00 - 21.00",

    // ---------- PETA ----------
    // Cara dapat koordinat: buka Google Maps, tekan lama di lokasi usahamu,
    // lalu salin dua angka yang muncul (lintang, bujur).
    // Angka di bawah baru contoh (sekitar Prabumulih), ganti dengan lokasi usahamu.
    lokasi: {
        lintang: -3.4326,
        bujur: 104.2358
    },

    // ---------- BIAYA LAYANAN ----------
    // Biaya layanan = persen dari subtotal, tapi tidak kurang dari minimum
    // dan tidak lebih dari maksimum. Isi persen 0 untuk mematikan biaya layanan.
    biayaLayanan: {
        persen: 5,
        minimum: 1000,
        maksimum: 5000
    },

    // ---------- PAKET PREMIUM ----------
    // Member premium: bebas biaya layanan + diskon persen dari subtotal.
    // kodeMember: daftar kode yang kamu berikan ke pelanggan setelah mereka bayar.
    // Catatan: kode ini bisa dilihat siapa pun yang membuka kode situsnya.
    // Cukup untuk usaha kecil, tapi untuk keamanan penuh nanti perlu server.
    premium: {
        nama: "ZEALO Plus",
        harga: 29000,
        masaBerlaku: "per bulan",
        diskonPersen: 5,
        kodeMember: ["PLUS001", "PLUS002"]
    }
};

/* DAFTAR MENU
   - id       : angka, harus beda untuk tiap menu (1, 2, 3, ...)
   - nama     : nama menu
   - harga    : angka saja, tanpa titik dan tanpa "Rp"
   - kategori : isi salah satu: "makanan", "minuman", atau "camilan"
   - foto     : alamat foto. Bisa link, atau file di folder img, misal "img/nasi-goreng.jpg"
   Untuk menambah menu, salin satu baris { ... }, lalu ganti isinya. */
const MENU = [
    {
        id: 1,
        nama: "Nasi Goreng Spesial",
        harga: 16000,
        kategori: "makanan",
        foto: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600"
    },
    {
        id: 2,
        nama: "Nasi padang",
        harga: 12000,
        kategori: "makanan",
        foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoCiAR34z47QhoIHwgkHrUl_slQrj__a8FY6Wk8ep2eRRi_t03sQp9Nrw&s=10"
    },
    {
        id: 3,
        nama: "Es Kopi Susu",
        harga: 12000,
        kategori: "minuman",
        foto: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600"
    },
    {
        id: 4,
        nama: "Kentang Goreng",
        harga: 10000,
        kategori: "camilan",
        foto: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600"
    },
    {
        id: 5,
        nama: "Ayam geprek",
        harga: 18000,
        kategori: "makanan",
        foto: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWwRgxyBOlWBupcGoNyzLAcW0uVmzMvg3uYerBuDsRw&s"
    },
];

/* =====================================================
   KODE PROGRAM (tidak perlu diubah)
   ===================================================== */

const KUNCI_SIMPAN = "umkm-food-keranjang";
const KUNCI_KODE = "umkm-food-kode-member";

let keranjang = [];
let kategoriAktif = "all";

const search = document.getElementById("search");
const kolomKode = document.getElementById("kode");

// Cegah karakter aneh merusak tampilan
function aman(teks) {
    return String(teks)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function rupiah(angka) {
    return "Rp" + angka.toLocaleString("id-ID");
}

// ---------- SIMPAN KERANJANG ----------
function muatKeranjang() {
    try {
        const data = JSON.parse(localStorage.getItem(KUNCI_SIMPAN) || "[]");
        keranjang = data.filter(d =>
            d.jumlah > 0 && MENU.some(m => m.id === d.id)
        );
    } catch (e) {
        keranjang = [];
    }

    try {
        kolomKode.value = localStorage.getItem(KUNCI_KODE) || "";
    } catch (e) {
        // abaikan
    }
}

function simpanKeranjang() {
    try {
        localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(keranjang));
    } catch (e) {
        // abaikan kalau browser menolak menyimpan
    }
}

// ---------- TAMPILKAN MENU ----------
function tampilkanMenu() {
    const wadah = document.getElementById("products");
    const kata = search.value.trim().toLowerCase();

    const hasil = MENU.filter(item => {
        const cocokNama = item.nama.toLowerCase().includes(kata);
        const cocokKategori =
            kategoriAktif === "all" || item.kategori === kategoriAktif;
        return cocokNama && cocokKategori;
    });

    if (hasil.length === 0) {
        wadah.innerHTML = '<p class="produk-kosong">Menu tidak ditemukan.</p>';
        return;
    }

    wadah.innerHTML = hasil.map(item => `
        <div class="product">
            <img src="${aman(item.foto)}" alt="${aman(item.nama)}"
                loading="lazy" onerror="this.style.visibility='hidden'">

            <div class="product-info">
                <span class="product-kategori">${aman(item.kategori)}</span>
                <h3>${aman(item.nama)}</h3>
                <h4>${rupiah(item.harga)}</h4>
                <button onclick="tambahKeranjang(${item.id})">+ Tambah</button>
            </div>
        </div>
    `).join("");
}

// ---------- HITUNG BIAYA ----------
function kodeValid() {
    const kode = kolomKode.value.trim().toUpperCase();
    if (kode === "") return false;

    return PENGATURAN.premium.kodeMember.some(function (k) {
        return k.toUpperCase() === kode;
    });
}

function hitungTotal() {
    let subtotal = 0;

    keranjang.forEach(k => {
        const menu = MENU.find(m => m.id === k.id);
        if (menu) subtotal += menu.harga * k.jumlah;
    });

    const member = kodeValid();
    const bl = PENGATURAN.biayaLayanan;

    let biayaLayanan = 0;
    if (subtotal > 0 && bl.persen > 0 && !member) {
        biayaLayanan = Math.round(subtotal * bl.persen / 100);
        biayaLayanan = Math.max(bl.minimum, Math.min(bl.maksimum, biayaLayanan));
    }

    let diskon = 0;
    if (subtotal > 0 && member) {
        diskon = Math.round(subtotal * PENGATURAN.premium.diskonPersen / 100);
    }

    return {
        subtotal: subtotal,
        biayaLayanan: biayaLayanan,
        diskon: diskon,
        member: member,
        total: subtotal + biayaLayanan - diskon
    };
}

// ---------- KERANJANG ----------
function tambahKeranjang(id) {
    const ada = keranjang.find(item => item.id === id);

    if (ada) {
        ada.jumlah++;
    } else {
        keranjang.push({ id: id, jumlah: 1 });
    }

    simpanKeranjang();
    tampilkanKeranjang();
}

function ubahJumlah(id, perubahan) {
    const item = keranjang.find(k => k.id === id);
    if (!item) return;

    item.jumlah += perubahan;

    if (item.jumlah <= 0) {
        keranjang = keranjang.filter(k => k.id !== id);
    }

    simpanKeranjang();
    tampilkanKeranjang();
}

function tampilkanKeranjang() {
    const cartItems = document.getElementById("cart-items");
    let jumlahProduk = 0;

    if (keranjang.length === 0) {
        cartItems.innerHTML = "<p>Keranjang masih kosong.</p>";
    } else {
        cartItems.innerHTML = keranjang.map(k => {
            const menu = MENU.find(m => m.id === k.id);
            const subtotal = menu.harga * k.jumlah;

            jumlahProduk += k.jumlah;

            return `
                <div class="cart-row">
                    <div>
                        <strong>${aman(menu.nama)}</strong>
                        <p>${rupiah(menu.harga)} per porsi</p>
                    </div>

                    <div class="cart-right">
                        <div class="qty">
                            <button onclick="ubahJumlah(${k.id}, -1)">−</button>
                            <strong>${k.jumlah}</strong>
                            <button onclick="ubahJumlah(${k.id}, 1)">+</button>
                        </div>
                        <strong>${rupiah(subtotal)}</strong>
                    </div>
                </div>
            `;
        }).join("");
    }

    const hitung = hitungTotal();
    const bl = PENGATURAN.biayaLayanan;

    document.getElementById("subtotal").innerText = rupiah(hitung.subtotal);

    // Baris biaya layanan: tampilkan "Gratis" untuk member premium
    const barisLayanan = document.getElementById("baris-layanan");
    barisLayanan.hidden = bl.persen <= 0 || hitung.subtotal === 0;
    document.getElementById("biaya-layanan").innerText =
        hitung.member ? "Gratis" : rupiah(hitung.biayaLayanan);
    document.getElementById("biaya-layanan").classList.toggle("gratis", hitung.member);

    // Baris diskon premium
    const barisDiskon = document.getElementById("baris-diskon");
    barisDiskon.hidden = hitung.diskon === 0;
    document.getElementById("diskon").innerText = "−" + rupiah(hitung.diskon);

    // Status kode member
    const status = document.getElementById("kode-status");
    const kodeIsi = kolomKode.value.trim();
    status.className = "kode-status";
    if (kodeIsi === "") {
        status.innerText = "Punya kode " + PENGATURAN.premium.nama + "? Masukkan di sini.";
    } else if (hitung.member) {
        status.innerText = "Kode valid. Bebas biaya layanan + diskon " +
            PENGATURAN.premium.diskonPersen + "%.";
        status.classList.add("ok");
    } else {
        status.innerText = "Kode tidak dikenali.";
        status.classList.add("salah");
    }

    document.getElementById("total").innerText = rupiah(hitung.total);
    document.getElementById("cart-count").innerText = jumlahProduk;
    document.getElementById("float-count").innerText = jumlahProduk;
    document.getElementById("float-total").innerText = rupiah(hitung.total);

    document.getElementById("floating-cart")
        .classList.toggle("tampil", jumlahProduk > 0);
}

function lihatKeranjang() {
    document.getElementById("keranjang").scrollIntoView({
        behavior: "smooth"
    });
}

// ---------- CHECKOUT KE WHATSAPP ----------
function checkout() {
    if (keranjang.length === 0) {
        alert("Keranjang kamu masih kosong!");
        return;
    }

    const nama = document.getElementById("nama").value.trim();
    const jam = document.getElementById("jam").value.trim();
    const catatan = document.getElementById("catatan").value.trim();

    if (nama === "") {
        alert("Isi nama kamu dulu ya.");
        document.getElementById("nama").focus();
        return;
    }

    if (!/^62\d{8,13}$/.test(PENGATURAN.nomorWhatsApp)) {
        alert("Nomor WhatsApp usaha belum diisi dengan benar di server.js.");
        return;
    }

    const hitung = hitungTotal();

    let pesan = `Halo ${PENGATURAN.namaUsaha}, saya ingin memesan:\n\n`;

    keranjang.forEach((k, i) => {
        const menu = MENU.find(m => m.id === k.id);
        const subtotal = menu.harga * k.jumlah;

        pesan += `${i + 1}. ${menu.nama} x ${k.jumlah} = ${rupiah(subtotal)}\n`;
    });

    pesan += `\nSubtotal: ${rupiah(hitung.subtotal)}`;

    if (hitung.member) {
        pesan += `\nBiaya layanan: Gratis (member ${PENGATURAN.premium.nama})`;
        pesan += `\nDiskon ${PENGATURAN.premium.nama}: -${rupiah(hitung.diskon)}`;
    } else if (hitung.biayaLayanan > 0) {
        pesan += `\nBiaya layanan: ${rupiah(hitung.biayaLayanan)}`;
    }

    pesan += `\nTotal: ${rupiah(hitung.total)}`;
    pesan += `\n\nNama: ${nama}`;

    if (hitung.member) {
        pesan += `\nKode member: ${kolomKode.value.trim().toUpperCase()}`;
    }

    pesan += `\nMetode: Ambil di tempat`;

    if (jam !== "") {
        pesan += `\nJam ambil: ${jam}`;
    }

    if (catatan !== "") {
        pesan += `\nCatatan: ${catatan}`;
    }

    pesan += "\n\nMohon konfirmasi pesanan saya. Terima kasih!";

    const url = "https://wa.me/" + PENGATURAN.nomorWhatsApp +
        "?text=" + encodeURIComponent(pesan);

    window.open(url, "_blank");
}

// ---------- PENCARIAN DAN KATEGORI ----------
search.addEventListener("input", tampilkanMenu);

kolomKode.addEventListener("input", function () {
    try {
        localStorage.setItem(KUNCI_KODE, kolomKode.value);
    } catch (e) {
        // abaikan
    }
    tampilkanKeranjang();
});

document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", function () {
        document.querySelectorAll(".category").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");
        kategoriAktif = this.dataset.category;
        tampilkanMenu();
    });
});

// ---------- PAKET PREMIUM ----------
function isiPremium() {
    const p = PENGATURAN.premium;
    const bl = PENGATURAN.biayaLayanan;

    document.getElementById("premium-nama").innerText = p.nama;
    document.getElementById("premium-harga").innerText = rupiah(p.harga);
    document.getElementById("premium-masa").innerText = p.masaBerlaku;
    document.getElementById("premium-diskon").innerText =
        "Diskon " + p.diskonPersen + "% untuk setiap pesanan";
    document.getElementById("reguler-layanan").innerText =
        bl.persen > 0
            ? "Biaya layanan " + bl.persen + "% (min " + rupiah(bl.minimum) +
              ", maks " + rupiah(bl.maksimum) + ")"
            : "Tanpa biaya layanan";

    const tombol = document.getElementById("beli-premium");
    const pesan = "Halo " + PENGATURAN.namaUsaha + ", saya ingin berlangganan paket " +
        p.nama + " (" + rupiah(p.harga) + " " + p.masaBerlaku + ").";

    tombol.href = "https://wa.me/" + PENGATURAN.nomorWhatsApp +
        "?text=" + encodeURIComponent(pesan);

    tombol.addEventListener("click", function (e) {
        if (!/^62\d{8,13}$/.test(PENGATURAN.nomorWhatsApp)) {
            e.preventDefault();
            alert("Nomor WhatsApp usaha belum diisi dengan benar di server.js.");
        }
    });
}

// ---------- PETA ----------
function isiPeta() {
    const lat = PENGATURAN.lokasi.lintang;
    const lng = PENGATURAN.lokasi.bujur;

    const kiri = lng - 0.006;
    const bawah = lat - 0.004;
    const kanan = lng + 0.006;
    const atas = lat + 0.004;

    document.getElementById("peta").src =
        "https://www.openstreetmap.org/export/embed.html?bbox=" +
        [kiri, bawah, kanan, atas].join("%2C") +
        "&layer=mapnik&marker=" + lat + "%2C" + lng;

    document.getElementById("rute").href =
        "https://www.google.com/maps/dir/?api=1&destination=" + lat + "," + lng;
}

// ---------- ISI NAMA USAHA DAN INFO ----------
function isiInfoUsaha() {
    document.title = PENGATURAN.namaUsaha + " | Pesan Makanan";
    document.getElementById("logo").innerHTML =
        aman(PENGATURAN.namaUsaha) + "<span>.</span>";
    document.getElementById("info-alamat").innerText =
        "📍 " + PENGATURAN.alamat;
    document.getElementById("info-jam").innerText =
        "🕒 " + PENGATURAN.jamBuka;
    document.getElementById("footer-text").innerText =
        "© 2026 " + PENGATURAN.namaUsaha + ". All Rights Reserved.";
}

// ---------- MULAI ----------
isiInfoUsaha();
isiPremium();
isiPeta();
muatKeranjang();
tampilkanMenu();
tampilkanKeranjang();
