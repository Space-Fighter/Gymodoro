import { Check } from "lucide-react";
import { backgrounds } from "@/components/timer/backgrounds";

interface Props {
  contentLeft: string;
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function BackgroundView({ contentLeft, selectedId, onSelect }: Props) {
  return (
    <div
      className="absolute inset-0 overflow-y-auto p-6 pt-20"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      <div>
        <h2 className="text-3xl font-bold text-white font-poppins mb-2">
          Background
        </h2>
        <p className="text-sm text-white/50 mb-6">Choose your focus scene</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {backgrounds.map((bg) => {
          const isSelected = bg.id === selectedId;
          return (
            <button
              key={bg.id}
              onClick={() => onSelect(bg.id)}
              className={`relative aspect-video rounded-xl bg-cover bg-center border-2 transition-all cursor-pointer flex items-end p-3 font-semibold text-white text-sm ${
                isSelected
                  ? "border-white shadow-[0_0_0_3px_rgba(255,255,255,0.35)]"
                  : "border-white/30 hover:border-white/60"
              }`}
              style={{ backgroundImage: `url(${bg.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-black/25 rounded-[10px]" />
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Check size={14} className="text-black stroke-[3]" />
                </div>
              )}
              <span className="relative">{bg.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
