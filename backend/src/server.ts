import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.PORT) || 3100;
app.listen(port, () => {
  console.log(`🚀 OOPS! backend (Express) listening on http://localhost:${port}`);
});
