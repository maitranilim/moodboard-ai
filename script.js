const moodForm = document.getElementById("moodForm");
const moodInput = document.getElementById("moodInput");
const moodGrid = document.getElementById("moodGrid");
const moodStatus = document.getElementById("moodStatus");

const moodPalettes = {
  calm: ["#f5f8f6", "#e7f0ef", "#6f9c8f", "#446f65"],
  joyful: ["#fff9ec", "#f7e9b7", "#e8a642", "#9b6728"],
  melancholy: ["#f4f5f7", "#dce3eb", "#7f90a5", "#48576b"],
  romantic: ["#fff5f5", "#f3d8dc", "#c97786", "#854b59"],
  energetic: ["#fff7ed", "#fde6cc", "#e77943", "#9c4628"],
  dreamy: ["#f7f6fb", "#e6e1ef", "#9b8bb8", "#64567e"],
  focused: ["#f5f7f4", "#dfe8dc", "#708d6d", "#425d48"],
  cozy: ["#fbf6ef", "#ead9c2", "#b88759", "#745439"],
  anxious: ["#f7f6f1", "#e7dfcf", "#9c8d6b", "#61583f"],
  angry: ["#fff3ef", "#f4c9bd", "#c35f45", "#7a3528"],
  hopeful: ["#f6fbf4", "#dbeed0", "#7fad67", "#526f41"],
  lonely: ["#f4f6f8", "#d8e0e8", "#7891aa", "#495e73"],
  tired: ["#f8f6f2", "#e4ddd3", "#9a8875", "#615244"],
  confident: ["#f5f8fb", "#dbe7ef", "#507fa2", "#304e68"],
  inspired: ["#fff8f2", "#efdcc9", "#be7d59", "#744e3b"],
  nostalgic: ["#fbf4ec", "#ead4bd", "#b17d52", "#714f35"],
  grateful: ["#fff8ef", "#f1dfbd", "#c89448", "#745528"],
  curious: ["#f3f8f8", "#d5e9e8", "#5f9c9a", "#3b6263"]
};

const moodTerms = {
  calm: "calm,soft,nature,minimal",
  joyful: "joyful,sunlight,flowers,color",
  melancholy: "melancholy,rain,window,blue",
  romantic: "romantic,flowers,soft,pink",
  energetic: "energetic,city,bright,motion",
  dreamy: "dreamy,clouds,pastel,soft",
  focused: "focused,desk,minimal,quiet",
  cozy: "cozy,interior,warm,coffee",
  anxious: "anxious,storm,shadow,abstract",
  angry: "angry,red,dramatic,texture",
  hopeful: "hopeful,sunrise,green,light",
  lonely: "lonely,blue,empty,street",
  tired: "tired,bed,soft,quiet",
  confident: "confident,architecture,bold,portrait",
  inspired: "inspired,studio,art,creative",
  nostalgic: "nostalgic,film,vintage,warm",
  grateful: "grateful,golden,home,light",
  curious: "curious,books,travel,details"
};

const moodAliases = {
  breathe: "calm",
  breathing: "calm",
  chill: "calm",
  chilled: "calm",
  chilling: "calm",
  ease: "calm",
  easy: "calm",
  peaceful: "calm",
  quiet: "calm",
  relax: "calm",
  relaxed: "calm",
  relaxing: "calm",
  serene: "calm",
  soothe: "calm",
  soothing: "calm",
  happy: "joyful",
  happier: "joyful",
  happiest: "joyful",
  joy: "joyful",
  laugh: "joyful",
  laughing: "joyful",
  lively: "joyful",
  playful: "joyful",
  smile: "joyful",
  smiling: "joyful",
  sunny: "joyful",
  upbeat: "joyful",
  weep: "melancholy",
  weeping: "melancholy",
  cry: "melancholy",
  crying: "melancholy",
  gloomy: "melancholy",
  heartbroken: "melancholy",
  low: "melancholy",
  moody: "melancholy",
  sad: "melancholy",
  sorrowful: "melancholy",
  blue: "melancholy",
  tender: "romantic",
  love: "romantic",
  loving: "romantic",
  lovely: "romantic",
  flirty: "romantic",
  passionate: "romantic",
  warmhearted: "romantic",
  active: "energetic",
  bold: "energetic",
  charged: "energetic",
  dance: "energetic",
  dancing: "energetic",
  excited: "energetic",
  fast: "energetic",
  motivated: "energetic",
  vibrant: "energetic",
  vivid: "energetic",
  wonder: "dreamy",
  ethereal: "dreamy",
  floaty: "dreamy",
  magical: "dreamy",
  surreal: "dreamy",
  whimsical: "dreamy",
  concentrate: "focused",
  concentrating: "focused",
  focused: "focused",
  productive: "focused",
  sharp: "focused",
  study: "focused",
  studying: "focused",
  think: "focused",
  thinking: "focused",
  snug: "cozy",
  comfort: "cozy",
  comforting: "cozy",
  comfy: "cozy",
  warm: "cozy",
  worried: "anxious",
  worry: "anxious",
  worrying: "anxious",
  nervous: "anxious",
  stressed: "anxious",
  stress: "anxious",
  tense: "anxious",
  uneasy: "anxious",
  furious: "angry",
  anger: "angry",
  mad: "angry",
  rage: "angry",
  raging: "angry",
  irritated: "angry",
  hopeful: "hopeful",
  hope: "hopeful",
  hoping: "hopeful",
  optimistic: "hopeful",
  uplifted: "hopeful",
  alone: "lonely",
  isolated: "lonely",
  empty: "lonely",
  longing: "lonely",
  lost: "lonely",
  sleepy: "tired",
  sleep: "tired",
  sleeping: "tired",
  exhausted: "tired",
  drained: "tired",
  weary: "tired",
  brave: "confident",
  confidence: "confident",
  empowered: "confident",
  strong: "confident",
  inspired: "inspired",
  create: "inspired",
  creating: "inspired",
  creative: "inspired",
  imagine: "inspired",
  imagining: "inspired",
  nostalgic: "nostalgic",
  remember: "nostalgic",
  remembering: "nostalgic",
  wistful: "nostalgic",
  grateful: "grateful",
  gratitude: "grateful",
  thankful: "grateful",
  appreciate: "grateful",
  appreciating: "grateful",
  curious: "curious",
  explore: "curious",
  exploring: "curious",
  intrigued: "curious",
  wondering: "curious"
};

const ignoredMoodWords = new Set([
  "a",
  "am",
  "and",
  "be",
  "bit",
  "feeling",
  "feel",
  "felt",
  "i",
  "im",
  "i-m",
  "kind",
  "little",
  "of",
  "really",
  "so",
  "super",
  "today",
  "to",
  "too",
  "very",
  "want"
]);

const unsplashSearchLinks = Object.fromEntries(
  Object.entries(moodTerms).map(([mood, terms]) => [
    mood,
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(terms.replaceAll(",", " "))}&orientation=portrait&per_page=10`
  ])
);

function canonicalMood(slug) {
  if (moodAliases[slug]) return moodAliases[slug];

  const words = slug.split("-").filter(Boolean);
  const meaningfulWords = words.filter((word) => !ignoredMoodWords.has(word));
  const wordMatch = meaningfulWords.find((word) => moodAliases[word] || moodPalettes[word]);

  if (wordMatch) return moodAliases[wordMatch] || wordMatch;
  return meaningfulWords.join("-") || slug || "calm";
}

function searchTerms(slug) {
  return moodTerms[slug] || `${slug},aesthetic,nature,art`;
};

const imageBanks = {
  calm: [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82"
  ],
  joyful: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1492681290082-e932832941e6?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1000&q=82"
  ],
  melancholy: [
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=82"
  ],
  romantic: [
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1000&q=82"
  ],
  energetic: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1000&q=82"
  ],
  dreamy: [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1000&q=82"
  ],
  default: [
    "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=82",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=82"
  ]
};

const imageBankAliases = {
  anxious: "melancholy",
  angry: "energetic",
  cozy: "romantic",
  focused: "calm",
  hopeful: "joyful",
  lonely: "melancholy",
  tired: "calm",
  confident: "calm",
  inspired: "dreamy",
  nostalgic: "romantic",
  grateful: "joyful",
  curious: "calm"
};

const tilePattern = ["is-wide", "", "is-tall", "", "", "is-wide", "", "is-tall", "", ""];

function slugMood(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") || "calm";
}

function titleMood(slug) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function hashMood(slug) {
  return [...slug].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function paletteFor(slug) {
  if (moodPalettes[slug]) return moodPalettes[slug];

  const hue = hashMood(slug) % 360;
  return [
    `hsl(${hue} 45% 97%)`,
    `hsl(${hue} 38% 90%)`,
    `hsl(${hue} 30% 56%)`,
    `hsl(${hue} 32% 34%)`
  ];
}

function applyPalette(slug) {
  const [bg, bgSoft, accent, accentStrong] = paletteFor(slug);
  const root = document.documentElement;
  root.style.setProperty("--bg", bg);
  root.style.setProperty("--bg-soft", bgSoft);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-strong", accentStrong);
}

function imageBankFor(slug) {
  if (imageBanks[slug]) return imageBanks[slug];
  if (imageBankAliases[slug]) return imageBanks[imageBankAliases[slug]];

  const terms = searchTerms(slug);
  if (terms.includes("sun") || terms.includes("bright")) return imageBanks.joyful;
  if (terms.includes("rain") || terms.includes("blue")) return imageBanks.melancholy;
  return imageBanks.default;
}

function imageUrl(slug, index) {
  const bank = imageBankFor(slug);
  return bank[index % bank.length];
}

function makeTile(displaySlug, imageSlug, index) {
  const tile = document.createElement("article");
  const tileClass = tilePattern[index] || "";
  tile.className = `tile ${tileClass}`.trim();
  tile.style.animationDelay = `${index * 58}ms`;
  tile.dataset.unsplashApi = unsplashSearchLinks[imageSlug] || unsplashSearchLinks.default || "";

  const img = document.createElement("img");
  img.alt = `${titleMood(displaySlug)} moodboard image ${index + 1}`;
  img.loading = "eager";
  img.decoding = "async";

  img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
  img.addEventListener("error", () => {
    const fallbackBank = imageBanks.default;
    img.src = fallbackBank[index % fallbackBank.length];
  }, { once: true });
  img.src = imageUrl(imageSlug, index);
  if (img.complete) requestAnimationFrame(() => img.classList.add("loaded"));

  tile.appendChild(img);
  return tile;
}

function renderMood(rawMood = "calm") {
  const inputSlug = slugMood(rawMood);
  const slug = canonicalMood(inputSlug);
  const title = titleMood(inputSlug);

  applyPalette(slug);
  moodStatus.textContent = inputSlug === slug ? `Showing: ${slug}` : `Showing: ${inputSlug} as ${slug}`;
  moodGrid.replaceChildren();

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 10; index += 1) {
    fragment.appendChild(makeTile(inputSlug, slug, index));
  }
  moodGrid.appendChild(fragment);

  document.title = `${title} Moodboard | Moodboard AI`;
}

moodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderMood(moodInput.value);
});

moodInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    renderMood(moodInput.value);
  }
});

renderMood("calm");
