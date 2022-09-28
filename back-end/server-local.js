const app = require("./src/app")

// Mimic Netlify serving the `public` folder
const express = require("express")
app.use(express.static("public"))

const port = 3001
app.listen(port, () => {
    console.log(`Your app is listening on http://localhost:${port}`)
})
