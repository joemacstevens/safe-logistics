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