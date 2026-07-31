# Brand naming — decision & rejected options

**Date:** 2026-07-31
**Status:** Decided (name only)
**Related:** [Cobalt & Tangerine](2026-07-19-cobalt-tangerine-design.md) · [Net & Heads of Responsibility](2026-07-04-net-domains-design.md)

## Decision

**The app is Tandem.** Two riders, one drivetrain, nobody coasting — the metaphor encodes the
product's thesis (both partners genuinely carrying, neither subordinate) and the equity already
exists across the repo, docs and design history.

Kept warm, not chosen: **Helm**, **Weir**, **Reeve**. Rationale for each below.

> **This was a naming exercise, not trademark clearance.** Everything here comes from web and
> App Store search, which reliably rules names *out* but cannot clear one *in*. Before shipping
> under any name, run a real USPTO + App Store clearance.

## Two risks found along the way (act on these regardless of name)

1. **`com.savbjork.fairplay` should not ship.** `app.json` still carries `name: "fairplay"`,
   `slug: "fairplay"` and `bundleIdentifier: "com.savbjork.fairplay"`. "Fair Play" is Eve
   Rodsky's trademarked method, and **FairShare** is already on the App Store explicitly
   marketed as "inspired by Eve Rodsky's Fair Play method" with 100+ cards — essentially
   pre-pivot Tandem. Renaming these is now a prerequisite to a TestFlight build, not a polish item.
2. **The Card → Domain rename is ~13% done.** Source carries ~342 `card` references against
   ~50 `domain`. The split is user-visible: "Add Domain" and "No claimed domains yet" ship
   alongside "Select Card" (`CardPickerField.tsx:90`), "No cards found", and "Choose specific
   cards to assign" (`ShuffleModal.tsx:62`). The feature directory is still `features/cards/`.
   Finish this before layering any further vocabulary.

## Competitive landscape (denser than the net-domains doc assumed)

That doc names Ohai and Milo as the AI-copilot competition. The category is now crowded:

**FairShare · fiftyfifty · RemindHer · AlphaMa · Nestmate · Homsy · evenus · Tidied · Maple ·
Nori · Cozi · OurHome · ChoreBuster · Ohai · Hearth Display**

Most are explicitly scorekeeping — "equity score", "family leaderboard", "reduces arguments by
80–90%". That is the pattern the net-domains research says breeds resentment, which means
**naming the *holding* rather than the *measuring* is the open lane.** Visually the category is
uniformly soft pastels; deep cobalt with a tangerine accent is genuinely differentiated.

**Direct competitor to watch: [Exhale](https://exhaleapp.io/)** — "Get the family load out of
your head." Speak tasks aloud, the app sorts them for the family to pick up. Closest thing found
to Tandem's relief-valve positioning.

## The 23 candidates

Grouped by naming territory. Collision status from July 2026 search.

### A — Two people, one load
| Name | Status | Note |
|---|---|---|
| **Tandem** | **CHOSEN** | Tandem language-exchange app (1M+ users) owns the bare word in App Store search. Mitigation: qualify as **Tandem Home** for store listing and SEO — "tandem" alone tells a shopper nothing about the category. |
| Twoheads | clear | No app found. "Two heads are better than one" + every domain has a head. |
| Relay | kill | Republic Wireless Relay (screenless kids' phone) — family-adjacent; plus Relay.app. |
| Ferry | clear | No collision. Soft, warm; weak trademark (common word). |

### B — The net & catching
| Name | Status | Note |
|---|---|---|
| Net | check | No household collision but unregistrable alone and reads financial. **Better as a feature name inside another brand — which is what it already is.** |
| Catch | check | No collision; bare common verb, near-impossible to protect or rank for. |
| **Weir** | **clear — best available word** | Only Weir Group PLC (industrial mining), a different trademark class. A structure that catches everything in the current with nobody standing there. |
| Mitt | clear | No collision. Sporty, may skew masculine. Means "my" in Swedish. |
| Cradle | kill | No app collision, but baby association signals "for the mom" — opposite of the couples-equity pitch. |
| Holdall | clear | Only luggage retail. Reads British; describes storage, not routing. |

### C — Setting it down
| Name | Status | Note |
|---|---|---|
| Exhale | kill | Direct competitor (above), plus a wellness app. |
| Setdown | clear | Nothing found anywhere. Coined compound, properly registrable. |
| Offhand | check | OffHand exists on the App Store (photo-reference tool for artists). |
| Unspool | kill | Unspool — Voice-based Journal is live; unspool.app. |
| Landing | check | "Landing" is a large US apartment-rental brand; also collides with "landing page". |

### D — Domains & who's the head
| Name | Status | Note |
|---|---|---|
| Purview | check | Microsoft Purview — trademarked, same broad software class, actively enforced. |
| Remit | check | Heavy fintech shadow (Remitly et al.); "remit" as a payments verb. |
| **Helm** | **runner-up** | See below. |
| Beat | kill | Beats/Apple plus countless fitness apps. Unsearchable. |
| Steward | kill | Five live "Steward" apps incl. Steward+Helm (below). Churchy/finance halo. |

### E — A better Tuesday
| Name | Status | Note |
|---|---|---|
| Tuesday | check | Two unrelated "Tuesday" apps (real-estate MLS). Weak trademark, strong story — it's the positioning line from the net-domains doc. |
| Hearth | kill | **Worst collision found.** Hearth Display (VC-funded, TechCrunch-covered) + Hearth Companion + Hearthly Chores & More + HearthSync. Exact category. |
| Keep | kill | Google Keep. Not a legal risk — a discoverability one, and in precisely Tandem's capture category. |

### Late additions (custodial territory)
Surfaced after the shortlist showed a preference for *custodial* words — solid, slightly
old-world nouns about someone or something that **holds** on your behalf.

| Name | Status | Note |
|---|---|---|
| **Reeve** | **clear — runner-up** | The officer who ran a manor's affairs on behalf of the household; the literal medieval head-of-domain (shire-reeve → sheriff). **Steward's exact meaning without Steward's crowd.** |
| Ward | clear | "A thing watched over" and "the act of watching over it". Works like "purview" without Microsoft. |
| Holdfast | clear | The root structure anchoring kelp against the current — doesn't feed the plant, just refuses to let go. |

## Why the runners-up lost

**Helm** had the best icon in the exercise and by far the richest vocabulary (see below), but
**it does not convey partnership.** A ship has one helm; the live idiom "at the helm of" means
*in sole charge*. For a household app that reads as a better tool for the person who already
runs the house, with the partner as staff — the "delegation with extra steps" pattern the
net-domains doc exists to kill. Partnership would have to be repaired by icon and tagline
rather than carried by the word. Also crowded: Kubernetes Helm (CNCF-backed, developer tooling)
and **Steward+Helm: Home, Redefined** — a live Yardi Systems property app, 163 ratings.

**Weir** is the cleanest word available and has no hierarchy baggage, but its semantic field
themes *capture* and offers nothing for *ownership* — and ownership is the differentiator.
Every competitor does capture; none does "one named person holds this."

**Reeve** is conceptually excellent but sits in a manorial field (manor, lord, tenant, villein)
— a hierarchy where one person owns another's labor. Wrong politics for an equity app. Its best
triage words, *reckoning* and *audit*, also pull toward scorekeeping.

## Deferred: the "watch" vocabulary

Explored and **not decided.** English has no word for the anticipate-and-monitor labor that a
domain head takes over (Daminger's two phases) — the gap Fair Play never filled. Nautical
watch-standing supplies one, and it survives outside a nautical brand because *watch* is
ordinary English:

- Domain head → **"has the watch"**
- The handoff → **"You have the watch."** A ritual sentence; the relieved officer genuinely
  goes below and sleeps. No competitor has an equivalent.
- Strain `drowning` → **`swamped`** (plain English and nautical at once)
- Unclaimed domain → "nobody has the watch"

Crucially, watch-standing is a **rotation among peers** — nobody outranks anybody — so it
carries none of Helm's hierarchy problem, and it works inside an app named Tandem.

**The rule if this is ever picked up: invent vocabulary only where plain English genuinely
fails.** Keep Net, domain, task, someday and declined exactly as they are. The adoption model is
one partner recruiting a reluctant second; every coined word is a tax paid by the user you can
least afford to lose, and a fully-themed app reads as one person's private hobby — the exact
dynamic the product exists to fix.

Sequencing if adopted: finish Card → Domain **first**, then layer watch language as a separate,
smaller pass. It touches the `Domain.head` field and a lot of UI copy, so it needs its own spec.

## Icon direction (not decided)

The Tandem mark explored here: two cobalt wheels joined by a tangerine crossbar, with a
tangerine rider dot above — cobalt-600 `#1F3AB8` ground, cobalt-100 `#DDE3FA` rings, tangerine-500
`#FF6B2B` accent, per the two-hue role rules. Light variant inverts to cobalt-50 `#EDF0FD` ground
with a cobalt-600 mark. Wordmark set in **NanumMyeongjo ExtraBold**, lowercase, with the final
letter in tangerine.

Not yet done: full iOS icon size set, splash screen, adaptive Android icon, App Store screenshots.

## Next steps

1. Rename `name` / `slug` / `bundleIdentifier` off `fairplay` in `app.json` (blocks TestFlight).
2. Finish Card → Domain across source and UI copy.
3. Real trademark clearance on "Tandem" for the mobile-app class before store submission.
4. Decide the icon variant, then produce the full asset set.
5. Optional, separate spec: the watch vocabulary.
