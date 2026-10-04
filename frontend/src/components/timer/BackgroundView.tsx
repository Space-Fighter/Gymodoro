import { useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { Check, Plus, X, Loader2 } from "lucide-react";
import { backgrounds, getThumbnailUrl } from "@/components/timer/backgrounds";
import {
  addCustomBackground,
  getCustomBackgrounds,
  removeCustomBackground,
  isCustomBackgroundId,
} from "@/lib/customBackgrounds";

interface Props {
  contentLeft: string;
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function BackgroundView({ contentLeft, selectedId, onSelect }: Props) {
  const [customBackgrounds, setCustomBackgrounds] = useState(() => getCustomBackgrounds());
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file again later
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const background = await addCustomBackground(file);
      setCustomBackgrounds((prev) => [...prev, background]);
      onSelect(background.id);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Couldn't upload that image.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    removeCustomBackground(id);
    setCustomBackgrounds((prev) => prev.filter((bg) => bg.id !== id));
    if (selectedId === id) onSelect(backgrounds[0].id);
  };

  const allBackgrounds = [...backgrounds, ...customBackgrounds];

  return (
    <div
      className="absolute inset-0 overflow-y-auto p-6 pt-36"
      style={{ left: contentLeft, transition: "left 0.25s ease" }}
    >
      <div>
        <h2 className="text-3xl font-bold text-white font-poppins mb-2">
          Background
        </h2>
        <p className="text-sm text-white/50 mb-6">Choose your focus scene</p>
      </div>

      {uploadError && <p className="text-sm text-red-400 mb-4">{uploadError}</p>}

      <div className="grid grid-cols-3 gap-4">
        {allBackgrounds.map((bg) => {
          const isSelected = bg.id === selectedId;
          const isCustom = isCustomBackgroundId(bg.id);
          return (
            <button
              key={bg.id}
              onClick={() => onSelect(bg.id)}
              className={`group relative aspect-video rounded-xl bg-cover bg-center border-2 transition-all cursor-pointer flex items-end p-3 font-semibold text-white text-sm ${
                isSelected
                  ? "border-white shadow-[0_0_0_3px_rgba(255,255,255,0.35)]"
                  : "border-white/30 hover:border-white/60"
              }`}
              style={{ backgroundImage: `url(${getThumbnailUrl(bg.imageUrl)})` }}
            >
              <div className="absolute inset-0 bg-black/25 rounded-[10px]" />
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                  <Check size={14} className="text-black stroke-[3]" />
                </div>
              )}
              {isCustom && (
                <div
                  role="button"
                  aria-label="Remove background"
                  onClick={(e) => handleRemove(e, bg.id)}
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500/80 transition-opacity"
                >
                  <X size={14} />
                </div>
              )}
              <span className="relative truncate">{bg.name}</span>
            </button>
          );
        })}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative aspect-video rounded-xl border-2 border-dashed border-white/30 hover:border-white/60 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-white/70 hover:text-white disabled:opacity-60"
        >
          {uploading ? <Loader2 size={22} className="animate-spin" /> : <Plus size={22} />}
          <span className="text-xs font-semibold">
            {uploading ? "Uploading…" : "Upload your own"}
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
