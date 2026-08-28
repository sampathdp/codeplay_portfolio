import { useState } from "react";
import { SiLinkedin, SiFacebook, SiX } from "react-icons/si";
import { Check, Link2 } from "lucide-react";
import { shareUrls, copyToClipboard } from "@/lib/insights/shareUrls";

/**
 * LinkedIn / Facebook / X share links + copy-link. Plain anchors — no
 * third-party scripts loaded.
 */
export default function ShareControls({
  url,
  title,
  compact = false,
  onShare,
}: {
  url: string;
  title: string;
  compact?: boolean;
  onShare?: (network: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const targets = shareUrls(url, title);

  const cls =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "flex-wrap"}`}>
      {!compact && (
        <span className="mr-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Share
        </span>
      )}
      <a className={cls} href={targets.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" onClick={() => onShare?.("linkedin")}>
        <SiLinkedin className="h-4 w-4" aria-hidden="true" />
      </a>
      <a className={cls} href={targets.x} target="_blank" rel="noopener noreferrer" aria-label="Share on X" onClick={() => onShare?.("x")}>
        <SiX className="h-4 w-4" aria-hidden="true" />
      </a>
      <a className={cls} href={targets.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" onClick={() => onShare?.("facebook")}>
        <SiFacebook className="h-4 w-4" aria-hidden="true" />
      </a>
      <button
        type="button"
        className={cls}
        aria-label={copied ? "Link copied" : "Copy link"}
        onClick={async () => {
          if (await copyToClipboard(url)) {
            setCopied(true);
            onShare?.("copy_link");
            setTimeout(() => setCopied(false), 2000);
          }
        }}
      >
        {copied ? (
          <Check className="h-4 w-4 text-primary" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
