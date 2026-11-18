CoMANT 2027 website (static site)

This folder is a complete, self-contained website. It has no build step, no database, no server-side code, no cookies, and it does not load anything from other websites (fonts and images are included).

Contents
  index.html   the page (all text)
  style.css    styles
  script.js    small script (topic diagram, menu highlight, back-to-top button)
  favicon.svg  browser tab icon
  bali.jpg     header photo (left)
  network.jpg  header photo (right)
  fonts/       IBM Plex web fonts (SIL Open Font License, license file included)

How to publish
1. Upload the whole content of this folder to the web root of the site, or to a sub-folder such as /comant2027/. Keep the folder structure exactly as it is (index.html next to style.css, script.js, favicon.svg, the two photos and the fonts folder).
2. Make sure the server serves index.html as the default page of that folder (this is the default on Apache, Nginx, IIS and most hosting panels).
3. Open the address in a browser and check that the two header photos and the page fonts appear.

Security policy (CSP)
  The page has no inline scripts, no inline styles and no inline event handlers, and loads nothing from other domains. It works with a strict policy such as:
    Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; font-src 'self'

Server requirements
  Any web server that can serve static files over HTTPS. No PHP, no Node, no database.
  If the server does not know the .woff2 type, set it to font/woff2 (most servers already do).

Test on a computer before uploading (optional)
  Double-click index.html to open it in a browser, or run in this folder:
    python3 -m http.server 8000
  and open http://localhost:8000

Editing later
  Text is in index.html and can be changed with any text editor. Dates are in the "Important Dates" table and in the "Key Dates" box. Committee names are in the "Committee" section. Colors and layout are in style.css. Replace bali.jpg or network.jpg with another image of the same file name to change the header photos.

Notes
  The "Submit" buttons and the author guidelines link point to the ICCSA-2027 submission system (https://ess.iccsa.org) and instructions (https://iccsa.org/instructions-for-authors). Nothing else needs to be configured.
