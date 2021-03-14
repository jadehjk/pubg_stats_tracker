const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const axios = require('axios');
require('dotenv').config()
app.use(cors());

app.get('/players',(req, res) => {
    let names = req.query.names;
    let key = req.query.key;
    res.setHeader('Access-Control-Allow-Origin', '*');
    axios.get(`https://api.pubg.com/shards/steam/players?filter[playerNames]=${names}`, { headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
        'Accept': 'application/json'
    }})
      .then(response => {
        res.send(response.data);
      })
      .catch(error => {
        console.log(error);
      })
});

app.get('/matches', (req,res) => {
    let matchUrls = req.query.matchUrls.split(',');
    let commonMatches = [];
    res.setHeader('Access-Control-Allow-Origin', '*');
    Promise.all(matchUrls.map(m => axios.get(m, { headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
        'Accept': 'application/json'
    }})))
        .then(responses => {
            Promise.all(responses.map(res => res.data))
                .then((match) => {
                    commonMatches.push(match)
                    res.send(commonMatches);
                })
        })
})

//Set the port that you want the server to run on
const port = process.env.PORT || 8080;
app.listen(port);