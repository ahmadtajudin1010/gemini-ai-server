    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    const app = express();
    const port = process.env.PORT || 3000;

    // Pastikan API Key ada
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("Error: GEMINI_API_KEY is not set in environment variables.");
        process.exit(1); // Keluar jika API Key tidak ada
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Konfigurasi CORS
    // PENTING: Ganti dengan URL LENGKAP dari GitHub Pages Anda
    // Contoh: 'https://username.github.io/nama-repo-portofolio'
    const corsOptions = {
        origin: 'https://ahmadtajudin1010.github.io', // <<< PASTIKAN INI HANYA DOMAIN DASAR!
        optionsSuccessStatus: 200
    };

    app.use(cors(corsOptions));
    app.use(express.json());

    app.post('/chat', async (req, res) => {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        try {
            const result = await model.generateContent(userMessage);
            const response = await result.response;
            const text = response.text();
            res.json({ reply: text });
        } catch (error) {
            console.error('Error saat berkomunikasi dengan Gemini API:', error);
            res.status(500).json({ error: 'Gagal mendapatkan respons dari AI. Coba lagi nanti.' });
        }
    });

    app.listen(port, () => {
        console.log(`Server AI backend berjalan di http://localhost:${port}`);
    });
    