import './App.css';
import axios from "axios";
import { useState } from 'react';
import SearchBar from './SearchBar';
import MatchListItem from './MatchListItem';
import _ from 'lodash';
import List from '@material-ui/core/List';

function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

    interface Match {
        id?: string;
        teams?: Team[];
        date?: number;
    }

    interface Team {
        id?: string;
        playerIds?: string[];
        players?: Player[];
        rank?: number;
        isTarget?: boolean;
    }

    interface Player {
        assists?: number;
        damage?: number;
        kills?: number;
        timeSurvived?: number;
        rank?: number;
        name?: string;
        isTarget?: boolean;
    }

    function getDateDifference(today: Date, matchDate: Date) {
        const diffTime = Math.abs(today.getTime() - matchDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function parseMatches(commonMatches: any[], parsedNames) {
        let tempMatches = commonMatches;
        let teams: Team[] = [];
        let matches: Match[] = [];
        let players: Record<string, Player> = {};
        if (!tempMatches || !tempMatches[0]) {
            setErrorMsg('Could not find players with the provided name. Please make sure that the names are cased correctly.')
            return;
        }
        let date = new Date();
        tempMatches[0].forEach((tempMatch: any) => {
            let matchDate = new Date(tempMatch.data.attributes.createdAt);
            tempMatch.included.forEach((player: any) => {
                if (player.type === 'roster') {
                    teams.push({
                        id: player.id,
                        playerIds: player.relationships.participants.data.map((p: any) => p.id),
                        rank: player.attributes.stats.rank,
                        players: []
                    })
                }
                if (player.type === 'participant') {
                    players[player.id] = {
                        assists: player.attributes.stats.assists,
                        damage: parseInt(player.attributes.stats.damageDealt),
                        kills: player.attributes.stats.kills,
                        timeSurvived: player.attributes.stats.timeSurvived / 60,
                        rank: player.attributes.stats.winPlace,
                        name: player.attributes.stats.name,
                        isTarget: parsedNames.includes(player.attributes.stats.name)
                    }
                }
            })
            teams.forEach(team => {
                team.playerIds!.forEach(playerId => {
                    team.players!.push(players[playerId])
                    if (players[playerId].isTarget) {
                        team.isTarget = true;
                    }
                })
            })
            teams.sort((x, y) => x.rank! - y.rank!);
            let targetTeams = [];
            let nonTargetTeams = [];
            let teamsLength = teams.length;
            for (let i = 0; i < teamsLength; ++i) {
                if (teams[i].isTarget) {
                    targetTeams.push(teams[i]);
                } else {
                    nonTargetTeams.push(teams[i]);
                }
            }
            matches.push({
                id: tempMatch.data.id,
                teams: targetTeams.concat(nonTargetTeams),
                date: getDateDifference(date, matchDate)
            })
            teams = [];
            players = {};
        })
        setMatches([...matches]);
    }

    async function getMatches(matchUrls, parsedNames) {
        if (matchUrls.length < 1) {
            setErrorMsg('Could not find players with the provided name. Please make sure that the names are cased correctly.')
            return;
        }
        for (let i = 0; i < matchUrls.length; ++i) {
            matchUrls[i] = `https://api.pubg.com/shards/steam/matches/${matchUrls[i]}`;
        }
            let response = await axios.get(`/matches?matchUrls=${matchUrls}`);
            if (response.data.status && response.data.status === 400) {
                setErrorMsg('Could not find players with the provided name. Please make sure that the names are cased correctly.')
                return;
            }
            parseMatches(response.data, parsedNames);
    }

   async function getPlayers(names: string) {
        const playerNames = names.replace(/\s+/g, '');
        if (playerNames[playerNames.length - 1] === ',') {
            playerNames.slice(0, -1);
        }
        let parsedNames = playerNames.split(',');
        let response: any = await axios.get(`/players?names=${playerNames}`);
        console.log(response);
        if (response.data.status && response.data.status === 400) {
            setErrorMsg('Could not find players with the provided name. Please make sure that the names are cased correctly.')
            return;
        }
        let totalMatches: string[] = [];
        response.data.data.forEach((players: any) => {
            let matchIds: any = [];
            players.relationships.matches.data.forEach((match: Record<string, string>) => {
                matchIds.push(match);
            })
            totalMatches.push(matchIds.map((x: any) => x.id));
        })
        getMatches([..._.intersection.apply(_, totalMatches)], parsedNames);
    }

    function handlePlayersSearch(names: string) {
        setMatches([]);
        getPlayers(names);
    }

    return (
        <div className="App">
            <SearchBar onPlayersSearch={handlePlayersSearch}/>
            <div>
                {errorMsg.length > 0 &&
                    <div>{errorMsg}</div>
                }
                {matches.map((match) => (
                    <div>
                        <List key={match.id}>
                            <MatchListItem match={match} />
                        </List>
                        
                    </div>
                    
                ))}
            </div>
        </div>
        );
}

export default App;
