import { NavLink } from "react-router-dom"
import Twemoji from "react-twemoji"

import Graph from "./Graph"

export default function Summary(props) {
    const { player, i, history } = props
    const {
        name,
        games,
        eloHistory,
        elo,
        crewWin,
        crewLoss,
        impostorWin,
        impostorLoss,
        winStreaks,
    } = player

    const _eloHistory = eloHistory
        .map(elo => {
            return { y: elo }
        })
        .slice(history)

    const crewWinRate = parseFloat(
        (crewWin / (crewWin + crewLoss)) * 100
    ).toFixed(2)
    const impostorWinRate = parseFloat(
        (impostorWin / (impostorWin + impostorLoss)) * 100
    ).toFixed(2)

    const placements = games.length <= 10
    return (
        <div
            className="player-summary"
            style={{
                opacity: placements ? 0.5 : 1,
                display: "flex",
                flexWrap: "wrap",
                paddingBottom: "15px",
            }}
        >
            <div>
                <div style={{ marginBottom: "-5px" }}>
                    <Twemoji>
                        <small>{placements ? "#~" : `#${i + 1}`}</small>{" "}
                        <span style={{ fontWeight: "bold" }}>
                            <NavLink to={`/player/${name}`}>{name}</NavLink>{" "}
                        </span>
                        <small>
                            {`(${elo})`}{" "}
                            {winStreaks.current > 2 && (
                                <span
                                    title={`${winStreaks.current} wins in a row!`}
                                >
                                    🔥
                                </span>
                            )}
                        </small>
                    </Twemoji>
                </div>
                <table>
                    <tr>
                        <th>
                            <small>team</small>
                        </th>
                        <th>
                            <small>wins</small>
                        </th>
                        <th>
                            <small>losses</small>
                        </th>
                        <th>
                            <small>win rate</small>
                        </th>
                    </tr>
                    <tr>
                        <td>
                            <Twemoji>😇</Twemoji>
                        </td>
                        <td>{crewWin}</td>
                        <td>{crewLoss}</td>
                        <td>{crewWinRate !== "NaN" && `${crewWinRate}%`}</td>
                    </tr>
                    <tr>
                        <td>
                            <Twemoji>👹</Twemoji>
                        </td>
                        <td>{impostorWin}</td>
                        <td>{impostorLoss}</td>
                        <td>
                            {impostorWinRate !== "NaN" && `${impostorWinRate}%`}
                        </td>
                    </tr>
                </table>
            </div>
            <Graph className="elo-graph" data={_eloHistory} />
        </div>
    )
}
