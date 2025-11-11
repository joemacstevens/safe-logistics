SafeLogistics Copilot – Brownfield Product Requirements Document (BMAD Method)
Executive summary (Brief)

SafeLogistics Copilot is an AI‑powered logistics assistant built on top of an existing Next.js Chat SDK template (AI SDK, Next.js App Router, Neon Postgres with Vercel AI Gateway, and Auth.js). The goal of the project is to modernize and extend American Safe & Vault’s internal safe‑management system so that a logistics coordinator (Kelly) can coordinate safe storage and transport for eBay’s trade‑show schedule. This is a brownfield project: we inherit a Supabase database with tables for safes, shows, vendors and assignments, and we already have a basic user authentication and chat interface. The enhancement will layer on a timeline‑driven UI, vendor and safe management screens, AI‑assisted route optimization, and interactive map/list views for assigning vendors and safes. The finished product should decrease the time needed to assign vendors and safes, reduce total travel mileage, and provide a clear operational picture of upcoming events.

1  Project identity

Name: SafeLogistics Copilot (working title)

Type: Brownfield enhancement to an existing Next.js/Chat SDK project hosted on Vercel with Supabase and Neon Postgres.

Objective: Provide an intelligent logistics planning tool for safe storage/transport across U.S. trade shows, leveraging AI for route optimization and vendor assignment.

Owner: Joey (Design Technologist at American Safe & Vault)

Stakeholders: Kelly (logistics coordinator), vendor managers, operations director, CEO of American Safe & Vault.

2  Primary personas & goals
Persona	Needs & goals	Pain points
Kelly – Logistics Coordinator	• Plan and visualise the trade‑show schedule. • Assign vendors to each show based on distance, vendor capacity, and time gaps. • Assign safes to shows. • Track each safe’s status (stored, in transit, delivered). • Optimise routes to minimise travel distance/time and use vendors efficiently. • Get quick answers via chat (e.g., “Who’s handling Anaheim?”).	• Manual spreadsheets and phone calls result in errors and delays. • Difficulty visualising distances and time gaps across multiple shows. • Re‑assignments are time consuming when vendor capacity changes.
Vendor Manager	• Track vendor workload and capacity. • See which vendors handle which shows and safes. • Adjust assignments proactively when vendors near capacity.	• Lack of unified view of vendor utilisation. • Hard to communicate changes between logistics and vendor teams.
Operations Director / CEO	• See overall schedule health (upcoming shows, total mileage, safe inventory). • Monitor efficiency gains (distance reduced, cost savings). • Ensure compliance and data security.	• No single source of truth for safe and vendor assignments.
3  Problem statement

American Safe & Vault coordinates safe storage and transport for trade shows across the U.S. The existing system is limited to a basic chat interface and manual spreadsheets, making it difficult to visualise schedules, assign vendors and safes efficiently, and track safe movements. This leads to wasted travel miles, idle safes, over‑ or under‑utilised vendors, and delays when show schedules change.

4  Proposed solution (Scope and features)

We will build the SafeLogistics Copilot as a brownfield enhancement following the BMAD method. Major capabilities include:

Timeline View – a vertical timeline of upcoming shows with date, location, vendor chip, and a “Next gap” line showing days and miles until the next show. Connectors between cards show time and distance gaps with vendor‑colour lines and distance/time labels.

Show Detail View – a detailed view for each trade show (venue, dates, city/state, vendor assignment, safes assigned, delivery window, distance/time gap). Provides actions: reassign vendor, assign/unassign safes, mark deliveries complete, view route on map.

Vendor Assignment View – launched from Show Detail. Supports both List view (search/filter vendors, see distance/time/capacity, assign vendor) and Map view (interactive map with vendor pins and route lines). Users can compare vendors by distance and assign a vendor directly; capacity alerts are displayed.

Safes View – a dashboard showing total safes, counts assigned/in transit/stored, and a scrollable list of all safes with status (in transit/stored/at venue), next destination and vendor. Users can assign a safe to a show or reassign it.

Safe Detail View – details for a single safe (origin, current location, next destination, ETA, movement history, vendor). Actions: assign to show, mark delivered, reassign vendor, view route on map.

Vendor List View – list of all vendors with utilisation metrics (number of shows assigned, number of safes, capacity utilisation), vendor status (active/inactive), and quick access to vendor details.

Vendor Detail View – details for a single vendor (base location, capacity, shows assigned, safes assigned, route overview). Actions: add/remove assignments, view routes on map.

Assign Safe to Show – a bottom‑sheet/overlay launched from Safe Detail or Safes View. Lists upcoming shows and allows assigning or reassigning a safe.

AI Copilot – a chat panel (docked on desktop, bottom sheet on mobile) that answers natural‑language questions and triggers actions. Provides contextual cards (e.g., route optimisation results, vendor summary, safe status) and quick action buttons (View on Timeline, Assign Vendor, Optimise Routes). The chat persists across screens.

Authentication & onboarding – simple sign‑in page (e.g., “Sign in with Google”) and initial onboarding to connect to Supabase.

Additional non‑UI features

Route optimisation & distance calculations – use OpenRouteService (via our agent integration) or Google Maps API to calculate driving distances/time between vendor base and show venues, and to compute potential mileage reductions for optimisation.

Supabase database integration – use existing Supabase tables for safes, vendors, shows, assignments and capacity. Provide migration scripts or environment notes for existing data. All new features will read/write through Supabase using the Chat SDK’s fetcher.

Security & authentication – continue using Auth.js for login; ensure role‑based access (e.g., only admin users can add vendors). Protect Supabase with row‑level security policies.

Notifications & audit trail – record assignment changes (who changed vendor or safe assignment, when). Optionally send Slack/email notifications when assignments or deliveries occur.

5  Data & integrations

Supabase – primary data store. Tables include shows (id, title, venue, dates, city/state, distanceGap, timeGap, vendorId), vendors (id, name, base_city, base_state, capacity, safeCount), safes (id, status, current_location, next_destination, vendorId, showId), and assignments linking safes and vendors to shows.

Neon Postgres – underlying Postgres database for Supabase; environment configured via Vercel and environment variables.

OpenRouteService/Google Maps – API for geocoding addresses and calculating routes/distances. Our agent will call these through the available mapping tools (OpenRoute via the earlier integrated tool definitions) or Google @maps when running as a Gem.

Vercel AI Gateway – streaming chat completions; integrated with Chat SDK. We will extend our system instructions to include guardrails (no hallucinations, use data only from Supabase or uploaded files).

Auth.js – user login and session management.

6  Workflow expectations

Login & data load – user signs in via Auth.js; timeline loads upcoming shows from Supabase; vendor and safe data load concurrently.

Planning & viewing – user scrolls through timeline to see upcoming shows, distances and time gaps. Colour coding indicates vendor continuity. Notifications appear when safe assignments change.

Assigning vendors – user taps a show card → Show Detail → Assign Vendor. By default the map view opens showing vendor pins; user can switch to list view to search. Selecting a vendor highlights the route and shows distance/time; user confirms assignment via bottom bar. Supabase updates and timeline reflects new vendor colour.

Assigning safes – user navigates to Safes View or via Show Detail; selects a safe; assigns it to a show via list of upcoming shows. Confirm assignment; timeline card updates to show safe assigned chip.

Optimising routes – user asks Copilot “Optimise routes for next month” or taps a button; the agent calculates potential mileage reductions and vendor changes; Copilot returns a card summarising distance reduced and vendors updated; user can view changes and optionally undo.

Tracking safes & deliveries – safe statuses update (stored, in transit, delivered). Safe detail view shows journey summary and movement history. Copilot can answer “Where is Safe #SL‑4821?” and provide a status card.

Vendor management – user opens vendor list to see capacity and assignments; from vendor detail view they can add or remove assignments or view vendor routes on the map.

Configuration & settings – user can manage API keys (e.g., mapping services), view account details, connect additional data sources (future phases). Not part of core scope.

7  Non‑functional requirements

Performance: initial timeline load < 2 seconds for up to 50 shows; vendor list and safe list load < 1 second; route optimisation queries should return within 5 seconds (depends on mapping API limits).

Availability: 99.9 % uptime for production; fallback to local caching for reading if Supabase is down; graceful handling of API rate limits.

Security & compliance: use HTTPS/TLS for all client–server communications; protect user data with Supabase RLS; follow SOC2/ISO 27001 practices for data handling; support multi‑factor authentication via Auth.js; maintain audit logs of changes.

Scalability: design should accommodate hundreds of shows, vendors and safes without significant performance degradation; tables should be indexed (e.g., by show date, vendor id).

Accessibility: follow WCAG 2.1 AA guidelines; ensure good contrast, keyboard navigation, and ARIA labels.

Offline/low‑connectivity: out of scope for initial release; future work may include offline caching of timeline and safe data.

8  Success metrics

Operational efficiency: average vendor assignment time < 1 minute; safe assignment time < 30 seconds; route optimisation reduces total travel miles by ≥ 20 % across a quarter.

User adoption & satisfaction: at least 80 % of logistics team uses the system daily; NPS > 8/10 by the end of first quarter after rollout.

Data accuracy: 95 %+ accuracy for safe status and vendor capacity; minimal manual corrections.

Business impact: reduction in missed delivery windows; ability to handle 25 % more trade shows without increasing headcount.

9  Risks & constraints

Data quality: existing Supabase tables may have incomplete or inconsistent entries (e.g., missing vendor capacity). Data cleaning may be required before enabling route optimisation.

Mapping API limits: OpenRouteService or Google Maps have rate limits and may incur cost; caching distances between frequent locations will reduce API calls.

Legacy code complexity: the current Chat SDK template may not be fully modular; integrating new pages (timeline, safes, vendors) may require refactoring; ensure backward compatibility.

AI hallucinations: Copilot must not invent vendor names or distances; system instructions should enforce guardrails (only use data from Supabase and API responses). Provide fallback responses when data is missing.

User adoption: training may be required to teach users to rely on AI suggestions; maintain manual override capability.

Timeline of trade shows: eBay show dates may change; ensure schedule updates propagate to the timeline and safe assignments.

10  Timeline & release phases
Phase	Date (approx.)	Deliverables
Phase 1 – PRD & architecture (Brownfield)	Weeks 1–2	Finalised PRD (this document); architecture design; screen flows; data model updates; mapping service integration plan.
Phase 2 – UI & component development	Weeks 3–6	Implement timeline view, show detail, vendor assignment (list & map), safe list/detail, vendor list/detail; integrate Supabase queries; build sign‑in and global navigation. Conduct internal user testing.
Phase 3 – AI Copilot & optimisation	Weeks 7–9	Implement Copilot panel and bottom‑sheet; integrate AI calls to mapping API for distance calculations; develop route optimisation logic; design context cards; enforce guardrails.
Phase 4 – Testing & iteration	Weeks 10–11	End‑to‑end testing with logistics team; fix bugs; refine UI/UX; ensure performance and accessibility requirements.
Phase 5 – Rollout & training	Week 12	Deploy to production via Vercel; run training sessions for Kelly and vendor managers; gather feedback; plan incremental improvements.
11  Appendices

Supabase schema: Document existing tables (shows, vendors, safes, assignments) and proposed additional fields (e.g., distanceGap, timeGap, status flags). Provide sample data.

API keys & environment variables: Document required keys for Supabase, Neon Postgres, mapping services, and AI gateway; specify environment variable names.

Glossary: Show – an event or trade show; Safe – a safe asset; Vendor – a storage or transport provider; Assignment – mapping of a vendor or safe to a show.

– This document summarizes the SafeLogistics project scope, personas, features, integrations, workflows, non‑functional requirements, success metrics, risks, and release phases. It serves as the authoritative reference for the brownfield enhancement plan.

User Flows:
SafeLogistics User Flows
Overview

This document summarises the primary user flows for the SafeLogistics application. The flows map out how logistics coordinators and vendor managers interact with the system to plan trade shows, assign safes and vendors, optimise routes, and manage assets.

Login & Data Load

A user navigates to the sign‑in page and authenticates using Google (handled via Auth.js).

After a successful login, the app queries Supabase/Neon Postgres for the current lists of shows, vendors and safes and loads them into the interface.

Timeline Planning

The default Timeline View displays upcoming shows in chronological order. Each card shows the show’s dates, location, assigned vendor, safes assigned, and the next gap (distance and days until the next show).

Users scroll vertically through the timeline to review the schedule, identify gaps and check assignments.

Tapping View Details on a card opens the Show Detail View.

Show Detail View

The Show Detail panel shows comprehensive information about a show: dates, venue, vendor assignment, safes assigned, distance and time gaps, and a delivery window.

Users can:

Tap Change Vendor to open the vendor assignment flow.

Tap Assign Safes to assign safes to this show.

View and edit logistics details (e.g. delivery window).

Vendor Assignment (List & Map)

When a user selects Assign Vendor or Change Vendor, the Assign Vendor view opens.

At the top is a toggle between List View and Map View with a search box.

List View: Displays vendor cards with base location, travel distance/time to the show, capacity (e.g. 8/10 safes), and an Assign Vendor button. Users can search by vendor name or city.

Map View: Displays the show venue and vendor locations on a map with route lines. Selecting a vendor card or pin highlights the route and shows distance/time in an overlay.

Users review distance, travel time and capacity, then select Assign Vendor. The system confirms the assignment and updates the timeline and show detail.

Safe Assignment

Users access Safes either from the safes list or from a show detail panel.

Selecting Assign Safe opens an overlay listing upcoming shows; users choose a show to assign a safe. The overlay shows show name, dates, and location.

After assignment, the safe’s status changes (e.g. Stored → Assigned), and the show card reflects the safe assignment.

Safe Detail & Movement Tracking

Tapping a safe in the Safes list or show detail view opens the Safe Detail panel.

This panel displays:

Status: Stored, In transit, At venue or Delivered.

Journey summary: Origin, current location, next destination, ETA.

Movement history: A log of pick‑ups, drop‑offs and vendor assignments.

Users can mark a safe as delivered, reassign the safe to a different vendor, or view its route on a map.

Vendors Management

The Vendors view lists all vendors with metrics such as shows assigned, safes handled, total miles, and capacity.

Selecting a vendor opens the Vendor Detail panel, which shows:

Vendor status and capacity (e.g. Active, 4/5 safes).

Shows assigned with dates, distances and gaps.

Safes currently managed by the vendor.

Actions to add or remove assignments and view routes on a map.

Route Optimisation & AI Copilot

The Copilot chat panel (right‑side on desktop, floating action button on mobile) allows users to ask questions or request optimisations.

Users can type commands like “Optimise routes for next month” or “Who’s covering the Anaheim show?”.

The AI calculates distances and days between shows, suggests vendor changes to reduce travel time, and returns quick‑action cards (e.g. View Changes, Undo).

Users can accept or reject AI suggestions, which immediately update vendor assignments in the UI.

Configuration & Settings

Administrators use the Settings section to connect data sources (Supabase, mapping API keys), set vendor capacities and safe counts, and configure authentication providers.

They can also customise notification thresholds (e.g. warn when a vendor exceeds 80 % capacity).

Success Notifications & Logging

After actions like assigning a vendor or safe, the UI briefly displays a toast notification (e.g. “Safe S‑301 assigned to Future Build Summit”).

All assignments and status changes are logged in the database for audit and reporting.

These flows capture the major user journeys in SafeLogistics. Additional flows (e.g. importing data, adjusting user roles) can be added as the product evolves.