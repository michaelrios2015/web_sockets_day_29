const { application } = require('express');
const express = require('express');
const app = express();
const path = require('path');
const { send } = require('process');
const ws = require('ws');

const randomMessage = () => {
    const num = Math.round(Math.random() * 1000);
//    the point is to send an object 
    return { num }
}

const numbers = [];

numbers.push(randomMessage());
numbers.push(randomMessage());

console.log(numbers);

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/', (req, res)=> {
    const message = randomMessage();
    // why do we oush it here?? so we can remember it
    numbers.push(message);
    // then we send it and it gies to the fetch/xhr which I have no clue what that is 
    res.send(message);
});

const port = process.env.PORT || 3000;
const server = app.listen(port, ()=> console.log(`listening on port ${port}`));

// console.log(server);
// so I guess websockets has it's own server... honestly not sure 
const webSocketServer = new ws.Server({ server });


// we need an array of sockets so we can broadcat our message

let sockets = [];


// so there is something like this in hatchways but it appears to be in the client on hatchways... 
// I think this is a good way to test it 
webSocketServer.on('connection', (socket)=> {
    console.log(sockets.length);
    // everytime we coonect a new socket is born 
    sockets.push(socket);
// so I can at leats see that's it's trying to send this 
// cen'y send objects and history is just what I am calling it 
    socket.send(JSON.stringify({ history: numbers }));
    // so here I need to listen for messages coming from other windows (sockets) so they 
    // can all be up to date 
    socket.on('message', (data)=> {
        console.log(data);
        const message = JSON.parse(data)
        console.log(message);
        // now we send to each socket 
        // something weird happened somewhere.... there most be an extra set of {} somewhere 
        // the filter just takes out the socket from whihc it originated soe it does not get teh meaage 
        // twice
        sockets.filter(s => s !== socket).forEach( s => s.send(JSON.stringify( message )));
    });
    // we are just removing the closed one from our array of sockets 
    // honestly a bit confused but it's ok 
    socket.on('close', ()=> {
        sockets = sockets.filter(s=> s !== socket)
    })
});
