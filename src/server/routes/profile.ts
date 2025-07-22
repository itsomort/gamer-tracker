// PROTECTED ROUTE!!

import { Router, json } from 'express';
import connectToDb from '../db/mongo';
import { configDotenv } from 'dotenv';
const jwt = require('jsonwebtoken');
configDotenv();

const router = Router();
router.use(json());

router.get('/', async(req, res) => {
    // verify with passport
    
    // get stats from database and return?
    console.log("able to access route");
    console.log(req.body);
    const token = req.headers.authorization?.split(" ")[1];
    if(token) {
        let payload = jwt.decode(token);
        console.log(`accessing profile for user ${payload.username}`);
    }
    else {
        res.send("token missing (wont happen)");
        return;
    }
    res.send("seems to work");
    // RETURN DIFFERENT PROFILE STATS AND THAT SORT OF STUFF
});

export default router;