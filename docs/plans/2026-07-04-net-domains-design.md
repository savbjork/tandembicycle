# The Net & Heads of Responsibility — Design

**Date:** 2026-07-04
**Status:** Approved

## Overview

Tandem pivots from a measurement tool (who holds which cards, weighted balance) to a
**relief valve**: a trusted net where any household thought can be captured and released,
routed to the single partner responsible for that slice of life. The product promise is
*caught = you're allowed to forget it.*

Positioning: Fair Play sells a better conversation (the deal). AI copilots (Ohai, Milo)
sell a robot that remembers. Tandem sells a better Tuesday — a flow where a human partner
is genuinely responsible, so the other partner can actually stop tracking.

### Research grounding

- **Zeigarnik effect / Masicampo & Baumeister (2011):** open loops create mental tension;
  a trusted plan relieves it without finishing the task. Capture must be zero-friction and
  nothing may ever silently die, or trust in the net collapses.
- **Daminger (2019), _The Cognitive Dimension of Household Labor_:** cognitive labor =
  anticipate, identify, decide, monitor. Deciding is usually shared; **anticipating and
  monitoring are done alone**, overwhelmingly by women. Those two phases are what a
  domain head takes over.
- **Scorekeeping research:** zero-sum point systems breed resentment; people get defensive
  when shown imbalance evidence; ~50% of task-dividing couples feel their split is fair vs
  98% of broadly-sharing couples. Therefore: no computed balance score, no leaderboard.

## Core concepts

The pipeline: **thought → (routed to) domain → (triaged into) task / done / someday / declined.**

- **The Net** captures raw thoughts — plain text, no type, no owner, no due date.
  A Net item is *not* a task and *not* a domain; it is pre-task. If the Net captured
  tasks, the capturer would be doing the planning — delegation with extra steps, the
  exact pattern this app kills.
- **Domain** (evolves `Card`): a slice of household responsibility with at most one
  **head**. The head owns the anticipating and monitoring for that domain,
  scrum-master style. A domain with no head is **unclaimed** and visible to both.
- **Routing**: assigning a captured thought to a domain sends it into that domain
  head's triage. The capturer never decides who does it, when, or how.
- **Triage**: the head processes incoming items: create a task / handle now (done) /
  someday / **decline with reason**. Declining bounces the item back to the capturer's
  Net — explicit renegotiation instead of silent dropping.

## Data model

### Domain (evolves `Card`)

```ts
interface Domain {
  dbId?: string;
  name: string;
  head?: Person;            // undefined = unclaimed
  note?: string;
  strain?: DomainStrain;    // 'light' | 'manageable' | 'drowning'
  strainAt?: string;        // ISO timestamp of last strain rating
}
```

- `frequency` and `FREQUENCY_WEIGHT` are removed from the UI and code paths.
  The Supabase `frequency` column stays in place (unused) — no destructive migration.

### NetItem (evolves `DropZoneItem`)

```ts
type NetItemStatus =
  | 'unrouted'   // captured, no domain yet — sits in capturer's "to route" pile
  | 'pending'    // routed, awaiting the head's triage
  | 'accepted'   // head turned it into a task (or scheduled it)
  | 'done'       // head handled it on the spot
  | 'someday'    // head parked it in the domain's someday pile
  | 'declined';  // head bounced it back with a reason

interface NetItem {
  id: string;
  capturer: Person;
  content: string;
  domainId?: string;        // set at routing
  status: NetItemStatus;
  declineReason?: string;   // required when status = 'declined'
  createdAt: Date;
}
```

### Task

Shape unchanged. Every task belongs to a domain; its owner is the domain head by
definition (no independent task assignment across partners).

## Visibility rules (the wall)

1. Tasks and someday items in a domain are visible **only to the head**.
   Client-side filtering for MVP; Supabase RLS hardening deferred.
2. After routing, the capturer's copy shows "Caught → <domain>" and fades from the Net
   view. No status tracking, no notifications about the head's backlog.
3. The only signal that crosses back is a **decline with reason**, which reappears in
   the capturer's Net.
4. A non-head cannot create or assign tasks inside someone else's domain — the UI only
   offers the Net. This is the structural enforcement of notice-plan-do ownership
   (the onboarding "contract screen" is explicitly skipped for now).
5. **Strain is the one deliberate signal that crosses the wall**: self-reported per
   domain by its head, visible to both partners. It is never computed from task data.

## Screens

- **Net** (replaces Inbox): capture box pinned on top, zero required fields. Sections:
  *To route* (own unrouted captures; one tap assigns a domain), *Your triage* (pending
  items in domains you head, with the four triage actions), and declined items returned
  to you. Recently routed items show briefly ("Caught → Groceries") then fade.
- **Domains** (replaces Cards): your domains with strain dot + pending-triage count;
  partner's domains as plain rows (name + head only — no counts, no tasks); unclaimed
  domains in their own section, claimable by either partner. **BalanceMeter removed.**
- **Domain detail**: head sees backlog (tasks + someday pile) and triage actions, plus
  editable strain. Non-head sees name, head, and an empty state ("Alex heads this").
- **Tasks**: own tasks only; otherwise unchanged.
- **Strain check**: dismissible weekly prompt to rate only your own domains
  (light / manageable / drowning); also editable anytime from domain detail.

## Removed / deferred

**Removed:** BalanceMeter, frequency weights and card tints, weighted-points logic.

**Deferred (agreed, not in this MVP):** domain-claim contract screen, perception-gap
features, weekly huddle ritual, minimum-standards per domain, appreciation recaps,
auto-suggest routing, widget/Siri/share-sheet capture, RLS-enforced privacy.

## Migration path

- **Supabase:** add `strain text`, `strain_at timestamptz` to `cards`; add `domain_id`,
  expand `status` values, and add `decline_reason` to the drop-zone items table.
  Existing rows map: `pending → pending`, `converted → accepted`, `dismissed → declined`
  (no reason), `archived → done`.
- **UI renames:** Cards → Domains, Inbox → Net. Code-level renames may land
  incrementally.
- **Existing flows:** the swipe/deal flow survives as the mechanism for claiming
  unclaimed domains. No data loss, no rewrite — this is a re-plumbing.

## Error handling

- Routing to a domain that was deleted/renamed concurrently: item reverts to
  `unrouted` with a subtle notice.
- Decline requires a non-empty reason (enforced in the decline sheet).
- Offline captures queue locally and sync on reconnect (existing Supabase client
  behavior; no new infrastructure).

## Testing

- Unit: NetItem status transitions (legal moves only), visibility filters
  (non-head never receives partner's tasks/someday items in any selector).
- Component: triage actions on the Net screen; domain detail head vs non-head states.
- Manual: two-account walkthrough — capture, route, triage, decline round-trip;
  strain prompt cadence.
