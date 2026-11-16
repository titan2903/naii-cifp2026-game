# Rencana Perubahan (Action Plan) — Menindaklanjuti Feedback Lead Event CIFP 2026

Dokumen ini memetakan seluruh poin dari [feedback.md](file:///home/titan/github/cifp/feedback.md) terhadap kondisi aktual kode di repositori `cifp-booth-game`, lengkap dengan analisis opsi terbaik sebelum eksekusi perubahan kode dilakukan.

---

## 1. Ringkasan Audit: Feedback vs Kondisi Kode Saat Ini

| No | Poin Feedback Lead Event | Kondisi Kode Saat Ini | Keputusan & Perubahan yang Direkomendasikan |
| :--- | :--- | :--- | :--- |
| **1** | **Sederhanakan alur:** cukup **1 game singkat** (*Speed Trivia* atau *Real vs AI Hallucination*) + **bikin akun `naii.co`** = dapat merch. **Stamp FPCI** diberikan setelah 1 game. | [PlayerContext.tsx](file:///home/titan/github/cifp/cifp-booth-game/src/context/PlayerContext.tsx) & [PassportModal.tsx](file:///home/titan/github/cifp/cifp-booth-game/src/components/PassportModal.tsx) masih mewajibkan **3 Stempel** (harus main *Crisis Simulator* **dan** *Trivia/Real vs AI* **dan** input kode sandi). | **Ubah menjadi Alur 2 Langkah (2 Stempel):**<br>• **Stempel #01:** Selesaikan **1 Game Singkat** (*Speed Trivia* atau *Real vs AI*, atau *Crisis Simulator*) $\rightarrow$ Otomatis terbuka **Stamp FPCI & Hadiah Tier 1 (Stiker)**.<br>• **Stempel #02:** **Buat Akun `www.naii.co`** (verifikasi panitia) $\rightarrow$ Langsung terbit **Tiket Klaim Merch Tier 2 (Pin Resmi NAII)**. |
| **2** | **Hadiah sesuai budget:** Tier 1 = Stiker, Tier 2 = Pin, Tier 3 = Totebag (Top 3 per sesi break), VIP = Kalender. **Spin wheel di-skip.** | Teks di `PassportModal.tsx`, `HomeScreen.tsx`, `LeaderboardScreen.tsx`, dan `QuizGame.tsx` masih menyebut *"Totebag / Notebook / Lanyard / Pin"* untuk Tier 2 dan *"Grand Merchandise"* untuk Tier 3. Tidak ada fitur Spin Wheel. | **Perbarui seluruh teks hadiah (ID & EN):**<br>• Tier 1: **Stiker Eksklusif NAII × CIFP 2026** (+ Stamp FPCI)<br>• Tier 2: **Pin Resmi NAII**<br>• Tier 3: **Totebag Resmi NAII** (Top 3 per sesi break)<br>• VIP: **Kalender NAII** (dicatat di SOP/Dokumen Konsep, diserahkan manual oleh panitia)<br>• Pastikan tidak ada referensi Spin Wheel di dokumen konsep. |
| **3** | **Pastikan tidak ada biaya API AI.** Gunakan jawaban yang sudah disiapkan. | Hasil audit kode (`src/`): **0 panggilan API eksternal** (tidak ada OpenAI/Gemini/Anthropic SDK maupun `fetch()` ke LLM). Seluruh analisis di `evaluate.ts`, `evaluatePrompt.ts`, dan `HomeScreen.tsx` 100% *rule-based* & *pre-written*. | **Tidak perlu ubah arsitektur.** Cukup perjelas di [DOKUMEN_KONSEP_FITUR_GAME_BOOTH_CIFP2026.md](file:///home/titan/github/cifp/cifp-booth-game/DOKUMEN_KONSEP_FITUR_GAME_BOOTH_CIFP2026.md) bahwa sistem 100% *pre-written/rule-based* (**Rp 0 biaya API**). |
| **4** | **Hapus kode sandi `NAII2026` / `CIFP2026`** (karena di `naii.co` tidak ada kolom input kode). Ganti dengan **tunjukkan screenshot akun `naii.co` sudah dibuat**, lalu panitia tekan tombol **“Verifikasi Akun naii.co”** di HP pengunjung. | `PassportModal.tsx` masih memiliki form input kode sandi (`VALID_CODES`: `NAII2026`, `CIFP2026`, dll.), serta teks *"KODE SANDI BOOTH: NAII2026"* di `QrCodeModal.tsx` & `HomeScreen.tsx`. | **Hapus seluruh input & teks Kode Sandi Booth:**<br>• Ganti form kode sandi di `PassportModal.tsx` menjadi alur **2 langkah**: (1) Tombol buka/QR `www.naii.co` untuk daftar akun, lalu (2) Tombol konfirmasi 2-klik **`Verifikasi Akun naii.co`** oleh panitia booth setelah mengecek screenshot akun di HP pengunjung.<br>• Hapus badge `BOOTH CODE: NAII2026` dari `QrCodeModal.tsx` & `HomeScreen.tsx`. |
| **5** | **Data pengunjung:** pastikan akses database (**Supabase**) & **Vercel** dibagikan ke NAII. | Aplikasi sudah menyimpan data ke tabel `leaderboard`, `diplomat_personas`, dan `leads` (insert-only UU PDP) di Supabase. Akses kolaborator dashboard bersifat administratif di luar kode. | **Buat Checklist Handover Akses NAII:**<br>• Undang email PIC NAII sebagai *Member/Admin* di **Supabase Project** (`Table Editor` untuk export CSV `leads` & `leaderboard`) dan **Vercel Project** (`Deployments` & `Environment Variables`). |
| **6** | **Konten:** pastikan wording skenario **netral**, dan minta 1 orang cek ulang fakta di **soal trivia** & **klaim fakta vs AI**. | Di [scenarios.ts](file:///home/titan/github/cifp/cifp-booth-game/src/data/scenarios.ts), Skenario 1 menyebut *"Amerika Serikat dan Tiongkok"* serta label blok *"Blok Barat"* dan *"Tiongkok & Mitra Timur"*. Di `trivia.ts` & `realVsAi.ts`, ditemukan minor typo hukum *"UU Perlindungan Data Pribadi"* (resmi: **Pelindungan** Data Pribadi). | **Netralisasi wording & siapkan Lembar Fact-Check:**<br>• Ganti *"Amerika Serikat dan Tiongkok"* menjadi istilah netral (*"dua kutub kekuatan teknologi dunia"* / *"Negara A & Negara B"*), dan *"Tiongkok & Mitra Timur"* menjadi *"Poros Mitra Timur"* (`Eastern Partners`).<br>• Perbaiki penulisan resmi **UU Pelindungan Data Pribadi**.<br>• Sediakan daftar ringkas seluruh 15 soal Trivia & 12 pernyataan Real vs AI untuk di-approve 1 *fact-checker* sebelum hari-H. |
| **7** | **Fitur Duel 1v1 (MC) dan Simulasi Wawancara di-skip** dulu supaya fokus. | • **Simulasi Wawancara:** Ada di Tab `04 // CAREER INTERVIEW` di `HomeScreen.tsx`.<br>• **Duel 1v1 (MC):** Ada di `PromptBattleScreen.tsx` (mode `'duel'`, input Penantang Panggung, podium 1v1) dan disebut di kartu Bento `HomeScreen.tsx`. | **Hapus/Nonaktifkan Kedua Fitur:**<br>• Hapus Tab `04 // Wawancara AI` dari `COPILOT_EXAMPLES` & teks penyebutannya di `HomeScreen.tsx`.<br>• Nonaktifkan mode **1 vs 1 Stage Duel** di `PromptBattleScreen.tsx` (dan tentukan apakah menu **Prompt Battle Solo** ikut disembunyikan demi penyederhanaan alur #1 — lihat Keputusan Arsitektur di bawah). |

---

## 2. Rekomendasi Pilihan Terbaik (*Trade-off Decisions*)

Sebelum eksekusi kode, ada **2 keputusan desain UX penting** agar aplikasi terasa super ringan saat *coffee break* tanpa membuang fitur bagus yang sudah terlanjur selesai:

### Keputusan 1: Bagaimana Menyusun Menu Game agar Sesuai Poin 1 & Poin 7?
Saat ini di navigasi atas & bawah ada **4 game + Leaderboard**: *Crisis Simulator, Speed Trivia, Real vs AI, Prompt Battle*.
* **Opsi A — Fokus Ekstrem (Sesuai persis Poin 1 + Poin 7, Paling Direkomendasikan untuk Hari-H):**
  * Halaman Utama & Navigasi menonjolkan **2 Game Singkat Kompetitif** (**Speed Trivia** & **Real vs AI Hallucination**) sebagai jalur utama **30–45 detik** menuju Stamp FPCI & Leaderboard, plus **AI Crisis Simulator** (Kartu Persona IG Story) sebagai opsi bonus bagi pengunjung yang ingin kartu persona.
  * **Prompt Battle** (yang dulunya untuk aktivasi MC 1v1 duel + mengetik prompt panjang di HP) **disembunyikan dari navigasi utama** (atau tetap bisa diakses tersembunyi jika suatu saat perlu) agar pengunjung tidak bingung memilih di antara terlalu banyak menu saat *coffee break*.
* **Opsi B — Pertahankan Prompt Battle Mode Solo Saja:**
  * Menghapus hanya tab *Duel 1v1 (MC)* dari `PromptBattleScreen.tsx`, tetapi tetap mempertahankan *Prompt Battle (Solo Challenge)* di menu navigasi.

> **Rekomendasi:** Pilih **Opsi A** karena selaras 100% dengan Feedback Poin 1 (*"cukup 1 game singkat: Speed Trivia atau Real vs AI"*) dan Poin 7 (*"supaya fokus"*), sekaligus membuat tombol navigasi smartphone berkurang dari 6 menjadi **5 tombol lega** (*Beranda, Trivia, Real/AI, Simulator, Peringkat*).

---

### Keputusan 2: Struktur Baru Paspor Hadiah (2 Stempel, Bukan 3 Stempel)
Dengan menghapus syarat kode sandi `NAII2026` dan menyederhanakan alur menjadi **1 Game + 1 Akun `naii.co`**:
* **Stempel #01 — Selesaikan 1 Game Singkat (*Stamp FPCI & Tier 1: Stiker*):**
  * Otomatis tercap (`✓ TERCAP`) segera setelah pengunjung menyelesaikan **salah satu** game (*Speed Trivia*, *Real vs AI*, atau *Crisis Simulator*).
  * Setelah Stempel #01 tercap, layar menampilkan banner bahwa peserta sudah berhak atas **Stamp FPCI & Stiker Tier 1**.
* **Stempel #02 — Buat Akun Gratis `www.naii.co` (*Tier 2: Pin Resmi NAII*):**
  * Pengunjung mengklik tombol/scan QR menuju `www.naii.co` untuk membuat akun.
  * Setelah selesai mendaftar, pengunjung **menunjukkan screenshot akun `naii.co`** ke panitia meja booth.
  * Panitia menekan tombol konfirmasi 2-klik **`Verifikasi Akun naii.co`** langsung di HP pengunjung $\rightarrow$ Stempel #02 terbuka & **Tiket Klaim Pin Resmi NAII (Tier 2)** langsung aktif (lalu panitia menandai **`Tandai Pin Sudah Diserahkan`**).

> **Catatan:** Struktur ini menghilangkan friksi pengunjung yang sebelumnya harus bermain 2 game berbeda + mengetik kode sandi yang tidak ada di `naii.co`. Total waktu pengunjung dari scan QR hingga klaim Pin terpangkas menjadi **~60 detik**.

---

### Keputusan 3: Penyesuaian Netralitas Konten & Fact-Check (Poin 6)
1. **Netralisasi Wording Skenario ([scenarios.ts](file:///home/titan/github/cifp/cifp-booth-game/src/data/scenarios.ts) & [types.ts](file:///home/titan/github/cifp/cifp-booth-game/src/types.ts)):**
   * Ganti penyebutan spesifik *"Amerika Serikat dan Tiongkok"* pada Skenario 1 menjadi istilah diplomatik netral: *"Dua kutub kekuatan teknologi dunia memberlakukan pembatasan ekspor semikonduktor dan model AI..."* (*"Major global technology powers impose strict export controls..."*).
   * Ganti label reaksi blok dari `'Tiongkok & Mitra Timur'` (`'China & Eastern Partners'`) menjadi `'Poros Mitra Timur'` (`'Eastern Partners'`), berpasangan dengan `'Mitra Barat'` (`'Western Partners'`) dan `'Global South & ASEAN'`.
2. **Perbaikan Akurasi Hukum & Daftar Item untuk Fact-Check:**
   * Perbaiki penulisan *"Perlindungan Data Pribadi"* menjadi istilah resmi undang-undang: **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi** di `trivia.ts` dan `realVsAi.ts`.
   * Poin fakta yang perlu dicek silang oleh 1 PIC konten NAII sebelum acara:
     * `trivia.ts` (`t1`): Redaksi persis tema resmi **10th CIFP 2026** FPCI.
     * `trivia.ts` (`t12`–`t15`): Klaim misi NAII (*"diinisiasi mahasiswa dan diaspora Indonesia di AS"*), 3 jalur kurikulum, serta durasi rata-rata kursus (*"2–4 jam"*).
     * `realVsAi.ts` (`r1`–`r12`): Seluruh 12 pernyataan (6 Fakta Asli + 6 Halusinasi AI) sudah sesuai fakta sejarah diplomasi, namun tetap disiapkan ringkasannya untuk dicek ulang 1 orang.

---

## 3. Rencana Eksekusi File (*Implementation Checklist*)

Jika plan ini disetujui, berikut file yang akan diperbarui:

1. **`src/types.ts` & `src/context/PlayerContext.tsx`**
   * Sederhanakan `PassportState` menjadi **2 Misi (`stamp1`: Game Completed + FPCI Stamp, `stamp2`: Verifikasi Akun `naii.co` oleh Panitia)**.
   * Hapus logika `codeUsed` kode sandi booth; ganti `unlockStamp3` menjadi `verifyNaiiAccountByStaff()`.
2. **`src/components/PassportModal.tsx`**
   * Ubah tampilan menjadi **Paspor 2 Langkah Simpel** dengan indikator hadiah **Tier 1 (Stiker + Stamp FPCI)** dan **Tier 2 (Pin Resmi NAII)**.
   * Hapus kolom input kode sandi `NAII2026`; ganti dengan instruksi *"Tunjukkan screenshot akun `www.naii.co` Anda ke panitia booth"* + tombol konfirmasi 2-klik **`Verifikasi Akun naii.co`**.
   * Perbarui teks Tiket Klaim menjadi **Pin Resmi NAII** (+ info **Totebag** untuk Top 3 Leaderboard & **Kalender** untuk VIP).
3. **`src/components/QrCodeModal.tsx`**
   * Hapus badge `KODE SANDI BOOTH: NAII2026` dan kalimat petunjuk kode sandi pada kartu QR `www.naii.co`.
   * Perbarui daftar deep-link sesuai menu game aktif (*Beranda, Speed Trivia, Real vs AI, Simulator*).
4. **`src/screens/HomeScreen.tsx`**
   * Perbarui Strip Paspor menjadi **2 Langkah (1 Game Singkat $\rightarrow$ Stamp FPCI & Stiker | Buat Akun `naii.co` $\rightarrow$ Pin Resmi NAII)**.
   * Hapus **Tab 04 (Simulasi Wawancara Kerja)** dan referensi *"1 vs 1 Duel"* / *"Wawancara"* di Workbench.
   * Tonjolkan **Speed Trivia** & **Real vs AI** (+ **Crisis Simulator** opsional) pada Bento Grid dan perbarui copy hadiah Leaderboard menjadi **Totebag Resmi NAII**.
5. **`src/components/Shell.tsx`, `src/hooks/useHashRoute.ts`, `src/App.tsx`**
   * Sederhanakan navigasi menjadi **5 menu utama** (menonaktifkan Prompt Battle 1v1 Duel sesuai Keputusan 1 Opsi A) agar fokus di HP pengunjung.
6. **`src/components/QuizGame.tsx` & `src/screens/LeaderboardScreen.tsx`**
   * Sesuaikan pesan Podium Top 3 menjadi **Totebag Resmi NAII** per sesi break dan tautkan tombol buka Paspor (`1/2` $\rightarrow$ `2/2`).
7. **`src/data/scenarios.ts`, `src/data/trivia.ts`, `src/data/realVsAi.ts`**
   * Terapkan wording geopolitik netral (`Mitra Barat`, `Poros Mitra Timur`, `Global South & ASEAN`) dan perbaiki istilah resmi **Pelindungan Data Pribadi**.
8. **`DOKUMEN_KONSEP_FITUR_GAME_BOOTH_CIFP2026.md`**
   * Sinkronkan dokumen konsep untuk Lead Event (termasuk checklist handover akses **Supabase & Vercel**, SOP verifikasi screenshot akun `naii.co`, tabel hadiah Tier 1/2/3/VIP tanpa Spin Wheel, dan konfirmasi **Rp 0 biaya API AI**).

---

## 4. Poin Konfirmasi Sebelum Eksekusi

Mohon konfirmasi singkat Anda untuk 2 detail berikut agar eksekusi langsung tepat sasaran:
1. **Menu Game:** Setuju dengan **Opsi A** (menonaktifkan *Prompt Battle* & *Duel 1v1* dari menu agar fokus pada **Speed Trivia**, **Real vs AI**, dan **Crisis Simulator** sesuai poin 1 & 7), atau ingin mempertahankan *Prompt Battle Mode Solo*?
2. **Nama Skenario Netral:** Setuju label blok di *Crisis Simulator* diubah menjadi **`Mitra Barat`** & **`Poros Mitra Timur`** (tanpa menyebut langsung nama negara tertentu seperti AS/Tiongkok)?
