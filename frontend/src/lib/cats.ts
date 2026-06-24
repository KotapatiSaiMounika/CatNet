type Cat = {
  id: string;
  name: string;
  breed: string;
  age: string;
  color: string;
  location: string;
  distance: string;
  lastSeen?: string;
  reward?: string;
  status?: "missing" | "found" | "adoption";
  gradient: string;
  emoji: string;
  personality?: string[];
};

const palettes = [
  "from-pink-200 to-orange-200",
  "from-purple-200 to-pink-200",
  "from-blue-200 to-purple-200",
  "from-green-200 to-blue-200",
  "from-yellow-200 to-pink-200",
  "from-orange-200 to-pink-200",
];

const emojis = ["🐱", "😺", "😸", "😻", "🙀", "😽", "😼", "😹"];

const breeds = [
  "Tabby",
  "Persian",
  "Maine Coon",
  "Siamese",
  "Ragdoll",
  "British Shorthair",
  "Bengal",
  "Scottish Fold",
];
const names = [
  "Mochi",
  "Biscuit",
  "Pepper",
  "Luna",
  "Miso",
  "Oreo",
  "Mango",
  "Cloud",
  "Pumpkin",
  "Olive",
  "Hazel",
  "Whiskers",
];
const colors = ["Cream", "Tabby", "Black & White", "Calico", "Ginger", "Grey"];
const locations = [
  "Brooklyn, NY",
  "Mission, SF",
  "Shoreditch, UK",
  "Shibuya, JP",
  "Kreuzberg, DE",
  "Le Marais, FR",
];
const personalities = [
  "Playful",
  "Cuddly",
  "Curious",
  "Shy",
  "Adventurous",
  "Lap cat",
  "Indoor",
  "Good with kids",
];

export function generateCats(count: number, status: Cat["status"] = "missing"): Cat[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${status}-${i}`,
    name: names[i % names.length],
    breed: breeds[i % breeds.length],
    age: `${1 + (i % 8)} yr`,
    color: colors[i % colors.length],
    location: locations[i % locations.length],
    distance: `${(0.3 + i * 0.4).toFixed(1)} km`,
    lastSeen: `${1 + (i % 12)}h ago`,
    reward: status === "missing" ? `$${50 + i * 25}` : undefined,
    status,
    gradient: palettes[i % palettes.length],
    emoji: emojis[i % emojis.length],
    personality: [
      personalities[i % personalities.length],
      personalities[(i + 2) % personalities.length],
    ],
  }));
}

export type { Cat };
