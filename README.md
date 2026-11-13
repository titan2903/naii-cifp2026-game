# CIFP 2026 - Booth Interactive Game & Simulator (Nusantara AI Institute)

Aplikasi web interaktif untuk Booth **Nusantara AI Institute (NAII)** di acara **Conference on Indonesian Foreign Policy (CIFP) 2026**.

## 🚀 Fitur Utama
1. **Bebas-Aktif AI Crisis Simulator**: Roleplay 60 detik sebagai Diplomat RI menghadapi krisis AI/geopolitik dan menghasilkan *Digital Diplomatic Persona Card*.
2. **Speed Trivia Geopolitics x AI**: 15 bank soal trivia adu cepat dengan sistem poin dan bonus waktu.
3. **Real Diplomacy vs AI Hallucination**: Game tebak cepat membedakan fakta diplomasi vs fabrikasi/halusinasi AI.
4. **Live Leaderboard**: Tampilan monitor TV besar dengan pergerakan peringkat *real-time*.
5. **Konversi ke [www.naii.co](https://www.naii.co)**: Rekomendasi kursus gratis dan formulir registrasi.

---

## 🛠️ Stack Teknologi
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Icons & Visual**: Lucide React + Canvas Confetti
- **Backend / Database (Opsional)**: Supabase (PostgreSQL + Realtime Broadcast)
- **Deployment**: Vercel atau Netlify

---

## 📦 Menjalankan Proyek Lokal

```bash
# 1. Masuk ke folder proyek
cd cifp-booth-game

# 2. Jalankan server development
npm run dev

# 3. Buka di browser
# http://localhost:5173
```

---

## ☁️ Panduan Deployment (Vercel / Netlify)

### A. Deploy ke Vercel (Rekomendasi)
1. Push folder ini ke repository GitHub.
2. Buka [Vercel](https://vercel.com) -> **Add New Project** -> Pilih repo ini.
3. Set **Root Directory** ke `cifp-booth-game`.
4. (Opsional) Tambahkan Environment Variables dari file `.env.example`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**.

### B. Deploy ke Netlify
1. Buka [Netlify](https://app.netlify.com) -> **Add new site** -> **Import an existing project**.
2. Pilih repo GitHub -> Set **Base directory** ke `cifp-booth-game`.
3. Set **Build command**: `npm run build` dan **Publish directory**: `dist`.
4. Klik **Deploy site**.
