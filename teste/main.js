const axios = require('axios');
const fs = require('fs');

const url ='https://www.plantuml.com/plantuml/png/FO-n2i8m48RtFCNPrI1fQgKEWHR1GIXq44SXc0oHqa2IBcrz6WVHryYBcLGg77mVT_znN6aTDyxorg7ncboKxNch1cwWCTA_j8M3RgNZGji4LPs62IYXMrJxZmr-uXr2ZFt34upd5G9OCyOQeqNluaRm6wIBq4Mo8BL_2yNZHcMC7a87qXmN9BB0XCHx-O_f7kz8J1wbklkddhCqp2ApcPiOepWdw852bR8JyRCl'
const res = axios.get(url, {
    responseType: 'arraybuffer',
}).then((r) => {
    fs.writeFile('image.png', r.data, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
})