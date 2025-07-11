import { Router, json } from 'express';
import { configDotenv } from 'dotenv';
import connectToDb from '../db/mongo';
const mongodb = require('mongodb');
configDotenv();

const router = Router();
/**
POST /api/journal 
req: {"userid": "hashed_code", "journal_entry": "journal entry here"}
res: {"status": "yes, no, whatever", "sentiment": number_here}

GET /api/journal
req: {"userid": "hashed_code"}
res: {"entries": ["entry1", "entry2"], "status": "yes, no, whatever"}
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
        console.log("User not present");
    }
    else {
        console.log("User found");
    }
});

export default router;
