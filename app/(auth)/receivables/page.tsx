import { createClient } from "../../../src/lib/supabase/server";
import ReceivablesList from "./ReceivableList";

export default async function ReceivablePage() {

    try {
        const supabase = await createClient();
        const { data: user, error } = await supabase.auth.getUser();
        if (error) {
            return <></>
        }
        return <ReceivablesList user={user.user} />
    } catch (error) {
        console.log("Erreur lors de la récupération de l'abonnement de l'utilisateur");
        return <></>;
    }
};