import { Router, json } from 'express';
import { configDotenv } from 'dotenv';
import connectToDb from '../db/mongo';
configDotenv();

const router = Router();
router.use(json());

/**
 * POST /user/register
 * req: {"username": username, "email": email, "password": password}
 * res: {"token": jwt_token}
 */

router.post('/register', async(req, res) => {
    // take username, email, password
    
    // verify they exist in the query

    // make sure email and username are unique

    // create hashed password and jwt token

    // create new document with new objectid

    // write email, username, hashed password, and salt to db

    // return jwt token to session
});

/**
 * POST user/login
 * req: {"username": username, "password": password}
 * res: {"token": jwt_token}
 */

router.post('/login', async(req, res) => {
    // authenticate with passport

    // if passport error just die or something

    // if user is found
        // generate jwt and return
    // else
        // throw a hissy fit everywhere
});

export default router;
