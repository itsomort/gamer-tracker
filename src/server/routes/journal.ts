import { Router, json } from 'express';
import { configDotenv } from 'dotenv';
import connectToDb from '../db/mongo';
const mongodb = require('mongodb');
configDotenv();

const router = Router();
/**
POST /api/journal 
req: {"userid": "hashed_code", "journal_entry": "journal entry here"}
res: {"status": 0 or 1, "sentiment": number_here}
"status": 0 = success, "status": 1 = error
HTTP 200 = success
HTTP 500 = error
 */

router.use(json());

router.post('/', async(req, res) => {
    // write journal entry to document with _id of hashed_code

    // check that both fields are there
    const body = req.body;
    if(!body.userid || !body.journal_entry) {
        res.send({"status": 1, "sentiment": 0}).status(500);
    }

    // separate fields out
    const userid = body.userid;
    const journal_entry = body.journal_entry;

    // find document associated with userid
    let db = await connectToDb();
    let collection = await db.collection("tests");
    let query = {_id: userid};
    let result = await collection.findOne(query);

    // TODO: sentiment analysis here
    let sentiment = 0;

    if(result === null) {
        console.log(`User ${userid} not found`);
        // insert new document with userid and journal entry
        try {
            await collection.insertOne({
                "_id": userid,
                "entries": [[journal_entry, sentiment]]
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
                {$push: {entries: [journal_entry, sentiment]}}
            );
        }
        catch {
            res.send({"status": 1, "sentiment": 0}).status(500);
        }
    }

    res.send({"status": 0, "sentiment": sentiment}).status(200);
});
/*
GET /api/journal
req: {"userid": "hashed_code"}
res: {"status": 0 or 1, "entries": [["entry1", sentiment1], ["entry2", sentiment2], ...]}
"status": 0 = user found, "status": 1 = user not found
HTTP 200 = success
HTTP 500 = error
*/

router.get('/', async(req, res) => {
    const body = req.body;
    if(!body.userid) {
        res.send({"status": 1, "entries": []}).status(500);
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
