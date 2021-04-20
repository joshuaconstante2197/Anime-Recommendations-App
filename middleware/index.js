var Anime = require("../models/anime");
var Comment = require("../models/comment");
var middlewareObj = {};


//check for campground ownership middlewareObj
middlewareObj.checkAnimeOwnership = function (req,res,next){
if(req.isAuthenticated()){
		Anime.findById(req.params.id,function(err,toUpdateAnime){
			if(err || !toUpdateAnime){
				console.log("can't update anime if cant find it");
				req.flash("error","Anime not found");
				res.redirect("/animes");
			}else if(toUpdateAnime.author.id!=null && toUpdateAnime.author.id.equals(req.user._id) || req.user.isAdmin){
          			req.anime = toUpdateAnime;
					next();
			}else{
				req.flash("error","You do not have permissions to do that");
				res.redirect("/animes/"+req.params.id);
			}
			
		})
		
	}
}
// check for comment ownership middleware
middlewareObj.checkCommentOwnership= function (req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,toUpdateComment){
				if(err || !toUpdateComment){
					console.log("can't update comment if cant find it middleware",err);
					req.flash("error","Comment not found");
					res.redirect("/animes");
				}else if(toUpdateComment.author.id!=null && toUpdateComment.author.id.equals(req.user._id) || req.user.isAdmin){
						req.comment = toUpdateComment;
						next();
				}else{
					req.flash("error","You do not have permissions to do that");
					res.redirect("back");
				}
		})

	}
}
				
//is logged in middleware
middlewareObj.isLoggedIn = function (req,res,next){
if(req.isAuthenticated()){
	return next();
	}
	req.flash("error","You need to be logged in to do that");
	res.redirect("/login"); 
}

module.exports = middlewareObj;