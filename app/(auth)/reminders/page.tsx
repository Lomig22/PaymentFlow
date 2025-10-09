import { fetchRecords } from "../../../src/lib/supabase/server";
import RemindersClient from "./ReminderClient";

export default async function ReminderList() {
  const records = await fetchRecords();
  return <RemindersClient records={records} />
};
