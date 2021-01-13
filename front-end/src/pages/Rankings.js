import Summary from "../components/Summary"

export default function Rankings(props) {
    const { loading, players, search, setSearch } = props

    const searchBar = (
        <input
            value={search}
            style={{ marginBottom: "48px" }}
            placeholder="Search players"
            onChange={e => setSearch(e.target.value)}
        />
    )

    if (loading) {
        return searchBar
    }

    return (
        <div className="App">
            {searchBar}

            {players.map((player, i) => {
                if (search !== "" && !player.name.includes(search)) {
                    return <></>
                }
                return <Summary key={i} player={player} i={i} history={-30} />
            })}
        </div>
    )
}
