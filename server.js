                                    //Server-side application

//Assign variables that contains the functions to create certain services from different libraries.

let express = require('express');
let bodyParser = require('body-parser');
const path = require('path');
let Pusher = require('pusher');
const crypto = require("crypto");

// here inside the express service I say to the app to use another express framework and use to response 
// to url with bodyparser in json file and encode the url...
const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

// to serve our JavaScript, CSS and index.html
   app.use(express.static('./dist/'));

// CORS
    app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
    next();
    });


// initialise Pusher. 
//Pusher is a service which helps us to add real-time data and functionality to web and mobile applications. Pusher maintains
// the constant connection between client and server sides, over websockets if possible and fall back to http -base connection.
//ass soon as the server has a new data it pushes it to the client side.
    // The credentials replaced from the dashboard where I created an app in pusher.com 
    let pusher = new Pusher({
        appId: '709983',
        key: 'c96975967b7ac6b1ba41',
        secret: '50c9504cca064e560ffe',
        cluster: 'us2',
        encrypted: true
      });


        // endpoint for authenticating client and say presence data all the time without authguards. 
    app.post('/pusher/auth', function(req, res) {
        let socketId = req.body.socket_id;
        let channel = req.body.channel_name;
        let presenceData = {
          user_id: crypto.randomBytes(16).toString("hex")
        };
        let auth = pusher.authenticate(socketId, channel, presenceData);
        res.send(auth);
      });

// direct all other requests to the built app view
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/battlefield-dev/index.html'));
  });

  // start server
  var port = process.env.PORT || 4100;
  app.listen(port, () => console.log('Listening at http://localhost:4100'));


  //in the code above we define an endpoint for authentication with pusher then we serve the app the html file for any request.
  //Next we have to initialise ousher in component.ts file
