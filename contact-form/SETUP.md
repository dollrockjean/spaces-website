# Contact form to a private Google Sheet

Not switched on yet. Until it is, the website form says "this is a preview" and sends nothing.

## What it does
- Every message becomes one new row in a private Google Sheet owned by the Spaces account.
- Tracy and Tim get an email for each message. Pressing Reply answers the visitor directly.
- The script can only add rows. It has no way to read the sheet back, so nobody can pull client messages out through the website.

## Spam and junk protection
- A hidden trap field that people never see. Bots fill it in and their message is quietly dropped.
- The form must be on screen at least 3 seconds before it can be sent (bots are instant).
- One message per minute from the same browser, and the script also caps messages per hour and per email address.
- Everything typed is cleaned: invisible characters and < > removed, length limits, email checked, and anything that could run as a spreadsheet formula is turned into plain text.

## One-time setup (about 10 minutes, signed in as the Spaces Google account)
1. Make a Google Sheet called **Spaces Website Messages**. Do not share it with anyone outside Spaces.
2. Extensions → Apps Script. Paste `Code.gs` in, replacing what is there. Save.
3. Project Settings (gear) → Script Properties → add `ALERT_EMAILS` with Tracy's and Tim's addresses, separated by a comma.
4. Deploy → New deployment → Web app. Execute as: **Me**. Who has access: **Anyone**. Allow access when asked.
   ("Anyone" only means anyone can send a message to it. It still can only add rows.)
5. Copy the web app address. Put it in `FORM_ENDPOINT` in `js/site.js` and push.
6. Send a test message from the live site. Check the new row and the email.

## Keep it private
- Share the Sheet only with the Spaces people who answer leads.
- If someone leaves, remove them from the Sheet's sharing list.
