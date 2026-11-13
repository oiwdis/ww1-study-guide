# World War I study guide

A static, interactive study guide based on the supplied classroom slides, Paris Peace Conference handouts, and three homework reading bundles.

Live guide: https://wwi-unit-study-guide.themaclan-2484.chatgpt.site

## Included

- **Summary:** 14 detailed sections covering the slide deck.
- **Slides:** all 127 original slides, with navigation and the original PDF.
- **Readings:** three detailed summaries, each followed by the original textbook photographs (4, 3, and 5 pages).
- **Quiz:** 112 multiple-choice questions with 4–10 choices, explanations, topic filters, and source links.
- **Practice tests:** five distinct tests, each with 5 political-cartoon questions, 10 content multiple-choice questions, 7 blanks, and 2 short answers. Every test includes combination choices and chronology.
- **Timeline:** 84 sourced dates and periods, with search and theme/era filters.
- **Paris Peace Conference:** 17 country and movement perspectives, plus all 21 original document pages.

Practice-test answers unlock after all 24 responses in that individual test are completed and submitted. Objective questions are checked automatically; short answers provide model responses and a four-point self-assessment rubric. Equivalent fill-in wording can be manually credited. Progress is stored in the current browser's local storage; it does not sync between devices.

## Run locally

No build step or backend is required. Serve `dist` with any static HTTP server, for example:

```sh
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`. Opening the HTML directly as a `file:` URL will not work because content is loaded with `fetch`.

## Deploy

No build step. `dist/` is the static site. From the repository root, apply the D1 migration, publish the Worker, then set the stats secret (this stores no value in the repo):

```sh
npx wrangler d1 migrations apply ww1-analytics --remote
npx wrangler deploy
npx wrangler secret put STATS_KEY
```

`wrangler secret put` reads the secret from the prompt and deploys a new version that includes it. Static files are served directly; only `/api/*` runs the Worker. The stats page is `/stats.html`.

## Checks

Node.js 20 or newer is recommended.

```sh
npm test
npm install
npm run test:dom
```

The first command validates content, assets, source ranges, scoring, completion gates, and saved-state handling without installing packages. The DOM check also exercises navigation, all five practice tests, answer visibility, persistence, readings, timeline filters, and the existing quiz. DOM checks are functional checks and do not substitute for visual browser review.

## Content and structure

`dist/` is the deployable website. `app.js` handles the original notes, viewers, and quiz; `extras.js` handles readings, practice tests, and the timeline. Scoring logic is in the two engine modules. JSON files contain the course content. All material is bundled locally: no analytics, tracking, external fonts, or AI grading services are used.

`source/` contains the editorial scripts used to generate the JSON content. The scripts for readings, practice tests, and the timeline resolve paths relative to this repository. Earlier slide and quiz extraction scripts also document the original preparation and may refer to the original workspace/source PDF path; the ready-to-run content and assets are already in `dist/`.

Historical corrections and conflicting textbook estimates are marked in the guide. Uploaded pages remain unchanged and keep their supplied order. Classroom directions within documents are preserved as source material, not treated as instructions to the application.

This repository includes user-supplied textbook scans, classroom slides, political cartoons, and handouts. Their inclusion does not grant a new license to those third-party materials. The answer keys are shipped with this client-side study tool; the completion gate is a learning aid, not a secure examination system.

The `.openai/hosting.json` file identifies the existing Sites deployment. It contains no authentication credential. The GitHub repository and the live Site have separate access settings.
