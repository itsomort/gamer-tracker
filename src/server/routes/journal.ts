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

GET /api/journal
req: {"userid": "hashed_code"}
res: {"status": 0 or 1, "entries": ["entry1", "entry2"]}
"status": 0 = success, "status": 1 = error
HTTP 200 = success
HTTP 500 = error
 * 
 */

router.use(json());
// curl -X POST -d '{"hello": "hi"}' -H "Content-Type:application/json" --url http://localhost:4200/what
router.post('/what', async (req, res) => {
    let db = await connectToDb();
    //console.log(process.env.ATLAS_URI)
    let collection = await db.collection("tests");
    let query = {_id: "la"};
    let result = await collection.findOne(query);
    console.log(result);
    res.send("Whatever\n").status(200);
});

router.post('/', async(req, res) => {
    // write journal entry to document with _id of hashed_code

    // check that both fields are there
    const body = req.body;
    if(!body.userid || !body.journal_entry) {
        res.send({"status": "ERROR", "sentiment": 0});
    }

    // separate fields out
    const userid = body.userid;
    const journal_entry = body.journal_entry;

    // find document associated with userid
    let db = await connectToDb();
    let collection = await db.collection("tests");
    let query = {_id: userid};
    let result = await collection.findOne(query);

    if(result === null) {
        console.log(`User ${userid} not found`);
        // insert new document with userid and journal entry
        await collection.insertOne({
            "_id": userid,
            "entries": [journal_entry]
        });
        res.send({"status": 0, "sentiment": 1});
    }
    else {
        console.log(`User ${userid} found`);
        // update document with new journal entry
        await collection.updateOne(
            {_id: userid},
            {$push: {entries: journal_entry}}
        );
        res.send({"status": 0, "sentiment": 1})
    }
});

export default router;
