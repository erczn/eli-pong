export const event = {
  babyName: "Eli",
  date: "2026-11-29",
  time: "10:00",
  venue: "Saint John Nepomucene Parish Church",
  address: "Cabiao, Nueva Ecija, Philippines",
  mapQuery: "15.249652,120.8584759",
  reception: "The Garden Pavilion",
  receptionAddress: "Sample reception — replace with your venue",
  mapLink:
    "https://www.google.com/maps/place/Saint+John+Nepomucene+Parish+Church-+Cabiao,+Nueva+Ecija+(Diocese+of+Cabanatuan)/@15.249652,120.8558956,17z/data=!3m1!4b1!4m6!3m5!1s0x3396e1acfe27a931:0xe4679169277ef617!8m2!3d15.249652!4d120.8584759!16s%2Fg%2F1ptynp6ft?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
  dressCode: "Pastels & a little sunshine",
  parentsNames: "Eli’s loving family",
  welcomeMessage: "A little faith. A little sunshine. A whole lot of love.",
  giftInfo:
    "Your presence and prayers are our sweetest gifts. If you would like to bring a little something, books and keepsakes are always treasured.",
  timezone: "+08:00",
};
export const godparents = [
  {
    id: "richmond",
    role: "father",
    name: "Dada Richmond",
    photoUrl: "/portrait-mark.svg",
    message:
      "Being your dad is my greatest blessing, Eli. I’ll always be your guiding hand, your safe place, and your biggest cheerleader.",
  },
  {
    id: "mae",
    role: "mother",
    name: "Mama Mae",
    photoUrl: "/portrait-anna.svg",
    message:
      "May your days be full of wonder, kindness, and love. I’ll be here for every little adventure, sweet Eli.",
  },
  {
    id: "eli",
    role: "baby",
    name: "Eli",
    photoUrl: "/baby-eli.svg",
    message: "Tiny hands, big dreams, and a heart surrounded by love. Thank you for being part of my beautiful beginning!",
  },
  {
    id: "eric",
    role: "godfather",
    name: "Tito Eric",
    photoUrl: "/portrait-mark.svg",
    message:
      "May your days be full of wonder, kindness, and love. I’ll be here for every little adventure, sweet Eli.",
  },
  {
    id: "ryza",
    role: "godmother",
    name: "Tita Ryza",
    photoUrl: "/portrait-anna.svg",
    message:
      "May your days be full of wonder, kindness, and love. I’ll be here for every little adventure, sweet Eli.",
  },
];
export const schedule = [
  {
    id: "ceremony",
    time: "10:00 AM",
    title: "A beautiful beginning",
    description: "Christening ceremony at the church",
    order: 0,
  },
  {
    id: "photos",
    time: "11:00 AM",
    title: "Tiny smiles, forever memories",
    description: "Family and godparent photos",
    order: 1,
  },
  {
    id: "lunch",
    time: "12:00 PM",
    title: "Gather around the table",
    description: "Lunch at the reception",
    order: 2,
  },
  {
    id: "games",
    time: "1:00 PM",
    title: "A little playtime",
    description: "Games, giggles, and happy surprises",
    order: 3,
  },
  {
    id: "cake",
    time: "2:00 PM",
    title: "The sweetest little ending",
    description: "Cake, wishes, and warm goodbyes",
    order: 4,
  },
];
export const gallery = [0, 1, 2, 3].map((i) => ({
  id: String(i),
  imageUrl: `/memory-${i}.svg`,
  caption: [
    "Little sunshine",
    "Dream a little dream",
    "Our bundle of joy",
    "Loved beyond measure",
  ][i],
  order: i,
}));
