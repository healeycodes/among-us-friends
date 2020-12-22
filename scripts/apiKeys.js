const fs = require("fs")

// Our Netlify functions need access to env vars
fs.writeFileSync(
    "./.env.json",
    `{
    "SHEETS_ID": "${process.env.SHEETS_ID}",
    "SHEETS_API_KEY": "${process.env.SHEETS_API_KEY}"
}`
)
