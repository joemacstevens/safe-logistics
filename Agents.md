<!--
This agents.md outlines how to use the project documentation and templates when building or extending the SafeLogistics application.  The goal of this file is to give any AI or human agent clear instructions on where to find key information, how to interpret it, and how to apply it consistently.
-->
SafeLogistics Agent Guide

This project contains two core documentation files that describe what the application must do and how users are expected to interact with it:
	•	safelogistics_brownfield_prd.md – our brown‑field product requirements document (PRD).  It defines the purpose of SafeLogistics, the personas it serves, detailed feature specifications (timeline, show detail, vendor assignment, safe management, vendor management, AI Copilot, etc.), data integrations and non‑functional requirements.
	•	safelogistics_user_flows.md – a narrative description of user journeys.  It breaks down step‑by‑step workflows for login and data load, planning on the timeline, assigning vendors, assigning safes, optimising routes with the Copilot, tracking safe movement and managing vendors.

Additionally, this repository contains a template folder which holds reusable layout patterns and visual components for pages such as the timeline, show detail, vendor list and safe detail.  When building new pages or updating existing ones, reuse these templates rather than designing from scratch.

How to use the PRD
	1.	Answer questions by citing the PRD – when the user asks about system behaviour, supported features, constraints or integration details, consult safelogistics_brownfield_prd.md first.  The PRD contains the authoritative description of the product.  Quote or summarise the relevant section in your response.
	2.	Respect scope and phases – the PRD lists which features belong in each release phase.  Don’t promise functionality that isn’t scoped for the current phase.
	3.	Don’t invent new features – if a requested capability isn’t documented in the PRD, ask the user whether it should be added or suggest creating a change request.  Avoid making assumptions about behaviour.
	4.	Reference non‑functional requirements – performance, security, compliance and other systemic requirements live in the PRD.  Ensure any design or code suggestions comply with them.

How to use the User Flows
	1.	Map tasks to flows – for every user‑facing feature or story, there is a corresponding flow in safelogistics_user_flows.md.  Use these flows to understand the sequence of screens, interactions and backend actions.
	2.	Check preconditions and outcomes – the flows specify what must be true before a user can start a task (e.g., they must be logged in) and what state the system should be in afterwards (e.g., a vendor assignment saved).  Make sure your implementation honours these.
	3.	Surface steps in chat – when responding in the Copilot, summarise the relevant flow steps so the user knows what will happen next.  For example, when a user asks to assign a vendor, the Copilot should remind them that they will first choose list or map view, then select a vendor, then confirm.
	4.	Identify gaps – if a flow does not cover a scenario the user asks about, note the missing step and flag it for documentation update.

How to use Templates

The template directory (once added) will contain reusable UI templates—pages built in Next.js, component snippets, and styling guidelines.  These are meant to maintain a consistent look and feel across the application.  When using templates:
	1.	Start from the template – copy the relevant template file into your feature directory.  For example, the timeline page template includes card layouts, connectors and colours that adhere to the design system.
	2.	Only change content – replace placeholder text, data fields and component props with the actual variables from your feature.  Do not change the overall structure, spacing, colours or typography unless directed by the design system.
	3.	Re‑export components – if a template includes shared components (e.g., vendor pill, safe card or notification toast), import and use those components rather than recreating them.  This ensures consistency and reduces duplication.
	4.	Follow naming conventions – keep file and component names consistent with the existing templates (e.g., TimelineView.tsx, VendorListCard.tsx).  This makes it easier to locate and maintain code.
	5.	Document customisations – if you need to extend a template (e.g., add a new field in a card), document the change in a comment at the top of the file so other agents understand why the deviation exists.

Best Practices for Agents
	•	Stay synchronised with documentation – before proposing a new design or code structure, verify that the PRD and user flows still align with your assumptions.  If the documents change, update this guidance.
	•	Ask targeted questions – when information is missing or ambiguous, ask the user concise questions rather than making up requirements.
	•	Keep responses actionable – summarise relevant documentation or template instructions when replying to user queries.  Provide clear next steps rather than generic comments.
	•	Maintain traceability – reference which section of the PRD or user flows you used to derive your answer.  This builds trust and makes it easier to audit decisions.

By following this guide, any agent working on SafeLogistics will know how to leverage the existing documentation and templates effectively, keeping the product consistent and aligned with its requirements.