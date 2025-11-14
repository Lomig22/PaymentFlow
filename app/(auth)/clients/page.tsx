import { fetchAbonnementInfo } from "../../../src/lib/supabase/server";
import ClientPageClient from "./ClientPageclient";

export type SelectedPage = "client" | "unknown";

export default async function ClientPage() {

  try {
    const { isExpired } = await fetchAbonnementInfo();
    if (isExpired) {
      return <></>
    }
  } catch (error) {
    console.log("Erreur lors de la récupération de l'abonnement");
    return <></>;
  }
  return <ClientPageClient />
};
