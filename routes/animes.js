const express = require("express");
const router = express.Router();
const Anime = require("../models/anime");
const Comment = require("../app");
const middlewareObj = require("../middleware/index");

router.get("/",function(req,res){
	req.user
	if(req.query.search){
			const regex = new RegExp(escapeRegex(req.query.search),'gi');
			Anime.find({name:regex},function(err,dbanimes){
			if(err){
				console.log(err);
			} else{
				var noMatch;
				if(dbanimes.length<1){
					noMatch = "No campgrounds match your search";
				}
				res.render("animes/index",{animes:dbanimes,currentUser:req.user,noMatch:noMatch});
			}
		})
	}else{
	//get anime from DB
		Anime.find({},function(err,dbanimes){
			if(err){
				console.log(err);
			} else{
				var noMatch;
				res.render("animes/index",{animes:dbanimes,currentUser:req.user,noMatch:noMatch});
			}
		})	
	}
})	



// Create new campground page
router.post("/",middlewareObj.isLoggedIn,async function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var genre = req.body.genre;
	var author = {
		id:req.user._id,
		username:req.user.username
	}
	
		
		var newAnime = {name:name,image:image,description:description,genre:genre,author:author};
		Anime.create(newAnime, function(err,userAnime){
			if(err){
				console.log("Error Found",err);
			} else{
			console.log(userAnime.author.id);
			res.redirect("/animes");
			}
		});
	});	
//NEW page where the form the CREATE a new anime is displayed
router.get("/new",middlewareObj.isLoggedIn,function(req,res){
	res.render("animes/new");
})

//SHOW one of the current animes
router.get("/:id",function(req,res){
	//find the campground with provided ID
	Anime.findById(req.params.id).populate("comments").exec(function (err,foundAnime){
		if(err || !foundAnime){
			
			console.log(err);
			req.flash("error","anime not found");
			return res.redirect("/animes")
		}
		else{
			console.log("anime Found");
			//render show template with that campground
			res.render("animes/show",{anime:foundAnime});
		}	
	});
});
//SHOW UPDATE FORM
router.get("/:id/edit",middlewareObj.isLoggedIn, middlewareObj.checkAnimeOwnership,function(req,res){
		res.render("animes/update",{anime:req.anime});
});
//MAKE UPDATE
router.put("/:id",middlewareObj.isLoggedIn,middlewareObj.checkAnimeOwnership,function(req,res){
	
	Anime.findByIdAndUpdate(req.params.id,req.body.campground,{new:true}, function(err,userAnime){
		if(err){
			console.log("error",err)	
		}else{
			res.redirect("/anime/"+req.params.id);
		}
	});
});	

//Destroy campground route
router.delete("/:id",middlewareObj.isLoggedIn,middlewareObj.checkAnimeOwnership,function(req,res){
	Anime.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
			res.redirect("/animes");
		}else{
			res.redirect("/animes");
			
		}
	})
})


function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$\#\s]/g,"\\$&");
}


module.exports = router;