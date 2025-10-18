import express from 'express';
import { startBot } from './src/bot.js';

const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('TrophyTracker Discord Bot is running.');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Web server listening on port ${port}`);
});

async function main() {
  try {
    await startBot();
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();
