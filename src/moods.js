/**
 * Mood lexicon.
 *
 * Every entry is an adjective the board can render. Instead of hand-writing a
 * hex palette per mood (which drifts out of tune as the list grows) each mood
 * carries three colour inputs that `palette.js` expands into a full OKLCH
 * ramp. OKLCH keeps lightness perceptually uniform, so contrast stays stable
 * across all 100+ hues without per-mood tuning.
 *
 *   hue     0-360  base hue angle
 *   chroma  0-1    colourfulness multiplier (0 = neutral grey, 1 = saturated)
 *   lift    0-1    how bright the board feels (drives background lightness)
 *
 * `traits` is a 4-axis emotional vector used by the resolver to find the
 * closest available mood when a search term is not in the lexicon:
 *
 *   valence  -1 negative .. +1 positive
 *   energy    0 still    ..  1 intense
 *   warmth   -1 cool     .. +1 warm
 *   light     0 dark     ..  1 bright
 *
 * `terms` are the image-search phrases sent to the providers, and `kin` lists
 * hand-picked neighbours that outrank the computed distance.
 */

/** @typedef {{ valence: number, energy: number, warmth: number, light: number }} Traits */
/** @typedef {{ id: string, terms: string[], hue: number, chroma: number, lift: number, traits: Traits, kin: string[] }} Mood */

/** @type {Mood[]} */
// prettier-ignore
/** @type {Mood[]} */
export const MOODS = [
  // ── Stillness ────────────────────────────────────────────────────────────
  { id: 'calm', terms: ['calm water', 'soft morning light', 'minimal landscape'], hue: 178, chroma: 0.45, lift: 0.74, traits: { valence: 0.5, energy: 0.08, warmth: -0.1, light: 0.72 }, kin: ['serene', 'tranquil', 'peaceful'] },
  { id: 'serene', terms: ['still lake', 'misty morning', 'quiet horizon'], hue: 195, chroma: 0.4, lift: 0.76, traits: { valence: 0.55, energy: 0.06, warmth: -0.2, light: 0.76 }, kin: ['calm', 'tranquil', 'ethereal'] },
  { id: 'tranquil', terms: ['zen garden', 'calm sea', 'soft fog'], hue: 168, chroma: 0.42, lift: 0.75, traits: { valence: 0.55, energy: 0.05, warmth: -0.05, light: 0.72 }, kin: ['serene', 'calm', 'meditative'] },
  { id: 'peaceful', terms: ['meadow at dawn', 'open sky', 'quiet field'], hue: 150, chroma: 0.42, lift: 0.76, traits: { valence: 0.6, energy: 0.1, warmth: 0.05, light: 0.75 }, kin: ['calm', 'serene', 'pastoral'] },
  { id: 'still', terms: ['motionless water', 'empty room light', 'silent landscape'], hue: 205, chroma: 0.28, lift: 0.72, traits: { valence: 0.3, energy: 0.02, warmth: -0.25, light: 0.68 }, kin: ['quiet', 'serene', 'minimal'] },
  { id: 'quiet', terms: ['empty street morning', 'soft interior', 'muted landscape'], hue: 215, chroma: 0.25, lift: 0.72, traits: { valence: 0.25, energy: 0.05, warmth: -0.2, light: 0.68 }, kin: ['still', 'calm', 'solitary'] },
  { id: 'meditative', terms: ['zen stones', 'incense smoke', 'monastery light'], hue: 40, chroma: 0.35, lift: 0.66, traits: { valence: 0.4, energy: 0.05, warmth: 0.3, light: 0.58 }, kin: ['tranquil', 'introspective', 'grounded'] },
  { id: 'grounded', terms: ['bare earth', 'stone texture', 'roots and soil'], hue: 32, chroma: 0.4, lift: 0.6, traits: { valence: 0.35, energy: 0.2, warmth: 0.5, light: 0.5 }, kin: ['earthy', 'meditative', 'rustic'] },
  { id: 'balanced', terms: ['symmetry architecture', 'balanced stones', 'clean composition'], hue: 145, chroma: 0.3, lift: 0.72, traits: { valence: 0.4, energy: 0.2, warmth: 0, light: 0.66 }, kin: ['minimal', 'grounded', 'refined'] },
  { id: 'restful', terms: ['linen bed', 'afternoon nap light', 'soft shadows'], hue: 45, chroma: 0.3, lift: 0.78, traits: { valence: 0.4, energy: 0.05, warmth: 0.4, light: 0.72 }, kin: ['cozy', 'calm', 'languid'] },
  { id: 'gentle', terms: ['soft petals', 'diffused light', 'delicate texture'], hue: 340, chroma: 0.3, lift: 0.8, traits: { valence: 0.5, energy: 0.1, warmth: 0.3, light: 0.8 }, kin: ['tender', 'soft', 'calm'] },
  { id: 'soft', terms: ['blurred light', 'pastel clouds', 'gauzy fabric'], hue: 20, chroma: 0.28, lift: 0.82, traits: { valence: 0.45, energy: 0.1, warmth: 0.35, light: 0.82 }, kin: ['gentle', 'dreamy', 'tender'] },
  { id: 'zen', terms: ['raked sand garden', 'bamboo shadow', 'tea ceremony'], hue: 120, chroma: 0.3, lift: 0.74, traits: { valence: 0.5, energy: 0.05, warmth: 0.05, light: 0.68 }, kin: ['meditative', 'minimal', 'tranquil'] },

  // ── Joy ──────────────────────────────────────────────────────────────────
  { id: 'joyful', terms: ['sunlit flowers', 'confetti celebration', 'bright summer'], hue: 52, chroma: 0.85, lift: 0.8, traits: { valence: 0.95, energy: 0.7, warmth: 0.7, light: 0.88 }, kin: ['happy', 'cheerful', 'radiant'] },
  { id: 'happy', terms: ['sunshine picnic', 'smiling colours', 'warm daylight'], hue: 48, chroma: 0.8, lift: 0.8, traits: { valence: 0.9, energy: 0.6, warmth: 0.7, light: 0.85 }, kin: ['joyful', 'cheerful', 'sunny'] },
  { id: 'cheerful', terms: ['yellow flowers', 'bright kitchen', 'colourful market'], hue: 58, chroma: 0.78, lift: 0.82, traits: { valence: 0.85, energy: 0.6, warmth: 0.65, light: 0.86 }, kin: ['happy', 'sunny', 'playful'] },
  { id: 'elated', terms: ['jumping in air', 'open arms sky', 'festival lights'], hue: 42, chroma: 0.88, lift: 0.78, traits: { valence: 0.95, energy: 0.85, warmth: 0.65, light: 0.84 }, kin: ['euphoric', 'jubilant', 'joyful'] },
  { id: 'euphoric', terms: ['festival crowd lights', 'colour explosion', 'rave neon'], hue: 300, chroma: 0.9, lift: 0.6, traits: { valence: 0.9, energy: 0.95, warmth: 0.4, light: 0.6 }, kin: ['elated', 'ecstatic', 'electric'] },
  { id: 'ecstatic', terms: ['fireworks night', 'wild celebration', 'burst of colour'], hue: 320, chroma: 0.92, lift: 0.55, traits: { valence: 0.92, energy: 1, warmth: 0.45, light: 0.55 }, kin: ['euphoric', 'jubilant', 'elated'] },
  { id: 'jubilant', terms: ['victory celebration', 'golden confetti', 'raised hands crowd'], hue: 45, chroma: 0.85, lift: 0.74, traits: { valence: 0.92, energy: 0.85, warmth: 0.7, light: 0.8 }, kin: ['elated', 'triumphant', 'festive'] },
  { id: 'playful', terms: ['colourful balloons', 'paint splash', 'playground colour'], hue: 10, chroma: 0.82, lift: 0.78, traits: { valence: 0.8, energy: 0.75, warmth: 0.6, light: 0.8 }, kin: ['cheerful', 'whimsical', 'giddy'] },
  { id: 'giddy', terms: ['spinning lights', 'candy colours', 'bubbles sunlight'], hue: 330, chroma: 0.8, lift: 0.8, traits: { valence: 0.85, energy: 0.8, warmth: 0.5, light: 0.82 }, kin: ['playful', 'elated', 'whimsical'] },
  { id: 'radiant', terms: ['golden hour glow', 'sun flare', 'luminous portrait'], hue: 38, chroma: 0.8, lift: 0.8, traits: { valence: 0.85, energy: 0.55, warmth: 0.85, light: 0.9 }, kin: ['joyful', 'sunny', 'golden'] },
  { id: 'sunny', terms: ['blue sky sunshine', 'beach daylight', 'sunlit leaves'], hue: 55, chroma: 0.82, lift: 0.84, traits: { valence: 0.85, energy: 0.55, warmth: 0.8, light: 0.92 }, kin: ['radiant', 'cheerful', 'summery'] },
  { id: 'buoyant', terms: ['floating balloons sky', 'light and airy', 'weightless water'], hue: 190, chroma: 0.6, lift: 0.84, traits: { valence: 0.75, energy: 0.55, warmth: 0.2, light: 0.86 }, kin: ['airy', 'cheerful', 'hopeful'] },
  { id: 'festive', terms: ['string lights party', 'celebration table', 'holiday market'], hue: 5, chroma: 0.75, lift: 0.6, traits: { valence: 0.85, energy: 0.75, warmth: 0.7, light: 0.62 }, kin: ['jubilant', 'joyful', 'cozy'] },

  // ── Sorrow ───────────────────────────────────────────────────────────────
  { id: 'melancholy', terms: ['rain on window', 'grey sea', 'lone figure fog'], hue: 225, chroma: 0.35, lift: 0.56, traits: { valence: -0.6, energy: 0.15, warmth: -0.5, light: 0.4 }, kin: ['sad', 'wistful', 'somber'] },
  { id: 'sad', terms: ['rainy street', 'overcast sky', 'empty bench'], hue: 220, chroma: 0.32, lift: 0.55, traits: { valence: -0.75, energy: 0.15, warmth: -0.4, light: 0.4 }, kin: ['melancholy', 'sorrowful', 'blue'] },
  { id: 'sorrowful', terms: ['grief sculpture', 'rain and shadow', 'grey horizon'], hue: 235, chroma: 0.3, lift: 0.48, traits: { valence: -0.85, energy: 0.15, warmth: -0.45, light: 0.32 }, kin: ['mournful', 'sad', 'somber'] },
  { id: 'mournful', terms: ['bare winter tree', 'stone memorial', 'dark water'], hue: 250, chroma: 0.26, lift: 0.42, traits: { valence: -0.9, energy: 0.12, warmth: -0.5, light: 0.26 }, kin: ['sorrowful', 'somber', 'desolate'] },
  { id: 'wistful', terms: ['faded photograph', 'window light dust', 'distant memory'], hue: 32, chroma: 0.32, lift: 0.62, traits: { valence: -0.2, energy: 0.15, warmth: 0.35, light: 0.5 }, kin: ['nostalgic', 'melancholy', 'bittersweet'] },
  { id: 'somber', terms: ['dark clouds', 'muted architecture', 'shadow and stone'], hue: 240, chroma: 0.2, lift: 0.42, traits: { valence: -0.6, energy: 0.2, warmth: -0.4, light: 0.28 }, kin: ['melancholy', 'brooding', 'mournful'] },
  { id: 'forlorn', terms: ['abandoned house', 'empty shoreline', 'peeling paint'], hue: 210, chroma: 0.24, lift: 0.5, traits: { valence: -0.75, energy: 0.1, warmth: -0.25, light: 0.36 }, kin: ['desolate', 'lonely', 'sad'] },
  { id: 'heartbroken', terms: ['wilting roses', 'rain and neon', 'torn letter'], hue: 350, chroma: 0.45, lift: 0.44, traits: { valence: -0.9, energy: 0.35, warmth: 0.1, light: 0.32 }, kin: ['sorrowful', 'melancholy', 'yearning'] },
  { id: 'bittersweet', terms: ['autumn last light', 'goodbye at station', 'faded flowers'], hue: 25, chroma: 0.45, lift: 0.6, traits: { valence: -0.05, energy: 0.25, warmth: 0.45, light: 0.5 }, kin: ['wistful', 'nostalgic', 'melancholy'] },
  { id: 'blue', terms: ['deep blue sea', 'blue hour city', 'cobalt shadow'], hue: 232, chroma: 0.5, lift: 0.5, traits: { valence: -0.4, energy: 0.2, warmth: -0.7, light: 0.36 }, kin: ['melancholy', 'sad', 'oceanic'] },

  // ── Love ─────────────────────────────────────────────────────────────────
  { id: 'romantic', terms: ['candlelit dinner', 'roses soft light', 'couple silhouette sunset'], hue: 355, chroma: 0.55, lift: 0.72, traits: { valence: 0.7, energy: 0.35, warmth: 0.7, light: 0.66 }, kin: ['tender', 'intimate', 'affectionate'] },
  { id: 'tender', terms: ['held hands', 'soft blush petals', 'gentle embrace'], hue: 348, chroma: 0.4, lift: 0.8, traits: { valence: 0.7, energy: 0.2, warmth: 0.6, light: 0.78 }, kin: ['gentle', 'affectionate', 'romantic'] },
  { id: 'affectionate', terms: ['warm embrace', 'soft blanket two cups', 'close portrait'], hue: 12, chroma: 0.45, lift: 0.76, traits: { valence: 0.75, energy: 0.3, warmth: 0.7, light: 0.72 }, kin: ['tender', 'romantic', 'cozy'] },
  { id: 'passionate', terms: ['deep red silk', 'flamenco motion', 'fire and shadow'], hue: 8, chroma: 0.85, lift: 0.5, traits: { valence: 0.6, energy: 0.9, warmth: 0.9, light: 0.4 }, kin: ['fiery', 'sensual', 'romantic'] },
  { id: 'intimate', terms: ['low lamp light', 'close texture skin', 'quiet bedroom'], hue: 25, chroma: 0.42, lift: 0.5, traits: { valence: 0.6, energy: 0.25, warmth: 0.75, light: 0.36 }, kin: ['sensual', 'romantic', 'cozy'] },
  { id: 'sensual', terms: ['silk drapery', 'warm skin light', 'velvet shadow'], hue: 350, chroma: 0.55, lift: 0.45, traits: { valence: 0.55, energy: 0.5, warmth: 0.8, light: 0.32 }, kin: ['intimate', 'passionate', 'luxurious'] },
  { id: 'yearning', terms: ['distant window light', 'reaching hand', 'empty horizon dusk'], hue: 265, chroma: 0.42, lift: 0.5, traits: { valence: -0.25, energy: 0.35, warmth: 0.1, light: 0.36 }, kin: ['longing', 'wistful', 'heartbroken'] },
  { id: 'longing', terms: ['train window dusk', 'far away shore', 'lone light in dark'], hue: 255, chroma: 0.4, lift: 0.48, traits: { valence: -0.3, energy: 0.3, warmth: 0, light: 0.34 }, kin: ['yearning', 'wistful', 'lonely'] },
  { id: 'devoted', terms: ['old hands together', 'worn wedding rings', 'steady flame'], hue: 30, chroma: 0.42, lift: 0.62, traits: { valence: 0.7, energy: 0.25, warmth: 0.65, light: 0.54 }, kin: ['affectionate', 'reverent', 'tender'] },

  // ── Drive ────────────────────────────────────────────────────────────────
  { id: 'energetic', terms: ['runner motion blur', 'city rush light', 'splash of movement'], hue: 22, chroma: 0.88, lift: 0.7, traits: { valence: 0.7, energy: 0.95, warmth: 0.7, light: 0.7 }, kin: ['dynamic', 'vibrant', 'electric'] },
  { id: 'electric', terms: ['neon signs night', 'lightning storm', 'electric blue glow'], hue: 265, chroma: 0.95, lift: 0.42, traits: { valence: 0.5, energy: 1, warmth: -0.1, light: 0.4 }, kin: ['neon', 'euphoric', 'dynamic'] },
  { id: 'vibrant', terms: ['colour market spices', 'saturated street art', 'tropical colour'], hue: 340, chroma: 0.9, lift: 0.68, traits: { valence: 0.8, energy: 0.85, warmth: 0.5, light: 0.7 }, kin: ['energetic', 'bold', 'joyful'] },
  { id: 'dynamic', terms: ['motion blur city', 'dancer mid leap', 'wave crashing'], hue: 205, chroma: 0.75, lift: 0.6, traits: { valence: 0.55, energy: 0.95, warmth: 0, light: 0.56 }, kin: ['energetic', 'kinetic', 'bold'] },
  { id: 'kinetic', terms: ['long exposure lights', 'skateboard motion', 'blur of movement'], hue: 285, chroma: 0.78, lift: 0.5, traits: { valence: 0.5, energy: 1, warmth: 0.1, light: 0.46 }, kin: ['dynamic', 'electric', 'restless'] },
  { id: 'bold', terms: ['strong graphic contrast', 'red architecture', 'powerful portrait'], hue: 12, chroma: 0.9, lift: 0.55, traits: { valence: 0.5, energy: 0.8, warmth: 0.7, light: 0.48 }, kin: ['confident', 'fierce', 'vibrant'] },
  { id: 'fierce', terms: ['storm waves', 'predator eyes', 'fire and smoke'], hue: 15, chroma: 0.92, lift: 0.38, traits: { valence: 0.15, energy: 1, warmth: 0.75, light: 0.28 }, kin: ['bold', 'defiant', 'passionate'] },
  { id: 'adventurous', terms: ['mountain trail hiker', 'open road map', 'wild coastline'], hue: 155, chroma: 0.65, lift: 0.62, traits: { valence: 0.75, energy: 0.8, warmth: 0.2, light: 0.6 }, kin: ['wanderlust', 'daring', 'curious'] },
  { id: 'daring', terms: ['cliff edge climber', 'skydiver sky', 'bold leap'], hue: 30, chroma: 0.8, lift: 0.58, traits: { valence: 0.6, energy: 0.9, warmth: 0.55, light: 0.55 }, kin: ['adventurous', 'fierce', 'bold'] },
  { id: 'restless', terms: ['pacing shadow', 'city at 3am', 'unmade bed morning'], hue: 275, chroma: 0.45, lift: 0.44, traits: { valence: -0.2, energy: 0.8, warmth: -0.1, light: 0.32 }, kin: ['anxious', 'kinetic', 'frenetic'] },
  { id: 'frenetic', terms: ['crowd rush blur', 'tangled wires', 'chaotic neon'], hue: 320, chroma: 0.85, lift: 0.4, traits: { valence: -0.15, energy: 1, warmth: 0.2, light: 0.32 }, kin: ['chaotic', 'restless', 'overwhelmed'] },
  { id: 'chaotic', terms: ['paint chaos', 'tangled city wires', 'scattered fragments'], hue: 295, chroma: 0.82, lift: 0.42, traits: { valence: -0.2, energy: 0.95, warmth: 0.2, light: 0.36 }, kin: ['frenetic', 'overwhelmed', 'eccentric'] },

  // ── Dream ────────────────────────────────────────────────────────────────
  { id: 'dreamy', terms: ['pastel clouds', 'soft focus light', 'floating petals'], hue: 285, chroma: 0.5, lift: 0.78, traits: { valence: 0.6, energy: 0.2, warmth: 0.2, light: 0.76 }, kin: ['ethereal', 'hazy', 'whimsical'] },
  { id: 'ethereal', terms: ['light through mist', 'gossamer fabric', 'pale glow figure'], hue: 200, chroma: 0.35, lift: 0.84, traits: { valence: 0.55, energy: 0.15, warmth: -0.15, light: 0.85 }, kin: ['dreamy', 'celestial', 'otherworldly'] },
  { id: 'surreal', terms: ['impossible architecture', 'floating objects', 'dali landscape'], hue: 315, chroma: 0.7, lift: 0.58, traits: { valence: 0.3, energy: 0.5, warmth: 0.2, light: 0.52 }, kin: ['otherworldly', 'whimsical', 'eccentric'] },
  { id: 'whimsical', terms: ['storybook forest', 'tiny door', 'playful illustration'], hue: 145, chroma: 0.6, lift: 0.74, traits: { valence: 0.75, energy: 0.55, warmth: 0.3, light: 0.72 }, kin: ['playful', 'enchanted', 'dreamy'] },
  { id: 'mystical', terms: ['candles and smoke', 'forest fog light', 'ancient symbols'], hue: 270, chroma: 0.6, lift: 0.4, traits: { valence: 0.25, energy: 0.35, warmth: 0.15, light: 0.3 }, kin: ['enchanted', 'otherworldly', 'mysterious'] },
  { id: 'enchanted', terms: ['fairy lights forest', 'glowing moss', 'magic hour woods'], hue: 165, chroma: 0.65, lift: 0.5, traits: { valence: 0.7, energy: 0.4, warmth: 0.15, light: 0.44 }, kin: ['mystical', 'whimsical', 'dreamy'] },
  { id: 'otherworldly', terms: ['alien landscape', 'strange geology', 'unearthly light'], hue: 175, chroma: 0.7, lift: 0.44, traits: { valence: 0.2, energy: 0.45, warmth: -0.2, light: 0.38 }, kin: ['surreal', 'celestial', 'mystical'] },
  { id: 'hazy', terms: ['heat haze', 'smoky sunlight', 'blurred distance'], hue: 35, chroma: 0.42, lift: 0.7, traits: { valence: 0.25, energy: 0.2, warmth: 0.5, light: 0.66 }, kin: ['dreamy', 'nostalgic', 'soft'] },
  { id: 'celestial', terms: ['milky way night', 'moon and clouds', 'star field'], hue: 250, chroma: 0.65, lift: 0.28, traits: { valence: 0.45, energy: 0.25, warmth: -0.4, light: 0.16 }, kin: ['cosmic', 'ethereal', 'mystical'] },
  { id: 'cosmic', terms: ['nebula colours', 'deep space', 'galaxy swirl'], hue: 280, chroma: 0.8, lift: 0.24, traits: { valence: 0.4, energy: 0.45, warmth: -0.2, light: 0.14 }, kin: ['celestial', 'otherworldly', 'mystical'] },

  // ── Focus ────────────────────────────────────────────────────────────────
  { id: 'focused', terms: ['clean desk workspace', 'single lamp study', 'notebook and pen'], hue: 210, chroma: 0.38, lift: 0.68, traits: { valence: 0.35, energy: 0.45, warmth: -0.2, light: 0.62 }, kin: ['disciplined', 'studious', 'minimal'] },
  { id: 'disciplined', terms: ['ordered tools', 'grid architecture', 'training routine'], hue: 220, chroma: 0.3, lift: 0.62, traits: { valence: 0.3, energy: 0.5, warmth: -0.25, light: 0.55 }, kin: ['methodical', 'focused', 'resolute'] },
  { id: 'methodical', terms: ['laboratory glassware', 'blueprint drawing', 'sorted objects'], hue: 195, chroma: 0.32, lift: 0.68, traits: { valence: 0.25, energy: 0.4, warmth: -0.3, light: 0.62 }, kin: ['analytical', 'meticulous', 'disciplined'] },
  { id: 'meticulous', terms: ['watchmaker detail', 'precise craft hands', 'fine typography'], hue: 40, chroma: 0.3, lift: 0.66, traits: { valence: 0.3, energy: 0.4, warmth: 0.25, light: 0.6 }, kin: ['methodical', 'refined', 'analytical'] },
  { id: 'studious', terms: ['library reading', 'stacked books lamp', 'annotated pages'], hue: 30, chroma: 0.42, lift: 0.58, traits: { valence: 0.3, energy: 0.35, warmth: 0.45, light: 0.48 }, kin: ['focused', 'analytical', 'introspective'] },
  { id: 'analytical', terms: ['data visualisation', 'circuit macro', 'geometry study'], hue: 200, chroma: 0.45, lift: 0.6, traits: { valence: 0.2, energy: 0.45, warmth: -0.35, light: 0.52 }, kin: ['methodical', 'focused', 'technical'] },
  { id: 'resolute', terms: ['lone lighthouse storm', 'set jaw portrait', 'steady mountain'], hue: 215, chroma: 0.42, lift: 0.48, traits: { valence: 0.35, energy: 0.6, warmth: -0.15, light: 0.38 }, kin: ['determined', 'disciplined', 'confident'] },
  { id: 'determined', terms: ['uphill climb', 'hands gripping rope', 'long road ahead'], hue: 25, chroma: 0.55, lift: 0.55, traits: { valence: 0.45, energy: 0.7, warmth: 0.45, light: 0.46 }, kin: ['resolute', 'driven', 'hopeful'] },
  { id: 'driven', terms: ['early morning training', 'city ambition skyline', 'focused athlete'], hue: 12, chroma: 0.6, lift: 0.5, traits: { valence: 0.5, energy: 0.85, warmth: 0.5, light: 0.42 }, kin: ['determined', 'energetic', 'confident'] },

  // ── Comfort ──────────────────────────────────────────────────────────────
  { id: 'cozy', terms: ['blanket and coffee', 'fireplace evening', 'rain outside window warm inside'], hue: 30, chroma: 0.55, lift: 0.6, traits: { valence: 0.75, energy: 0.15, warmth: 0.9, light: 0.5 }, kin: ['hygge', 'warm', 'restful'] },
  { id: 'hygge', terms: ['candles wool socks', 'wooden cabin interior', 'warm mug hands'], hue: 34, chroma: 0.5, lift: 0.62, traits: { valence: 0.8, energy: 0.15, warmth: 0.9, light: 0.52 }, kin: ['cozy', 'restful', 'rustic'] },
  { id: 'warm', terms: ['golden interior light', 'amber glow', 'sunlit wood'], hue: 38, chroma: 0.6, lift: 0.68, traits: { valence: 0.7, energy: 0.3, warmth: 0.95, light: 0.62 }, kin: ['cozy', 'radiant', 'intimate'] },
  { id: 'snug', terms: ['nest of blankets', 'small warm room', 'cat sleeping sunbeam'], hue: 28, chroma: 0.48, lift: 0.64, traits: { valence: 0.75, energy: 0.1, warmth: 0.85, light: 0.54 }, kin: ['cozy', 'restful', 'hygge'] },
  { id: 'rustic', terms: ['weathered barn wood', 'stone farmhouse', 'linen and bread'], hue: 36, chroma: 0.45, lift: 0.58, traits: { valence: 0.5, energy: 0.2, warmth: 0.7, light: 0.48 }, kin: ['earthy', 'pastoral', 'grounded'] },
  { id: 'pastoral', terms: ['rolling green hills', 'sheep in meadow', 'country lane'], hue: 108, chroma: 0.5, lift: 0.7, traits: { valence: 0.65, energy: 0.2, warmth: 0.3, light: 0.66 }, kin: ['peaceful', 'rustic', 'verdant'] },
  { id: 'nostalgic', terms: ['vintage film photo', 'old polaroids', 'faded summer memory'], hue: 30, chroma: 0.5, lift: 0.64, traits: { valence: 0.2, energy: 0.25, warmth: 0.65, light: 0.56 }, kin: ['wistful', 'retro', 'bittersweet'] },
  { id: 'sentimental', terms: ['keepsake box', 'handwritten letters', 'childhood objects'], hue: 22, chroma: 0.45, lift: 0.66, traits: { valence: 0.3, energy: 0.2, warmth: 0.6, light: 0.58 }, kin: ['nostalgic', 'tender', 'wistful'] },
  { id: 'grateful', terms: ['shared table meal', 'harvest light', 'open hands sunlight'], hue: 48, chroma: 0.6, lift: 0.72, traits: { valence: 0.85, energy: 0.3, warmth: 0.8, light: 0.72 }, kin: ['warm', 'reverent', 'joyful'] },
  { id: 'reverent', terms: ['cathedral light', 'ancient temple', 'candle offering'], hue: 45, chroma: 0.45, lift: 0.42, traits: { valence: 0.55, energy: 0.15, warmth: 0.5, light: 0.28 }, kin: ['meditative', 'awed', 'devoted'] },
  { id: 'awed', terms: ['vast canyon scale', 'towering waterfall', 'aurora sky'], hue: 190, chroma: 0.7, lift: 0.44, traits: { valence: 0.7, energy: 0.5, warmth: -0.2, light: 0.4 }, kin: ['reverent', 'celestial', 'majestic'] },

  // ── Unease ───────────────────────────────────────────────────────────────
  { id: 'anxious', terms: ['tangled shadows', 'crowded blur', 'storm approaching'], hue: 65, chroma: 0.35, lift: 0.48, traits: { valence: -0.6, energy: 0.7, warmth: 0.1, light: 0.36 }, kin: ['nervous', 'tense', 'uneasy'] },
  { id: 'nervous', terms: ['waiting room', 'trembling light', 'clenched hands'], hue: 72, chroma: 0.32, lift: 0.52, traits: { valence: -0.5, energy: 0.7, warmth: 0.05, light: 0.4 }, kin: ['anxious', 'apprehensive', 'restless'] },
  { id: 'tense', terms: ['taut rope', 'hard shadow lines', 'storm light'], hue: 55, chroma: 0.4, lift: 0.42, traits: { valence: -0.55, energy: 0.8, warmth: 0.2, light: 0.32 }, kin: ['anxious', 'ominous', 'restless'] },
  { id: 'uneasy', terms: ['empty corridor', 'off kilter room', 'strange light'], hue: 88, chroma: 0.3, lift: 0.46, traits: { valence: -0.5, energy: 0.5, warmth: 0, light: 0.34 }, kin: ['anxious', 'eerie', 'apprehensive'] },
  { id: 'apprehensive', terms: ['door ajar dark', 'fog on road', 'looking back'], hue: 240, chroma: 0.28, lift: 0.42, traits: { valence: -0.55, energy: 0.55, warmth: -0.25, light: 0.3 }, kin: ['nervous', 'ominous', 'uneasy'] },
  { id: 'overwhelmed', terms: ['crowded city blur', 'stacked paperwork', 'wave crashing over'], hue: 258, chroma: 0.45, lift: 0.38, traits: { valence: -0.7, energy: 0.85, warmth: -0.1, light: 0.28 }, kin: ['frenetic', 'anxious', 'chaotic'] },

  // ── Fire ─────────────────────────────────────────────────────────────────
  { id: 'angry', terms: ['red storm sky', 'cracked earth', 'smouldering embers'], hue: 18, chroma: 0.85, lift: 0.4, traits: { valence: -0.7, energy: 0.95, warmth: 0.8, light: 0.3 }, kin: ['furious', 'fiery', 'indignant'] },
  { id: 'furious', terms: ['volcanic eruption', 'raging fire', 'violent waves'], hue: 10, chroma: 0.95, lift: 0.32, traits: { valence: -0.8, energy: 1, warmth: 0.85, light: 0.24 }, kin: ['angry', 'fierce', 'fiery'] },
  { id: 'fiery', terms: ['flames close up', 'molten metal', 'sunset inferno'], hue: 25, chroma: 0.95, lift: 0.46, traits: { valence: 0.1, energy: 0.95, warmth: 1, light: 0.38 }, kin: ['passionate', 'furious', 'bold'] },
  { id: 'defiant', terms: ['protest raised fist', 'lone tree in storm', 'graffiti wall'], hue: 355, chroma: 0.75, lift: 0.42, traits: { valence: 0.1, energy: 0.85, warmth: 0.5, light: 0.34 }, kin: ['rebellious', 'fierce', 'bold'] },
  { id: 'rebellious', terms: ['punk texture', 'torn posters wall', 'street art defiance'], hue: 330, chroma: 0.8, lift: 0.38, traits: { valence: 0.05, energy: 0.9, warmth: 0.35, light: 0.3 }, kin: ['defiant', 'eccentric', 'bold'] },
  { id: 'indignant', terms: ['stark contrast portrait', 'broken glass', 'harsh red light'], hue: 5, chroma: 0.7, lift: 0.44, traits: { valence: -0.5, energy: 0.8, warmth: 0.6, light: 0.34 }, kin: ['angry', 'defiant', 'fierce'] },

  // ── Hope ─────────────────────────────────────────────────────────────────
  { id: 'hopeful', terms: ['sunrise over hills', 'new sprout soil', 'light through clouds'], hue: 130, chroma: 0.6, lift: 0.76, traits: { valence: 0.8, energy: 0.45, warmth: 0.35, light: 0.76 }, kin: ['optimistic', 'renewed', 'uplifting'] },
  { id: 'optimistic', terms: ['clear morning sky', 'open window light', 'green shoots'], hue: 115, chroma: 0.62, lift: 0.78, traits: { valence: 0.85, energy: 0.5, warmth: 0.35, light: 0.8 }, kin: ['hopeful', 'cheerful', 'uplifting'] },
  { id: 'uplifting', terms: ['birds taking flight', 'sunbeam through forest', 'reaching sky'], hue: 95, chroma: 0.6, lift: 0.78, traits: { valence: 0.85, energy: 0.6, warmth: 0.4, light: 0.8 }, kin: ['hopeful', 'buoyant', 'radiant'] },
  { id: 'renewed', terms: ['spring buds', 'fresh rain leaves', 'clean morning'], hue: 140, chroma: 0.65, lift: 0.78, traits: { valence: 0.8, energy: 0.45, warmth: 0.2, light: 0.78 }, kin: ['hopeful', 'vernal', 'fresh'] },
  { id: 'aspirational', terms: ['mountain summit view', 'skyline ambition', 'staircase to light'], hue: 200, chroma: 0.6, lift: 0.66, traits: { valence: 0.7, energy: 0.6, warmth: -0.1, light: 0.62 }, kin: ['hopeful', 'determined', 'majestic'] },
  { id: 'serendipitous', terms: ['unexpected light', 'happy accident paint', 'found flowers'], hue: 168, chroma: 0.6, lift: 0.74, traits: { valence: 0.75, energy: 0.5, warmth: 0.25, light: 0.72 }, kin: ['whimsical', 'hopeful', 'curious'] },

  // ── Solitude ─────────────────────────────────────────────────────────────
  { id: 'lonely', terms: ['single figure empty street', 'one chair window', 'vast empty landscape'], hue: 218, chroma: 0.32, lift: 0.5, traits: { valence: -0.6, energy: 0.15, warmth: -0.35, light: 0.38 }, kin: ['solitary', 'isolated', 'forlorn'] },
  { id: 'solitary', terms: ['lone tree field', 'single lighthouse', 'walking alone shore'], hue: 205, chroma: 0.35, lift: 0.56, traits: { valence: -0.1, energy: 0.15, warmth: -0.2, light: 0.46 }, kin: ['lonely', 'secluded', 'introspective'] },
  { id: 'isolated', terms: ['remote cabin snow', 'island in fog', 'empty desert road'], hue: 200, chroma: 0.28, lift: 0.5, traits: { valence: -0.4, energy: 0.15, warmth: -0.4, light: 0.4 }, kin: ['solitary', 'desolate', 'lonely'] },
  { id: 'desolate', terms: ['abandoned landscape', 'cracked salt flat', 'ruined structure'], hue: 45, chroma: 0.22, lift: 0.44, traits: { valence: -0.75, energy: 0.1, warmth: 0.15, light: 0.34 }, kin: ['isolated', 'forlorn', 'mournful'] },
  { id: 'secluded', terms: ['hidden forest path', 'private cove', 'garden behind wall'], hue: 145, chroma: 0.42, lift: 0.55, traits: { valence: 0.3, energy: 0.15, warmth: 0.1, light: 0.44 }, kin: ['solitary', 'tranquil', 'verdant'] },
  { id: 'introspective', terms: ['mirror reflection quiet', 'journal by window', 'shadow self portrait'], hue: 258, chroma: 0.35, lift: 0.5, traits: { valence: 0, energy: 0.15, warmth: -0.05, light: 0.38 }, kin: ['meditative', 'solitary', 'studious'] },

  // ── Depletion ────────────────────────────────────────────────────────────
  { id: 'tired', terms: ['unmade bed morning', 'cold coffee desk', 'soft grey light'], hue: 40, chroma: 0.22, lift: 0.6, traits: { valence: -0.3, energy: 0.08, warmth: 0.3, light: 0.5 }, kin: ['weary', 'drowsy', 'languid'] },
  { id: 'weary', terms: ['worn hands rest', 'long road dusk', 'faded workwear'], hue: 35, chroma: 0.25, lift: 0.54, traits: { valence: -0.45, energy: 0.08, warmth: 0.3, light: 0.44 }, kin: ['tired', 'drained', 'languid'] },
  { id: 'drained', terms: ['grey empty room', 'washed out light', 'bare walls'], hue: 210, chroma: 0.15, lift: 0.56, traits: { valence: -0.55, energy: 0.05, warmth: -0.2, light: 0.46 }, kin: ['weary', 'tired', 'lethargic'] },
  { id: 'languid', terms: ['summer afternoon haze', 'lounging shadow', 'slow river'], hue: 55, chroma: 0.4, lift: 0.68, traits: { valence: 0.25, energy: 0.08, warmth: 0.6, light: 0.62 }, kin: ['restful', 'drowsy', 'hazy'] },
  { id: 'drowsy', terms: ['dim bedroom morning', 'half closed blinds', 'warm pillow light'], hue: 42, chroma: 0.3, lift: 0.6, traits: { valence: 0.1, energy: 0.05, warmth: 0.5, light: 0.5 }, kin: ['tired', 'languid', 'restful'] },
  { id: 'lethargic', terms: ['still humid air', 'unmoving heavy sky', 'dull interior'], hue: 80, chroma: 0.18, lift: 0.52, traits: { valence: -0.4, energy: 0.03, warmth: 0.15, light: 0.42 }, kin: ['drained', 'weary', 'tired'] },

  // ── Poise ────────────────────────────────────────────────────────────────
  { id: 'confident', terms: ['strong architecture lines', 'direct gaze portrait', 'sharp tailoring'], hue: 222, chroma: 0.55, lift: 0.56, traits: { valence: 0.65, energy: 0.6, warmth: -0.1, light: 0.48 }, kin: ['poised', 'empowered', 'bold'] },
  { id: 'empowered', terms: ['standing tall skyline', 'raised arms summit', 'strong silhouette'], hue: 340, chroma: 0.6, lift: 0.54, traits: { valence: 0.75, energy: 0.7, warmth: 0.3, light: 0.48 }, kin: ['confident', 'triumphant', 'bold'] },
  { id: 'poised', terms: ['ballet stillness', 'clean minimal portrait', 'balanced form'], hue: 12, chroma: 0.3, lift: 0.72, traits: { valence: 0.55, energy: 0.35, warmth: 0.25, light: 0.68 }, kin: ['elegant', 'refined', 'confident'] },
  { id: 'regal', terms: ['deep purple velvet', 'palace interior', 'crown and gold'], hue: 295, chroma: 0.6, lift: 0.36, traits: { valence: 0.6, energy: 0.45, warmth: 0.3, light: 0.26 }, kin: ['majestic', 'luxurious', 'opulent'] },
  { id: 'majestic', terms: ['alpine peaks light', 'grand cathedral', 'vast glacier'], hue: 215, chroma: 0.55, lift: 0.5, traits: { valence: 0.65, energy: 0.45, warmth: -0.25, light: 0.44 }, kin: ['awed', 'regal', 'alpine'] },
  { id: 'triumphant', terms: ['summit flag', 'victory light', 'golden trophy glow'], hue: 46, chroma: 0.75, lift: 0.62, traits: { valence: 0.85, energy: 0.8, warmth: 0.7, light: 0.6 }, kin: ['jubilant', 'empowered', 'radiant'] },

  // ── Making ───────────────────────────────────────────────────────────────
  { id: 'inspired', terms: ['artist studio light', 'open sketchbook', 'paint and brushes'], hue: 275, chroma: 0.6, lift: 0.68, traits: { valence: 0.75, energy: 0.6, warmth: 0.25, light: 0.64 }, kin: ['creative', 'imaginative', 'expressive'] },
  { id: 'creative', terms: ['messy studio desk', 'colour swatches', 'work in progress canvas'], hue: 300, chroma: 0.65, lift: 0.66, traits: { valence: 0.7, energy: 0.65, warmth: 0.3, light: 0.62 }, kin: ['inspired', 'experimental', 'expressive'] },
  { id: 'imaginative', terms: ['collage of ideas', 'paper sculpture', 'dreamlike illustration'], hue: 258, chroma: 0.62, lift: 0.7, traits: { valence: 0.7, energy: 0.55, warmth: 0.2, light: 0.68 }, kin: ['creative', 'whimsical', 'inspired'] },
  { id: 'experimental', terms: ['abstract chemistry', 'unexpected materials', 'glitch texture'], hue: 178, chroma: 0.7, lift: 0.54, traits: { valence: 0.45, energy: 0.7, warmth: -0.1, light: 0.48 }, kin: ['creative', 'eccentric', 'technical'] },
  { id: 'expressive', terms: ['gestural brushstroke', 'dance movement', 'bold mark making'], hue: 350, chroma: 0.75, lift: 0.6, traits: { valence: 0.6, energy: 0.8, warmth: 0.45, light: 0.55 }, kin: ['creative', 'vibrant', 'passionate'] },
  { id: 'eccentric', terms: ['maximalist interior', 'odd collection', 'clashing patterns'], hue: 105, chroma: 0.75, lift: 0.6, traits: { valence: 0.55, energy: 0.7, warmth: 0.3, light: 0.56 }, kin: ['whimsical', 'experimental', 'rebellious'] },

  // ── Seeking ──────────────────────────────────────────────────────────────
  { id: 'curious', terms: ['open book detail', 'magnifying glass', 'winding path forest'], hue: 185, chroma: 0.55, lift: 0.7, traits: { valence: 0.6, energy: 0.5, warmth: 0, light: 0.66 }, kin: ['inquisitive', 'exploratory', 'wandering'] },
  { id: 'inquisitive', terms: ['question mark chalk', 'peering through window', 'specimen study'], hue: 172, chroma: 0.55, lift: 0.68, traits: { valence: 0.55, energy: 0.5, warmth: 0, light: 0.64 }, kin: ['curious', 'analytical', 'exploratory'] },
  { id: 'exploratory', terms: ['old maps compass', 'unmarked trail', 'expedition gear'], hue: 40, chroma: 0.5, lift: 0.62, traits: { valence: 0.6, energy: 0.65, warmth: 0.4, light: 0.56 }, kin: ['curious', 'adventurous', 'wanderlust'] },
  { id: 'wandering', terms: ['footpath through fields', 'drifting clouds', 'slow travel road'], hue: 130, chroma: 0.42, lift: 0.66, traits: { valence: 0.45, energy: 0.35, warmth: 0.2, light: 0.62 }, kin: ['wanderlust', 'curious', 'solitary'] },
  { id: 'wanderlust', terms: ['airport window dawn', 'train through mountains', 'packed rucksack road'], hue: 195, chroma: 0.6, lift: 0.62, traits: { valence: 0.7, energy: 0.6, warmth: 0.05, light: 0.58 }, kin: ['adventurous', 'wandering', 'exploratory'] },

  // ── Shadow ───────────────────────────────────────────────────────────────
  { id: 'moody', terms: ['dark clouds contrast', 'chiaroscuro portrait', 'shadowed interior'], hue: 250, chroma: 0.35, lift: 0.32, traits: { valence: -0.3, energy: 0.4, warmth: -0.2, light: 0.2 }, kin: ['brooding', 'noir', 'mysterious'] },
  { id: 'brooding', terms: ['storm over sea', 'dark forest depth', 'heavy sky'], hue: 235, chroma: 0.35, lift: 0.28, traits: { valence: -0.5, energy: 0.4, warmth: -0.3, light: 0.16 }, kin: ['moody', 'somber', 'ominous'] },
  { id: 'mysterious', terms: ['fog in alleyway', 'hidden door', 'silhouette in mist'], hue: 268, chroma: 0.45, lift: 0.3, traits: { valence: 0, energy: 0.4, warmth: -0.1, light: 0.18 }, kin: ['enigmatic', 'noir', 'mystical'] },
  { id: 'enigmatic', terms: ['masked figure', 'cryptic symbols', 'half lit face'], hue: 285, chroma: 0.45, lift: 0.3, traits: { valence: 0.05, energy: 0.4, warmth: 0, light: 0.18 }, kin: ['mysterious', 'surreal', 'noir'] },
  { id: 'haunting', terms: ['derelict interior', 'pale figure fog', 'empty grand hall'], hue: 165, chroma: 0.3, lift: 0.28, traits: { valence: -0.5, energy: 0.3, warmth: -0.3, light: 0.16 }, kin: ['eerie', 'gothic', 'desolate'] },
  { id: 'eerie', terms: ['fog forest night', 'flickering light corridor', 'still water dark'], hue: 145, chroma: 0.35, lift: 0.26, traits: { valence: -0.5, energy: 0.4, warmth: -0.3, light: 0.14 }, kin: ['haunting', 'ominous', 'uneasy'] },
  { id: 'ominous', terms: ['storm wall approaching', 'crows on wire', 'blood red sky'], hue: 20, chroma: 0.5, lift: 0.24, traits: { valence: -0.65, energy: 0.6, warmth: 0.3, light: 0.14 }, kin: ['eerie', 'brooding', 'apprehensive'] },
  { id: 'gothic', terms: ['gothic cathedral arches', 'wrought iron gate', 'stone gargoyle'], hue: 300, chroma: 0.32, lift: 0.22, traits: { valence: -0.3, energy: 0.4, warmth: -0.1, light: 0.12 }, kin: ['haunting', 'noir', 'regal'] },
  { id: 'noir', terms: ['black and white rain street', 'venetian blind shadow', 'cigarette smoke light'], hue: 230, chroma: 0.12, lift: 0.22, traits: { valence: -0.25, energy: 0.45, warmth: -0.2, light: 0.12 }, kin: ['moody', 'mysterious', 'monochrome'] },

  // ── Restraint ────────────────────────────────────────────────────────────
  { id: 'minimal', terms: ['white wall shadow', 'single object still life', 'negative space architecture'], hue: 60, chroma: 0.08, lift: 0.86, traits: { valence: 0.4, energy: 0.15, warmth: 0.05, light: 0.86 }, kin: ['clean', 'understated', 'refined'] },
  { id: 'clean', terms: ['white studio light', 'crisp geometry', 'uncluttered space'], hue: 200, chroma: 0.1, lift: 0.88, traits: { valence: 0.45, energy: 0.25, warmth: -0.1, light: 0.88 }, kin: ['minimal', 'crisp', 'refined'] },
  { id: 'crisp', terms: ['frost detail', 'sharp morning light', 'clean edges snow'], hue: 205, chroma: 0.3, lift: 0.86, traits: { valence: 0.5, energy: 0.4, warmth: -0.5, light: 0.88 }, kin: ['clean', 'fresh', 'wintry'] },
  { id: 'airy', terms: ['sheer curtain breeze', 'high ceiling light', 'open bright space'], hue: 190, chroma: 0.2, lift: 0.88, traits: { valence: 0.6, energy: 0.3, warmth: 0, light: 0.9 }, kin: ['buoyant', 'clean', 'ethereal'] },
  { id: 'refined', terms: ['fine tailoring detail', 'marble and brass', 'considered still life'], hue: 45, chroma: 0.22, lift: 0.72, traits: { valence: 0.5, energy: 0.3, warmth: 0.3, light: 0.66 }, kin: ['elegant', 'understated', 'minimal'] },
  { id: 'elegant', terms: ['long lines fashion', 'orchid on grey', 'silk and stone'], hue: 330, chroma: 0.25, lift: 0.7, traits: { valence: 0.55, energy: 0.3, warmth: 0.15, light: 0.64 }, kin: ['refined', 'poised', 'luxurious'] },
  { id: 'understated', terms: ['muted tones interior', 'soft neutral texture', 'quiet detail'], hue: 50, chroma: 0.15, lift: 0.76, traits: { valence: 0.4, energy: 0.2, warmth: 0.25, light: 0.72 }, kin: ['minimal', 'refined', 'quiet'] },
  { id: 'monochrome', terms: ['black and white texture', 'grayscale portrait', 'high contrast form'], hue: 250, chroma: 0.03, lift: 0.7, traits: { valence: 0.2, energy: 0.4, warmth: -0.1, light: 0.6 }, kin: ['minimal', 'noir', 'clean'] },
  { id: 'brutalist', terms: ['raw concrete architecture', 'heavy geometric block', 'grey monolith'], hue: 250, chroma: 0.08, lift: 0.5, traits: { valence: 0, energy: 0.5, warmth: -0.2, light: 0.4 }, kin: ['industrial', 'monochrome', 'bold'] },

  // ── Luxe ─────────────────────────────────────────────────────────────────
  { id: 'luxurious', terms: ['marble and gold', 'velvet interior', 'silk texture light'], hue: 42, chroma: 0.55, lift: 0.5, traits: { valence: 0.65, energy: 0.35, warmth: 0.6, light: 0.4 }, kin: ['opulent', 'elegant', 'regal'] },
  { id: 'opulent', terms: ['baroque interior gold', 'chandelier detail', 'lavish banquet'], hue: 38, chroma: 0.7, lift: 0.42, traits: { valence: 0.6, energy: 0.5, warmth: 0.7, light: 0.32 }, kin: ['luxurious', 'decadent', 'regal'] },
  { id: 'decadent', terms: ['dark chocolate texture', 'rich red wine', 'velvet and fruit'], hue: 355, chroma: 0.6, lift: 0.34, traits: { valence: 0.5, energy: 0.4, warmth: 0.7, light: 0.24 }, kin: ['opulent', 'sensual', 'luxurious'] },
  { id: 'glamorous', terms: ['sequins and light', 'red carpet glow', 'vintage hollywood'], hue: 320, chroma: 0.65, lift: 0.5, traits: { valence: 0.7, energy: 0.65, warmth: 0.4, light: 0.44 }, kin: ['opulent', 'elegant', 'festive'] },

  // ── Land ─────────────────────────────────────────────────────────────────
  { id: 'earthy', terms: ['clay and terracotta', 'soil texture', 'raw natural material'], hue: 30, chroma: 0.5, lift: 0.58, traits: { valence: 0.4, energy: 0.25, warmth: 0.7, light: 0.5 }, kin: ['grounded', 'rustic', 'organic'] },
  { id: 'organic', terms: ['natural fibre texture', 'leaf vein macro', 'driftwood form'], hue: 85, chroma: 0.42, lift: 0.66, traits: { valence: 0.5, energy: 0.25, warmth: 0.35, light: 0.6 }, kin: ['earthy', 'botanical', 'verdant'] },
  { id: 'verdant', terms: ['dense green forest', 'moss covered stone', 'jungle canopy'], hue: 142, chroma: 0.7, lift: 0.5, traits: { valence: 0.6, energy: 0.35, warmth: 0.1, light: 0.42 }, kin: ['botanical', 'tropical', 'organic'] },
  { id: 'botanical', terms: ['pressed leaves study', 'greenhouse plants', 'fern detail'], hue: 128, chroma: 0.55, lift: 0.68, traits: { valence: 0.6, energy: 0.25, warmth: 0.1, light: 0.62 }, kin: ['verdant', 'organic', 'pastoral'] },
  { id: 'oceanic', terms: ['deep ocean blue', 'waves from above', 'underwater light'], hue: 210, chroma: 0.7, lift: 0.5, traits: { valence: 0.45, energy: 0.5, warmth: -0.6, light: 0.42 }, kin: ['coastal', 'blue', 'aquatic'] },
  { id: 'aquatic', terms: ['underwater bubbles', 'pool light ripples', 'submerged plants'], hue: 190, chroma: 0.7, lift: 0.62, traits: { valence: 0.5, energy: 0.45, warmth: -0.5, light: 0.56 }, kin: ['oceanic', 'coastal', 'crisp'] },
  { id: 'coastal', terms: ['pale beach dunes', 'weathered pier', 'sea grass wind'], hue: 195, chroma: 0.4, lift: 0.78, traits: { valence: 0.6, energy: 0.35, warmth: 0.1, light: 0.76 }, kin: ['oceanic', 'airy', 'summery'] },
  { id: 'alpine', terms: ['snow covered peaks', 'pine forest ridge', 'mountain hut mist'], hue: 200, chroma: 0.4, lift: 0.7, traits: { valence: 0.5, energy: 0.4, warmth: -0.6, light: 0.68 }, kin: ['wintry', 'majestic', 'crisp'] },
  { id: 'tropical', terms: ['palm leaves sun', 'turquoise lagoon', 'hibiscus colour'], hue: 160, chroma: 0.85, lift: 0.68, traits: { valence: 0.8, energy: 0.7, warmth: 0.5, light: 0.68 }, kin: ['verdant', 'summery', 'vibrant'] },
  { id: 'desert', terms: ['sand dune ripples', 'red rock canyon', 'dry heat horizon'], hue: 35, chroma: 0.6, lift: 0.7, traits: { valence: 0.35, energy: 0.35, warmth: 0.9, light: 0.68 }, kin: ['arid', 'earthy', 'desolate'] },
  { id: 'arid', terms: ['cracked dry earth', 'sparse scrubland', 'bleached bone stone'], hue: 48, chroma: 0.35, lift: 0.72, traits: { valence: 0, energy: 0.25, warmth: 0.8, light: 0.7 }, kin: ['desert', 'desolate', 'earthy'] },
  { id: 'arctic', terms: ['ice floe blue', 'polar white expanse', 'frozen sea'], hue: 205, chroma: 0.35, lift: 0.84, traits: { valence: 0.25, energy: 0.3, warmth: -0.9, light: 0.86 }, kin: ['wintry', 'crisp', 'isolated'] },

  // ── Season ───────────────────────────────────────────────────────────────
  { id: 'autumnal', terms: ['golden autumn leaves', 'misty october woods', 'harvest colours'], hue: 32, chroma: 0.72, lift: 0.6, traits: { valence: 0.5, energy: 0.35, warmth: 0.8, light: 0.54 }, kin: ['nostalgic', 'earthy', 'cozy'] },
  { id: 'wintry', terms: ['snow on branches', 'frozen lake grey', 'winter dusk light'], hue: 218, chroma: 0.28, lift: 0.78, traits: { valence: 0.15, energy: 0.2, warmth: -0.8, light: 0.78 }, kin: ['arctic', 'crisp', 'quiet'] },
  { id: 'vernal', terms: ['cherry blossom branches', 'spring green shoots', 'first flowers'], hue: 340, chroma: 0.5, lift: 0.82, traits: { valence: 0.8, energy: 0.45, warmth: 0.4, light: 0.82 }, kin: ['renewed', 'gentle', 'botanical'] },
  { id: 'golden', terms: ['golden hour field', 'warm amber light', 'wheat at sunset'], hue: 44, chroma: 0.78, lift: 0.72, traits: { valence: 0.8, energy: 0.4, warmth: 0.9, light: 0.78 }, kin: ['radiant', 'warm', 'autumnal'] },
  { id: 'fresh', terms: ['dew on grass', 'cut citrus', 'clean morning air'], hue: 148, chroma: 0.65, lift: 0.82, traits: { valence: 0.75, energy: 0.5, warmth: 0, light: 0.84 }, kin: ['crisp', 'renewed', 'clean'] },
  { id: 'summery', terms: ['sunlit summer field', 'lemonade and shade', 'warm evening swim'], hue: 62, chroma: 0.75, lift: 0.8, traits: { valence: 0.8, energy: 0.6, warmth: 0.85, light: 0.84 }, kin: ['sunny', 'coastal', 'radiant'] },

  // ── Signal ───────────────────────────────────────────────────────────────
  { id: 'retro', terms: ['seventies interior colour', 'vintage car chrome', 'analogue tv glow'], hue: 28, chroma: 0.68, lift: 0.62, traits: { valence: 0.5, energy: 0.5, warmth: 0.7, light: 0.56 }, kin: ['vintage', 'nostalgic', 'analog'] },
  { id: 'vintage', terms: ['sepia photograph', 'antique objects', 'worn leather books'], hue: 34, chroma: 0.45, lift: 0.66, traits: { valence: 0.3, energy: 0.25, warmth: 0.7, light: 0.6 }, kin: ['retro', 'nostalgic', 'rustic'] },
  { id: 'analog', terms: ['film grain texture', 'cassette tape', 'darkroom prints'], hue: 25, chroma: 0.4, lift: 0.58, traits: { valence: 0.35, energy: 0.3, warmth: 0.55, light: 0.5 }, kin: ['retro', 'vintage', 'nostalgic'] },
  { id: 'futuristic', terms: ['sleek white technology', 'chrome curves', 'sci fi interior'], hue: 195, chroma: 0.6, lift: 0.6, traits: { valence: 0.45, energy: 0.65, warmth: -0.5, light: 0.56 }, kin: ['technical', 'cyber', 'clean'] },
  { id: 'cyber', terms: ['neon cyberpunk street', 'holographic surface', 'data glow night'], hue: 305, chroma: 0.92, lift: 0.28, traits: { valence: 0.3, energy: 0.9, warmth: -0.2, light: 0.18 }, kin: ['neon', 'futuristic', 'electric'] },
  { id: 'neon', terms: ['neon sign reflection', 'pink and blue night glow', 'arcade lights'], hue: 325, chroma: 0.95, lift: 0.26, traits: { valence: 0.45, energy: 0.9, warmth: 0.1, light: 0.18 }, kin: ['cyber', 'electric', 'vibrant'] },
  { id: 'industrial', terms: ['factory steel beams', 'rusted machinery', 'warehouse light'], hue: 30, chroma: 0.25, lift: 0.44, traits: { valence: -0.05, energy: 0.5, warmth: 0.3, light: 0.34 }, kin: ['brutalist', 'technical', 'urban'] },
  { id: 'technical', terms: ['circuit board macro', 'engineering drawing', 'precision machinery'], hue: 185, chroma: 0.5, lift: 0.5, traits: { valence: 0.25, energy: 0.55, warmth: -0.4, light: 0.42 }, kin: ['analytical', 'futuristic', 'industrial'] },
  { id: 'urban', terms: ['city street texture', 'rooftop skyline dusk', 'subway light'], hue: 240, chroma: 0.3, lift: 0.46, traits: { valence: 0.2, energy: 0.65, warmth: -0.1, light: 0.38 }, kin: ['industrial', 'noir', 'dynamic'] },
]

/** Fast id → mood lookup, built once at module load. */
export const MOOD_BY_ID = new Map(MOODS.map((mood) => [mood.id, mood]))

/** Every adjective the board knows, alphabetised — powers the typeahead. */
export const MOOD_IDS = MOODS.map((mood) => mood.id).sort()

/** Curated starting points shown as chips before the visitor types anything. */
export const FEATURED_MOODS = [
  'serene',
  'euphoric',
  'melancholy',
  'nostalgic',
  'cyber',
  'botanical',
  'noir',
  'hygge',
  'ethereal',
  'brutalist',
  'autumnal',
  'wanderlust',
]
