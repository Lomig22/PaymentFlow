import React, { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { supabase } from "../../lib/supabase";

export default function SignatureSettings() {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [localLogo, setLocalLogo] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [font, setFont] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showPreview, setShowPreview] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("classique");

  const themes = {
    classique: {
      font: "Arial",
      textColor: "#000000",
      bgColor: "#ffffff",
    },
    sombre: {
      font: "Verdana",
      textColor: "#ffffff",
      bgColor: "#1f2937",
    },
    professionnel: {
      font: "Georgia",
      textColor: "#1a202c",
      bgColor: "#e2e8f0",
    },
  };

  const applyTheme = themes[selectedTheme];
  const saveToSupabase = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("utilisateur non authentifiée!");
      return;
    }
    const user = session?.user;
    if (!user) {
      alert("Utilisateur non connecté");
      return;
    }

    const { error } = await supabase
      .from("email_settings")
      .update({ signature_html: signatureHTML })
      .eq("user_id", user.id);

    if (error) {
      console.error("Erreur Supabase:", error);
      alert("Échec de l'enregistrement");
    } else {
      alert("Signature enregistrée avec succès !");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const signatureHTML = renderToStaticMarkup(
    <EmailSignature
      name={senderName}
      email={senderEmail}
      phone={phoneNumber}
      instagram={instagram}
      facebook={facebook}
      linkedin={linkedin}
      logo={logoUrl}
      font={applyTheme.font}
      textColor={applyTheme.textColor}
      bgColor={applyTheme.bgColor}
      company={companyName}
    />
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold col-span-full">
          Paramètres de signature
        </h2>

        <div>
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Adresse email</label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Nom de la société</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Téléphone (WhatsApp)</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Instagram (URL)</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Facebook (URL)</label>
          <input
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">LinkedIn (URL)</label>
          <input
            type="text"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Logo (URL)</label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Ou importer un logo local</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Thème</label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="classique">Classique</option>
            <option value="sombre">Sombre</option>
            <option value="professionnel">Professionnel</option>
          </select>
        </div>

        <div className="col-span-full flex space-x-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Aperçu
          </button>
        </div>
      </form>

      {/* MODALE D'APERÇU */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-xl relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-4">Aperçu de la signature</h3>

            <div className="mb-4">
              <button
                onClick={() => setShowHtml(!showHtml)}
                className="bg-gray-200 px-3 py-1 rounded mr-2 hover:bg-gray-300"
              >
                {showHtml ? "Afficher l’aperçu visuel" : "Afficher le HTML"}
              </button>
                
              <button
                onClick={saveToSupabase}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Enregistrer dans Supabase
              </button>
            </div>

            {showHtml ? (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {signatureHTML}
              </pre>
            ) : (
              <div
                className="border p-4 rounded"
                style={{
                  backgroundColor: applyTheme.bgColor,
                }}
              >
                <EmailSignature
                  name={senderName}
                  email={senderEmail}
                  phone={phoneNumber}
                  instagram={instagram}
                  facebook={facebook}
                  linkedin={linkedin}
                  logo={logoUrl}
                  font={applyTheme.font}
                  textColor={applyTheme.textColor}
                  bgColor={applyTheme.bgColor}
                  company={companyName}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmailSignature({
  name,
  email,
  phone,
  instagram,
  facebook,
  linkedin,
  logo,
  font,
  textColor,
  bgColor,
  company,
}: {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  logo: string;
  font: string;
  textColor: string;
  bgColor: string;
  company: string;
}) {
  return (
    <table
      style={{
        fontFamily: font,
        color: textColor,
        backgroundColor: bgColor,
        fontSize: "14px",
      }}
    >
      <tbody>
        <tr>
          <td style={{ paddingRight: "10px" }}>
            {logo && (
              <img
                src={logo}
                alt="Logo"
                style={{ width: "80px", height: "auto", borderRadius: "6px" }}
              />
            )}
          </td>
          <td>
            <strong>{name}</strong>
            <br />
            {company && (
              <span>
                {company}
                <br />
              </span>
            )}
            <a href={`mailto:${email}`} style={{ color: textColor }}>
              {email}
            </a>
            <br />
            {phone && (
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: textColor }}
              >
                WhatsApp : {phone}
              </a>
            )}
            <br />
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: textColor }}
              >
                Instagram
              </a>
            )}
            <br />
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: textColor }}
              >
                Facebook
              </a>
            )}
            <br />
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: textColor }}
              >
                LinkedIn
              </a>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
