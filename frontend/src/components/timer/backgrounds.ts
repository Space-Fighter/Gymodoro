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
];

export const DEFAULT_BACKGROUND_ID = "forest";

export function getBackgroundById(id: string): Background {
  return backgrounds.find((bg) => bg.id === id) || backgrounds[0];
}
