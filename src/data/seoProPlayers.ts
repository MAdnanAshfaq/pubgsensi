export interface ProPlayerSeoData {
  slug: string;
  name: string;
  team: string;
  game: string;
  clawLayout: string;
  gyroMode: string;
  deviceUsed: string;
  shareCode: string;
  tppNoScope: string;
  redDotAds: string;
  scope3xAds: string;
  gyroNoScope: string;
  gyro3x: string;
  bio: string;
}

export const SEO_PRO_PLAYERS: ProPlayerSeoData[] = [
  {
    slug: 'jonathan-gaming',
    name: 'Jonathan Gaming',
    team: 'GodLike Esports',
    game: 'BGMI / PUBG Mobile',
    clawLayout: '2-Finger Thumb + Always-On Gyro',
    gyroMode: 'Always-On Gyroscope',
    deviceUsed: 'iPhone 14 Pro Max',
    shareCode: '7350-5353-1699-2688-280',
    tppNoScope: '45%',
    redDotAds: '50%',
    scope3xAds: '24%',
    gyroNoScope: '400%',
    gyro3x: '240%',
    bio: 'Jonathan is widely regarded as one of India’s most lethal aggressive assaulters in BGMI. Famous for his maxed-out 400% Always-On gyroscope spray control and two-finger thumb movement.',
  },
  {
    slug: 'scoutop',
    name: 'ScoutOP',
    team: 'Team XSpark',
    game: 'BGMI / PUBG Mobile',
    clawLayout: '4-Finger Claw + Always-On Gyro',
    gyroMode: 'Always-On Gyroscope',
    deviceUsed: 'iPhone 15 Pro Max',
    shareCode: '7120-0643-8249-5640-805',
    tppNoScope: '55%',
    redDotAds: '60%',
    scope3xAds: '28%',
    gyroNoScope: '350%',
    gyro3x: '180%',
    bio: 'Scout is a pioneer of 4-finger claw and gyroscope laser sprays in the Indian esports scene. Known for masterclass M416 + 6x scope spray transfers at extreme ranges.',
  },
  {
    slug: 'mortal',
    name: 'Mortal',
    team: 'Team SouL',
    game: 'BGMI / PUBG Mobile',
    clawLayout: '4-Finger Claw + Gyro',
    gyroMode: 'Always-On Gyroscope',
    deviceUsed: 'iPhone 14 Pro',
    shareCode: '7504-1481-8987-5798-249',
    tppNoScope: '50%',
    redDotAds: '55%',
    scope3xAds: '25%',
    gyroNoScope: '300%',
    gyro3x: '160%',
    bio: 'Mortal is an iconic BGMI player and founder of S8UL Esports. His sensitivity profile balances smooth close-quarters camera control with high gyro accuracy.',
  },
  {
    slug: 'goblin',
    name: 'Goblin',
    team: 'Carnival Gaming',
    game: 'BGMI / PUBG Mobile',
    clawLayout: '5-Finger Claw + Always-On Gyro',
    gyroMode: 'Always-On Gyroscope',
    deviceUsed: 'iPhone 14 Pro Max',
    shareCode: '7280-9912-3401-5612-901',
    tppNoScope: '60%',
    redDotAds: '65%',
    scope3xAds: '30%',
    gyroNoScope: '380%',
    gyro3x: '210%',
    bio: 'Goblin is renowned for his lightning-fast 5-finger claw reflexes and high-velocity gyro hipfire in close-quarters tournament fights.',
  },
];

export function getProPlayerBySlug(slug: string): ProPlayerSeoData | undefined {
  return SEO_PRO_PLAYERS.find((p) => p.slug === slug);
}
