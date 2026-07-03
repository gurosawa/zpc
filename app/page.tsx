import { HomeAtlasExperience } from "@/components/atlas/home-atlas-experience";
import { GuideShell } from "@/components/guide-shell";
import { getChapters, getTocSections } from "@/lib/content";

export default function Home() {
  const chapters = getChapters();
  const tocSections = getTocSections();

  return (
    <GuideShell chapters={chapters}>
      <HomeAtlasExperience tocSections={tocSections} />
    </GuideShell>
  );
}
