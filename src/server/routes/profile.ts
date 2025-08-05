// PROTECTED ROUTE!!

import { Router, json } from 'express';
import connectToDb from '../db/mongo';
import { configDotenv } from 'dotenv';
const jwt = require('jsonwebtoken');
configDotenv();

const router = Router();
router.use(json());

/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH
 * GET /api/profile
 * Headers: Content-Type, Authorization
 * req: {}
 * res: {"averages": string containing averages}
 */

router.get('/', async(req: any, res: any) => {
    // verify with passport
    
    // get stats from database and return?
    const payload = req.auth;
    const userId = payload.username;
    
    // query db for recent entries
    const db = await connectToDb();
    const collection = await db.collection("tests");

    const result = await collection.findOne({_id: userId});
    if(!result) {
        console.log(`in /api/profile: user ${userId} not found`);
        return res.status(401).send({average5: 0, average: 0});
    }

    const entries = result.entries;
    const sentiments = entries.map((entry: any) => entry[3]);
    let avg = sentiments.reduce((acc: any, val:any) => acc + val, 0) / entries.length;
    let avg5 = avg;
    let s = `Average sentiment across ${entries.length} journal entr${entries.length == 1 ? 'y' : 'ies'}: ${avg}`;
    if(entries.length > 5) {
        const last5 = sentiments.slice(-5);
        avg5 = last5.reduce((acc: any, val: any) => acc + val, 0) / 5;
        s += `\nAverage sentiment across last 5 journal entries: ${avg5}`
    }
    return res.status(200).send({averages: s})

});

export default router;