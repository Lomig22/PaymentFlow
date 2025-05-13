import { isBefore } from "date-fns";

export function getReminderStatus(receivable: any): { title: string, icon: "info" | "pause" | null } {
  const now = new Date();
  const issues: string[] = [];

  // Vérifie les templates manquants quand les relances sont activées
  if (receivable.client?.pre_reminder_enable && !receivable.client?.pre_reminder_template)
    issues.push("la pré-relance est activée sans template");
  if (receivable.client?.reminder_enable_1 && !receivable.client?.reminder_template_1)
    issues.push("la relance 1 est activée sans template");
  if (receivable.client?.reminder_enable_2 && !receivable.client?.reminder_template_2)
    issues.push("la relance 2 est activée sans template");
  if (receivable.client?.reminder_enable_3 && !receivable.client?.reminder_template_3)
    issues.push("la relance 3 est activée sans template");
  if (receivable.client?.reminder_enable_final && !receivable.client?.reminder_template_final)
    issues.push("la relance finale est activée sans template");

  // Vérifie si une date est dépassée
  const datesToCheck = [
    receivable.pre_reminder_date,
    receivable.reminder_date_1,
    receivable.reminder_date_2,
    receivable.reminder_date_3,
    receivable.reminder_date_final
  ];

  const hasPastDate = datesToCheck.some(date => date && isBefore(new Date(date), now));
  if (hasPastDate) issues.push("une ou plusieurs dates de relance sont dépassées");

  // Détermine l’icône et le titre à afficher
  if (issues.length > 0) {
    return { title: issues.join(", "), icon: "info" };
  }

  if (!receivable.automatic_reminder) {
    return { title: "Relance en pause", icon: "pause" };
  }

  return { title: "", icon: null };
}
