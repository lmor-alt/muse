# Project Memories

## Architectural Decisions

### Design System Variable Naming Convention
The CSS design system uses semantic naming without `--color-` prefix:
- Colors: `--brass`, `--sage`, `--terracotta`, `--ink`, `--sand` (with `-light`, `-dark`, `-muted` variants)
- Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-elevated`, `--bg-tertiary`
- Typography: `--font-display`, `--font-body`, `--text-*` sizes, `--weight-*`
- WHY: Semantic names are more maintainable than descriptive color names (e.g., `--brass` vs `--color-gold`). The palette can evolve while keeping meaningful semantic relationships.

### "Contemporary minimalism with analog soul" Aesthetic
- Warm, muted earthy tones (no pure whites/blacks)
- Brass/gold accents for interactive elements (hover, selected states)
- Layered box-shadows for tactile depth (subtle neumorphism)
- Fraunces (display serif) + DM Sans (body) font pairing
- WHY: Creates warmth and approachability for a music education app vs sterile tech aesthetic.

### State Colors
- Correct answers: `--sage` (muted green)
- Incorrect answers: `--terracotta` (warm rust/red)
- Highlights/selected: `--brass` (gold accent)
- WHY: Warm, non-jarring feedback colors that fit the overall palette.

## Gotchas

### CSS Modules Variable Migration
When updating CSS files from old variable scheme to new:
- Old: `--color-parchment`, `--color-cream`, `--color-charcoal`, `--color-gold`, `--color-stone`
- New: `--bg-secondary`, `--bg-elevated`, `--ink`, `--brass`, `--sand`
- Old font vars (`--font-size-*`, `--font-weight-*`) → New (`--text-*`, `--weight-*`)

### Exercise CSS Files Location
Exercise-specific CSS files are in `/src/exercises/{category}/` not `/src/components/`:
- pitch-notes, intervals, chords, rhythm directories
- Each has ExerciseSettings.module.css plus exercise-specific CSS
