const chooseSelect = document.querySelector(".wrapped-choose select")
const displaySection = document.querySelector(".display")
let statsStore = null

function load(allStats) {
    // Store global state
    statsStore = allStats

    // Remove loading text
    document.querySelector(".loading-indicator").innerHTML = ""
    let allPlayers = new Set()
    allStats.forEach(stats => {
        stats.players.forEach(player => allPlayers.add(player.name))
    })
    let alphabetical = [...allPlayers].sort()
    alphabetical.forEach(player => {
        chooseSelect.innerHTML += `<option value="${player}">${player}</option>`
    })
    chooseSelect.closest(".wrapped-choose-hider").style.display = "block"

    const urlParams = new URLSearchParams(window.location.search)
    const name = urlParams.get("name")
    if (name) {
        console.log(name)
        wrappedPlayer(null, name)
    }
}

function wrappedPlayer(select, name) {
    const player = name || select.selectedOptions[0].value
    if (player === "") {
        return
    }
    let seasonsPlayed = 0
    let gamesPlayed = 0
    let crewWin = 0
    let crewLoss = 0
    let imposterWin = 0
    let imposterLoss = 0
    let highestElo = 1200
    let lowestElo = 1200
    let imposterNemesis = {}
    let killingBuddy = {}
    statsStore.forEach(season => {
        season.players.forEach(p => {
            if (p.name === player) {
                seasonsPlayed++
                crewWin += p.crewWin
                crewLoss += p.crewLoss
                imposterWin += p.imposterWin
                imposterLoss += p.imposterLoss
                highestElo = Math.max(highestElo, Math.max(...p.eloHistory))
                lowestElo = Math.min(lowestElo, Math.min(...p.eloHistory))

                p.games.forEach(game => {
                    gamesPlayed++

                    // Player was crew
                    if (game.crew.includes(p.name)) {
                        if (game.winner === "crew") {
                            game.imposters.forEach(imposter => {
                                if (imposterNemesis[imposter] === undefined) {
                                    imposterNemesis[imposter] = -1
                                } else {
                                    imposterNemesis[imposter]--
                                }
                            })
                        } else {
                            game.imposters.forEach(imposter => {
                                if (imposterNemesis[imposter] === undefined) {
                                    imposterNemesis[imposter] = 1
                                } else {
                                    imposterNemesis[imposter]++
                                }
                            })
                        }
                        return
                    }

                    // Player was imposter
                    if (game.winner === "imposter") {
                        game.imposters.forEach(imposter => {
                            if (imposter !== p.name) {
                                if (killingBuddy[imposter] === undefined) {
                                    killingBuddy[imposter] = 1
                                } else {
                                    killingBuddy[imposter]++
                                }
                            }
                        })
                    } else {
                        game.imposters.forEach(imposter => {
                            if (imposter !== p.name) {
                                if (killingBuddy[imposter] === undefined) {
                                    killingBuddy[imposter] = -1
                                } else {
                                    killingBuddy[imposter]--
                                }
                            }
                        })
                    }
                })
            }
        })
    })
    if (Object.keys(imposterNemesis).length > 0) {
        imposterNemesis = Object.entries(imposterNemesis).reduce((a, b) =>
            a[1] > b[1] ? a : b
        )[0]
    } else {
        imposterNemesis = null
    }
    if (Object.keys(killingBuddy).length > 0) {
        killingBuddy = Object.entries(killingBuddy).reduce((a, b) =>
            a[1] > b[1] ? a : b
        )[0]
    } else {
        killingBuddy = null
    }

    const pattern = GeoPattern.generate(player)
    $(".wrapped-display").css("background-image", pattern.toDataUrl())
    document.querySelector(".wrapped-display").innerHTML = `
    <h2 style="font-size: 4rem; font-weight: bold; text-align: center; margin-bottom: 1em;">${player}</h2>
    <h2 style="margin-bottom: 1.5em;">${player}'s highest Elo was ${highestElo} over ${
        seasonsPlayed > 1 ? seasonsPlayed + " seasons" : "1 season"
    } and ${gamesPlayed} games.</h2>
    <h3 style="margin-bottom: 1.5em";>${player} won as crew ${crewWin} times and lost ${crewLoss} times. ${
        imposterNemesis
            ? "Their imposter nemesis was " + imposterNemesis + "."
            : ""
    }    
    <h3 style="margin-bottom: 1.5em;">${player} won as imposter ${imposterWin} times and lost ${imposterLoss} times. ${
        killingBuddy ? "Their killing buddy was " + killingBuddy + "." : ""
    } </h3>
    <p style="text-align: right;">Among Us League 2020</p>
    `

    // Remove old onclick
    $(".wrapped-download").prop("onclick", null).off("click")

    // Generate canvas
    html2canvas(document.querySelector(".wrapped-display")).then(canvas => {
        $(".wrapped-download").show()
        // By clicking the HTML, start a download of the image from the canvas
        $(".wrapped-download").click(() => {
            var link = document.createElement("a")
            link.download = "among-us-friends-wrapped-2020.png"
            link.href = canvas.toDataURL()

            // Might need to exist in the document for Firefox?
            document.body.appendChild(link)
            link.click()
        })

        // Share link
        $(".wrapped-share").show()
        $(".wrapped-share").attr(
            "href",
            document.location.origin +
                document.location.pathname +
                "?name=" +
                player
        )
        $("a.wrapped-share").text(`Share link for ${player}`)
        $(".wrapped-share")
    })
}

function setupWrappedDownload() {
    $(".wrapped-display").click(function () {
        html2canvas($(".wrapped-display")[0], {
            onrendered: function (canvas) {
                saveAs(canvas.toDataURL(), "among-us-wrapped-2020.png")
            },
        })
    })

    function saveAs(uri, filename) {
        const link = document.createElement("a")
        if (typeof link.download === "string") {
            link.href = uri
            link.download = filename

            // Firefox requires the link to be in the body
            document.body.appendChild(link)

            // Simulate click
            link.click()

            // Remove the link when done
            document.body.removeChild(link)
        } else {
            window.open(uri)
        }
    }
}
// setupWrappedDownload()

getAllStats().then(json => load(json))
