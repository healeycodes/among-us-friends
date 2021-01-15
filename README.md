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

A Jamstack application which runs Express via Netlify Lambda.

The front-end is React via Create React App.

tested by Jest.

<hr>

![Win rates and loss rates, and an ELO graph](https://github.com/healeycodes/among-us-friends/blob/main/front-end/public/preview.png)

<br>

## Google Sheets


Sheets should be named in the following format:

-   `Season X` — where `X` is an incrementing integer starting at `1`

To add a season, edit `seasons` inside `config.json`. Append to the list of incrementing integers.

<br>

![A Google Sheets file](https://github.com/healeycodes/among-us-friends/blob/main/front-end/public/sheets.png)

Enter data starting at C4 downwards. The rows should be 14 cells long.

10 player slots (which should be left empty if you have less than 10), 2 slots for the impostors (the names are repeated from the player list), 1 slot for the winner ('crew' or 'impostor'), and 1 slot for the map short name.

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

"ally" -- impostors
"spon"

"crew" <-- game winner (crew, impostor)

"skeld" <-- map shortname (skeld, mira, polus, airship)
```

<br>

## Deploy

This application is deployed by Netlify.

Set two environmental variables via the Netlify UI.

- `SHEETS_ID` - the id in the URL bar.
- `SHEETS_API_KEY` - an API key from Google Console.

<br>

## Local Development

Create a file called `.env` inside `back-end/` with the contents `snapshot=true`

<br>

Run both the back-end and the front-end.

`cd back-end/ && yarn install && yarn dev`

`cd front-end/ && yarn install && yarn start`

<br>

## Tests

`cd back-end/ && yarn test`
