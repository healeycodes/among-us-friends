const app = require("./app")

const listener = app.listen(process.env.PORT, () => {
    console.log(
        "Your app is listening on http://localhost:" + listener.address().port
    )
})
