import { supabase } from "./supabase";
import { Notification } from "../types/database";

export  async function saveNotification(notification:Notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification]);
  console.log("notifications: ",notification);
  
    if (error) {
      console.error('Erreur lors de la sauvegarde de la notification :', error);
      throw error;
    }
  
    return data;
  }