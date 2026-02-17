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
      { id: 'brooklyn-bridge', label: 'Brooklyn Bridge', source: require('../assets/stickers/brooklyn-bridge.png') },
    ],
  },
  {
    name: 'New York',
    stickers: [
      { id: 'statue-liberty', label: 'Statue of Liberty', source: require('../assets/stickers/statue-liberty.png') },
      { id: 'nyc-taxi', label: 'NYC Taxi', source: require('../assets/stickers/nyc-taxi.png') },
      { id: 'nyc-pizza', label: 'NYC Pizza', source: require('../assets/stickers/nyc-pizza.png') },
      { id: 'central-park', label: 'Central Park', source: require('../assets/stickers/central-park.png') },
      { id: 'subway', label: 'Subway Train', source: require('../assets/stickers/subway.png') },
      { id: 'empire-state', label: 'Empire State Building', source: require('../assets/stickers/empire-state.png') },
      { id: 'nyc-bagel', label: 'NYC Bagel', source: require('../assets/stickers/nyc-bagel.png') },
      { id: 'i-love-ny', label: 'I Love New York', source: require('../assets/stickers/i-love-ny.png') },
      { id: 'hot-dog-cart', label: 'Hot Dog Cart', source: require('../assets/stickers/hot-dog-cart.png') },
      { id: 'prospect-park', label: 'Prospect Park', source: require('../assets/stickers/prospect-park.png') },
      { id: 'brownstone', label: 'Brooklyn Brownstone', source: require('../assets/stickers/brownstone.png') },
      { id: 'nyc-coffee', label: 'NYC Coffee', source: require('../assets/stickers/nyc-coffee.png') },
      { id: 'nyc-pigeon', label: 'NYC Pigeon', source: require('../assets/stickers/nyc-pigeon.png') },
      { id: 'nyc-pretzel', label: 'NYC Pretzel', source: require('../assets/stickers/nyc-pretzel.png') },
      { id: 'fire-hydrant', label: 'Fire Hydrant', source: require('../assets/stickers/fire-hydrant.png') },
      { id: 'coney-island', label: 'Coney Island', source: require('../assets/stickers/coney-island.png') },
      { id: 'nyc-skyline', label: 'NYC Skyline', source: require('../assets/stickers/nyc-skyline.png') },
      { id: 'bk-stroller-mom', label: 'Brooklyn Stroller Mom', source: require('../assets/stickers/bk-stroller-mom.png') },
      { id: 'metrocard', label: 'MetroCard', source: require('../assets/stickers/metrocard.png') },
      { id: 'water-tower', label: 'Water Tower', source: require('../assets/stickers/water-tower.png') },
    ],
  },
];

export const ALL_STICKERS: Sticker[] = STICKER_CATEGORIES.flatMap(cat => cat.stickers);

export const STICKER_MAP: Record<string, any> = {};
ALL_STICKERS.forEach(s => {
  STICKER_MAP[s.id] = s.source;
});
