# Muhammad Rizky Fadillah — Personal Portfolio

Website portofolio pribadi untuk memperkenalkan profil, pendidikan, minat, dan kompetensi di bidang **Teknik Komputer dan Jaringan (TKJ)**, networking, infrastruktur IT, Linux, cloud computing, dan cyber security.

- **Live website:** https://rizkyfrz.github.io/
- **Dibuat dengan:** HTML, CSS, dan JavaScript vanilla
- **Gaya desain:** Dark Technical Editorial dengan aksen cyan

## Tentang Proyek

Portofolio ini menggabungkan layout editorial yang minimalis dengan ilustrasi jaringan komputer dan motion design. Diagram jaringan menggambarkan hubungan workstation, laptop, switch, server, router, dan internet gateway. Diagram ini merupakan ilustrasi interaktif, **bukan monitoring jaringan secara langsung**.

Website menggunakan file statis dan tidak memerlukan proses build.

## Fitur

- **Preloader singkat bertema TKJ** dengan ilustrasi komputer, perangkat jaringan, dan identitas Rizky Fadillah. Intro dirancang tampil sekali per sesi dan dapat dilewati melalui interaksi pengguna.
- **Hero reveal animation** untuk tipografi, foto profil, dan elemen visual.
- **Diagram topologi jaringan interaktif** dengan workstation, laptop, network switch, server, router, Wi-Fi, dan internet gateway.
- **Animasi aliran data** menggunakan SVG, indikator perangkat, serta highlight jalur ketika perangkat dipilih.
- **Diagram responsif terpisah** untuk desktop dan layar yang lebih kecil.
- **Scroll reveal** untuk konten halaman dan indikator progres scroll.
- **Navigasi responsif** dengan menu mobile serta penanda section aktif.
- **Galeri enam sertifikat** dengan komposisi asimetris, interaksi hover, lightbox, dan tautan ke PDF asli.
- **Formulir kontak Web3Forms** dengan status pengiriman berhasil atau gagal berdasarkan respons layanan.
- **Aksesibilitas dasar**, termasuk focus indicator, dukungan keyboard, dan penanganan `prefers-reduced-motion`.

## Teknologi

- HTML5
- CSS3, CSS Grid, dan Flexbox
- JavaScript vanilla
- SVG untuk diagram dan animasi networking
- Google Fonts: Geist dan Instrument Serif
- Web3Forms untuk formulir kontak

Tidak ada framework front-end atau proses build yang diperlukan.

## Struktur Folder

Simpan file dan aset dengan struktur berikut. Perhatikan bahwa nama folder dan file harus cocok dengan path yang dipanggil HTML.

```text
.
├── index.html
├── style.css
├── script.js
├── README.md
├── Image/
│   ├── foto 2.jpg
│   ├── MTCNA_page-0001.jpg
│   ├── Junior Cybersecurity_page-0001.jpg
│   ├── Linux Fundamental_page-0001.jpg
│   ├── NetworkTechnicianCareer_page-0001.jpg
│   ├── Sertifikat E-Learning K3 Muhammad Rizky Fadillah_page-0001.jpg
│   └── Virtual Machine_page-0001.jpg
└── PDF/
    ├── MTCNA.pdf
    ├── Junior Cybersecurity.pdf
    ├── Linux Fundamental.pdf
    ├── NetworkTechnicianCareer.pdf
    ├── Sertifikat E-Learning K3 Muhammad Rizky Fadillah.pdf
    └── Virtual Machine.pdf
```

> Hosting statis berbasis Linux membedakan huruf besar dan kecil. Jangan mengubah nama folder `Image` dan `PDF` tanpa menyesuaikan referensinya di HTML.

## Menjalankan Secara Lokal

1. Clone atau unduh repositori.
2. Pastikan `index.html`, `style.css`, `script.js`, serta folder `Image/` dan `PDF/` berada pada lokasi yang benar.
3. Buka proyek menggunakan server lokal, misalnya ekstensi **Live Server** di Visual Studio Code.
4. Uji preloader, animasi diagram jaringan, menu mobile, sertifikat, dan formulir kontak.

Server lokal lebih sesuai daripada membuka file langsung melalui `file://`, terutama untuk menguji fitur browser dan pengiriman formulir.

## Deployment ke GitHub Pages

Jika menggunakan GitHub Pages, letakkan file website di root branch atau folder yang dikonfigurasi, lalu periksa pengaturan di **Repository → Settings → Pages**.


## Formulir Kontak

Formulir menggunakan [Web3Forms](https://web3forms.com/). Pastikan access key pada form di `index.html` terdaftar dan dikonfigurasi dengan benar pada akun Web3Forms yang digunakan.

JavaScript mengirimkan data formulir dan menampilkan status berdasarkan respons layanan. Uji pengiriman setelah deployment; tampilan form saja tidak menjamin pesan berhasil terkirim.

## Preloader dan Animasi

Preloader merupakan intro visual bertema TKJ, bukan proses pemeriksaan atau inisialisasi jaringan sungguhan. Dalam mode normal, intro berlangsung singkat; interaksi pengguna dapat melewati intro lebih awal. Status intro disimpan menggunakan `sessionStorage` agar tidak terus muncul saat pengguna menjelajahi halaman dalam sesi yang sama.

Animasi diagram jaringan menggunakan SVG. Untuk menghemat sumber daya, animasi diagram dijeda ketika diagram tidak terlihat, tab browser tidak aktif, atau sistem meminta pengurangan gerakan. Pada mode `prefers-reduced-motion`, sejumlah gerakan diganti dengan presentasi yang lebih statis.

## Kustomisasi

- **Foto profil:** ganti `Image/foto 2.jpg` dengan foto yang ingin ditampilkan, atau sesuaikan path `src` di `index.html`.
- **Sertifikat:** ganti gambar di `Image/` dan PDF di `PDF/`, kemudian perbarui path jika nama file berubah.
- **Warna dan tipografi:** ubah CSS custom properties di bagian awal `style.css`.
- **Konten profil dan tautan:** edit bagian yang sesuai di `index.html`.
- **Durasi preloader:** sesuaikan nilai `OUT` pada bagian preloader di `script.js` dengan tetap menjaga transisi singkat dan tidak menghalangi akses ke konten.
- **Kontak:** periksa tautan GitHub, LinkedIn, WhatsApp, serta konfigurasi Web3Forms sebelum publikasi.

## Aksesibilitas dan Performa

Website menyediakan indikator fokus keyboard, menu mobile, dan dukungan reduced motion. Periksa tampilan di desktop dan ponsel, termasuk horizontal overflow, path gambar, navigasi, lightbox, serta pengiriman formulir sebelum menjadikan deployment sebagai versi utama.

## Hak Penggunaan

Foto profil, sertifikat, dan konten pribadi merupakan milik pemiliknya masing-masing. Pastikan hak penggunaan dan atribusi diperiksa sebelum menggunakan kembali aset atau konten tersebut.
