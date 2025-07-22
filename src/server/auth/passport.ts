import passport from "passport";
import passportLocal from "passport-local";
import connectToDb from '../db/mongo';
import { checkPassword } from "./user";
const LocalStrategy = passportLocal.Strategy;

passport.use(new LocalStrategy(
async(username, password, done) => {
    // check if user exists
    // console.log("in local passport strategy");
    let db = await connectToDb();
    let collection = await db.collection("user-tests");
    let query = {username: username};
    let result = await collection.findOne(query);
    // console.log(result);
    // console.log("connected to db and queried");
    // console.log({username: username, password: password});
    // user not found
    if(result === null) {
        // console.log("user not found");
        return done(null, false, {
            message: "User not found"
        });
    }

    // console.log("user found");

    // check password
    let check = await checkPassword(username, password);
    console.log(check);
    if(!check) {
        // console.log("incorrect password");
        return done(null, false, {
            message: "Incorrect password"
        });
    }

    // password is correct
    // console.log("correct password");
    return done(null, result);
}));

export default passport;