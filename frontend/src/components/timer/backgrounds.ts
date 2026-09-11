import { getCustomBackgrounds } from "@/lib/customBackgrounds";
import alpsDrive from "@/assets/backgrounds/alps-drive.jpg";
import autumnDirtRoad from "@/assets/backgrounds/autumn-dirt-road.jpg";
import porscheVillage from "@/assets/backgrounds/porsche-village.jpg";
import porschesCoveredBridge from "@/assets/backgrounds/porsches-covered-bridge.jpg";
import desertSunsetDrive from "@/assets/backgrounds/desert-sunset-drive.jpg";
import tunnelGt3 from "@/assets/backgrounds/tunnel-gt3.jpg";
import mountainPass718 from "@/assets/backgrounds/mountain-pass-718.jpg";

export interface Background {
  id: string;
  name: string;
  imageUrl: string;
}

export const backgrounds: Background[] = [
  {
    id: "forest",
    name: "Forest",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=3000&h=1993&fit=crop",
  },
  {
    id: "jungle",
    name: "Jungle",
    imageUrl:
      "https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=3000&h=1993&fit=crop",
  },
  {
    id: "night-sky",
    name: "Night Sky",
    imageUrl:
      "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=3000&h=1993&fit=crop",
  },
  {
    id: "beach",
    name: "Beach",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=3000&h=1993&fit=crop",
  },
  {
    id: "rainy-cafe",
    name: "Rainy Cafe",
    imageUrl:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=3000&h=1993&fit=crop",
  },
  {
    id: "city-lights",
    name: "City Lights",
    imageUrl:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=3000&h=1993&fit=crop",
  },
  {
    id: "alps-drive",
    name: "Alps Drive",
    imageUrl: alpsDrive,
  },
  {
    id: "autumn-dirt-road",
    name: "Autumn Backroad",
    imageUrl: autumnDirtRoad,
  },
  {
    id: "porsche-village",
    name: "Village Porsche",
    imageUrl: porscheVillage,
  },
  {
    id: "porsches-covered-bridge",
    name: "Covered Bridge",
    imageUrl: porschesCoveredBridge,
  },
  {
    id: "desert-sunset-drive",
    name: "Desert Sunset",
    imageUrl: desertSunsetDrive,
  },
  {
    id: "tunnel-gt3",
    name: "Tunnel Run",
    imageUrl: tunnelGt3,
  },
  {
    id: "mountain-pass-718",
    name: "Mountain Pass",
    imageUrl: mountainPass718,
  },
];

export const DEFAULT_BACKGROUND_ID = "porsches-covered-bridge";

export function getBackgroundById(id: string): Background {
  const preset = backgrounds.find((bg) => bg.id === id);
  if (preset) return preset;
  // Not a preset — check user-uploaded backgrounds. customBackgrounds.ts only
  // imports this file's `Background` *type*, which is erased at compile time,
  // so this runtime import back into it isn't an actual circular dependency.
  const custom = getCustomBackgrounds().find((bg) => bg.id === id);
  return custom || backgrounds[0];
}
