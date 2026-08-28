/**
 * CodePlay Insights visual identity for featured images. A fixed house
 * style plus per-category subject/environment guidance, and the negative
 * requirements every prompt carries.
 *
 * Goal: premium technology-publication editorial illustration — not cheap
 * generic AI art.
 */

export const HOUSE_VISUAL_STYLE =
  "professional editorial technology illustration for a premium tech publication, modern and minimal, clean composition, one strong focal subject, generous negative space, cinematic soft studio lighting with gentle rim light, subtle futuristic visual language, restrained cool palette with a single warm accent, shallow depth of field, high readability when cropped to a 16:9 thumbnail, not overcrowded, no busy background";

export const HOUSE_MOOD =
  "calm, confident, credible, forward-looking; think the cover illustration of a respected technology magazine, not stock art";

/** Absolute negatives — appended to every prompt. */
export const NEGATIVE_REQUIREMENTS = [
  "no text",
  "no words",
  "no letters",
  "no numbers",
  "no captions",
  "no watermark",
  "no signature",
  "no logos",
  "no brand marks",
  "no user interface",
  "no app screenshots",
  "no fake dashboards",
  "no readable source code",
  "no charts with labels",
  "no real people or recognizable faces",
  "no deformed hands",
  "no distorted geometry",
  "no cluttered composition",
  "no lens flare overload",
  "no rainbow gradients",
  "no clichéd glowing blue brain",
  "not a stock photo",
  "not a meme",
];

export interface CategoryVisual {
  subject: string;
  environment: string;
  camera: string;
}

const DEFAULT_VISUAL: CategoryVisual = {
  subject: "an abstract sculptural form representing the idea in the story",
  environment: "a clean minimal studio set with soft gradient backdrop",
  camera: "eye-level three-quarter view, 50mm lens feel",
};

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  "artificial-intelligence": {
    subject:
      "an abstract neural-interface or model-architecture concept — layered translucent nodes, flowing connective geometry, or stylised AI accelerator hardware",
    environment: "a dark, softly lit studio void with volumetric light",
    camera: "slow push-in, slightly low angle, macro-to-mid focal feel",
  },
  "software-development": {
    subject:
      "a code-editor-inspired abstract composition — floating panels, indentation rhythm, bracket and cursor motifs rendered as sculpture (never real readable code)",
    environment: "a bright minimal workspace with soft shadows",
    camera: "flat-lay or gentle isometric perspective",
  },
  "web-development": {
    subject:
      "layered translucent browser-window planes and responsive grid geometry as an abstract sculpture",
    environment: "a clean gradient studio backdrop",
    camera: "three-quarter isometric view",
  },
  "mobile-development": {
    subject:
      "a sleek modern handset or foldable device as a hero object, screen showing only abstract light — no UI",
    environment: "a minimal pedestal set with directional key light",
    camera: "product hero shot, 35mm, slight top-down",
  },
  "game-development": {
    subject:
      "a stylised game-development environment concept — wireframe-to-render transition, engine viewport gizmos as abstract forms, cinematic asset lighting",
    environment: "a moody studio with coloured practical lights",
    camera: "cinematic wide, shallow depth of field",
  },
  gaming: {
    subject:
      "cinematic gaming hardware — a controller, console silhouette or handheld — treated as a premium product still",
    environment: "a dark set with neon-adjacent accent lighting, kept subtle",
    camera: "dramatic low hero angle, 85mm",
  },
  "gaming-community": {
    subject:
      "an abstract representation of a player community — connected constellation of stylised avatars or arcade-glow motifs, no real faces",
    environment: "a dark studio with soft bokeh",
    camera: "mid shot, shallow focus",
  },
  cybersecurity: {
    subject:
      "a security-architecture concept — layered shields, lock geometry, network mesh, or cryptographic lattice as clean sculpture",
    environment: "a cool dark infrastructure-inspired space",
    camera: "straight-on, symmetrical, architectural",
  },
  "cloud-and-devops": {
    subject:
      "a data-center or distributed-systems concept — orderly rows of abstract server monoliths or a flowing pipeline of light between nodes",
    environment: "a vast clean hall with cool ambient light",
    camera: "one-point perspective down a corridor",
  },
  "developer-tools": {
    subject:
      "a toolmaker's bench of abstract instruments — CLI prompt caret, terminal blocks, plug-in modules rendered as tactile objects",
    environment: "a warm minimal desk set",
    camera: "top-down flat-lay",
  },
  "hardware-and-gpus": {
    subject:
      "a GPU, chip die or computing module as a jewel-like hero object, exposed heatsink fins and traces as abstract texture",
    environment: "a dark studio with hard raking light",
    camera: "macro product shot, 100mm",
  },
  startups: {
    subject:
      "an early-stage-growth concept — a single sprouting geometric form, a launch trajectory arc, or stacked building blocks",
    environment: "a bright optimistic gradient set",
    camera: "clean eye-level, centred",
  },
  saas: {
    subject:
      "a subscription-software concept — interlocking modular panels or a recurring-cycle motif as clean sculpture",
    environment: "a light minimal studio",
    camera: "three-quarter view",
  },
  "big-tech": {
    subject:
      "a scale-and-strategy concept — monolithic abstract architecture, tectonic plates, or a chessboard of light",
    environment: "a dramatic wide studio with long shadows",
    camera: "wide establishing angle, low horizon",
  },
  "open-source": {
    subject:
      "a collaborative-network concept — a lattice of contributing nodes, a shared keystone form, or interlocking hands abstracted to geometry",
    environment: "a warm communal-feeling set",
    camera: "mid shot, balanced",
  },
  "emerging-technology": {
    subject:
      "a frontier-technology concept — robotics joint, spatial-computing volume, or novel-material texture as a hero form",
    environment: "a clean speculative studio void",
    camera: "slow orbit, cinematic",
  },
};

export function categoryVisual(slug: string | null): CategoryVisual {
  return (slug && CATEGORY_VISUALS[slug]) || DEFAULT_VISUAL;
}
