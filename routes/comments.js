var express = require("express");
var router = express.Router({mergeParams:true});
var Anime = require("../models/anime")
var Comment = require("../models/comment")
var middlewareObj = require("../middleware/index")
//get form for new comments,NEW
router.get("/new",middlewareObj.isLoggedIn,function(req,res){
	Anime.findById(req.params.id,function(err,newComment){
		if(err){
			console.log("can't update comment if cant find it");
			console.log(err);
		}else{
			res.render("comments/new",{anime:newComment});
		}
	});
});
	
//post comment to comments array, CREATE
router.post("/",middlewareObj.isLoggedIn,function(req,res){
	var id = req.params.id;
	Anime.findById(id,function(err,anime){
		if(err){
			console.log("couldn't find anime to post comment",err);
		}else{
			Comment.create(req.body.comment,function(err,newComment){
				if(err){
					console.log("couldn't create comment",err);
				}else{
					newComment.author.username = req.user.username;
					newComment.author.id = req.user._id;
					newComment.save();
					anime.comments.push(newComment);
					anime.save();
					console.log("comment created",newComment);
					req.flash("success","Comment Created");
					res.redirect("/animes/"+anime._id);
				}
			});
		}
	});
});
//edit comments
router.get("/:comment_id/edit",middlewareObj.isLoggedIn,middlewareObj.checkCommentOwnership,function(req,res){
		res.render("comments/update",{comment:req.comment,campground_id:req.params.id})		
});

//update comments
router.put("/:comment_id",middlewareObj.isLoggedIn,middlewareObj.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,{new:true},function(err,updatedComment){
		if(err){
			console.log("couldn't update comment",err);
		}else{
			console.log("comment updated");
			console.log(updatedComment);
			console.log(req.body.comment);
			res.redirect("/animes/"+req.params.id);
		}
	});
});
//delete comments
router.delete("/:comment_id",middlewareObj.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			console.log("couldn't remove commnet",err)
		}else{
			req.flash("success","Comment Deleted");
			res.redirect("/animes/"+req.params.id)
		}
	})
})




module.exports = router;