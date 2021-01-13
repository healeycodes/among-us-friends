import { useState } from "react"

import Summary from '../components/Summary'

export default function Rankings(props) {
    const { players } = props
    const [search, setSearch] = useState('')

    return (
        <div className="App">
            <input style={{ marginBottom: '48px' }} placeholder="Search players" onChange={(e) => setSearch(e.target.value)} />

            {players.map((player, i) => {
                if (search !== '' && !player.name.includes(search)) {
                    return <></>
                }
                return <Summary key={i} player={player} i={i} history={-30} />
            })}
        </div>
    );
}