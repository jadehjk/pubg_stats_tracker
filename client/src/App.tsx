import './App.css';
import axios from "axios";
import { useState } from 'react';
import SearchBar from './SearchBar';
import MatchListItem from './MatchListItem';
import _ from 'lodash';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';

function App() {
  const [matchUrls, setMatchUrls] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [names, setNames] = useState(['']);
  const [expandMatch, setExpandMatch] = useState([false]);

    interface Match {
        id?: string;
        teams?: Team[];
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

    const playersURL = 'https://api.pubg.com/shards/steam/players?filter[playerNames]='

    function parseMatches(commonMatches: any[]) {
        let tempMatches = commonMatches;
        let teams: Team[] = [];
        let matches: Match[] = [];
        let players: Record<string, Player> = {};
        if (!tempMatches || !tempMatches[0]) {
            console.log('err')
            return;
        }
        console.log('matches');
        console.log(tempMatches)
        tempMatches[0].forEach((tempMatch: any) => {
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
                        damage: Number(player.attributes.stats.damageDealt),
                        kills: player.attributes.stats.kills,
                        timeSurvived: player.attributes.stats.timeSurvived / 60,
                        rank: player.attributes.stats.winPlace,
                        name: player.attributes.stats.name,
                        isTarget: names.includes(player.attributes.stats.name)
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

            for (let i = 0; i < teams.length; ++i) {
                if (teams[i].isTarget) {
                    let temp = JSON.parse(JSON.stringify(teams[i]));
                    teams.splice(i, 1);
                    teams.unshift(temp);
                }
            }
            matches.push({
                id: tempMatch.data.id,
                teams
            })
            teams = [];
            players = {};
        })
        console.log('-----------------------------------------------------');
        console.log(matches);
        setMatches(matches);
        setExpandMatch(Array<boolean>(matches.length).fill(false));
    }

    async function getMatches() {
        if (matchUrls.length < 1) {
            return;
        }
        for (let i = 0; i < matchUrls.length; ++i) {
            matchUrls[i] = `https://api.pubg.com/shards/steam/matches/${matchUrls[i]}`
        }
        let response = await axios.get(`/matches?matchUrls=${matchUrls}`);
        parseMatches(response.data);
    }

   async function getPlayers(names: string) {
        const playerNames = names.replace(/\s+/g, '');
        if (playerNames[playerNames.length - 1] === ',') {
            playerNames.slice(0, -1);
        }
        setNames(playerNames.split(','))
        let url = `${playersURL}${playerNames}`;
        console.log('player url');
        console.log(url);
        try {
            // let response: any = axios.get(url, {headers: new Headers(headers)});
            let response: any = await axios.get(`/players?names=${playerNames}`);
            // let response: any = await fetch('/api/hello');
            let totalMatches: string[] = [];
            console.log(response);
            response.data.data.forEach((players: any) => {
                let matchIds: any = [];
                players.relationships.matches.data.forEach((match: Record<string, string>) => {
                    matchIds.push(match);
                })
                totalMatches.push(matchIds.map((x: any) => x.id));
            })
            setMatchUrls(_.intersection.apply(_, totalMatches));
            getMatches();
        } catch(err) {
            console.log(err);
        }
    }

    function handlePlayersSearch(names: string) {
        setMatchUrls([]);
        setMatches([]);
        setNames([]);
        setExpandMatch([]);
        getPlayers(names);
    }

    function handleExpand(idx: number) {
        console.log('handle expand');
        console.log(idx);
        let tempMatches = expandMatch;
        let match = tempMatches[idx];
        console.log('match before set');
        console.log(match);
        match = !match;
        console.log('match after set');
        console.log(match);
        tempMatches[idx] = match;
        console.log('before set');
        console.log(expandMatch[idx]);
        setExpandMatch(tempMatches)
        console.log('after set');
        console.log(expandMatch[idx]);
    }


    return (
        <div className="App">
            <SearchBar onPlayersSearch={handlePlayersSearch}/>
            <div>
                {matches.map((match, idx) => (
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
