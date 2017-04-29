// Grab the following packages...
var fs = require("fs");
var request = require('request');

var nodeArg = process.argv;
var liriCommand = nodeArg[2];
if (nodeArg[3]){
	var liriRequest = nodeArg[3];
}

var content = "";

// "my-tweets"
function twitter() {

	// Include this key file and Twitter node.js module for Twitter access.
	var keysFile = require("./keys.js");
	var Twitter = require("twitter");

	var client = new Twitter({
		consumer_key: keysFile.twitterKeys.consumer_key,
		consumer_secret: keysFile.twitterKeys.consumer_secret,
		access_token_key: keysFile.twitterKeys.access_token_key,
		access_token_secret: keysFile.twitterKeys.access_token_secret
	});

	var params = {screen_name: '@SeussanSays', count: 20};

	client.get('statuses/user_timeline', params, function(error, tweets, response) {

  		// If error, report.
		if (error) {
			writeLogFile('Twitter: Error occurred: ' + error + response);
			return;
		}

		for (var i = 0; i < 20; i++){
			if (typeof tweets[i] !== 'undefined'){
				writeLogFile(tweets[i].text);
			}
		}
	});
};

// "spotify-this-song"
function spotifySong(songRequest) {

	if (!songRequest) {
		songRequest = "Ace of Base The Sign";
	}

	var spotify = require('spotify');

	spotify.search({ type: 'track', query: songRequest }, function(error, data) {

  		// If error, report.
		if (error) {
			writeLogFile('Spotify: Error occurred: ' + error);
			return;
		}

		writeLogFile("Artist: " + data.tracks.items[0].album.artists[0].name);
		writeLogFile("Song name: " + data.tracks.items[0].name);
		writeLogFile("Album: " + data.tracks.items[0].album.name);
		writeLogFile("A preview link of the song from Spotify: " + data.tracks.items[0].album.external_urls.spotify);
	});
};

// "movie-this"
function omdb(movieName) {

	if (!movieName) {
		movieName = "Mr. Nobody";
	}

	var movieSearch = "http://www.omdbapi.com/?t=" + movieName + "&plot=full";

	request(movieSearch, function (error, response, body) {

  		// If error, report.
		if (error) {
			writeLogFile('OMDB: Error occurred: ' + error);
			return;
		}

		// Successful response is 200
		if (response.statusCode === 200) {
			//content = "Title: " + JSON.parse(body).Title;

			writeLogFile("Title: " + JSON.parse(body).Title);
			writeLogFile("Year Released: " + JSON.parse(body).Year);
			writeLogFile("IMDB Rating: " + JSON.parse(body).imdbRating);
			writeLogFile("Production Country: " + JSON.parse(body).Country);
			writeLogFile("Language: " + JSON.parse(body).Language);
			writeLogFile("Plot: " + JSON.parse(body).Plot);
			writeLogFile("Actors: " + JSON.parse(body).Actors);
			writeLogFile("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
			writeLogFile("Movie Website: " + JSON.parse(body).Website);
		}
	});
};

// "do-what-it-says"
function doWhatItSays () {

	// Read the external file.
	var data = fs.readFileSync("random.txt", "utf8").toString();

	// Split the line by the comma character.
	var dataSplit = data.split(",");

	// Assign the first half of the string as the liri command.
	liriCommand = dataSplit[0].toString();

	if (dataSplit.length > 1) {
		// Assign the second half of the string (if it exists) as the liri request.
		liriRequest = dataSplit[1].toString();
	}
	liriResponse(liriCommand, liriRequest);
};

// Append all output to log.txt file. Creates file if it doesn't exist.
function writeLogFile(content, quiet) {

	// Send output to screen.
	if (!quiet) {
		console.log(content);
	}

	// Write it out with newline after each bit of information.
	fs.appendFile("log.txt", content + "\n", function(error) {

  		// If error, report.
  		if (error) {
  			writeLogFile(error);
  			return;
  		}
  	});
}

function liriResponse(liriCommand, liriRequest) {

	if (liriRequest){
		writeLogFile(liriCommand + " " + liriRequest, true);
	}
	else {
		writeLogFile(liriCommand, true);
	}

	switch (liriCommand) {
		case "my-tweets":
		twitter();
		break;

		case "spotify-this-song":
		spotifySong(liriRequest);
		break;

		case "movie-this":
		omdb(liriRequest);
		break;

		case "do-what-it-says":
		doWhatItSays();
		break;

		default:
		writeLogFile("I don't understand what you are asking for!!");
	}
}

liriResponse(liriCommand, liriRequest);