// ROUTES FOR ADMINISTRATOR ACCESS:

/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH + TYPE: 1 IN DB (verify in route)
 * GET api/admin/journal
 * req: {"username": username}
 * res: {"status": 0 or 1, "entries": journal entries}
 * Access journal entries from administrator account
 */

/**
 * PROTECTED ROUTE, REQUIRES JWT AUTH + TYPE: 1 IN DB (verify in route)
 * POST api/admin/delete-user
 * req: {"username": username}
 * res: {"status": 0 or 1}
 * Deletes user account and associated user entries
 */

/**
 * POST api/admin/delete-journal
 * req: {"username": username}
 * res: {"status": 0 or 1}
 * Deletes all entries related to specific user account
 */