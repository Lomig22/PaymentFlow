import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import ThemeCustomizer from "./ThemeCustomizer";
import {
  Code,
  Eye,
  Save,
  Clipboard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [customOpen, setCustomOpen] = useState(false);

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
      showSuccess("Signature enregistré avec succès ! 🎉");
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

  const btnHover = { scale: 1.05, transition: { duration: 0.2 } };
  const iconRotate = { rotate: 90, transition: { duration: 0.3 } };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="err"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 bg-red-50 border-red-200 border p-4 rounded-md text-red-700 shadow-lg"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            key="succ"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 bg-green-50 border-green-200 border p-4 rounded-md text-green-700 shadow-lg"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header flottant */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-20">
        <div className="max-w-5xl mx-auto flex justify-end gap-4 p-4">
          {[
            {
              label: showHtml ? "Aperçu visuel" : "HTML brut",
              icon: showHtml ? <Eye /> : <Code />,
              onClick: () => setShowHtml(!showHtml),
              color: "bg-gray-100",
            },
            {
              label: "Enregistrer",
              icon: <Save />,
              onClick: () => setSuccess("Enregistré !"),
              color: "bg-green-600 text-white",
            },
            {
              label: "Copier",
              icon: <Clipboard />,
              onClick: () => setSuccess("Copié !"),
              color: "bg-blue-600 text-white",
            },
          ].map((btn, i) => (
            <motion.button
              key={i}
              onClick={btn.onClick}
              whileHover={btnHover}
              className={`${btn.color} px-5 py-2 rounded-lg flex items-center gap-2 shadow`}
            >
              {btn.icon}
              <span className="font-semibold">{btn.label}</span>
            </motion.button>
          ))}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="pt-24 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Colonne de configuration */}
        <section className="space-y-6">
          {/* Choix de modèle */}
          <div className="bg-white p-6 rounded-xl shadow relative overflow-hidden">
            <h3 className="text-lg font-bold mb-4">Modèle de signature</h3>
            <div className="flex items-center justify-between">
              <select
                className="border rounded px-4 py-2 w-full"
                onChange={(e) =>
                  e.target.value === "custom"
                    ? setCustomOpen(true)
                    : setCustomOpen(false)
                }
              >
                <option value="classique">Classique</option>
                <option value="sombre">Sombre</option>
                <option value="professionnel">Professionnel</option>
                <option value="custom">Personnalisé</option>
              </select>
              <motion.div
                onClick={() => setCustomOpen(!customOpen)}
                whileHover={{ scale: 1.1 }}
                className="ml-4 cursor-pointer"
              >
                {customOpen ? <ChevronUp /> : <ChevronDown />}
              </motion.div>
            </div>

            {/* Accordéon */}
            <AnimatePresence>
              {customOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 grid grid-cols-1 gap-4"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block mb-1">Police</label>
                      <select
                        className="border rounded w-full px-3 py-2"
                        value={font}
                        onChange={(e) => setFont(e.target.value)}
                      >
                        <option>Arial</option>
                        <option>Times New Roman</option>
                        <option>Courier New</option>
                        <option>Verdana</option>
                        <option>Tahoma</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1">Couleur texte</label>
                      <input
                        type="color"
                        className="w-12 h-12 border rounded"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Couleur fond</label>
                      <input
                        type="color"
                        className="w-12 h-12 border rounded"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Uploader */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-2">Importer un logo</h3>
            <label className="block cursor-pointer bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              Cliquer ou déposer le fichier
            </label>
          </div>
        </section>

        {/* Aperçu / HTML brut */}
        <section>
          <div className="bg-white rounded-xl shadow p-6 h-full">
            {showHtml ? (
              <pre className="max-h-[600px] overflow-auto text-sm bg-gray-50 p-4 rounded">
                {signatureHTML}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
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
                  textColor={textColor}
                  company={companyName}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Formulaire & Preview */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 my-8 px-4">
        {/* Form */}
        <motion.form
          layout
          className="bg-white border p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <h2 className="text-2xl font-semibold col-span-full">
            Paramètres de signature
          </h2>

          {[
            ["Nom complet", senderName, setSenderName],
            ["Email", senderEmail, setSenderEmail],
            ["Société", companyName, setCompanyName],
            ["Téléphone", phoneNumber, setPhoneNumber],
            ["Poste", role, setRole],
            ["WhatsApp", whatsapp, setWhatsapp],
            ["Instagram (URL)", instagram, setInstagram],
            ["Facebook (URL)", facebook, setFacebook],
            ["LinkedIn (URL)", linkedin, setLinkedin],
            ["Logo URL", logoUrl, setLogoUrl],
          ].map(([label, value, setter]) => (
            <div key={label} className="flex flex-col">
              <label className="font-medium mb-1">{label}</label>
              <input
                type={label === "Email" ? "email" : "text"}
                value={value as string}
                onChange={(e) => (setter as any)(e.target.value)}
                className="border rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-300"
              />
            </div>
          ))}
        </motion.form>

        {/* Aperçu final */}
        <motion.div
          layout
          className="bg-white border p-6 rounded-lg shadow-lg space-y-4"
        >
          <h3 className="text-xl font-bold">Aperçu final</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="border p-4 rounded"
            style={{
              backgroundColor: bgColor,
              fontFamily: font,
              color: textColor,
            }}
          >
            <table>
              <tbody>
                <tr>
                  {logoUrl && (
                    <td style={{ paddingRight: 12, verticalAlign: "top" }}>
                      <motion.img
                        src={logoUrl}
                        alt="Logo"
                        className="rounded-md"
                        style={{ width: 80 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    </td>
                  )}
                  <td>
                    <strong style={{ display: "block", fontSize: 16 }}>
                      {senderName}
                    </strong>
                    {role && <div className="italic">{role}</div>}
                    {companyName && <div>{companyName}</div>}
                    <a href={`mailto:${senderEmail}`}>{senderEmail}</a>
                    {phoneNumber && <div>Tél : {phoneNumber}</div>}
                    {whatsapp && (
                      <div>
                        <a href={`https://wa.me/${whatsapp}`} target="_blank">
                          WhatsApp
                        </a>
                      </div>
                    )}
                    {instagram && (
                      <div>
                        <a href={instagram} target="_blank">
                          Instagram
                        </a>
                      </div>
                    )}
                    {facebook && (
                      <div>
                        <a href={facebook} target="_blank">
                          Facebook
                        </a>
                      </div>
                    )}
                    {linkedin && (
                      <div>
                        <a href={linkedin} target="_blank">
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        © 2025 MonApp Signature
      </footer>
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
  textColor,
  company,
}: {
  [K: string]: string;
}) {
  return (
    <table style={{ color: textColor, fontSize: 14 }}>
      <tbody>
        <tr>
          {logo && (
            <td style={{ paddingRight: 12, verticalAlign: "top" }}>
              <motion.img
                src={logo}
                alt="Logo"
                className="rounded-md"
                style={{ width: 80 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </td>
          )}
          <td>
            <strong style={{ display: "block", fontSize: 16 }}>{name}</strong>
            {role && <div style={{ fontStyle: "italic" }}>{role}</div>}
            {company && <div>{company}</div>}
            <a href={`mailto:${email}`} style={{ color: textColor }}>
              {email}
            </a>
            {phone && <div>Tél : {phone}</div>}
            {whatsapp && (
              <div>
                <a href={`https://wa.me/${whatsapp}`} target="_blank">
                  WhatsApp
                </a>
              </div>
            )}
            {instagram && (
              <div>
                <a href={instagram} target="_blank">
                  Instagram
                </a>
              </div>
            )}
            {facebook && (
              <div>
                <a href={facebook} target="_blank">
                  Facebook
                </a>
              </div>
            )}
            {linkedin && (
              <div>
                <a href={linkedin} target="_blank">
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