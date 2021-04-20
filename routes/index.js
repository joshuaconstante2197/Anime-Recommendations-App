var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Anime = require("../models/anime");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

router.get("/",function(req,res){
	res.render("landing");
})
// auth routes 
//============
//show register form
router.get("/register",function(req,res){
	res.render("auth/register");
})
router.post("/register",function(req,res){
	var newUser = new User({
		username:req.body.username,
		firstName:req.body.firstName,
		lastName:req.body.lastName,
		email:req.body.email,
		avatar:req.body.avatar
	});
	console.log(newUser);
	if(req.body.secret === process.env.ADMIN_SECRET){
			newUser.isAdmin = true;
			console.log(newUser);
		}
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			req.flash("error",err.message)
			res.render("auth/register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("animes");
		})
	})
})
//login routes
router.get("/login",function(req,res){
	res.render("auth/login");
})
router.post("/login",passport.authenticate("local",{
	successRedirect:"/animes",
	failureRedirect:"/login",
	failureFlash:true
	
}),function(req,res){			 
});
//logout routes
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","Logged you out");
	res.redirect("/");
})
//forgot password
router.get('/forgot',function(req,res){
	res.render("auth/forgot");
});

router.post("/forgot",function(req,res,next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20,function(err,buf){
			var token = buf.toString('hex');
			done(err,token);
			})
		},
		function(token,done){
			User.findOne({email:req.body.email},function(err,user){
				if(!user){
					req.flash("error","No Account with that email address exist.");
					return res.redirect("/forgot");
				}
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now()+3600000;
				
				user.save(function(err){
					done(err,token,user)
				});
			});
		},
		function(token,user,done){
			var smtpTransport = nodemailer.createTransport({
				service:'Gmail',
				auth:{
					user:"joshuaconstante2197@gmail.com",
					pass:process.env.GMAILPW
				}
			});
			var mailOptions={
				to:user.email,
				from:'yourmom@gmail.com',
				subject:"Yelpcamp Password Reset",
				text:"You are receiving this because you fricking forgot your email and you seem to need a new one so click on this link, it'll only work for an hour"+"http://"+req.header.host + "/reset" + token +"\n\n"+"If you did not request this please ignore and your password will remain unchanged."
			};
			smtpTransport.sendMail(mailOptions,function(err){
				console.log("mail sent");
				req.flash("success","an email has been sent to"+user.email+"with further instructions")
				done(err,"done");
			});
		}
	],function(err){
		if(err) return next(err);
		res.redirect("/forgot");
	});
});
router.get("/reset/token",function(req,res){
	User.findOne({resetPasswordToken:req.params.toke,resetPasswordExpires:{$gt:Date.now()}},function(err,user){
		if(!user){
			req.flash("error","password reset token is invalid or expired");
			return res.redirect("/forgot");
		}			 
		res.render("auth/reset",{token:req.params.token});
	});
});
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'learntocodeinfo@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'learntocodeinfo@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/animes');
  });
});
//adming logic
router.get("/secret/admin",function(req,res){
	res.render("auth/adminreg")
})
function isLoggedIn(req,res,next){
if(req.isAuthenticated()){
	return next();
	}
	res.redirect("/login"); 
}
//user profiles
router.get("/users/:id",function(req,res){
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			console.log("user not found");
			req.flash("error","Something went wrong");
			res.redirect("/");
		}
		Anime.find().where('author.id').equals(foundUser.id).exec(function(err,animes){
			if(err){
				console.log("user not found");
				req.flash("error","Something went wrong");
				res.redirect("/");
			}
		res.render("users/show",{user:foundUser,animes:animes});
		})
	})
});
module.exports = router;