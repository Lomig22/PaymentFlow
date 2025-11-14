import React, { useState } from "react";

 interface ThemeCustomizerProps {
  theme: string;
}

const ThemeCustomizer = ({ theme }: ThemeCustomizerProps) => {
  const [font, setFont] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const availableFonts = ["Arial", "Verdana", "Georgia", "Courier New", "Times New Roman"];

  if (theme !== "custom") return null;

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white space-y-4">
      <h2 className="text-xl font-semibold">Personnalisation du thème</h2>

      {/* Choix de police */}
      <div>
        <label className="block font-medium mb-1">Police :</label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {availableFonts.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Choix de la couleur du texte */}
      <div>
        <label className="block font-medium mb-1">Couleur du texte :</label>
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="w-16 h-10 p-0 border-0"
        />
      </div>

      {/* Choix de la couleur de fond */}
      <div>
        <label className="block font-medium mb-1">Couleur de fond :</label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-16 h-10 p-0 border-0"
        />
      </div>

      {/* Aperçu */}
      <div
        className="p-4 rounded border"
        style={{
          fontFamily: font,
          color: textColor,
          backgroundColor: bgColor,
        }}
      >
        Aperçu du texte avec le thème personnalisé.
      </div>
    </div>
  );
};

export default ThemeCustomizer;
