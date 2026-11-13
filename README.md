# World War I study guide

A static, interactive study guide based on the supplied classroom slides, Paris Peace Conference handouts, three homework reading bundles, royal telegrams, Western Front accounts, and two Crash Course video transcripts.

Live guide: https://wwi-unit-study-guide.themaclan-2484.chatgpt.site

## Included

- **Summary:** 18 searchable, printable sections: the original 14 slide sections plus four sections covering the telegrams, Western Front accounts, and videos.
- **Slides:** all 127 original slides, with navigation and the original PDF.
- **Readings:** three detailed summaries, each followed by the original textbook photographs (4, 3, and 5 pages).
- **Quiz:** 87 multiple-choice questions based only on the slide deck with 4–10 choices, explanations, topic filters, and source links.
- **Practice tests:** five distinct tests, each with 5 political-cartoon questions, 10 content multiple-choice questions, 7 blanks, and 2 short answers. All multiple-choice questions use only the slides, including combination choices and chronology.
- **Timeline:** 84 sourced dates and periods, with search and theme/era filters.
- **Extra Information:** six source guides covering the royal-cousins background, all ten Willy–Nicky telegrams, Clapham’s memoir, Remarque’s novel, and Crash Course 209 and 210. Includes category filters, search, dated telegram paraphrases, a crisis chronology, comparisons, terms, and links to both videos.
- **Paris Peace Conference:** 17 country and movement perspectives, plus all 21 original document pages.

Practice-test answers unlock after all 24 responses in that individual test are completed and submitted. Objective questions are checked automatically; short answers provide model responses and a four-point self-assessment rubric. Equivalent fill-in wording can be manually credited. Progress is stored in the current browser's local storage; it does not sync between devices.

## Run locally

No build step is required to preview the site. Serve `dist` with any static HTTP server, for example:

```sh
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`. Opening the HTML directly as a `file:` URL will not work because content is loaded with `fetch`.

## Deploy

From the repository root, stamp the asset URLs and publish:

```sh
npm run build && npx wrangler deploy
```

`npm run build` rewrites local JS and CSS URLs in `dist` with a content hash (`app.js?v=<hash>`, including the modules those files import). Run it again any time before deploy; the hash only changes when those files change. HTML, including `/` and `/stats`, is served with `Cache-Control: no-cache` from `dist/_headers`, so a normal reload sees the new URLs. Hashed JS and CSS can stay cached. JSON is revalidated because it is requested without a hash. `/api/*` still runs the Worker first and responds with `Cache-Control: no-store`.

Apply the D1 migration once, and set the stats secret when it changes (the secret command publishes a new version and stores nothing in the repo):

```sh
npx wrangler d1 migrations apply ww1-analytics --remote
npx wrangler secret put STATS_KEY
```

Static files are served directly. The stats page is `/stats`.

## Checks

Node.js 20 or newer is recommended.

```sh
npm test
npm install
npm run test:dom
```

The first command validates content, assets, slide-only multiple-choice sources, scoring, completion gates, and saved-state migration without installing packages. The DOM check also exercises navigation, all five practice tests, answer visibility, persistence, readings, timeline filters, extra-information search and deep links, summary printing, keyboard navigation, and the existing quiz. DOM checks are functional checks and do not substitute for visual browser review.

## Content and structure

`dist/` is the deployable website. `app.js` handles the original notes, viewers, and quiz; `extras.js` handles readings, practice tests, and the timeline. `supplement.js` and `supplement.css` render Extra Information and add four source-linked summary sections; `extra-information.json` contains those study notes. `npm run build` stamps every local JS and CSS file, including `supplement.js` and `supplement.css`. Scoring logic is in the two engine modules. Course content is bundled locally. Study activity is recorded by this site’s analytics Worker.

`source/` contains the editorial scripts used to generate the JSON content. The scripts for readings, practice tests, and the timeline resolve paths relative to this repository. Earlier slide and quiz extraction scripts also document the original preparation and may refer to the original workspace/source PDF path; the ready-to-run content and assets are already in `dist/`.

The new material uses clearly labeled study notes and paraphrases of printed sources, not verbatim transcriptions. Handwritten annotations and worksheet responses are excluded, and no new photographs or annotated scans are published. Clapham is identified as a memoirist; Remarque’s assigned passage is identified as fiction. The six photo references and PDF page references in the new notes point to the supplied class materials.

Historical corrections and conflicting textbook estimates are marked in the guide. Uploaded pages remain unchanged and keep their supplied order. Classroom directions within documents are preserved as source material, not treated as instructions to the application.

This repository includes user-supplied textbook scans, classroom slides, political cartoons, and handouts. Their inclusion does not grant a new license to those third-party materials. The answer keys are shipped with this client-side study tool; the completion gate is a learning aid, not a secure examination system.

The `.openai/hosting.json` file identifies the existing Sites deployment. It contains no authentication credential. The GitHub repository and the live Site have separate access settings.
