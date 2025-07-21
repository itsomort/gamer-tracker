// PROTECTED ROUTE!!

import { Router, json } from 'express';
import connectToDb from '../db/mongo';

const router = Router();

router.get('/profile', async(req, res) => {
    // verify with passport
    
    // get stats from database and return?
});

export default router;