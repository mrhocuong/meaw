import { getCMSData } from "@/lib/db";
import SoumakiHome from "@/components/SoumakiHome";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const data = getCMSData();
  return <SoumakiHome initialData={data} />;
}
