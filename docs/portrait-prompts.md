# Dialogue portrait production

## Current production: pop 16-bit portraits

The realistic first version was rejected by the user and is NOT used by the game. Active files are `src/assets/portraits/{owner,rival,guide,mechanic}-pop.webp`. All are 512×512 lossless WebP, prepared with nearest-neighbor resizing and a 64-color, no-dithering palette to preserve clear pixel clusters and reduce size; the dialogue portraits use CSS `image-rendering: pixelated`. The map keeps its existing smooth rendering.

Latest character rules: the shopkeeper is a friendly middle-aged man; the rival and background visitors are elementary-school children. Yui and Takumi use the same rounded child face base with different hair and clothing. Takumi's final portrait was made by editing Yui's pop portrait, preserving the face and replacing hair/outfit; he is a model-savvy schoolchild, not an adult mechanic. Future mobs reuse the shared child base rather than inventing new faces. All revisions used the built-in image tool, not the CLI.

### Active owner

Asset: `src/assets/portraits/owner-pop.webp`

Final generation/edit prompt:

```text
Use case: style-transfer. Edit target: the supplied portrait. Completely REPAINT it into a POPPY 1990s 16-bit Japanese console RPG dialogue face portrait. This must NOT look realistic or semi-realistic: no skin texture, no individual hair strands, no painting grain, no realistic fabric, no subtle gradients. Use deliberately chunky crisp pixel-art clusters on an approximately 96-by-96 logical pixel grid, bold dark-navy stepped outlines, a small saturated palette of about 24 colors, 2 or 3 flat shadow tones per material, large lively cartoon eyes, tiny simplified nose, round expressive face, oversized head filling the square, only shoulders and upper chest at the bottom. Single ORIGINAL character, not any existing game character, no text, no borders, no logos, no watermarks. Plain flat forest-teal background. Preserve only this character's recognizable hair color, hairstyle and outfit identity from the input, not its realism. The result should read instantly as a friendly colorful SNES-era character face sprite at 100px display size. Japanese middle-aged male model-shop owner: short swept gray hair, rectangular glasses with bold dark frames, warm brown eyes, blue work shirt and beige apron straps. Make him charming and slightly stout-faced with an energetic welcoming open-mouth smile. No mustache or beard. Simplify age cues to a couple of deliberate pixels, NOT wrinkles or pores.
```

### Active rival

Asset: `src/assets/portraits/rival-pop.webp`

Final generation/edit prompt:

```text
Use case: style-transfer. Edit target: the supplied portrait. Completely REPAINT it into a POPPY 1990s 16-bit Japanese console RPG dialogue face portrait. This must NOT look realistic or semi-realistic: no skin texture, no individual hair strands, no painting grain, no realistic fabric, no subtle gradients. Use deliberately chunky crisp pixel-art clusters on an approximately 96-by-96 logical pixel grid, bold dark-navy stepped outlines, a small saturated palette of about 24 colors, 2 or 3 flat shadow tones per material, large lively cartoon eyes, tiny simplified nose, round expressive face, oversized head filling the square, only shoulders and upper chest at the bottom. Single ORIGINAL character, not any existing game character, no text, no borders, no logos, no watermarks. Plain flat forest-teal background. Preserve only this character's recognizable hair color, hairstyle and outfit identity from the input, not its realism. The result should read instantly as a friendly colorful SNES-era character face sprite at 100px display size. Japanese teenage male rival: short spiky dark-plum hair, big dark brown cartoon eyes and confident playful grin; burgundy/rose-red sports jacket with a pale pink collar over navy undershirt. Youthful round head, NOT a realistic handsome adult or long narrow face. No hat, no glasses.
```

### Active guide

Asset: `src/assets/portraits/guide-pop.webp`

Final generation/edit prompt:

```text
Use case: style-transfer. Edit target: the supplied portrait. Completely REPAINT it into a POPPY 1990s 16-bit Japanese console RPG dialogue face portrait. This must NOT look realistic or semi-realistic: no skin texture, no individual hair strands, no painting grain, no realistic fabric, no subtle gradients. Use deliberately chunky crisp pixel-art clusters on an approximately 96-by-96 logical pixel grid, bold dark-navy stepped outlines, a small saturated palette of about 24 colors, 2 or 3 flat shadow tones per material, large lively cartoon eyes, tiny simplified nose, round expressive face, oversized head filling the square, only shoulders and upper chest at the bottom. Single ORIGINAL character, not any existing game character, no text, no borders, no logos, no watermarks. Plain flat forest-teal background. Preserve only this character's recognizable hair color, hairstyle and outfit identity from the input, not its realism. The result should read instantly as a friendly colorful SNES-era character face sprite at 100px display size. Japanese teenage female guide: dark brown/plum hair in a low side ponytail with a small pink hair clip, bright large dark-brown cartoon eyes, cheerful encouraging smile, berry/mauve cardigan and cream rounded-collar top. Youthful round face with clear graphic features, no realistic lashes or makeup, no hat or glasses.
```

### Active mechanic

Asset: `src/assets/portraits/mechanic-pop.webp`

Final generation/edit prompt:

```text
Use case: identity-preserve / precise-object-edit. Image 1 is the SHARED ELEMENTARY-SCHOOL CHILD FACE BASE and is the primary identity and pixel-art style reference. Image 2 is ONLY a clothing/hair color reference; do NOT keep its adult jaw, neck or facial proportions. Make a boy variant of Image 1 for an original poppy 16-bit console RPG dialogue portrait. Keep Image 1's SAME round child facial geometry, large brown eye shapes/placement, tiny simplified nose, cheeks, skin palette, cheerful open-mouth smile, face angle and pixel cluster style; the character is a Japanese elementary-school child age 10 or 11, not a teenager or adult. Change ONLY hair and clothing: remove the ponytail and pink hairclip, use short softly side-swept blue-black hair, a simple teal short-sleeved hobby shirt and pale sage small model-making apron with a small ochre pencil in its chest pocket as suggested by Image 2. Narrow child shoulders, short little neck, no neck muscles, no adult jaw, no wrinkles, no beard. Preserve Image 1's framing, plain forest-teal background, thick dark stepped outlines, cheerful saturated limited palette. Face should visibly share the same base as Image 1, NOT become a new unique adult face. Crisp chunky 96x96-logical-grid pixel art, flat shadows, no realism or painterly detail, no text, no logos, no watermark. This is a schoolchild who likes mini racing models, not a professional mechanic.
```

## Archived first version (not used in the game)

Generated with the built-in image generation tool (not the CLI/API fallback). Images were inspected, then encoded as 512×512 WebP assets for the game. Original generated files remain in the tool's generated_images directory. All characters are original; no existing-game portrait was used as an image source.

The walking sprite source is `src/game/PeopleArt.ts`. Preserve its clothing, hair, glasses and role-specific accessories when changing these portraits. Each character currently has one expression; animated lip sync and selectable expression variants are not implemented.

## owner

Asset: `src/assets/portraits/owner.webp`

Final prompt:

```text
Use case: stylized-concept. Asset type: original Japanese browser RPG dialogue portrait, a single square image, intended to be displayed 160px wide. Polished hand-painted anime illustration, grounded facial anatomy and believable clothing, expressive but not exaggerated, clean fine dark-navy linework and subtle cel-painted shading, warm soft lighting. Head-and-upper-chest close-up, eyes looking slightly toward viewer, face fills upper two-thirds, shoulders extend to bottom edge, entire head fully visible with a little padding. Plain muted dark teal backdrop, no scenery, no text, no logos, no watermark, no frames. Original character only, do not reproduce any existing game character. Match these existing walking-sprite character details exactly: Haruo Onodera, Japanese male model-shop owner about 50 years old. Short salt-and-pepper gray hair with a gentle side part, thin rectangular slate-gray eyeglasses, warm brown eyes, clean-shaven, slightly broad friendly face, subtle smile lines. Desaturated blue collared work shirt under a tan/beige canvas shop apron with visible shoulder straps and a small chest pocket. Warm welcoming closed-mouth smile, kind and dependable. Not elderly, no mustache, no yellow clothing, no overalls.
```

## rival

Asset: `src/assets/portraits/rival.webp`

Final prompt:

```text
Use case: stylized-concept. Asset type: original Japanese browser RPG dialogue portrait, a single square image, intended to be displayed 160px wide. Polished hand-painted anime illustration, grounded facial anatomy and believable clothing, expressive but not exaggerated, clean fine dark-navy linework and subtle cel-painted shading, warm soft lighting. Head-and-upper-chest close-up, eyes looking slightly toward viewer, face fills upper two-thirds, shoulders extend to bottom edge, entire head fully visible with a little padding. Plain muted dark teal backdrop, no scenery, no text, no logos, no watermark, no frames. Original character only, do not reproduce any existing game character. Match these existing walking-sprite character details exactly: Nagi Hayase, Japanese teenage boy around 15 years old, lean face, short tousled/spiky dark plum-black hair with several swept pointed tufts, dark brown eyes, quietly confident slight smile, not arrogant. Burgundy/rose-red zip-front casual sports jacket, pale pink lining and collar highlights, slate navy undershirt. No hat, no glasses, no apron, no logos. Age-appropriate teenager, not adult.
```

## guide

Asset: `src/assets/portraits/guide.webp`

Final prompt:

```text
Use case: stylized-concept. Asset type: original Japanese browser RPG dialogue portrait, a single square image, intended to be displayed 160px wide. Polished hand-painted anime illustration, grounded facial anatomy and believable clothing, expressive but not exaggerated, clean fine dark-navy linework and subtle cel-painted shading, warm soft lighting. Head-and-upper-chest close-up, eyes looking slightly toward viewer, face fills upper two-thirds, shoulders extend to bottom edge, entire head fully visible with a little padding. Plain muted dark teal backdrop, no scenery, no text, no logos, no watermark, no frames. Original character only, do not reproduce any existing game character. Match these existing walking-sprite character details exactly: Yui Miura, Japanese teenage girl around 16 years old, soft oval face, warm dark brown eyes, dark brown/plum hair in a tidy low side ponytail tucked behind one ear, a small muted pink hair clip. Berry/mauve cardigan with pale dusty-pink highlights over a simple light cream top; rounded collar, modest everyday clothing. Friendly encouraging smile. No hat, no glasses, no apron, no jewelry, no logos. Age-appropriate teenager.
```

## mechanic

Asset: `src/assets/portraits/mechanic.webp`

Final prompt:

```text
Use case: stylized-concept. Asset type: original Japanese browser RPG dialogue portrait, a single square image, intended to be displayed 160px wide. Polished hand-painted anime illustration, grounded facial anatomy and believable clothing, expressive but not exaggerated, clean fine dark-navy linework and subtle cel-painted shading, warm soft lighting. Head-and-upper-chest close-up, eyes looking slightly toward viewer, face fills upper two-thirds, shoulders extend to bottom edge, entire head fully visible with a little padding. Plain muted dark teal backdrop, no scenery, no text, no logos, no watermark, no frames. Original character only, do not reproduce any existing game character. Match these existing walking-sprite character details exactly: Takumi Saeki, Japanese young adult male around 25 years old. Short neatly side-swept dark blue-black hair, dark brown eyes, lean face and straight brows, clean-shaven. Teal blue short-sleeved work shirt with rolled cuffs under a muted pale sage/gray-green workshop apron, one chest pocket and a slim ochre pencil visible. Calm thoughtful reassuring expression and a small closed-mouth smile. No glasses, no hat, no facial hair, no logos.
```
