import { Router, json } from 'express';
import connectToDb from '../db/mongo';
// ROUTES FOR ADMINISTRATOR ACCESS:
const router = Router();
router.use(json());
/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH + TYPE: 1 IN DB (verify in route)
 * GET api/admin/journal
 * req: {"username": username}
 * res: {"status": 0 or 1, "entries": journal entries}
 * Access journal entries from administrator account
 */
router.get('/journal', async (req: any, res: any) => {
  const payload = req.auth;

  if (!payload || payload.username !== 'admin') {
    console.log(" Unauthorized: Missing or incorrect admin username");
    return res.status(401).json({ status: 1, message: "Unauthorized: non-admin user" });
  }

  if (payload.type !== 1) {
    console.log("Unauthorized: Valid username but wrong type");
    return res.status(403).json({ status: 1, message: "User is not an admin" });
  }

  const username = req.query.username as string;
  console.log("Query username:", username);

  if (!username) {
    console.log("Missing username in query");
    return res.status(400).send({ status: 1, entries: [] });
  }

  try {
    const db = await connectToDb();
    const collection = db.collection("tests");
    console.log("Connected to DB and collection");

    const result = await collection.findOne({ _id: username });
    console.log("Query result from DB:", result);

    if (!result || !result.entries) {
      console.log("No entries found for this user");
      return res.status(404).send({ status: 1, entries: [] });
    }

    console.log("Entries found, sending response");
    return res.status(200).send({ status: 0, entries: result.entries });
  } catch (err) {
    console.error("Admin GET journal error:", err);
    return res.status(500).send({ status: 1, entries: [] });
  }
});


/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH + TYPE: 1 IN DB (verify in route)
 * POST api/admin/delete-user
 * req: {"username": username}
 * res: {"status": 0 or 1}
 * Deletes user account and associated user entries
 */
router.post('/delete-user', async (req: any, res: any) => {
    const payload = req.auth;
    if (!payload || payload.type !== 1 || payload.username !== "admin") {
        return res.status(401).send({ status: 1 });
    }

    const { username } = req.body;
    if (!username) {
        return res.status(400).send({ status: 1 });
    }

    try {
        const db = await connectToDb();
        const userCol = db.collection("user-tests");
        const journalCol = db.collection("tests");

        await userCol.deleteOne({ username });
        await journalCol.deleteOne({ _id: username });

        return res.status(200).send({ status: 0 });
    } catch (err) {
        console.error("Admin DELETE user error:", err);
        return res.status(500).send({ status: 1 });
    }
});
/**
 * POST api/admin/delete-journal
 * req: {"username": username}
 * res: {"status": 0 or 1}
 * Deletes all entries related to specific user account
 */
router.post('/delete-journal', async (req: any, res: any) => {
    const payload = req.auth;
    if (!payload || payload.type !== 1 || payload.username !== "admin") {
        return res.status(401).send({ status: 1 });
    }

    const { username } = req.body;
    if (!username) {
        return res.status(400).send({ status: 1 });
    }

    try {
        const db = await connectToDb();
        const collection = db.collection("tests");

        await collection.updateOne(
        { _id: username },
        { $set: { entries: [] } }
        );

        return res.status(200).send({ status: 0 });
    } catch (err) {
        console.error("Admin DELETE journal error:", err);
        return res.status(500).send({ status: 1 });
    }
});

export default router;