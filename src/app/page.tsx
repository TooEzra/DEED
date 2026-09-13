import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  switch (session.role) {
    case "ADMIN":
      redirect("/admin");
    case "CARETAKER":
      redirect("/caretaker");
    case "TENANT":
      redirect("/tenant");
    default:
      redirect("/login");
  }
}
