import { Router, json } from 'express';
import connectToDb from '../db/mongo';
// ROUTES FOR ADMINISTRATOR ACCESS:
const router = Router();
router.use(json());
/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH + TYPE: 1 IN DB (verify in route)
 * GET api/admin/journal
 * req: {"username": admin}
 * res: {"status": 0 or 1, "entries": journal entries}
 * Access journal entries from administrator account
 */
router.get('/journal', async (req: any, res: any) => {
  const payload = req.auth;
  const targetUsername = req.query.username as string;
  
  if (!payload || !payload.username) {
    return res.status(400).json({status: 1, entries: []});
  }

  try {
    const db = await connectToDb();
    const userCol = db.collection("user-tests");
    const journalCol = db.collection("tests");

    const adminUser = await userCol.findOne({ username: payload.username, type: 1 });
    if (!adminUser) {
      return res.status(403).json({status: 1, entries: []});
    }

    // If no username provided, return list of all users
    if (!targetUsername) {
      const users = await userCol.find({}).toArray();
      return res.status(200).json({status: 0, users: users});
    }

    // Retrieve the journal entries for the requested user
    const userData = await journalCol.findOne({ _id: targetUsername });

    if (!userData || !userData.entries) {
      return res.status(404).json({status: 1, entries: []});
    }

    console.log('Admin backend - raw userData:', userData);
    console.log('Admin backend - entries:', userData.entries);

    return res.status(200).json({status: 0, entries: userData.entries});
  } catch (err) {
    console.error("Admin GET journal error:", err);
    return res.status(500).json({
      status: 1,
      message: "Server error",
      entries: []
    });
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
  const { username: targetUsername } = req.body;

  if (!payload || !payload.username || !targetUsername) {
    return res.status(400).json({status: 1});
  }

  try {
    const db = await connectToDb();
    const userCol = db.collection("user-tests");
    const journalCol = db.collection("tests");

    const adminUser = await userCol.findOne({ username: payload.username, type: 1 });
    if (!adminUser) {
      return res.status(403).json({status: 1 });
    }

    // Delete user from user-tests
    const userDeleteResult = await userCol.deleteOne({ username: targetUsername });

    // Delete user's journal entries
    const journalDeleteResult = await journalCol.deleteOne({ _id: targetUsername });

    if (userDeleteResult.deletedCount === 0 && journalDeleteResult.deletedCount === 0) {
      return res.status(404).json({status: 1, message: "User not found"});
    }

    return res.status(200).json({ status: 0, message: "User and journal data deleted"});
  } catch (err) {
    console.error("Admin DELETE user error:", err);
    return res.status(500).json({status: 1});
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
  const { username: targetUsername } = req.body;

  if (!payload || !payload.username || !targetUsername) {
    return res.status(400).json({status: 1});
  }

  try {
    const db = await connectToDb();
    const userCol = db.collection("user-tests");
    const journalCol = db.collection("tests");

    // Verify admin identity
    const adminUser = await userCol.findOne({ username: payload.username, type: 1 });
    if (!adminUser) {
      return res.status(403).json({status: 1});
    }

    const updateResult = await journalCol.updateOne(
      { _id: targetUsername },
      { $set: { entries: [] } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({status: 1});
    }

    return res.status(200).json({status: 0});
  } catch (err) {
    console.error("Admin DELETE journal error:", err);
    return res.status(500).json({status: 1});
  }
});

export default router;