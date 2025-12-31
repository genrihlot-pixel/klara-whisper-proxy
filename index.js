const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Нет аудиофайла' });
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: require('fs').createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'ru',
    });

    // Удаляем временный файл
    require('fs').unlinkSync(req.file.path);

    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Ошибка Whisper:', error);
    res.status(500).json({ error: 'Ошибка распознавания', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Прокси запущен на порту ${PORT}`);
  console.log(`Отправляй POST-запрос на /transcribe с файлом в поле "audio"`);
});