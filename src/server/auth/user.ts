const jwt = require('jsonwebtoken');
import { configDotenv } from 'dotenv';
import connectToDb from '../db/mongo';
import { pbkdf2Sync, randomBytes } from 'crypto';
configDotenv();

export function generateHash(password: string) {
    let salt = randomBytes(16).toString('hex');
    let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString();

    return [salt, hash];
}

export async function checkPassword(username: string, password: string) {
    // find user in database
    let db = await connectToDb();
    let collection = await db.collection("user-tests");
    let query = {username: username};
    let result = await collection.findOne(query);
    if(result === null) {
        return false;
    }
    else {
        // if user found, get salt and compare hashed passwords
        let salt = result.salt;
        let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString();
        // validate password
        return hash === result.hash;
    }
}

export function generateJWT(email: string, username: string, userType: number = 0) {
    var expire = new Date();
    // token expires after a week
    expire.setDate(expire.getDate() + 7);

    return jwt.sign({
        email: email,
        username: username,
        userType: userType,
        exp: expire.getTime() / 1000
    }, process.env.JWT_SECRET,
    {algorithm: "HS256"});
}
