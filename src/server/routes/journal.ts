import { Router, json } from 'express';
import connectToDb from '../db/mongo';
// TODO: replace with local AI 
// whatever has the smallest weights
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const router = Router();
// NEW ROUTE
/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH
 * POST /api/journal
 * Headers: Content-Type, Authorization
 * req: {"subject": subject, "journal_entry": journal entry, "session_time": elapsed session time}
 * res: {"status": 0 or 1, "advice": "ai advice here", "sentiment": -2 - 2}
 * -2 = very negative, 0 = neutral, 2 = very positive
 * ai advice is from local model
 */

router.use(json());

router.post('/', async (req: any, res: any) => {
  console.log("got post to /api/journal");

  const payload = req.auth;
  if (!payload) {
    return res.status(401).send({ status: 1, sentiment: 0 });
  }

  const userId = payload.username || payload.email;
  const { journal_entry } = req.body;

  // Validate the journal entry
  if (!journal_entry) {
    return res.status(400).send({ status: 1, sentiment: 0 });
  }

  try {
    const db = await connectToDb();
    const collection = await db.collection("tests");

    // Analyze sentiment score
    const sentimentScore = sentiment.analyze(journal_entry).score;

    // Insert or update user's journal entry
    const result = await collection.findOne({ _id: userId });
    if (!result) {
      console.log(`User ${userId} not found`);
      await collection.insertOne({
        _id: userId,
        entries: [[journal_entry, sentimentScore]]
      });
    } else {
      console.log(`User ${userId} found`);
      await collection.updateOne(
        { _id: userId },
        { $push: { entries: [journal_entry, sentimentScore] } }
      );
    }

    return res.status(200).send({ status: 0, sentiment: sentimentScore });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: 1, sentiment: 0 });
  }
});

// UPDATED WITH AUTH
/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH
 * GET api/journal
 * Headers: Authorization, Content-Type
 * req: {} 
 * res: {"status": 0 or 1, "entries": [["entry1", sentiment1], ["entry2", sentiment2], ...]}
 */

router.get('/', async (req: any, res: any) => {
  const payload = req.auth;
  if (!payload) {
    return res.status(401).send({ status: 1, entries: [] });
  }

  const userId = payload.username || payload.email;

  try {
    const db = await connectToDb();
    const collection = await db.collection("tests");
    const result = await collection.findOne({ _id: userId });

    if (!result || !result.entries) {
      return res.status(404).send({ status: 1, entries: [] });
    }

    return res.status(200).send({ status: 0, entries: result.entries });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: 1, entries: [] });
  }
});

export default router;
