import React, { useEffect, useState } from "react";
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
      setSignatureTemplate(data?.signature_template || "Classique");
      setSelectedTheme(data?.signature_template)
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
  const copySignatureToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(signatureHTML);
      showSuccess("Signature copiée dans le presse-papiers !");
    } catch (err) {
      showError("Erreur lors de la copie dans le presse-papiers");
    }
  };

  const signatureHTML = renderToStaticMarkup(
    <EmailSignature
      name={senderName}
      role={role}
      email={senderEmail}
      phone={phoneNumber}
      whatsapp={whatsapp}
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
          <label className="block font-medium">Téléphone </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Fonction</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Numéro WhatsApp</label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
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
          <label className="block font-medium">Modèle de signature</label>
          <select
            value={signatureTemplate}
            onChange={(e) => {
              setSignatureTemplate(e.target.value);
              setSelectedTheme(e.target.value);
            }}
            className="w-full border rounded px-3 py-2"
          >
            <option value="classique">Classique</option>
            <option value="sombre">Sombre</option>
            <option value="professionnel">Professionnel</option>
            <option value="custom">Personnalisé</option>
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
              <button
                onClick={copySignatureToClipboard}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2"
              >
                Copier 
              </button>
            </div>
                      {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
              {success}
            </div>
          )}
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
                <span className="signature-role">{role}</span>
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
            <br />
            {phone && (
              <>
                <span className="signature-phone">Tél : {phone}</span>
                <br />
              </>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="signature-whatsapp"
                style={{ color: textColor }}
              >
                WhatsApp : {whatsapp}
              </a>
            )}
            <br />
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="signature-instagram"
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
                className="signature-facebook"
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
                className="signature-linkedin"
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
