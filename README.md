# Spaces Designer Homes website (preview)

A new website for Spaces Designer Homes, with a built-in customize panel (the cog, top right) so the Spaces team can try colors, fonts, photos, words, section order and animations, leave notes, and send their favorite version back.

## Open it
- Live preview: GitHub Pages link for this repo.
- On your own computer: run `python3 -m http.server 8770` in this folder, then open http://localhost:8770.

## How it works
- `js/data.js`: all words, photos (with search tags), color themes and font pairs. Change defaults here.
- `js/site.js`: renders every page from that data. Pages use `#/name` links.
- `js/editor.js`: the cog panel (team only, see Security rules). Edits save in that browser (only the differences from the defaults).
- `css/site.css`: the site. Responsive rules use container queries on `#site`, so the panel's phone view is the real phone layout.
- `css/editor.css`: the panel, device frames and edit modes.

## Taking in a client's version
In the cog panel, open **Save & Send**, then **Open a version file**, and pick the `.json` file they sent. Their notes show in the **Notes** tab, with pins on the page.

## Before launch
- Switch on the contact form: `contact-form/SETUP.md` (private, add-only Google Sheet).
- Split pages into real URLs (or prerender) so Google indexes each page; the Google business details are already in `index.html`.
- Confirm team names, roles and headshots, and the name of the "Modern Farmhouse" project.
- Bump `?v=` on the CSS and JS links in `index.html` after each update so visitors get the new files.

## Security rules
- No keys, passwords or private links in this repo. It is public.
- The site never connects to Google Drive. Photos and videos are copied into `assets/` with hidden data (GPS, camera info) stripped and no client names or addresses in file names.
- The cog editor only loads on the preview link, on localhost, or after opening the team link (`?team=sdh-preview`). `?team=off` hides it in that browser to see the site as visitors do. It only changes what that one browser shows.
- The page may only load from itself, Google Fonts, YouTube/Vimeo players, and send to the Google Sheet form script (Content-Security-Policy in `index.html`).
- Contact form: see `contact-form/SETUP.md`. The Sheet script can only add rows.
