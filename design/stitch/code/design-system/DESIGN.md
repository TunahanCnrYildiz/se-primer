---
name: SE Primer
colors:
  surface: '#fcf9f3'
  surface-dim: '#dcdad4'
  surface-bright: '#fcf9f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ed'
  surface-container: '#f0eee8'
  surface-container-high: '#ebe8e2'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#45464d'
  inverse-surface: '#31312d'
  inverse-on-surface: '#f3f0ea'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#525e7d'
  primary: '#000a24'
  on-primary: '#ffffff'
  primary-container: '#14213d'
  on-primary-container: '#7c89aa'
  inverse-primary: '#b9c6ea'
  secondary: '#994709'
  on-secondary: '#ffffff'
  secondary-container: '#ff9656'
  on-secondary-container: '#713000'
  tertiary: '#160800'
  on-tertiary: '#ffffff'
  tertiary-container: '#361b00'
  on-tertiary-container: '#be7934'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b9c6ea'
  on-primary-fixed: '#0d1b36'
  on-primary-fixed-variant: '#3a4664'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#ffb68e'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#763300'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#ffb877'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6b3b00'
  background: '#fcf9f3'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
typography:
  headline-xl:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Source Serif 4
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-card: 1.25rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes an atmosphere described as "an illustrated primer opened during a night shift." It pairs the tactile, literary composure of an archival engineering textbook with the quiet, high-stakes precision of a real-time production telemetry console. The visual language rejects frantic emergency tropes—there are no flashing crimson alerts, garish warning badges, or patronizing gamification icons. Instead, it frames software incident response as an analytical, high-consequence discipline handled with deliberate composure.

The experience balances two aesthetic registers:
1. **The Book Surface:** Warm, tactile paper textures, deliberate serif typography, structural book dividers, and literary pacing for architectural explanations and scenario narratives.
2. **The Terminal Console:** Deep-ink slate surfaces, monospaced logs, structured metrics, and amber-glowing accent highlights representing active diagnostic tools in a low-lit operations room.

The emotional tone is calm, tensioned, cerebral, and authoritative.

## Colors
The palette is rooted in archival ink and paper, accented with amber diagnostic illumination. 

- **Primary (`#14213D`):** Archival Ink. Used for principal typography on light surfaces, high-contrast dark card substrates, deep terminal views, and primary interactive containers.
- **Secondary (`#A34E12`):** Burnt Rust. Serves as the primary operational accent against paper surfaces. Used for decision path selections, active breadcrumbs, section markings, and high-priority literary emphasis.
- **Tertiary (`#F0A35A`):** Amber Console Glow. Used exclusively against dark ink backgrounds (`#14213D`) to render active incident logs, telemetry highlights, operational status pings, and system prompts.
- **Neutral Canvas (`#F7F4EE`):** Acid-free book paper. Acts as the primary application background, providing eye relief during extended analytical sessions.
- **Surface Elevation (`#FFFDF8`):** Off-white editorial cards, inset panels, and narrative text plates.
- **Structural Stroke (`#D9D3C7`):** Fine bookbinder rules, grid dividers, and card borders.
- **Muted Text (`#5B6275`):** Secondary metadata, timestamps, annotation notes, and inactive state cues.

## Typography
Typography is split into three disciplined roles:

1. **Narrative & Titles (`Source Serif 4`):** Delivers literary weight. Headings mimic chapter titles, case study folios, and post-mortem scenario briefs. Optical sizing preserves crisp serifs across resolutions.
2. **Reading & UI (`Inter`):** Renders all core scenario prose, interactive options, and general controls. The standard body baseline is set to 16px with an open 24px line height for prolonged reading stamina.
3. **Telemetry & Diagnostics (`JetBrains Mono`):** Applied to log streams, stack traces, metrics, operational metadata, status pill readouts, and uppercase category labels (`label-caps`). All labels set in `JetBrains Mono` use uppercase casing and tracking to reinforce the feel of calibrated instruments.

## Layout & Spacing
The layout adheres to a fixed-width, dual-column editorial grid resembling an open ledger or book folio:

- **Desktop (>= 1024px):** A 12-column layout capped at 1280px max-width, framed by 48px outer margins. Scenarios split naturally into asymmetrical spreads: a 7-column editorial reading/decision ledger on the left, paired with a 5-column live telemetry/console card on the right.
- **Tablet (768px - 1023px):** An 8-column layout with 32px margins. The layout defaults to stacked panes with persistent access to the operational console via pinned tabs.
- **Mobile (< 768px):** A 4-column layout with 16px margins. Content stacks vertically: narrative brief first, decision choices secondary, with telemetry logs collapsible under a persistent diagnostic drawer.

Standard internal card padding is anchored at 20px (`space-card` / `1.25rem`) to maintain consistent, breathing margins across both book and terminal cards.

## Elevation & Depth
This design system avoids diffused drop shadows and floating atmospheric blurs. Depth is achieved via **tonal layering and crisp structural rules**:

- **Level 0 (Desk/Canvas):** Natural unprinted paper (`#F7F4EE`).
- **Level 1 (Page Surface):** Editorial Card (`#FFFDF8`) bordered with a precise `1px solid #D9D3C7` rule. No drop shadows.
- **Level 2 (Active Inspection Console):** Deep-ink dark card (`#14213D`) bordered with `1px solid rgba(255, 253, 248, 0.12)`. Renders code, stack traces, and terminal diagnostics directly onto the light desk surface, producing clear visual hierarchy through tonal contrast rather than elevation.
- **Level 3 (Overlay / Modal / Folio Insert):** Canvas of `#FFFDF8` or `#14213D` with a hard, offset structural ink rule (`box-shadow: 0 4px 0 0 #14213D` when on light paper), reinforcing physical printmaking plates.

## Shapes
Geometry is disciplined, combining gentle book corners with structured interior elements:

- **Cards & Panes:** Standardized at `14px` border-radius (`0.875rem`). This softens the clinical nature of the logs while maintaining the feel of a stitched, rounded pocket manual.
- **Buttons & Interactive Blocks:** Styled with a precise `12px` border-radius (`0.75rem`).
- **Pills, Timestamps, and Badges:** Maintained as micro-capsules (`9999px`) or rigid rectangles (`4px`), differentiating operational telemetry from interactive cards.
- **Rule Lines:** Crisp 1px strokes; dashed lines indicate simulated perforation or system trace streams.

## Components

### Buttons & Decision Triggers
- **Primary Decision Action:** 12px border radius, `#14213D` background, `#FFFDF8` text. Hover state triggers a subtle rust tint (`#A34E12`). Active state compresses 1px downward.
- **Secondary Decision Alternative:** 12px border radius, `#FFFDF8` background, 1px border `#D9D3C7`, `#14213D` text. Hover shifts border color to `#14213D`.
- **Destructive/Critical Remediation Action:** 12px border radius, border of 1.5px dashed `#A34E12`, text `#A34E12`, `#FFFDF8` surface. No saturated red alarms.

### Cards (Folios & Consoles)
- **Folio Card (Light):** `#FFFDF8` background, 14px radius, 1px solid `#D9D3C7` border, 20px padding. Used for book narrative, scenario branches, and theoretical explanations.
- **Console Card (Dark):** `#14213D` background, 14px radius, 1px solid rgba(217, 211, 199, 0.15) border, 20px padding. Monospace headers in `label-caps` styled with `#F0A35A`.

### Diagnostic Chips & Badges
- Small metadata markers with `JetBrains Mono` 11px uppercase type.
- **Normal Status:** Background `rgba(20, 33, 61, 0.06)`, text `#14213D`.
- **Degraded/Active Incident Status:** Background `rgba(163, 78, 18, 0.12)`, text `#A34E12`.
- **Terminal Monitor Glow:** When inside dark cards, badges feature background `rgba(240, 163, 90, 0.15)`, text `#F0A35A`.

### Lists & Decision Trees
- Unordered lists use em-dashes (`—`) in `#A34E12` rather than round bullet markers.
- Scenario decision branches are presented as numbered archival indices (`[ 01 ]`, `[ 02 ]`) set in `JetBrains Mono`.

### Inputs & Terminal Queries
- Background `#FFFDF8` (or `rgba(255, 255, 255, 0.05)` in dark console), 1px border `#D9D3C7`, 12px radius, 12px 16px padding.
- Focus state switches border directly to 1.5px solid `#A34E12` on light surfaces or `#F0A35A` on dark surfaces without focus ring halos.

### Checkboxes & Radios
- Square with 3px radius (checkbox) or circle (radio), `#FFFDF8` base, 1.5px border `#D9D3C7`.
- Checked state fills with `#14213D` featuring an inset `#FFFDF8` indicator mark.

### Telemetry Log Stream (Domain Component)
- Embedded inside `#14213D` dark cards. Text set in `JetBrains Mono` 13px/20px. 
- Timestamps in `#5B6275`. System parameters highlighted in `#FFFDF8`. Fault lines and stack indicators highlighted in console amber `#F0A35A`.