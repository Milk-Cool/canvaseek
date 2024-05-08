# canvaseek
Searches for hidden Canvas LMS files, including students' submissions!

# Installation
1. [Install NodeJS](https://nodejs.org/en)
2. Either download the repository as a ZIP file (using the Code button above) or clone it with [Git](https://git-scm.com/) (the latter is recommended but not required)
3. In the project directory, run:
```bash
npm i
npm i . -g
```
4. canvaseek is now installed!

# Running
5. Now you can start it from a terminal using the command `canvaseek`
6. When the server is running, open http://localhost:5960 in the browser

# Initial setup
7. Go to your canvas instance and in your account settings [create an API key](https://youtu.be/cZ5cn8stjM0)
8. In the opened tab, type the base URL into the first box (something like `https://canvas.myschool.com`)
9. Paste the API key into the second box
10. In the third box, enter the maximum file ID. Usually if you take the amount of files in your Canvas instance (or just the ID of a recently uploaded file) and double it it should be fine
11. In the fourth box, enter the number of worker threads. I recommend 10 to 50 threads depending on how powerful your machine is - the more powerful it is, the more threads it could handle
12. Click "submit" and try refreshing the page in around 5-10 minutes to see how many file it could find in this amount of time

# Searching
13. To search among found files, enter the query into the box on the main page. The program will try to match it with the following:
    * Display name
    * File name
    * MIME type (exact match)
    * UUID (exact match)
14. Click "submit" and you'll see a list of matching files. Click any of those to see the details

# File details
15. When you click on a matching file, you can see some details about it, specifically:
    * File ID
    * UUID
    * Display name
    * Filename
    * MIME type
    * Download URL (sometimes)
    * Preview URL (sometimes)
    * Creation date/time
    * Modification date/time
    * Update date/time

# Token regeneration
16. Go to your Canvas account settings and [open the Network tab in DevTools](https://developer.chrome.com/docs/devtools/network)
17. Open a token's settings and click "Regenerate Token"
18. In the Network tab, look at the last entry that is **a number** (e. g. `107`) and remember what the number is or write it down
19. In DevTools, [open the Application tab](https://developer.chrome.com/docs/devtools/application)
20. On the left side, open Cookies > `https://canvas.myschool.com` (your school's Canvas instance URL)
21. Copy the values `_normandy_session` and `_csrf_token`
> Please note that if you log out of Canvas, you might need to copy these values again
22. From the main canvaseek page, open "Edit regeneration config"
23. Paste the values into the according fields
24. Save the changes. The server will now regenerate the access token and reload all of its workers when needed