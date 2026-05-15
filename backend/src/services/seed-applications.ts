import { Application } from '../models/application.js';

interface Seed {
  appName: string;
  group: string;
}

const SOCIAL = 'สื่อสังคมออนไลน์';
const BANKING = 'ธุรกรรม';
const ENTERTAINMENT = 'ความบันเทิง';
const EDUCATION = 'การศึกษา';
const BOOKS = 'หนังสือ';
const GAMES = 'เกม';
const OTHER = 'อื่นๆ';

const SEED: Seed[] = [
  { appName: 'Facebook', group: SOCIAL },
  { appName: 'X', group: SOCIAL },
  { appName: 'Instagram', group: SOCIAL },
  { appName: 'Messenger', group: SOCIAL },
  { appName: 'LINE', group: SOCIAL },
  { appName: 'TikTok', group: SOCIAL },
  { appName: 'Discord', group: SOCIAL },
  { appName: 'WhatsApp', group: SOCIAL },
  { appName: 'Threads', group: SOCIAL },
  { appName: 'WeChat', group: SOCIAL },
  { appName: 'KakaoTalk', group: SOCIAL },
  { appName: 'Bluesky', group: SOCIAL },
  { appName: 'Weibo', group: SOCIAL },
  { appName: 'Gmail', group: SOCIAL },

  { appName: 'KPlus', group: BANKING },
  { appName: 'SCB', group: BANKING },
  { appName: 'MyMo (GSB)', group: BANKING },
  { appName: 'TrueMoney', group: BANKING },
  { appName: 'Krungsri', group: BANKING },
  { appName: 'Bualuang', group: BANKING },
  { appName: 'Krungthai', group: BANKING },
  { appName: 'KBank', group: BANKING },
  { appName: 'Shopee', group: BANKING },
  { appName: 'Lazada', group: BANKING },
  { appName: 'Amazon', group: BANKING },

  { appName: 'YouTube', group: ENTERTAINMENT },
  { appName: 'Netflix', group: ENTERTAINMENT },
  { appName: 'Apple', group: ENTERTAINMENT },

  { appName: 'Microsoft', group: EDUCATION },
  { appName: 'Google', group: EDUCATION },
  { appName: 'Classroom', group: EDUCATION },
  { appName: 'ChatGPT', group: EDUCATION },
  { appName: 'Google Meet', group: EDUCATION },
  { appName: 'Webex', group: EDUCATION },
  { appName: 'MSU REG', group: EDUCATION },

  { appName: 'ebay', group: BOOKS },
  { appName: 'kaidee', group: BOOKS },
  { appName: 'Joylada', group: BOOKS },
  { appName: 'LEZHIN', group: BOOKS },
  { appName: 'Rookie', group: BOOKS },
  { appName: 'wecomics', group: BOOKS },
  { appName: 'WEBTOON', group: BOOKS },
  { appName: 'fic', group: BOOKS },
  { appName: 'พิกซับ', group: BOOKS },

  { appName: 'FarmVille 2', group: GAMES },
  { appName: 'VALORANT', group: GAMES },
  { appName: 'Garena', group: GAMES },
  { appName: 'Steam', group: GAMES },
  { appName: 'ROK', group: GAMES },
  { appName: 'PUBG', group: GAMES },
  { appName: 'FREE FIRE', group: GAMES },
  { appName: 'GTA', group: GAMES },
  { appName: 'Roblox', group: GAMES },
];

export async function seedApplicationsIfEmpty(): Promise<void> {
  const count = await Application.estimatedDocumentCount();
  if (count > 0) return;
  for (const s of SEED) {
    await Application.create(s);
  }
  console.log(`📦 Seeded ${SEED.length} applications`);
}
