import { notFound } from "next/navigation";
import Concept from "../Concept";

export function generateStaticParams() {
  return ["clarity", "companion", "afterhours"].map(concept => ({ concept }));
}

export default async function ConceptPage({ params }: { params: Promise<{ concept: string }> }) {
  const { concept } = await params;
  if (concept !== "clarity" && concept !== "companion" && concept !== "afterhours") notFound();
  return <Concept kind={concept} />;
}
