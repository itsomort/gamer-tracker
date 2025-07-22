import { Router, json } from 'express';
import connectToDb from '../db/mongo';

// TODO: replace with local AI 
// whatever has the smallest weights
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const router = Router();
/**
 * TODO : UPDATE WITH AUTH
POST /api/journal 
req: {"userid": "hashed_code", "journal_entry": "journal entry here"}
res: {"status": 0 or 1, "sentiment": number_here}
"status": 0 = success, "status": 1 = error
HTTP 200 = success
HTTP 500 = error
 */

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

router.post('/', async(req, res) => {
    console.log("got post to /api/journal")
    // write journal entry to document with _id of hashed_code

    // check that both fields are there
    const body = req.body;
    if(!body.userid || !body.journal_entry) {
        res.send({"status": 1, "sentiment": 0}).status(400);
        return;
    }

    // separate fields out
    const userid = body.userid;
    const journal_entry = body.journal_entry;

    // find document associated with userid
    let db = await connectToDb();
    let collection = await db.collection("tests");
    let query = {_id: userid};
    let result = await collection.findOne(query);

    // sentiment analysis here
    let sentimentScore = sentiment.analyze(body.journal_entry).score;

    if(result === null) {
        console.log(`User ${userid} not found`);
        // insert new document with userid and journal entry
        try {
            await collection.insertOne({
                "_id": userid,
                "entries": [[journal_entry, sentimentScore]]
            });
        }
        catch {
            res.send({"status": 1, "sentiment": 0}).status(500);
        }
    }
    else {
        console.log(`User ${userid} found`);
        // update document with new journal entry
        try {
            await collection.updateOne(
                {_id: userid},
                {$push: {entries: [journal_entry, sentimentScore]}}
            );
        }
        catch {
            res.send({"status": 1, "sentiment": 0}).status(500);
        }
    }

    res.send({"status": 0, "sentiment": sentimentScore}).status(200);
});
/*
TODO: REMOVE THESE VERSIONS
GET /api/journal
req: {"userid": "hashed_code"}
res: {"status": 0 or 1, "entries": [["entry1", sentiment1], ["entry2", sentiment2], ...]}
"status": 0 = user found, "status": 1 = user not found
HTTP 200 = success
HTTP 500 = error
*/

// UPDATED WITH AUTH
/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH
 * GET api/journal
 * Headers: Authorization, Content-Type
 * req: {} 
 * res: {"status": 0 or 1, "entries": [["entry1", sentiment1], ["entry2", sentiment2], ...]}
 */

router.get('/', async(req, res) => {
    const body = req.body;
    if(!body.userid) {
        res.send({"status": 1, "entries": []}).status(400);
    }

    let userid = body.userid;

    // get entries from database
    let db = await connectToDb();
    let collection = await db.collection("tests");
    let query = {_id: userid};
    let result = await collection.findOne(query);

    if(result === null || result.entries === null) {
        res.send({"status": 1, "entries": []}).status(500);
    }
    else {
        res.send({"status": 0, "entries": result.entries});
    }
});



export default router;
