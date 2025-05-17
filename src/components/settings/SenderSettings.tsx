import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { supabase } from "../../lib/supabase";
import ThemeCustomizer from "./ThemeCustomizer";
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [signatureTemplate, setSignatureTemplate] = useState("");

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
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
    custom: {
      font: font || "Arial",
      textColor: textColor || "#000000",
      bgColor: bgColor || "#ffffff",
    },
  };
  const uploadLogo = async (file) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("utilisateur non authentifiée!");
      return null;
    }

    const user = session.user;
    const filePath = `logos/${user.id}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("logos") // nom du bucket Supabase
      .upload(filePath, file, {
        upsert: true, // écrase les anciennes versions si elles existent
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Erreur d'upload:", uploadError);
      showError("Échec de l'envoi du logo");
      return null;
    }

    // Génère l'URL publique du fichier
    const { data: publicUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
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
      showError("Utilisateur non connecté");
      return;
    }

    const { error } = await supabase
      .from("email_settings")
      .update({
        email_signature: signatureHTML,
        signature_template: signatureTemplate,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Erreur Supabase:", error);
      showError("Échec de l'enregistrement");
    } else {
      showSuccess("Signature enregistrée avec succès !");
    }
  };
  useEffect(() => {
    const loadFromSupabase = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("utilisateur non authentifiée!");
        return;
      }
      const user = session?.user;
      const { data, error } = await supabase
        .from("email_settings")
        .select("email_signature,signature_template")
        .eq("user_id", user?.id)
        .single();

      if (error || !data?.email_signature) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.email_signature, "text/html");
      const getField = (selector) => {
        const el = doc.querySelector(selector);
        if (!el) return "";
        const text = el.textContent?.trim() || "";
        // S'il y a un ":", on prend ce qu’il y a après, sinon on garde tout
        const parts = text.split(":");
        return parts.length > 1 ? parts.slice(1).join(":").trim() : text;
      };
      setSignatureTemplate(data?.signature_template || "classique");
      setSelectedTheme(data?.signature_template || "classique");
      setSenderName(getField(".signature-nom"));
      setSenderEmail(getField(".signature-email"));
      setCompanyName(getField(".signature-company"));
      setPhoneNumber(getField(".signature-phone"));
      setInstagram(getField(".signature-instagram"));
      setFacebook(getField(".signature-facebook"));
      setRole(getField(".signature-role"));
      setWhatsapp(getField(".signature-whatsapp"));
      setLinkedin(getField(".signature-linkedin"));
      setLogoUrl(
        doc.querySelector(".signature-logo")?.getAttribute("src") || ""
      );
    };

    loadFromSupabase();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalLogo(file); // utile si tu veux prévisualiser dans un <img />

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Utilisateur non authentifié");
      showError("Veuillez vous connecter d'abord");
      return;
    }

    const user = session.user;
    const filePath = `${user.id}/${file.name}`;

    // Upload du fichier vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("logos") // remplace par le nom exact de ton bucket Supabase
      .upload(filePath, file, {
        upsert: true, // autorise le remplacement d'anciens fichiers
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Erreur d'upload:", uploadError);
      showError("Erreur lors de l'envoi du logo");
      return;
    }

    // Récupère l'URL publique du fichier
    const { data: publicUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      setLogoUrl(publicUrlData.publicUrl); // ✔️ Ceci sera utilisé dans ta signature HTML
      showSuccess("Logo uploadé avec succès !");
    } else {
      // alert(error)
      showError("Échec de la récupération de l'URL du logo");
    }
    // alert("terminé")
  };

  const copySignatureToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(signatureHTML);
      showSuccess("Signature copiée dans le presse-papiers !");
    } catch (err) {
      showError("Erreur lors de la copie dans le presse-papiers");
    }
  };

  const signatureHTML = (() => {
    const html = renderToStaticMarkup(
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
    );

    return html;
  })();
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* --- Erreurs ou succès éventuels --- */}
          {error && (
        <div className="fixed p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          {success}
        </div>
      )}
      {/* --- Boutons d'action en colonne verticale --- */}
      <div className="flex flex-row  ">
        <button
          onClick={() => setShowHtml(!showHtml)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 mr-2"
        >
          {showHtml ? "Afficher l’aperçu visuel" : "Afficher le HTML"}
        </button>
        <button
          onClick={saveToSupabase}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
        >
          Enregistrer
        </button>
        <button
          onClick={copySignatureToClipboard}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
        >
          Copier
        </button>
      </div>
      <div className="space-y-4 mb-6">
        {/* Ligne horizontale : combo + options custom si actif */}
        <div className="flex items-end space-x-6">
          {/* Combo Modèle de signature */}
          <div>
            <label className="block font-medium mb-1">
              Modèle de signature
            </label>
            <select
              value={signatureTemplate}
              onChange={(e) => {
                setSignatureTemplate(e.target.value);
                setSelectedTheme(e.target.value);
              }}
              className="border rounded px-3 py-2 min-w-[200px]"
            >
              <option value="classique">Classique</option>
              <option value="sombre">Sombre</option>
              <option value="professionnel">Professionnel</option>
              <option value="custom">Personnalisé</option>
            </select>
          </div>

          {/* Options personnalisées alignées à droite */}
          {selectedTheme === "custom" && (
            <div className="flex items-end space-x-4">
              {/* Police */}
              <div>
                <label className="block font-medium mb-1">Police</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Tahoma">Tahoma</option>
                </select>
              </div>

              {/* Couleur du texte */}
              <div>
                <label className="block font-medium mb-1">
                  Couleur du texte
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-8 border rounded"
                />
              </div>

              {/* Couleur de fond */}
              <div>
                <label className="block font-medium mb-1">
                  Couleur de fond
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-16 h-8 border rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* Import logo, sur une ligne à part */}
        <div>
          <label className="block font-medium mb-1">
            Ou importer un logo local
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
      </div>

  

      {/* --- Contenu principal : formulaire à gauche et aperçu à droite --- */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Formulaire à gauche */}
        <div className="flex-1">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold col-span-full">
              Paramètres de signature
            </h2>

            <div className=" flex flex-col ">
              <div>
                <label className="block font-medium">Nom</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Adresse email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Nom de la société</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Téléphone</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Fonction</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Numéro WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Instagram (URL)</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Facebook (URL)</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">LinkedIn (URL)</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>

              <div>
                <label className="block font-medium">Logo (URL)</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full border rounded px-3 py-2 min-w-[300px]"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Aperçu à droite */}
        <div className="flex-1 bg-white border p-6 rounded-lg shadow space-y-4">
          <h3 className="text-xl font-bold mb-2">Aperçu de la signature</h3>

          {showHtml ? (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {signatureHTML}
            </pre>
          ) : (
            <div
              className="border p-4 rounded"
              style={{ backgroundColor: applyTheme.bgColor }}
            >
              <EmailSignature
                name={senderName}
                email={senderEmail}
                phone={phoneNumber}
                instagram={instagram}
                role={role}
                whatsapp={whatsapp}
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
    </div>
  );
}

function EmailSignature({
  name,
  role,
  email,
  phone,
  whatsapp,
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
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
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
                className="signature-logo"
                style={{ width: "80px", height: "auto", borderRadius: "6px" }}
              />
            )}
          </td>
          <td>
            <strong className="signature-nom">{name}</strong>
            <br />
            {role && (
              <>
                <strong className="signature-role">{role}</strong>
                <br />
              </>
            )}
            {company && (
              <>
                <span className="signature-company">{company}</span>
                <br />
              </>
            )}
            <a
              href={`mailto:${email}`}
              className="signature-email"
              style={{ color: textColor }}
            >
              {email}
            </a>

            {phone && (
              <>
                <br />
                <span className="signature-phone">Tél : {phone}</span>
                <br />
              </>
            )}
            {whatsapp && (
              <div>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="signature-whatsapp"
                  style={{ color: textColor }}
                >
                  WhatsApp : {whatsapp}
                </a>
              </div>
            )}

            {instagram && (
              <div>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="signature-instagram"
                  style={{ color: textColor }}
                >
                  Instagram
                </a>
              </div>
            )}

            {facebook && (
              <div>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="signature-facebook"
                  style={{ color: textColor }}
                >
                  Facebook
                </a>
              </div>
            )}

            {linkedin && (
              <div>
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="signature-linkedin"
                  style={{ color: textColor }}
                >
                  LinkedIn
                </a>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
