import React, { useEffect, useState } from "react";
import SignatureImageCropper from "./SignatureImageCropper";
import { renderToStaticMarkup } from "react-dom/server";
import { supabase } from "../../lib/supabase";
import ThemeCustomizer from "./ThemeCustomizer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Eye,
  Save,
  Clipboard,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useAbonnement } from "../context/AbonnementContext";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

type SignatureSettingsProps = {
  onDirtyChange?: (dirty: boolean) => void;
};

export default function SignatureSettings({ onDirtyChange }: SignatureSettingsProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Notifie le parent (Settings) quand l'état dirty change
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handler global pour intercepter les clics sur les liens internes
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (
        anchor &&
        anchor instanceof HTMLAnchorElement &&
        anchor.href &&
        anchor.origin === window.location.origin &&
        anchor.pathname !== location.pathname &&
        !anchor.href.startsWith("mailto:") &&
        !anchor.href.startsWith("tel:")
      ) {
        if (hasUnsavedChanges) {
          e.preventDefault();
          Swal.fire({
            title: 'Modifications non enregistrées',
            text: 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Continuer sans enregistrer',
            cancelButtonText: 'Annuler',
            reverseButtons: true,
            customClass: {
              confirmButton: 'bg-yellow-600 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-700',
              cancelButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
            },
          }).then((result) => {
            if (result.isConfirmed) {
              navigate(anchor.pathname + anchor.search + anchor.hash);
            }
          });
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [hasUnsavedChanges, location.pathname]);

  // Fonction pour continuer la navigation après l'avertissement
  const handleContinue = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setShowUnsavedWarning(false);
      setPendingNavigation(null);
    }
  };

  // Détection navigation avec changements non sauvegardés
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const [rawSignatureImg, setRawSignatureImg] = useState<string | null>(null);
  const { checkAbonnement } = useAbonnement();
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
  const [role, setRole] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [signatureTemplate, setSignatureTemplate] = useState<string>("");
  const [customOpen, setCustomOpen] = useState(false);

  // Helpers pour marquer la page comme "modifiée"
  const markUnsaved = () => setHasUnsavedChanges(true);

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
    return true;
  };

  const removeLogoUrl = () => {
    setLogoUrl("");
    setLocalLogo(null);
    showSuccess("Logo supprimé avec succès !");
    markUnsaved();
  };

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

  const uploadLogo = async (file: File) => {
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

  const applyTheme = themes[selectedTheme as keyof typeof themes];

  useEffect(() => {
    if (selectedTheme === "custom") {
      setCustomOpen(true);
    } else {
      setCustomOpen(false);
    }
  }, [selectedTheme]);

  const saveToSupabase = async () => {
    setHasUnsavedChanges(false);
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
      const getField = (selector: string) => {
        const el = doc.querySelector(selector);
        if (!el) return "";
        const text = el.textContent?.trim() || "";
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
      if (data?.signature_template === "custom") {
        const containerDiv = doc.querySelector(
          "div[style*='background-color']"
        );
        const table = doc.querySelector("table[style]");

        const extractInlineStyle = (
          el: Element | null,
          prop: string
        ): string => {
          if (!el) return "";
          const styleAttr = el.getAttribute("style") || "";
          const match = styleAttr.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`));
          return match ? match[1].trim() : "";
        };

        const bg =
          extractInlineStyle(containerDiv, "background-color") || "#ffffff";
        const color = extractInlineStyle(table, "color") || "#000000";
        const font = extractInlineStyle(table, "font-family") || "Arial";

        setBgColor(bg);
        setTextColor(color);
        setFont(font);
      }
    };

    loadFromSupabase();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const isValidSize = await new Promise<boolean>((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
  
      reader.onload = (event) => {
        if (!event.target?.result) return reject("Erreur de lecture du fichier");
        img.src = event.target.result as string;
      };
  
      img.onload = () => {
        const isValid = img.width <= 300 && img.height <= 100;
        resolve(isValid);
      };
  
      img.onerror = () => reject("Erreur de chargement de l'image");
  
      reader.readAsDataURL(file);
    });
  
    if (!isValidSize) {
      showError("L'image dépasse les dimensions maximales de 300px x 100px.");
      return;
    }
  
    setLocalLogo(file); // utile pour prévisualiser
  
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
  
    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });
  
    if (uploadError) {
      console.error("Erreur d'upload:", uploadError);
      showError("Erreur lors de l'envoi du logo");
      return;
    }
  
    const { data: publicUrlData } = supabase.storage
      .from("logos")
      .getPublicUrl(filePath);
  
    if (publicUrlData?.publicUrl) {
      setLogoUrl(publicUrlData.publicUrl);
      showSuccess("Logo uploadé avec succès !");
    } else {
      showError("Échec de la récupération de l'URL du logo");
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
          removeLogoUrl={removeLogoUrl}
        />
      </div>
    );

    return html;
  })();

  const btnHover = { scale: 1.05, transition: { duration: 0.2 } };
  const iconRotate = { rotate: 90, transition: { duration: 0.3 } };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as typeof signatureTemplate;
    setSignatureTemplate(value);
    setSelectedTheme(value);
    setCustomOpen(value === "custom");
    markUnsaved();
  };

  const handleToggle = () => {
    // si on ouvre, on passe en "custom"
    if (!customOpen) {
      setSignatureTemplate("custom");
      setSelectedTheme("custom");
      setCustomOpen(true);
    } else {
      // si on ferme, on revient à la 1re option non-custom
      setSignatureTemplate("classique");
      setSelectedTheme("classique");
      setCustomOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
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

      <main className="flex flex-col md:flex-row gap-6">
        <div className="bg-white rounded-xl shadow relative flex-1 overflow-hidden">
          <div className=" p-6">
            <h3 className="text-lg font-bold mb-4">Modèle de signature</h3>
            <div className="flex items-center justify-between">
              <select
                value={signatureTemplate}
                onChange={handleSelectChange}
                className="border rounded px-4 py-2 w-full"
              >
                <option value="classique">Classique</option>
                <option value="sombre">Sombre</option>
                <option value="professionnel">Professionnel</option>
                <option value="custom">Personnalisé</option>
              </select>

              {/* Toggle custom */}
              <motion.div
                onClick={handleToggle}
                whileHover={{ scale: 1.1 }}
                className="ml-4 cursor-pointer text-gray-600"
              >
                {customOpen ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
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
                        onChange={(e) => {
                          e.stopPropagation();
                          const allowed = onClick(e as any);
                          if (!allowed) return;
                          setFont(e.target.value);
                          markUnsaved();
                        }}
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
                        onChange={(e) => {
                          e.stopPropagation();
                          const allowed = onClick(e as any);
                          if (!allowed) return;
                          setTextColor(e.target.value);
                          markUnsaved();
                        }}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Couleur fond</label>
                      <input
                        type="color"
                        className="w-12 h-12 border rounded"
                        value={bgColor}
                        onChange={(e) => {
                          e.stopPropagation();
                          const allowed = onClick(e as any);
                          if (!allowed) return;
                          setBgColor(e.target.value);
                          markUnsaved();
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl flex-1 shadow">
          <h3 className="text-lg font-bold mb-2">Importer un logo / image de signature</h3>
          <label className="block cursor-pointer bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                e.stopPropagation();
                const allowed = onClick(e as any);
                if (!allowed) return;
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  // Vérifie le type MIME
                  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                    showError("Vous ne pouvez importer que des fichiers JPEG ou PNG.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setRawSignatureImg(ev.target?.result as string);
                    markUnsaved();
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            Importer un fichier
          </label>
          {rawSignatureImg && (
            <div className="my-4">
              <SignatureImageCropper
                image={rawSignatureImg}
                aspect={1}
                onChange={(croppedImg) => {
                  // croppedImg est un dataURL (base64) du cropper
                  // On le convertit en blob pour l'upload
                  fetch(croppedImg)
                    .then((res) => res.blob())
                    .then(async (blob) => {
                      // Crée un fichier à partir du blob (nom générique)
                      const file = new File([blob], `logo_cropped_${Date.now()}.png`, {
                        type: blob.type,
                      });
                      // Upload sur Supabase
                      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                      if (sessionError || !session) {
                        showError("Veuillez vous connecter d'abord");
                        return;
                      }
                      const user = session.user;
                      const filePath = `${user.id}/${file.name}`;
                      const { error: uploadError } = await supabase.storage
                        .from("logos")
                        .upload(filePath, file, { upsert: true, contentType: file.type });
                      if (uploadError) {
                        showError("Erreur lors de l'envoi du logo");
                        return;
                      }
                      const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(filePath);
                      if (publicUrlData?.publicUrl) {
                        setLogoUrl(publicUrlData.publicUrl);
                        setRawSignatureImg(null); // masque le cropper après validation
                        setSuccess('Logo rogné et enregistré avec succès !');
                        setTimeout(() => setSuccess(null), 2500);
                        markUnsaved();
                      } else {
                        showError("Échec de la récupération de l'URL du logo");
                      }
                    });
                }}
              />
              <div className="text-xs text-gray-500 mt-1">Format conseillé : 120x120px (ratio 1:1, carré). Vous pouvez rogner et ajuster l’aperçu avant validation.</div>
            </div>
          )}
        </div>
      </main>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <motion.form
            layout
            className="bg-white border p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <h2 className="text-2xl font-semibold col-span-full">
              Paramètres de signature
            </h2>

            {([
              ["Nom complet", senderName, setSenderName],
              ["Email", senderEmail, setSenderEmail],
              ["Société", companyName, setCompanyName],
              ["Téléphone", phoneNumber, setPhoneNumber],
              ["Poste", role, setRole],
              ["WhatsApp", whatsapp, setWhatsapp],
              ["Instagram (URL)", instagram, setInstagram],
              ["Facebook (URL)", facebook, setFacebook],
              ["LinkedIn (URL)", linkedin, setLinkedin],
              ["Logo URL", logoUrl, (v: string) => { setLogoUrl(v); markUnsaved(); }],
            ] as [string, string, React.Dispatch<React.SetStateAction<string>>][]).map(([label, value, setter], idx) => (
              <div key={idx} className="flex flex-col">
                <label className="font-medium mb-1">{label}</label>
                <input
                  type={label === "Email" ? "email" : "text"}
                  className="border rounded px-3 py-2"
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (typeof setter === 'function') setter(e.target.value);
                    markUnsaved();
                  }}
                />
              </div>
            ))}
          </motion.form>
        </div>

        <div className="flex-1 min-w-0 bg-white border p-6 rounded-lg shadow space-y-4">
          <h3 className="text-xl font-bold mb-2">Aperçu de la signature</h3>

          {showHtml ? (
            <pre className="max-h-[600px] overflow-auto text-sm bg-gray-50 p-4 rounded">
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
                logo={rawSignatureImg || logoUrl}
                font={applyTheme.font}
                textColor={applyTheme.textColor}
                bgColor={applyTheme.bgColor}
                company={companyName}
                removeLogoUrl={removeLogoUrl}
              />
            </div>
          )}
        </div>
      </div>

      <header className="flex flex-col md:flex-row gap-6">
        <div className="max-w-5xl mx-auto flex justify-end gap-4 p-4">
          {[
            {
              label: showHtml ? "Aperçu visuel" : "HTML brut",
              icon: showHtml ? <Eye /> : <Code />,
              onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                const allowed = onClick(e);
                if (!allowed) return;
                setShowHtml(!showHtml);
              },
              color: "bg-gray-100",
            },
            {
              label: "Enregistrer",
              icon: <Save />,
              onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                const allowed = onClick(e);
                if (!allowed) return;
                saveToSupabase();
              },
              color: "bg-green-600 text-white",
            },
            {
              label: "Copier",
              icon: <Clipboard />,
              onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                const allowed = onClick(e);
                if (!allowed) return;
                copySignatureToClipboard();
              },
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

      {/* Notification de succès logo */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow z-50 transition-all">
          {success}
        </div>
      )}

      {/* Bannière d’avertissement navigation */}
      {showUnsavedWarning && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-6 py-3 rounded shadow z-50 transition-all font-semibold flex items-center gap-4">
          ⚠️ Vous avez des modifications non enregistrées. Cliquez sur « Enregistrer » pour sauvegarder, ou
          <button
            className="ml-2 px-3 py-1 rounded bg-yellow-600 text-white font-bold hover:bg-yellow-700"
            onClick={handleContinue}
          >
            Continuer quand même
          </button>
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
  removeLogoUrl,
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
  removeLogoUrl: () => void;
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
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={logo}
                  alt="Logo"
                  className="signature-logo"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid #eee',
                  }}
                />
              </div>
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
