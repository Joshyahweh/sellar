import { DownloadExperience } from "@/components/download/download-gate";

export default function DownloadReadyPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>;
}) {
  return <DownloadExperience searchParams={searchParams} />;
}
