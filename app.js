require('dotenv').config();
var express   				= require("express"),
	app       				= express(),
	bodyParser				= require("body-parser"),
	mongoose  				= require("mongoose"),
	Anime				= require("./models/anime"),
	Comment 				= require("./models/comment"),
	seedDB					= require("./seeds"),
	methodOverride 			= require("method-override"),
	passport 				= require("passport"),
	LocalStrategy 			= require("passport-local"),
	passportLocalMongoose 	= require("passport-local-mongoose"),
	User 					= require("./models/user"),
	flash					= require("connect-flash")
//requiring routes

var commentRoutes = require("./routes/comments"),
	animeRoutes = require("./routes/animes"),
	indexRoutes = require("./routes/index");

const geoCoderK = process.env.GEOCODER_API_KEY;
const connectionString = process.env.CONNECTION_STRING;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(connectionString,{useNewUrlParser:true});

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
console.log(__dirname);
app.use(methodOverride("_method"));
app.use(flash());
seedDB();
app.locals.moment = require('moment');
//pasport configuration
app.use(require("express-session")({
	secret: "Everything you do, do with intent",
	resave:false,
	saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//passing current User
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/animes",animeRoutes);
app.use("/animes/:id/comments",commentRoutes);


app.listen(process.env.PORT||3001,process.env.IP,function(){
	console.log("Running Yelcamp!");
})