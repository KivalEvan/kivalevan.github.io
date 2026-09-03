# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is Kival Evan's personal audience. Visitors use the site to find his work, writing, commissions, professional record, and public profiles.

Employers, collaborators, Beat Saber community members, and commission clients are important secondary audiences.

## Product Purpose

The site is the central personal hub for Kival Evan. It gives visitors one canonical place to understand who he is and what he does.

Success means that visitors can find the relevant part of his work and continue to its detail or source.

## Positioning

The site connects Kival Evan's software engineering career with his long-term Beat Saber work and broader personal interests. It is both a current profile and an owned archive of his output.

## Operating Context

Visitors can:

- learn about Kival Evan from the home page;
- review his CV, work history, skills, and project evidence;
- browse software, Beat Saber, and other personal projects;
- read blog posts;
- review Beat Saber commission information;
- watch featured videos;
- continue to his public profiles on GitHub, Steam, YouTube, Twitch, X, and Discord.

The site is published at `kivalevan.me` and `www.kivalevan.me`.

## Capabilities and Constraints

- Preserve the home page, CV, blog, project catalog, commissions, contacts, and featured videos.
- Keep software engineering and Beat Saber work prominent.
- Preserve factual CV claims, project metrics, roles, work history, and skill claims.
- Do not invent clients, testimonials, metrics, awards, endorsements, or other proof.
- The current site uses Astro, Svelte, Tailwind CSS, and TypeScript.
- The site generates a sitemap and supports static deployment.

## Confirmed Workbench and Service Decisions

- Software and Tools contains software projects and reusable mapping tools.
- Mapping Workshop contains published maps, mapping utilities, mapping scripts, plugins, and Beat Saber commission access.
- The Split Workbench uses `/project/beat_saber`.
- `#software-tools` and `#mapping-workshop` are stable destinations on that page.
- The estimator maximum duration is 600 seconds (10 minutes).
- SlimeVR commissions are no longer offered and do not appear in the commission catalog.

## Brand Commitments

- Use the public name `Kival Evan`.
- Preserve the personal voice and the connection between professional work and personal interests.
- Preserve the current avatar attribution to まひる.
- Credit third-party work where the current content provides an attribution.

## Evidence on Hand

- The CV contains named roles, dates, responsibilities, skills, and project outcomes in `src/pages/cv.astro`.
- The Beat Saber Map Check entry states that more than 500 mappers use the application.
- The CV records a runner-up Best Project Award for the 2022/2023 final-year project.
- The project catalog links to public source repositories and project pages.
- Existing images include the avatar, project previews, commission images, background art, and Beat Saber cover art.
- Existing videos, blog posts, commission pages, and public profile links provide first-party content.
- No testimonials, press coverage, or customer logos are confirmed. Future work must not fabricate them.

## Product Principles

1. Keep the site personal and recognizable as Kival Evan's home on the web.
2. Make the full range of work easy to find without hiding either engineering or Beat Saber.
3. Support every claim with existing content, source links, or confirmed facts.
4. Preserve useful history while keeping current professional information clear.
5. Give each audience a direct path to the relevant work or contact point.
6. Keep the top-level hierarchy portfolio-first: identity and project evidence, then writing and commissions.
7. Keep the CV available only by direct URL. Do not link to it from the site or include it in the sitemap.

## Accessibility & Inclusion

Keyboard access, semantic structure, reduced-motion support, and responsive behavior are product requirements.
