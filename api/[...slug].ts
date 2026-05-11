// Vercel serverless wrapper for the Express app.
// All /api/* requests are routed to this single function.
import app from '../backend/src/app.js';

export default app;
