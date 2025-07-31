import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { configDotenv } from 'dotenv';
const { expressjwt: jwt } = require('express-jwt');

import journal from './routes/journal';
import auth from './routes/auth';
import profile from './routes/profile';
import passport from './auth/passport';
configDotenv();

const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();
const jwt_secret = process.env.JWT_SECRET || "something bad";

const jwtAuth = jwt({ secret: jwt_secret, algorithms: ["HS256"], userProperty: "payload" });
/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */


app.use(passport.initialize());

app.use('/api/user', auth);
// protected routes
app.use('/api/journal', jwtAuth, journal);
app.use('/api/profile', jwtAuth, profile);


app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

function errorhandler(err: any, req: any, res: any, next: any) {
    console.error(err.stack);
    res.status(500).send("something broke!");
}

app.use(errorhandler);
/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);