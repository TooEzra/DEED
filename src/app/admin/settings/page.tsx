import { getPropertySettings } from "@/services/admin-lists.service";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings;
  try {
    settings = await getPropertySettings();
  } catch {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        Unable to load settings.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Property information for THE DEED HOSTELS</p>
      </div>
      <SettingsForm
        initial={{
          name: settings?.name || "THE DEED HOSTELS",
          location: settings?.location || "",
          phone: settings?.phone || "",
          email: settings?.email || "",
          description: settings?.description || "",
          rentDueDay: settings?.rentDueDay ?? 5,
          lateFeeAmount: settings?.lateFeeAmount ? Number(settings.lateFeeAmount) : 0,
        }}
      />
    </div>
  );
}