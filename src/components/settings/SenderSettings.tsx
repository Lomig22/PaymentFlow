import React, { useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export default function SignatureSettings() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [localLogo, setLocalLogo] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [font, setFont] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const signatureHTML = renderToStaticMarkup(
      <EmailSignature
        name={senderName}
        email={senderEmail}
        phone={phoneNumber}
        instagram={instagram}
        logo={logoUrl}
        font={font}
        textColor={textColor}
        bgColor={bgColor}
      />
    );
    console.log('Signature HTML:', signatureHTML);
    // Tu peux aussi envoyer ce HTML au backend ici
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl p-6 border rounded-md bg-white">
      <h2 className="text-xl font-semibold">Paramètres de signature</h2>

      <div>
        <label className="block font-medium">Nom</label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Adresse email</label>
        <input
          type="email"
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Téléphone (WhatsApp)</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Instagram (lien complet)</label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Logo (depuis l'URL)</label>
        <input
          type="text"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Ou importer un logo local</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div>
        <label className="block font-medium">Police</label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="Arial">Arial</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>

      <div className="flex space-x-4">
        <div>
          <label className="block font-medium">Couleur du texte</label>
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Fond</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Générer la signature
      </button>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Aperçu :</h3>
        <div className="border p-4 rounded" style={{ backgroundColor: bgColor }}>
          <EmailSignature
            name={senderName}
            email={senderEmail}
            phone={phoneNumber}
            instagram={instagram}
            logo={logoUrl}
            font={font}
            textColor={textColor}
            bgColor={bgColor}
          />
        </div>
      </div>
    </form>
  );
}

function EmailSignature({
  name,
  email,
  phone,
  instagram,
  logo,
  font,
  textColor,
}: {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  logo: string;
  font: string;
  textColor: string;
  bgColor: string;
}) {
  return (
    <table style={{ fontFamily: font, color: textColor, fontSize: '14px' }}>
      <tbody>
        <tr>
          <td style={{ paddingRight: '10px' }}>
            {logo && (
              <img
                src={logo}
                alt="Logo"
                style={{ width: '80px', height: 'auto', borderRadius: '6px' }}
              />
            )}
          </td>
          <td>
            <strong>{name}</strong>
            <br />
            <a href={`mailto:${email}`} style={{ color: textColor }}>
              {email}
            </a>
            <br />
            {phone && (
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" style={{ color: textColor }}>
                WhatsApp : {phone}
              </a>
            )}
            <br />
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ color: textColor }}>
                Instagram
              </a>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
