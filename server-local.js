const app = require("./src/app")

// Mimic Netlify serving the `public` golder
const express = require("express")
app.use(express.static("public"))

const listener = app.listen(process.env.PORT, () => {
    console.log(
        "Your app is listening on http://localhost:" + listener.address().port
    )
})
