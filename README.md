# among-us-friends

> My blog post: [Writing Software for an Among Us League](https://healeycodes.com/writing-software-for-an-among-us-league/)

<br>

![Node.js CI](https://github.com/healeycodes/among-us-friends/workflows/Node.js%20CI/badge.svg)

<br>

I use this system to manage the Among Us league I play with my friends.

Features:

-   Elo rankings (w/ graphs)
-   Player pages
-   Seasons
-   Google Sheets as a datastore

Tech:

It's a Jamstack application which runs Express via Netlify Lambda. Tested by Jest.

The frontend is vanilla JS/CSS.

<hr>

![Win rates and loss rates, and an ELO graph](https://github.com/healeycodes/among-us-friends/blob/main/public/preview.png)

<br>

## Google Sheets


Sheets should be named in the following format:

-   `Current` — the season in-progress
-   `Season X` — where `X` is an incrementing integer starting at `1`

<br>

![A Google Sheets file](https://github.com/healeycodes/among-us-friends/blob/main/public/sheets.png)

Enter data starting at C4 downwards. The rows should be 14 cells long.

10 player slots (which should be left empty if you have less than 10), 2 slots for the imposters (the names are repeated from the player list), 1 slot for the winner ('crew' or 'imposter'), and 1 slot for the map short name.

E.g.

```
"andy" <-- player list
"ally"
"bayf"
"beans"
"keita"
"mads"
"roma"
"spon"
"gem"
"" <-- empty if you have nine players

"ally" -- imposters
"spon"

"crew" <-- game winner (crew, imposter)

"skeld" <-- map shortname (skeld, mira, polus, airship)
```

<br>

## Deploy

This application is deployed by Netlify.

Set two environmental variables via the Netlify UI.

-   `SHEETS_ID` - the id in the URL bar.
-   `SHEETS_API_KEY` - an API key from Google Console.

<br>

## Local Development

Set the following environmental variable:

-   `snapshot` - to `true`

<br>

Then run:

`npm i`

`node server-local.js`

<br>

## Tests

`npm test`
