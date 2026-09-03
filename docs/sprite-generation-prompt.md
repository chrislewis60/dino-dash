# Dinosaur Spritemap Generation Prompt

Use this prompt when generating or commissioning a replacement dinosaur character spritemap for Dino Dash.

```text
Create a 5-row sprite sheet for a right-facing cartoon green dinosaur character
for a fast-paced prehistoric platform runner.

Use a transparent background. Use a perfectly aligned uniform grid. Each frame
must be the same size. Keep the dinosaur at the same scale in every frame and
align its feet consistently so animation does not cause unwanted visual movement.

The dinosaur should always face right and should have a clear silhouette at game
scale. Keep the full tail, head, and feet inside each frame. Leave enough space
around the character for animation effects.

Rows:
1. Eight-frame running-right animation with natural alternating leg and arm movement
2. Four-frame crouching/sliding animation with the body kept low and feet aligned
3. One or two airborne jumping frames, clearly separated from the running pose
4. Two to four damage/invincibility frames with red impact effects
5. Two to four power-up frames with blue energy effects

Do not include labels, borders, grid lines, extra characters, scenery, or text.
Do not change the dinosaur's proportions, colours, facing direction, or scale
between frames. Do not mirror frames. Keep the background fully transparent.
```

## Atlas Requirements

- Use one consistent frame size across the whole sheet, such as 256 x 256 pixels.
- Keep the character's feet on a consistent baseline in running, jumping, and damage frames.
- Keep the crouching character's contact point aligned with the normal standing pose.
- Use transparent pixels outside the character and effects.
- Document the final sheet dimensions and row layout alongside the image.
- Check the sheet at the game's display size before replacing the current asset.

## Suggested Layout

| Row | Animation | Frames | Renderer use |
| --- | --- | ---: | --- |
| 0 | Run right | 8 | Normal grounded movement |
| 1 | Slide | 4 | Crouching beneath hazards |
| 2 | Jump | 1–2 | Rising and airborne movement |
| 3 | Damage | 2–4 | Hit and temporary invincibility |
| 4 | Power-up | 2–4 | Shield, sprint, magnet, or roar |

Animations do not need to contain the same number of frames. Running benefits
from a longer cycle, while jumping and damage can use a small number of strong,
readable poses.
