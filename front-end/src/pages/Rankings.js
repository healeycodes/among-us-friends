import Summary from "../components/Summary"

export default function Rankings(props) {
    const { loading, players, search, setSearch, sortBy, setSortBy } = props

    const searchBar = (
        <input
            value={search}
            style={{ marginBottom: "48px" }}
            placeholder="Search players"
            onChange={e => setSearch(e.target.value)}
        />
    )

    const sortByDropdown = (
        <select
            style={{ marginBottom: "48px" }}
            onChange={e => setSortBy(e.target.value)}>
            <option value="elo">Elo</option>
            <option value="games played">Games played</option>
            <option value="impostor win rate">Impostor win rate</option>
            <option value="crew win rate">Crew win rate</option>
        </select>
    )

    if (loading) {
        return searchBar
    }

    players.sort((a, b) => {
        switch (sortBy) {
            case "games played":
                return b.games.length - a.games.length
            case "impostor win rate":
                return ((b.impostorWin / (b.impostorWin + b.impostorLoss)) * 100) - ((a.impostorWin / (a.impostorWin + a.impostorLoss)) * 100)
            case "crew win rate":
                return ((b.crewWin / (b.crewWin + b.crewLoss)) * 100) - ((a.crewWin / (a.crewWin + a.crewLoss)) * 100)
            default:
                return b.elo - a.elo
        }
    })

    const placements = players.filter(player => player.games.length <= 10)
    const sortedPlayers = players.filter(player => player.games.length > 10).concat(placements)

    return (
        <div className="App">
            <div style={{display: "flex"}}>
                {searchBar}
                {sortByDropdown}
            </div>

            {sortedPlayers.map((player, i) => {
                if (search !== "" && !player.name.includes(search)) {
                    return <></>
                }
                return <Summary key={i} player={player} i={i} history={-30} />
            })}
        </div>
    )
}
