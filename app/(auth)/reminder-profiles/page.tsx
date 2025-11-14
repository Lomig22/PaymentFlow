import React from "react";
import ReminderProfilesClient from "./ReminderProfileClient";
import { fetchProfiles } from "../../../src/lib/supabase/server";

export default async function ReminderProfilesPage() {

  const profiles = await fetchProfiles();

  return <ReminderProfilesClient profiles={profiles} />;
}