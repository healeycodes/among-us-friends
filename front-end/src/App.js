import React, { useState, useEffect } from "react"
import { Switch, Route, NavLink, useLocation } from "react-router-dom"

import About from "./pages/About"
import Rankings from "./pages/Rankings"
import Player from "./pages/Player"
import Stats from "./pages/Stats"
import { getSeasons, getAllSeasonStats } from "./Api"

import "water.css/out/light.css"
import "typeface-inter"
import "./App.css"

function App() {
    const [loading, setLoading] = useState(true)
    const [allSeasonStats, setAllSeasonStats] = useState({})
    const [seasons, setSeasons] = useState([])
    const [currentSeason, setCurrentSeason] = useState("")
    const [stats, setStats] = useState({
        players: [],
        maps: [],
    })
    const [search, setSearch] = useState("")
    const [sortBy, setSortBy] = useState("")

    useEffect(() => {
        getSeasons().then(seasons => {
            getAllSeasonStats().then(allSeasonStats => {
                const current = seasons[seasons.length - 1]
                setAllSeasonStats(allSeasonStats)
                setSeasons(seasons) // e.g [1, 2, 3]
                setStats(allSeasonStats[current])
                setCurrentSeason(current)
                setLoading(false)
            })
        })
    }, [])

    // Track page views
    const location = useLocation()
    useEffect(() => {
        const t = setInterval(function () {
            if (window.goatcounter && window.goatcounter.count) {
                clearInterval(t)
                window.goatcounter.count({
                    path: location.pathname,
                })
            }
        }, 100)

        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
    }, [location])

    const handleSeasonChange = current => {
        setCurrentSeason(current)
        setStats(allSeasonStats[current])
    }

    const { players, deadlyDuos, season } = stats
    const allTrophies = {}
    Object.keys(allSeasonStats).forEach(s => {
        allTrophies[s] = allSeasonStats[s].trophies
    })

    return (
        <header>
            <nav style={{ paddingTop: "12px", marginBottom: "48px" }}>
                <ul style={{ paddingLeft: 0 }}>
                    <li style={{ display: "inline", marginRight: "12px" }}>
                        <b>Among Us League</b>
                    </li>
                    <li style={{ display: "inline", marginRight: "12px" }}>
                        <NavLink exact activeClassName="active-link" to="/">
                            Rankings
                        </NavLink>
                    </li>
                    <li style={{ display: "inline", marginRight: "12px" }}>
                        <NavLink activeClassName="active-link" to="/stats">
                            Stats
                        </NavLink>
                    </li>
                    <li style={{ display: "inline", marginRight: "12px" }}>
                        <NavLink activeClassName="active-link" to="/about">
                            About
                        </NavLink>
                    </li>
                    {currentSeason !== "" && (
                        <li
                            className="season-list"
                            style={{ display: "inline", float: "right" }}
                        >
                            <select
                                style={{ marginTop: "-10px" }}
                                disabled={loading}
                                value={currentSeason}
                                onChange={event =>
                                    handleSeasonChange(event.target.value)
                                }
                            >
                                {seasons.map(s => (
                                    <option key={s} value={s}>
                                        Season {s}
                                    </option>
                                ))}
                            </select>
                        </li>
                    )}
                </ul>
            </nav>
            <main style={{ opacity: loading ? 0.5 : 1 }}>
                <Switch>
                    <Route exact path="/">
                        <Rankings
                            loading={loading}
                            players={players}
                            search={search}
                            setSearch={setSearch}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />
                    </Route>
                    <Route path="/stats">
                        <Stats
                            loading={loading}
                            players={players}
                            deadlyDuos={deadlyDuos}
                            season={season}
                        />
                    </Route>
                    <Route path="/player/:id">
                        <Player
                            loading={loading}
                            players={players}
                            allTrophies={allTrophies}
                        />
                    </Route>
                    <Route path="/about">
                        <About />
                    </Route>
                </Switch>
                {loading && (
                    <img
                        alt="Among Us impostor"
                        className="centered"
                        style={{ opacity: 0.25, filter: "grayscale(100%)" }}
                        src="/impostor.png"
                    />
                )}
            </main>
        </header>
    )
}

export default App
