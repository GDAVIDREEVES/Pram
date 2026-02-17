export interface StickerCategory {
  name: string;
  stickers: Sticker[];
}

export interface Sticker {
  id: string;
  label: string;
  source: any;
}

export const STICKER_CATEGORIES: StickerCategory[] = [
  {
    name: 'Baby',
    stickers: [
      { id: 'baby-happy', label: 'Happy Baby', source: require('../assets/stickers/baby-happy.png') },
      { id: 'baby-sleepy', label: 'Sleepy Baby', source: require('../assets/stickers/baby-sleepy.png') },
      { id: 'baby-crying', label: 'Crying Baby', source: require('../assets/stickers/baby-crying.png') },
      { id: 'baby-laughing', label: 'Laughing Baby', source: require('../assets/stickers/baby-laughing.png') },
      { id: 'baby-surprised', label: 'Surprised Baby', source: require('../assets/stickers/baby-surprised.png') },
      { id: 'baby-crawling', label: 'Crawling Baby', source: require('../assets/stickers/baby-crawling.png') },
    ],
  },
  {
    name: 'Mom Life',
    stickers: [
      { id: 'mom-coffee', label: 'Coffee Mom', source: require('../assets/stickers/mom-coffee.png') },
      { id: 'mom-superhero', label: 'Super Mom', source: require('../assets/stickers/mom-superhero.png') },
      { id: 'mom-hug', label: 'Mom Hug', source: require('../assets/stickers/mom-hug.png') },
    ],
  },
  {
    name: 'Baby Stuff',
    stickers: [
      { id: 'baby-bottle', label: 'Bottle', source: require('../assets/stickers/baby-bottle.png') },
      { id: 'stroller', label: 'Stroller', source: require('../assets/stickers/stroller.png') },
      { id: 'rubber-duck', label: 'Rubber Duck', source: require('../assets/stickers/rubber-duck.png') },
      { id: 'pacifier', label: 'Pacifier', source: require('../assets/stickers/pacifier.png') },
      { id: 'teddy-bear', label: 'Teddy Bear', source: require('../assets/stickers/teddy-bear.png') },
      { id: 'onesie', label: 'Onesie', source: require('../assets/stickers/onesie.png') },
    ],
  },
  {
    name: 'Reactions',
    stickers: [
      { id: 'love-heart', label: 'Love', source: require('../assets/stickers/love-heart.png') },
      { id: 'thumbs-up', label: 'Thumbs Up', source: require('../assets/stickers/thumbs-up.png') },
      { id: 'party', label: 'Party', source: require('../assets/stickers/party.png') },
      { id: 'high-five', label: 'High Five', source: require('../assets/stickers/high-five.png') },
      { id: 'wave-hello', label: 'Wave', source: require('../assets/stickers/wave-hello.png') },
      { id: 'lol', label: 'LOL', source: require('../assets/stickers/lol.png') },
    ],
  },
  {
    name: 'Fun',
    stickers: [
      { id: 'playground', label: 'Playground', source: require('../assets/stickers/playground.png') },
      { id: 'cupcake', label: 'Cupcake', source: require('../assets/stickers/cupcake.png') },
      { id: 'ice-cream', label: 'Ice Cream', source: require('../assets/stickers/ice-cream.png') },
      { id: 'nap-time', label: 'Nap Time', source: require('../assets/stickers/nap-time.png') },
      { id: 'brooklyn-bridge', label: 'Brooklyn', source: require('../assets/stickers/brooklyn-bridge.png') },
    ],
  },
];

export const STICKER_MAP: Record<string, any> = {};
STICKER_CATEGORIES.forEach(cat => {
  cat.stickers.forEach(s => {
    STICKER_MAP[s.id] = s.source;
  });
});
