/* =====================================================
   PENGATURAN: EDIT BAGIAN INI SAJA
   ===================================================== */

const PENGATURAN = {
    namaUsaha: "ZEALO Food",

    // Format: 62 + nomor tanpa 0 di depan. Contoh: 6281234567890
    nomorWhatsApp: "6283146357084",

    alamat: "Isi alamat tempat ambil pesanan di sini",
    jamBuka: "Setiap hari, 09.00 - 21.00"
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
        harga: 18000,
        kategori: "makanan",
        foto: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600"
    },
    {
        id: 2,
        nama: "Nasi padang",
        harga: 25000,
        kategori: "makanan",
        foto: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
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
        harga: 13000,
        kategori: "camilan",
        foto: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600"
    }
];

/* =====================================================
   KODE PROGRAM (tidak perlu diubah)
   ===================================================== */

const KUNCI_SIMPAN = "umkm-food-keranjang";

let keranjang = [];
let kategoriAktif = "all";

const search = document.getElementById("search");

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
    let totalHarga = 0;

    if (keranjang.length === 0) {
        cartItems.innerHTML = "<p>Keranjang masih kosong.</p>";
    } else {
        cartItems.innerHTML = keranjang.map(k => {
            const menu = MENU.find(m => m.id === k.id);
            const subtotal = menu.harga * k.jumlah;

            jumlahProduk += k.jumlah;
            totalHarga += subtotal;

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

    document.getElementById("total").innerText = rupiah(totalHarga);
    document.getElementById("cart-count").innerText = jumlahProduk;
    document.getElementById("float-count").innerText = jumlahProduk;
    document.getElementById("float-total").innerText = rupiah(totalHarga);

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
        alert("Nomor WhatsApp usaha belum diisi dengan benar di app.js.");
        return;
    }

    let pesan = `Halo ${PENGATURAN.namaUsaha}, saya ingin memesan:\n\n`;
    let totalHarga = 0;

    keranjang.forEach((k, i) => {
        const menu = MENU.find(m => m.id === k.id);
        const subtotal = menu.harga * k.jumlah;
        totalHarga += subtotal;

        pesan += `${i + 1}. ${menu.nama} x ${k.jumlah} = ${rupiah(subtotal)}\n`;
    });

    pesan += `\nTotal: ${rupiah(totalHarga)}`;
    pesan += `\n\nNama: ${nama}`;
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
muatKeranjang();
tampilkanMenu();
tampilkanKeranjang();