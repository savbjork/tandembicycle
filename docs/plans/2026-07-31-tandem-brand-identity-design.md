# Tandem brand identity — design

**Date:** 2026-07-31
**Status:** Decided
**Related:** [Brand naming decision](2026-07-31-brand-naming-decision.md) · [Cobalt & Tangerine](2026-07-19-cobalt-tangerine-design.md) · [Net & Heads of Responsibility](2026-07-04-net-domains-design.md)

## Decisions

| Element | Decision | Rejected |
|---|---|---|
| Name | **Tandem** | Helm, Weir, Reeve, + 19 others (see naming doc) |
| Icon | **T1 — full tandem bicycle**, double-diamond frame | T2 clean profile, T3 bold, T4 riders-forward, and 6 abstract marks |
| Wordmark | **lowercase `tandem`**, NanumMyeongjo ExtraBold, final `m` in tangerine | Title case, letterspaced caps |
| Tagline | **"Everyone pedals together"** | "Pedal together", "Nobody coasts", "A better Tuesday", "Say it once. Then let it go." |
| Home-screen label | **Tandem** | "Tandem Home", "Tandem: Mental Load" |
| App Store name | **Tandem: Shared Mental Load** (26/30) | "Tandem" alone, "Tandem: A fair play app" (trademark), "Tandem: Sharing household labor" (31 chars) |
| App Store subtitle | **For partners in the home** (24/30) | ~20 list variants — see below |

### Why the subtitle is not a list

Eight rounds went into enumerating audiences ("couples, partners, families, housemates…").
Every list has the same flaw: **it excludes by omission**, and at 30 characters you cannot
enumerate enough to stop. "For partners in the home" solves it differently — the phrase
"in the home" flips *partners* from its romantic sense into its collaborative one: people who
partner in the work of running a place. Roommates, adult siblings and couples all qualify
without being named.

Also discovered along the way: in "for couples, partners, families", **couples and partners are
the same people** — a duplicate costing ~9 characters, which is why the list never fit.

## Icon — T1

Full double-diamond tandem frame. Chosen with eyes open: T1 is the least legible of the four
candidates at 29pt, and Expo downsamples a single 1024px source rather than allowing a
simplified small-size asset the way a native asset catalog does.

**Geometry** (100×100 viewBox, squircle `rx=23`):

```
wheels    circle(23,68,r14) · circle(77,68,r14)     stroke mark, w4
frame     M23 68 L35 44 H63 L77 68                  stroke mark, w4
          M35 44 L50 68 L63 44                      (double diamond)
          M50 68 H23
riders    circle(35,37,r5.5) · circle(63,37,r5.5)   fill accent
posts     M35 44 V40 · M63 44 V40                   stroke accent, w3.5
```

**Colors** (per the two-hue role rules — cobalt is structure, tangerine is the people):

| Variant | Ground | Mark | Accent |
|---|---|---|---|
| Dark (primary) | cobalt-900 `#0A1340` | cobalt-100 `#DDE3FA` | tangerine-500 `#FF6B2B` |
| Light | cobalt-50 `#EDF0FD` | cobalt-600 `#1F3AB8` | tangerine-500 `#FF6B2B` |

**Open decision:** ship T1 as drawn, or a stroke-thickened variant that survives the downsample
with the frame intact. Both to be rendered at 1024 / 180 / 120 / 87 / 58 / 29 px and compared
before the asset set is generated.

## Wordmark

NanumMyeongjo ExtraBold, lowercase, tight tracking (≈ −0.8px at 44px), final `m` in
tangerine-500. Latin subset only — the shipped TTF is ~3 MB because of Korean glyphs.

## Tagline usage

**"Everyone pedals together"** is a *product* line, not a store field. It appears on the first
App Store screenshot, the splash screen, onboarding, and marketing. It is deliberately **not**
the App Store subtitle:

- Screenshot captions are unindexed — they reach every visitor at zero keyword cost.
- "Pedals" in an indexed field nudges Apple's classifier toward cycling/fitness. With *Tandem*
  (a bicycle), a bicycle icon and "pedals", three of four signals would point away from the
  actual category.

## App Store metadata

Name, subtitle and keywords are indexed **together**, so no word may repeat across them.
Title keywords carry roughly 5× the weight of subtitle keywords.

| Field | Limit | Value | Used |
|---|---|---|---|
| Name | 30 | `Tandem: Shared Mental Load` | 26 |
| Subtitle | 30 | `For partners in the home` | 24 |
| Keywords | 100 | `chores,couples,housemates,roommates,family,invisible,labor,divide,tasks,marriage,duties,fair` | 92 |
| Description | 4000 | must credit "inspired by Eve Rodsky's Fair Play method" | — |

`fair` alone is safe as a keyword; the registered mark is the paired phrase **Fair Play**, which
must stay out of the name and subtitle. Precedent: FairShare ships as *"FairShare: Couples
Mental Load"* and credits the method only in its description.

## Implementation scope

### In scope now

1. `app.json` — `name`: `fairplay` → `Tandem`; `slug`: `fairplay` → `tandem`.
   **Verify first:** `extra.eas.projectId` is set explicitly, so the slug change should not
   break the EAS link — confirm against EAS config before editing rather than assuming.
2. Generate the icon asset set from the chosen T1 variant: `icon.png` (1024²),
   `adaptive-icon.png`, `splash-icon.png`, `favicon.png`.
3. Splash `backgroundColor` `#ffffff` → cobalt-900 `#0A1340` to match the icon ground.
4. Android `adaptiveIcon.backgroundColor` `#ffffff` → `#0A1340`.
5. Doc titles that use "Fair Play" as the *product* name — `tandem-mobile/README.md`,
   `ARCHITECTURE.md`, `IMPLEMENTATION_SUMMARY.md`. Methodology attribution stays; product-name
   usage becomes Tandem.

### Deferred — paused by Savannah 2026-07-31

**Bundle identifier and App Store Connect.** `com.savbjork.fairplay` is already registered as an
app record, and a bundle ID is immutable once a record exists — the ID can never be reclaimed or
reused. Changing it requires a new App ID, a new app record, regenerated EAS credentials, and
removing the old record from sale in all countries even though it was never released.

Nothing above depends on this; `name` and `slug` can change while `bundleIdentifier` stays as-is.
**Do not touch `bundleIdentifier` until Savannah reopens it.**

Outstanding question for when it resumes: has any build been uploaded to TestFlight under the old
record? If not, the change costs nothing but the setup.

### Out of scope

- Android `package` (not currently set; belongs with the bundle-ID work)
- App Store screenshots beyond specifying where the tagline goes
- The deferred "has the watch" vocabulary (separate spec)
- Finishing Card → Domain (~342 `card` refs vs ~50 `domain`) — a prerequisite for further
  vocabulary work, but independent of branding

## Open items

1. T1 as drawn vs stroke-thickened — decide after the size comparison.
2. Verify the EAS slug behaviour before editing `app.json`.
3. Trademark clearance for "Tandem" in the mobile-app class. Search rules names out; it cannot
   clear one. The language-exchange Tandem (1M+ users) owns the bare word in store search — the
   qualified store title is the mitigation, not a legal opinion.
