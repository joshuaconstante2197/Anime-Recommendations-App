var mongoose = require("mongoose");
var Anime = require("./models/anime");
var Comment = require("./models/comment");
var User = require("./models/user")
var fetch = require("node-fetch");
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const { concatSeries } = require('async');

var imdbPicks = [
	"attack on titan",
	"my hero academia",
	"one piece",
	"demon slayer",
	"jujutsu kaisen"
]

var myPicks = [
	"no game, no life",
	"deadman wonderland",
	"soul eater",
	"re:zero",
	"mob psycho"
]

async function getSampleAnimes(data)
{
	let animes = [];
	 for(var i = 0; i < data.length; i++){
		 var parsedData = await getAnime(data[i]);
		 animes.push(parsedData);
	};
	return animes;
}
async function getAnime(title){
	const response = await fetch("http://www.omdbapi.com/?t="+title+"&type=series&apikey=" + process.env.OMDb_KEY)
	const parsedData = await response.json();
	return parsedData;
}



async function cleanDB() {
	await User.deleteMany({},function(err){
		if(err){
			console.log("couldn't delete user");
		}
		return console.log("Users deleted")
	})
	await Anime.deleteMany({},function(err){
		if(err){
			console.log("couldn't delete user");
		}
		return console.log("Animes deleted")
	})
	await Comment.deleteMany({},function(err){
		if(err){
				console.log("error deleting comments",err)
		}	
		return console.log("Comments deleted")
	})
	return console.log("Cleaned db");
}

async function seedDB()
{
	await cleanDB();
	var imdbAnimes = await getSampleAnimes(imdbPicks);
	var myAnimes = await getSampleAnimes(myPicks);
	await saveToDB(imdbAnimes, "IMDb");
	await saveToDB(myAnimes,"Creator")
	return console.log("database seeded")
}
async function saveToDB(animes, author)
{
	await animes.forEach(anime => {
		Anime.create({
			name : anime["Title"],
			image : anime["Poster"],
			genre :  anime["Genre"],
			description : anime["Plot"],
			releaseDate : anime["Released"],
			ratings : {
				imdbRating : anime["imdbRating"]
			},
			author : {
				username : author
			}
		},async function(err,anime){
			await	anime.save();
			return console.log("Anime " + anime["Title"] + "create")
		})
	})
	return console.log("all animes created")
}

module.exports = seedDB;
