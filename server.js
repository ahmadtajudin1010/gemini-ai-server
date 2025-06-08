    require('dotenv').config(); // Memuat variabel lingkungan dari file .env
    const express = require('express');
    const cors = require('cors'); // Pastikan ini ada
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    const app = express();
    const port = process.env.PORT || 3000; // Server akan berjalan di port 3000 (default)

    // Middleware:
    // Konfigurasi CORS
    // GANTI 'https://[USERNAME_GITHUB_ANDA].github.io' DENGAN URL LENGKAP & PERSIS GITHUB PAGES ANDA
    const corsOptions = {
        origin: 'https://ahmadtajudin1010.github.io/portofolio/html/beranda.html', // Contoh: 'https://ahmadtajudin.github.io/nama-repo-portofolio/'
        optionsSuccessStatus: 200 // Untuk kompatibilitas browser lama
    };
    app.use(cors(corsOptions)); // Terapkan CORS dengan opsi yang ditentukan
    app.use(express.json()); // Mengizinkan server membaca body request dalam format JSON

    // Inisialisasi Google Generative AI dengan API Key
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("Kesalahan: GEMINI_API_KEY tidak ditemukan di file .env. Pastikan Anda sudah mengaturnya.");
        process.exit(1); // Keluar dari aplikasi jika API Key tidak ada
    }
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Pilih model Gemini yang akan digunakan (gemini-1.5-flash-latest direkomendasikan)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Informasi portofolio Ahmad Tajudin yang akan selalu disertakan dalam prompt
    const portfolioContext = `
    Berikut adalah informasi tentang portofolio Ahmad Tajudin:
    Ahmad Tajudin adalah mahasiswa program studi Teknik Informatika di Politeknik TEDC Bandung, dengan latar belakang pendidikan di SMK jurusan Multimedia.
    Keahliannya meliputi: HTML, CSS, JavaScript, Node.js, MongoDB, Responsive Design, Desain Grafis, Video Editing, Animasi, UI/UX Design, dan Database Management.
    Proyek-proyek pilihan utamanya mencakup:
    - Desain Grafis: Kumpulan karya desain grafis yang mencakup poster, logo, dan branding.
    - Video Editing: Contoh hasil editing video, termasuk motion graphics dan color grading.
    - Animasi: Portofolio animasi 2D dan 3D, menunjukkan kemampuan dalam storytelling visual.
    Informasi kontak dapat ditemukan di bagian 'Hubungi Saya' di portofolio.
    Sebagai AI untuk portofolio ini, jawablah pertanyaan berdasarkan informasi di atas. Jika pertanyaan tidak relevan dengan portofolio, katakan bahwa Anda tidak memiliki informasi tersebut.
    `;

    // Endpoint API untuk menerima pesan dari frontend
    app.post('/chat', async (req, res) => {
        const { message } = req.body; // Ambil pesan dari body request

        if (!message) {
            return res.status(400).json({ error: 'Pesan diperlukan.' });
        }

        try {
            // Gabungkan konteks portofolio dengan pesan pengguna
            const fullPrompt = `${portfolioContext}\n\nPertanyaan Pengguna: ${message}`;

            // Kirim pesan lengkap (termasuk konteks) ke model Gemini
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text(); // Ambil teks respons dari Gemini

            res.json({ reply: text }); // Kirim respons kembali ke frontend
        } catch (error) {
            console.error('Kesalahan saat memanggil Gemini API:', error);
            // Memberikan pesan error yang lebih informatif ke frontend
            res.status(500).json({ error: 'Gagal mendapatkan respons dari AI', details: error.message });
        }
    });

    // Mulai server backend
    app.listen(port, () => {
        console.log(`Server backend berjalan di http://localhost:${port}`);
    });
    