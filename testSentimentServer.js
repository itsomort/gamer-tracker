const express = require('express');
const Sentiment = require('sentiment');

const app = express();
const sentiment = new Sentiment();

app.use(express.json());

app.post('/sentiment', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }
  const result = sentiment.analyze(text);
  res.json({
    score: result.score,
    comparative: result.comparative
  });
});

app.listen(4000, () => {
  console.log('Test Sentiment server listening on http://localhost:4000');
});
