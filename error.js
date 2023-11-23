const axios = require('axios');
const exec = require('child_process').exec;

const url = 'https://narvaro.ntig.dev/';
const payload = {};
const headers = {};

axios.post(url, payload, { headers })
    .then(response => {
        const errorSite = 'http://127.0.0.1:5500/index.html';

        if (response.status == 200) {
            // opening the site
            console.log('Status code:', response.status);
            exec('start chrome ' + errorSite);
        } else {
            console.log("errorrrrrrrrrrrr");
        }
    })
    .catch(error => {
        console.log('Error:', error);
    });
