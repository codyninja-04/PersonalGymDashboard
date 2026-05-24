import { motion } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { MeasurementsForm } from "@/components/body/MeasurementsForm";
import { MeasurementsChart } from "@/components/body/MeasurementsChart";
import { PhotoGrid } from "@/components/body/PhotoGrid";
import { fetchMeasurementsAction } from "@/app/actions/measurements";
import { BodyHero } from "@/components/body/BodyHero";

void motion;

export default async function BodyPage() {
  const measurements = await fetchMeasurementsAction();

  return (
    <div className="space-y-6">
      <TopBar />
      <BodyHero count={measurements.length} />
      <MeasurementsForm />
      <MeasurementsChart measurements={measurements} />
      <PhotoGrid />
    </div>
  );
}
