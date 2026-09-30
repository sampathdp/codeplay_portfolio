export interface UnityAsset {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string[];
  features: string[];
  specs: { label: string; value: string }[];
  tags: string[];
  price: string;
  storeUrl: string;
  cover: string;
  screenshots: string[];
}

const IMG = "/assets/unity-assets";
const shots = (key: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${IMG}/${key}-${i + 1}.webp`);

export const PUBLISHER_URL = "https://assetstore.unity.com/publishers/41201";

export const UNITY_ASSETS: UnityAsset[] = [
  {
    slug: "mountainous-terrain-with-lakeside-view",
    name: "Mountainous Terrain with Lakeside View",
    category: "3D Environments",
    tagline:
      "A reflective lake, towering peaks and dense forest — ready to explore with a built-in first-person controller.",
    description: [
      "A high-quality Unity terrain blending lush green landscapes, towering mountains and a peaceful lakeside. Ideal for open-world games, adventure scenes and exploration-focused projects.",
      "Ships with a first-person character controller so you can walk the environment the moment you import it, and every terrain setting can be tuned or expanded for your own game.",
    ],
    features: [
      "Realistic vegetation: dense forests, vibrant grass and detailed trees",
      "Serene, reflective lake nestled between the mountains",
      "Varied terrain elevation, from valleys to towering peaks",
      "First-person character controller included",
      "Optimised for smooth performance across devices",
      "Adjustable terrain height, textures and vegetation settings",
    ],
    specs: [
      { label: "Price", value: "$4.99" },
      { label: "Render pipeline", value: "Built-in only" },
      { label: "Unity version", value: "2021.3.30 or newer" },
      { label: "Package size", value: "47.4 MB" },
      { label: "Files", value: "93" },
      { label: "Textures", value: "27 (1024² / 2048², PNG/TIFF)" },
      { label: "Meshes / prefabs", value: "9 / 9" },
      { label: "LOD", value: "1 level" },
      { label: "First release", value: "Sep 2024" },
    ],
    tags: ["Terrain", "Nature", "Forest", "FPS", "RPG", "PBR", "Environment"],
    price: "$4.99",
    storeUrl:
      "https://assetstore.unity.com/packages/3d/environments/mountainous-terrain-with-lakeside-view-294301",
    cover: `${IMG}/mountainous-terrain-cover.webp`,
    screenshots: shots("mountainous-terrain", 3),
  },
  {
    slug: "playing-cards-vintage-54-card-deck",
    name: "Playing Cards – Vintage 54-Card Deck",
    category: "2D",
    tagline:
      "A complete vintage deck as crisp transparent sprites, with an animated demo scene that doubles as your integration guide.",
    description: [
      "A ready-to-use playing card set for poker, blackjack, solitaire, rummy or any 2D/UI card game, in an ornate engraved style with rich red-and-black art on aged cream stock.",
      "Every sprite sits on a uniform 512 × 712 px transparent canvas with consistent naming (Club_A, Heart_02 … Spade_K), so cards load by name instead of wiring 54 references by hand. The demo shows a sorted grid, a curved fanned hand and a slide-and-flip deal animation built with plain coroutines.",
    ],
    features: [
      "56 sprites: 52-card deck, red & black jokers, 2 card backs",
      "Uniform 512 × 712 px transparent PNG with consistent naming",
      "Card.prefab with Suit/Rank enums",
      "Demo scene: sorted grid, 7-card fan, deal animation, Auto Play mode",
      "No DOTween, no TextMeshPro, zero dependencies",
      "UI-first (Canvas + Image); SpriteRenderer swap documented",
    ],
    specs: [
      { label: "Price", value: "$4.99" },
      { label: "Render pipeline", value: "Built-in, URP and HDRP" },
      { label: "Unity version", value: "2022.3 LTS or newer" },
      { label: "Package size", value: "47.9 MB" },
      { label: "Files", value: "66" },
      { label: "Sprite size", value: "512 × 712 px" },
      { label: "First release", value: "Aug 2026" },
    ],
    tags: ["Cards", "Poker", "Casino", "Solitaire", "2D", "UI", "Sprites"],
    price: "$4.99",
    storeUrl:
      "https://assetstore.unity.com/packages/2d/playing-cards-vintage-54-card-deck-394222",
    cover: `${IMG}/vintage-playing-cards-cover.webp`,
    screenshots: shots("vintage-playing-cards", 4),
  },
  {
    slug: "survivor-island",
    name: "Survivor Island",
    category: "Terrain",
    tagline:
      "A high-quality tropical island terrain with an island-wide road system, for quick prototyping or deep customisation.",
    description: [
      "Survivor Island – Island Grasslands is a package of unique island terrain for your Unity projects. Drop in a tropical island for quick prototyping, or build on it for a full game.",
      "Includes an island-wide road system plus extra models: a car, two types of rock and wood planks.",
    ],
    features: [
      "Tropical island terrain, ready for prototyping",
      "Island-wide road system",
      "Extra models: car, two rock types, wood planks",
      "Easy to customise and extend",
    ],
    specs: [
      { label: "Price", value: "$4.99" },
      { label: "Unity version", value: "2018.2.3 or newer" },
      { label: "Package size", value: "45.9 MB" },
      { label: "Files", value: "100" },
      { label: "First release", value: "Feb 2019" },
    ],
    tags: ["Island", "Terrain", "Tropical", "Roads", "Prototyping"],
    price: "$4.99",
    storeUrl: "https://assetstore.unity.com/packages/tools/terrain/survivor-island-139975",
    cover: `${IMG}/survivor-island-cover.webp`,
    screenshots: shots("survivor-island", 6),
  },
];

export const getUnityAsset = (slug: string) =>
  UNITY_ASSETS.find((a) => a.slug === slug);
