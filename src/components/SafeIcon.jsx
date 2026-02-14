import {
    BookOpen,
    Database,
    Server,
    Webhook,
    Binary,
    Palette,
  } from "lucide-react";
  
  const LUCIDE_MAP = {
    BookOpen,
    Database,
    Server,
    Webhook,
    Binary,
    Palette,
  };
  
  export default function SafeIcon({ icon, className = "" }) {
    if (icon.type === "image") {
      return (
        <img
          src={icon.value}
          alt=""
          className={`object-contain ${className}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }
  
    const Icon = LUCIDE_MAP[icon.value] || BookOpen;
  
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Icon size={20} className="text-indigo-500" />
      </div>
    );
  }
  