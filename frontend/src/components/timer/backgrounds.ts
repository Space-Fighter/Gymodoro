import { getCustomBackgrounds } from "@/lib/customBackgrounds";
import desertSunsetDrive from "@/assets/backgrounds/desert-sunset-drive.jpg";

export interface Background {
  id: string;
  name: string;
  imageUrl: string;
  /** CSS background-position override; defaults to DEFAULT_BACKGROUND_POSITION. */
  position?: string;
}

export const backgrounds: Background[] = [
  {
    id: "forest",
    name: "Forest",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2560&h=1440&fit=crop",
  },
  {
    id: "jungle",
    name: "Jungle",
    imageUrl:
      "https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=2560&h=1440&fit=crop",
  },
  {
    id: "night-sky",
    name: "Night Sky",
    imageUrl:
      "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=2560&h=1440&fit=crop",
  },
  {
    id: "beach",
    name: "Beach",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2560&h=1440&fit=crop",
  },
  {
    id: "rainy-cafe",
    name: "Rainy Cafe",
    imageUrl:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=2560&h=1440&fit=crop",
  },
  {
    id: "city-lights",
    name: "City Lights",
    imageUrl:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=2560&h=1440&fit=crop",
  },
  {
    id: "swiss-alps-pass",
    name: "Swiss Alps Pass",
    imageUrl:
      "https://images.unsplash.com/photo-1747138164851-3a6848a0b01f?w=2560&h=1440&fit=crop",
  },
  {
    id: "alpine-supercars",
    name: "Alpine Supercars",
    imageUrl:
      "https://images.unsplash.com/photo-1619157267030-1e13d0d0a23e?w=2560&h=1440&fit=crop",
  },
  {
    id: "mountain-911",
    name: "Mountain 911",
    imageUrl:
      "https://images.unsplash.com/photo-1778432999466-1f0a0705d481?w=2560&h=1440&fit=crop",
  },
  {
    id: "positano",
    name: "Positano",
    imageUrl:
      "https://images.unsplash.com/photo-1789091956593-2872dc389cd0?w=2560&h=1440&fit=crop",
  },
  {
    id: "amalfi-coast",
    name: "Amalfi Coast",
    imageUrl:
      "https://images.unsplash.com/photo-1567600335885-2ab0c94ac95a?w=2560&h=1440&fit=crop",
  },
  {
    id: "irish-coast-road",
    name: "Irish Coast Road",
    imageUrl:
      "https://images.unsplash.com/photo-1759759264020-661e7c7df11a?w=2560&h=1440&fit=crop",
  },
  {
    id: "irish-cliffs",
    name: "Irish Cliffs",
    imageUrl:
      "https://images.unsplash.com/photo-1769895123637-8f8d5c05117b?w=2560&h=1440&fit=crop",
  },
  {
    id: "tunnel-run",
    name: "Tunnel Run",
    imageUrl:
      "https://images.unsplash.com/photo-1783931635354-accc3e3db05d?w=2560&h=1440&fit=crop",
  },
  {
    id: "monaco-harbour",
    name: "Monaco Harbour",
    imageUrl:
      "https://images.unsplash.com/photo-1595138320174-a64d168e9970?w=2560&h=1440&fit=crop",
  },
  {
    id: "monte-carlo-casino",
    name: "Monte Carlo Casino",
    imageUrl:
      "https://images.unsplash.com/photo-1704810546542-593f1b228550?w=2560&h=1440&fit=crop",
  },
  {
    id: "monaco-rooftops",
    name: "Monaco Rooftops",
    imageUrl:
      "https://images.unsplash.com/photo-1526675261026-b83db55e4035?w=2560&h=1440&fit=crop",
  },
  {
    id: "monaco-night",
    name: "Monaco Night",
    imageUrl:
      "https://images.unsplash.com/photo-1566806925366-46c8926ec71c?w=2560&h=1440&fit=crop",
  },
  {
    id: "french-riviera-cove",
    name: "French Riviera Cove",
    imageUrl:
      "https://images.unsplash.com/photo-1605373543615-9aec72041d20?w=2560&h=1440&fit=crop",
  },
  {
    id: "portofino-harbour",
    name: "Portofino Harbour",
    imageUrl:
      "https://images.unsplash.com/photo-1756917894648-7a74e7aefd72?w=2560&h=1440&fit=crop",
  },
  {
    id: "cinque-terre",
    name: "Cinque Terre",
    imageUrl:
      "https://images.unsplash.com/photo-1617334140746-03dc1cc27593?w=2560&h=1440&fit=crop",
  },
  {
    id: "parisian-cafe",
    name: "Parisian Cafe",
    imageUrl:
      "https://images.unsplash.com/photo-1775742808930-a8bc05034604?w=2560&h=1440&fit=crop",
  },
  {
    id: "corner-cafe",
    name: "Corner Cafe",
    imageUrl:
      "https://images.unsplash.com/photo-1775042698367-df33ed52191a?w=2560&h=1440&fit=crop",
  },
  {
    id: "piazza-cafes",
    name: "Piazza Cafes",
    imageUrl:
      "https://images.unsplash.com/photo-1776523550701-dbe14ff5a3d4?w=2560&h=1440&fit=crop",
  },
  {
    id: "supercars-in-town",
    name: "Supercars in Town",
    imageUrl:
      "https://images.unsplash.com/photo-1758432940512-c2a932b6b976?w=2560&h=1440&fit=crop",
  },
  {
    id: "colourful-waterfront",
    name: "Colourful Waterfront",
    imageUrl:
      "https://images.unsplash.com/photo-1636559050522-89619ff5ce9d?w=2560&h=1440&fit=crop",
  },
  {
    id: "colourful-street",
    name: "Colourful Street",
    imageUrl:
      "https://images.unsplash.com/photo-1646039319329-ad6ef058cca5?w=2560&h=1440&fit=crop",
  },
  {
    id: "beach-huts",
    name: "Beach Huts",
    imageUrl:
      "https://images.unsplash.com/photo-1639579742606-f550b282986c?w=2560&h=1440&fit=crop",
  },
  {
    id: "santorini-domes",
    name: "Santorini Domes",
    imageUrl:
      "https://images.unsplash.com/photo-1678266561093-324802646fb2?w=2560&h=1440&fit=crop",
  },
  {
    id: "oia-sunset",
    name: "Oia Sunset",
    imageUrl:
      "https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=2560&h=1440&fit=crop",
  },
  {
    id: "oia-hillside",
    name: "Oia Hillside",
    imageUrl:
      "https://images.unsplash.com/photo-1696519669474-3001c0e2b548?w=2560&h=1440&fit=crop",
  },
  {
    id: "ammoudi-bay",
    name: "Ammoudi Bay",
    imageUrl:
      "https://images.unsplash.com/photo-1615807091119-4284fa55ecd7?w=2560&h=1440&fit=crop",
  },
  {
    id: "green-hills-huracan",
    name: "Green Hills Huracan",
    imageUrl:
      "https://images.unsplash.com/photo-1783822841222-b989ffb0071d?w=2560&h=1440&fit=crop",
  },
  {
    id: "forest-aventador",
    name: "Forest Aventador",
    imageUrl:
      "https://images.unsplash.com/photo-1760834916514-41451216f30d?w=2560&h=1440&fit=crop",
  },
  {
    id: "green-forest-drive",
    name: "Green Forest Drive",
    imageUrl:
      "https://images.unsplash.com/photo-1770998785950-74bf11057509?w=2560&h=1440&fit=crop",
  },
  {
    id: "huracan-forest-road",
    name: "Huracan Forest Road",
    imageUrl:
      "https://images.unsplash.com/photo-1783822841360-793f41064b1d?w=2560&h=1440&fit=crop",
  },
  {
    id: "lakeside-meet",
    name: "Lakeside Meet",
    imageUrl:
      "https://images.unsplash.com/photo-1770998697995-a1be1c994cc5?w=2560&h=1440&fit=crop",
  },
  {
    id: "river-overlook",
    name: "River Overlook",
    imageUrl:
      "https://images.unsplash.com/photo-1758311177597-d4133023e817?w=2560&h=1440&fit=crop",
  },
  {
    id: "green-classic-forest",
    name: "Green Classic Forest",
    imageUrl:
      "https://images.unsplash.com/photo-1758620331050-307fa019956d?w=2560&h=1440&fit=crop",
  },
  {
    id: "green-porsche-mountains",
    name: "Green Porsche Mountains",
    imageUrl:
      "https://images.unsplash.com/photo-1789096172501-cce113c754ff?w=2560&h=1440&fit=crop",
  },
  {
    id: "green-coupe-meadow",
    name: "Green Coupe Meadow",
    imageUrl:
      "https://images.unsplash.com/photo-1542211295-6c7d17e84ea4?w=2560&h=1440&fit=crop",
  },
  {
    id: "green-roadster-hillside",
    name: "Green Roadster Hillside",
    imageUrl:
      "https://images.unsplash.com/photo-1784558844022-aeb1babb7938?w=2560&h=1440&fit=crop",
  },
  {
    id: "red-and-green-alps",
    name: "Red and Green Alps",
    imageUrl:
      "https://images.unsplash.com/photo-1789096171154-431b46422bfd?w=2560&h=1440&fit=crop",
  },
  {
    id: "classic-mountain-pass",
    name: "Classic Mountain Pass",
    imageUrl:
      "https://images.unsplash.com/photo-1782056094490-b0f16e19bcf4?w=2560&h=1440&fit=crop",
  },
  {
    id: "roadster-snow-peaks",
    name: "Roadster Snow Peaks",
    imageUrl:
      "https://images.unsplash.com/photo-1782992649752-3fd2548c6d72?w=2560&h=1440&fit=crop",
  },
  {
    id: "blue-coast-road",
    name: "Blue Coast Road",
    imageUrl:
      "https://images.unsplash.com/photo-1720670273595-ccd6ceb5e812?w=2560&h=1440&fit=crop",
  },
  {
    id: "coastal-dusk-drive",
    name: "Coastal Dusk Drive",
    imageUrl:
      "https://images.unsplash.com/photo-1780399823334-778b0787d7aa?w=2560&h=1440&fit=crop",
  },
  {
    id: "alpine-convertibles",
    name: "Alpine Convertibles",
    imageUrl:
      "https://images.unsplash.com/photo-1762393060999-ba7e0cc31379?w=2560&h=1440&fit=crop",
  },
  {
    id: "blue-mustang-twisties",
    name: "Blue Mustang Twisties",
    imageUrl:
      "https://images.unsplash.com/photo-1774838227602-ce81f150fa97?w=2560&h=1440&fit=crop",
  },
  {
    id: "desert-sunset-drive",
    name: "Desert Sunset",
    imageUrl: desertSunsetDrive,
  },
];

/** Small version of a background for picker tiles (Unsplash URLs only). */
export function getThumbnailUrl(imageUrl: string): string {
  return imageUrl.replace("w=2560&h=1440", "w=640&h=360");
}

/**
 * Most scenes (cars on roads, coastlines) have their subject in the lower part
 * of the frame, so on short/wide windows anchor low instead of dead centre —
 * otherwise `cover` crops the bottom of the car off.
 */
export const DEFAULT_BACKGROUND_POSITION = "center 85%";

// What a first-time visitor sees until they pick their own wallpaper (a saved choice always wins).
export const DEFAULT_BACKGROUND_ID = "santorini-domes";

export function getBackgroundById(id: string): Background {
  const preset = backgrounds.find((bg) => bg.id === id);
  if (preset) return preset;
  // Not a preset — check user-uploaded backgrounds. customBackgrounds.ts only
  // imports this file's `Background` *type*, which is erased at compile time,
  // so this runtime import back into it isn't an actual circular dependency.
  const custom = getCustomBackgrounds().find((bg) => bg.id === id);
  return custom || backgrounds[0];
}
