import { useState } from "react";
import { Users, FileText, BookText } from "lucide-react";

interface AnimatedResourceIconProps {
  type: "testimonials" | "blog" | "guides";
  className?: string;
}

// Couleurs Payment Flow : bleu #2563eb, turquoise #22d3ee, jaune #facc15
const ICONS = {
  testimonials: {
    Icon: Users,
    color: "#2563eb",
    animation: "animate-bounce"
  },
  blog: {
    Icon: FileText,
    color: "#22d3ee",
    animation: "animate-spin"
  },
  guides: {
    Icon: BookText,
    color: "#facc15",
    animation: "animate-pulse"
  }
};

export default function AnimatedResourceIcon({ type, className = "" }: AnimatedResourceIconProps) {
  const [clicked, setClicked] = useState(false);
  const { Icon, color, animation } = ICONS[type];

  return (
    <span
      className={`inline-block transition-all ${clicked ? animation : ""} ${className}`}
      style={{ color }}
      onAnimationEnd={() => setClicked(false)}
      onClick={e => {
        e.stopPropagation();
        setClicked(true);
      }}
      tabIndex={-1}
      aria-hidden
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}
