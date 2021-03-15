const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const axios = require('axios');
require('dotenv').config()
app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/players',(req, res) => {
    let names = req.query.names;
    let key = req.query.key;
    res.setHeader('Access-Control-Allow-Origin', '*');
    axios.get(`https://api.pubg.com/shards/steam/players?filter[playerNames]=${names}`, { headers: {
        'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwNTc1YmY4MC05MTIyLTAxMzctOTYwYS00N2ZiNGVlMjNhYjEiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTY0MDY5OTAyLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImhpaW1oYWpvby1nbWFpIn0.NT2cmhbtOBLp6JgZNgzFrW81ipbitYHYWAkAUlDgjKU`,
        'Accept': 'application/json'
    }})
      .then(response => {
        res.send(response.data);
      })
      .catch(() => {
        res.send({
            status: 400
        })
      })
});

app.get('/matches', (req,res) => {
    let matchUrls = req.query.matchUrls.split(',');
    let commonMatches = [];
    res.setHeader('Access-Control-Allow-Origin', '*');
    Promise.all(matchUrls.map(m => axios.get(m, { headers: {
        'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwNTc1YmY4MC05MTIyLTAxMzctOTYwYS00N2ZiNGVlMjNhYjEiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTY0MDY5OTAyLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImhpaW1oYWpvby1nbWFpIn0.NT2cmhbtOBLp6JgZNgzFrW81ipbitYHYWAkAUlDgjKU`,
        'Accept': 'application/json'
    }})))
        .then(responses => {
            Promise.all(responses.map(res => res.data))
                .then((match) => {
                    commonMatches.push(match)
                    res.send(commonMatches);
                })
        })
        .catch(() => {
            res.send({
                status: 400
            })
        })
})

// This middleware informs the express application to serve our compiled React files
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
};

//Set the port that you want the server to run on
const port = process.env.PORT || 8080;
app.listen(port);