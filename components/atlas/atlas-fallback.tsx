import { atlasLayers, getActiveLayerIds } from "@/components/atlas/atlas-data";

type AtlasFallbackProps = {
  activeChapterSlug?: string | null;
  className?: string;
};

export function AtlasFallback({ activeChapterSlug = null, className }: AtlasFallbackProps) {
  const activeLayerIds = getActiveLayerIds(activeChapterSlug);
  const hasActiveLayer = activeLayerIds.size > 0;

  return (
    <div
      className={["atlas-fallback", className].filter(Boolean).join(" ")}
      role="img"
      aria-label="Seven-layer zkTLS evidence stack from source API response through TLS, transcript, redaction, witness, proof, and verifier decision."
    >
      <ol className="atlas-fallback-stack" aria-hidden="true">
        {atlasLayers.map((layer) => {
          const isActive = activeLayerIds.has(layer.id);

          return (
            <li
              className={[
                "atlas-fallback-layer",
                hasActiveLayer && !isActive ? "is-dimmed" : "",
                isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={layer.id}
            >
              <span>{layer.label}</span>
              <code>{layer.fragment}</code>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
