import { DownloadExperience } from "@/components/download/download-gate";

export default function DownloadPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string }>;
}) {
  return <DownloadExperience searchParams={searchParams} />;
}
