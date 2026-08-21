import { getTagColor, type TagCategory } from "@/lib/tagColors";

interface Props {
  category: TagCategory;
  value: string;
}

export default function Tag({ category, value }: Props) {
  const { background, color } = getTagColor(category, value);

  return (
    <span
      className="font-poppins"
      style={{
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 700,
        background,
        color,
      }}
    >
      {value}
    </span>
  );
}
