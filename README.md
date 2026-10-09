# Nigam Cinematics — GitHub Pages

A static, founder-led AI production portfolio. Plain HTML, CSS and JavaScript; no package installation, build step, backend, or API key required.

## Preview locally

From this folder run:

    python3 -m http.server 8080

Then open http://localhost:8080. The site also opens directly from index.html; using a local server is recommended for previewing.

## Publish with GitHub Pages

1. Add index.html, style.css, refinements.css, script.js, .nojekyll and the complete images folder to the root of your GitHub repository.
2. In the repository open Settings → Pages.
3. Set Source to Deploy from a branch.
4. Choose the branch containing the files (usually main), select / (root), and save.
5. Open the URL shown by GitHub after deployment completes.

Upload the extracted contents, not only a ZIP file. Relative asset paths support both a project URL such as username.github.io/repository/ and a custom domain.

For nigamcinematics.com, configure the custom domain in Settings → Pages and follow GitHub's DNS instructions. This project does not change your domain or DNS configuration.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Editing the site

- Founder copy, navigation, film descriptions and contact details: index.html.
- Base layouts: style.css. Brand refinement, readable controls and responsive navigation: refinements.css.
- Portfolio filters, service selection, film dialog, WhatsApp brief and orbital animation: script.js.
- Portfolio thumbnails and original NC logo: images/. The supplied logos.png is used in the header, hero, footer and favicon.
- Film buttons use their data-video value as the YouTube video ID.
- The featured Jaanki Corporate Tower Short uses a 9:16 inline YouTube player. Update its iframe src and YouTube link together in index.html.
- WhatsApp uses the business number 919235600936 in script.js.
- Founder biography is adapted from https://abhinigam.com. The founder graphic is a typographic monogram.
- Update portfolio labels when concepts become commissioned work.

## Behaviour and accessibility

The enquiry form prepares a message and opens WhatsApp. Visitors review and send the message themselves. No data is stored by this site, and a fallback link appears if the browser blocks the new tab.

Portfolio dialog players load when a film is opened. The featured Short is embedded directly, loads lazily near the viewport, and starts when the visitor presses play. Players use youtube-nocookie.com and include a Watch on YouTube fallback. Google Fonts and YouTube require an internet connection; system fonts remain available if fonts fail.

The decorative canvas pauses outside the viewport and while the tab is hidden, and becomes static for reduced-motion preferences. Essential content remains visible without JavaScript. Navigation, category filters, form controls and the native film dialog support keyboard use.
