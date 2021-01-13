import { getMap } from '../Api'

export default function Maps(props) {
    const { season, currentSeasonName } = props

    return (
        <div className="App">
            <p>In Season {currentSeasonName}, there have been {season.totalGames} games played.</p>
            {Object.keys(season.mapData).map(name => {
                const crewWin = season.mapData[name].crewWin
                const crewLoss = season.mapData[name].crewLoss
                const percent = parseFloat(
                    (crewWin / (crewWin + crewLoss)) * 100
                ).toFixed(2)

                return <p>Crew win {percent}% of the time on {getMap(name)}.</p>
            })}
        </div>
    );
}