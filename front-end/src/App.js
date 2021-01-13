import React, { useState, useEffect } from "react"
import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink,
} from "react-router-dom"

import About from './components/About'
import Rankings from './components/Rankings'
import Player from './components/Player'
import Maps from './components/Maps'
import { getStats } from './Api'

import 'water.css/out/light.css'
import 'typeface-inter'
import './App.css'

export default function App() {
    const [loading, setLoading] = useState(true)
    const [currentSeasonName, setCurrentSeasonName] = useState('0')
    const [stats, setStats] = useState({
        players: [],
        maps: [],
        seasons: []
    })

    useEffect(() => {
        getStats('0')
            .then(stats => {
                setStats(stats)
                setCurrentSeasonName(stats.seasons[stats.seasons.length - 1])
                setLoading(false)
            })
    }, [])

    const handleSeasonChange = (season) => {
        setLoading(true)
        setCurrentSeasonName(season)
        getStats(season)
            .then(stats => {
                setStats(stats)
                setLoading(false)
            })
    }

    const { players, season, seasons } = stats
    return (
        <Router>
            <header>
                <nav style={{ paddingTop: '12px', marginBottom: '48px' }}>
                    <ul style={{ paddingLeft: 0 }}>
                        <li style={{ display: 'inline', marginRight: '12px' }}>
                            <b>Among Us League</b>
                        </li>
                        <li style={{ display: 'inline', marginRight: '12px' }}>
                            <NavLink exact activeClassName="active-link" to="/">Rankings</NavLink>
                        </li>
                        <li style={{ display: 'inline', marginRight: '12px' }}>
                            <NavLink activeClassName="active-link" to="/maps">Maps</NavLink>
                        </li>
                        <li style={{ display: 'inline', marginRight: '12px' }}>
                            <NavLink activeClassName="active-link" to="/about">About</NavLink>
                        </li>
                        {currentSeasonName !== '0' &&
                            <li style={{ display: 'inline', float: 'right' }}>
                                <select style={{ marginTop: '-12px' }} disabled={loading} value={currentSeasonName} onChange={(event) => handleSeasonChange(event.target.value)}>
                                    {seasons.map((season) =>
                                        <option key={season} value={season}>Season {season}</option>
                                    )}
                                </select>
                            </li>
                        }
                    </ul>
                </nav>
                <main style={{ opacity: loading ? .5 : 1 }}>
                    <Switch>
                        <Route exact path="/">
                            <Rankings loading={loading} players={players} />
                        </Route>
                        <Route path="/maps">
                            <Maps loading={loading} season={season} currentSeasonName={currentSeasonName} />
                        </Route>
                        <Route path="/player/:id" >
                            <Player loading={loading} players={players} />
                        </Route>
                        <Route path="/about" >
                            <About />
                        </Route>
                    </Switch>
                </main>
            </header>
        </Router>
    );
}
