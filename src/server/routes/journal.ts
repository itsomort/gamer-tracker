import { Router, json } from 'express';
import connectToDb from '../db/mongo';
import { GoogleGenAI } from '@google/genai';
import { configDotenv } from 'dotenv';
// TODO: replace with local AI 
// whatever has the smallest weights
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
configDotenv();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function getAdvice(journal_entry: string, sentimentScore: any, session_time: any) {
  let prompt = `You are an interactive gaming journaling assistant.\
Your job is to give players short, supportive advice based on their current gaming session.\
You will receive the player's journal entry, a sentiment analysis score, \
and the total session time in hours and minutes. Based on this information, \
respond with a brief, single-sentence recommendation: either continue playing, \
take a short break, or end the session. Be thoughtful, motivational, and concise.\
Input:\n
Session time: ${session_time}\n
Sentiment score: ${sentimentScore}\n
Journal entry: ${journal_entry}`
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt
  });

  return response.text;
}

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
  const userId = payload.username;
  if (!payload || !userId) {
    return res.status(401).send({ status: 1, sentiment: 0, advice: "" });
  }
  const { subject, journal_entry, session_time } = req.body;

  // Validate the journal entry
  if (!journal_entry || !subject || !session_time) {
    return res.status(400).send({ status: 1, sentiment: 0, advice: " "});
  }

  try {
    const db = await connectToDb();
    const collection = await db.collection("tests");

    // Analyze sentiment score
    const sentimentScore = sentiment.analyze(journal_entry).score;
    let advice = "no ai mode detected";
    if(process.env.RUN_AI === "1" || process.env.RUN_AI === undefined) {
      advice = await getAdvice(journal_entry, sentimentScore, session_time) || "something went wrong";
    }
    // Insert or update user's journal entry
    const result = await collection.findOne({ _id: userId });
    if (!result) {
      console.log(`User ${userId} not found`);
      await collection.insertOne({
        _id: userId,
        entries: [[subject,journal_entry, session_time, sentimentScore]]
      });
    } else {
      console.log(`User ${userId} found`);
      await collection.updateOne(
        { _id: userId },
        { $push: { entries: [subject, journal_entry, session_time, sentimentScore] } }
      );
    }

    return res.status(200).send({ status: 0, sentiment: sentimentScore, advice: advice });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: 1, sentiment: 0, advice: " "});
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
  const userId = payload.username;
  if (!payload || !userId) {
    return res.status(401).send({ status: 1, entries: [] });
  }

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
