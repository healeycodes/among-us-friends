# among-us-friends

> My blog post: [Writing Software for an Among Us League](https://healeycodes.com/writing-software-for-an-among-us-league/)

<br>

![Node.js CI](https://github.com/healeycodes/among-us-friends/workflows/Node.js%20CI/badge.svg)

<br>

I use this to track the performance of players in the Among Us games I play with my friends!

There is a provisional ELO system, and graphs powered by Chart.js. The backend is an Node/Express app, tested by Jest.

![Win rates and loss rates, and an ELO graph, for three players](https://github.com/healeycodes/among-us-friends/blob/main/public/preview.png)

![The player page with match history](https://github.com/healeycodes/among-us-friends/blob/main/public/preview-player.png)

<br>

The data source is a Google Sheets file where I store the crew names, impostor names, and the winner (crew/impostor).

![A Google Sheets file](https://github.com/healeycodes/among-us-friends/blob/main/public/sheets.png)

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

"crew" <-- game winner

"skeld" <-- map shortname
```

See the above image for clarification.

<br>

This setup is easy for me to update when we play multiple games with the same lobby as I can clone the rows.

The data is brought into the application through the Sheets API (v4).

## Setup

Set two enviromental variables.

-   `SHEETS_ID` - the id in the URL bar.
-   `SHEETS_API_KEY` - an API key from Google Console.

`npm i`

`npm run start`

Visit `/` in a browser!

## Tests

`npm test`

## Deployment

I run this project on glitch.com without any setup.

You can import straight from this repository.
