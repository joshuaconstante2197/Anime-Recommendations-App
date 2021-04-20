var mongoose   = require("mongoose");
const Comment = require('./comment');

//schema setup
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description:String,
	geometry:{
		type: {
			type: String,
			enum: ['Point'],
			required: true
		},
		coordinates: {
			type :[Number],
			required: true
		}
	},
	price:String,
	createdAt:{type:Date,default:Date.now},
	author:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username:String,
	},
	comments:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref:"Comment"
		}
	]
});
campgroundSchema.pre('remove', async function() {
	await Comment.remove({
		_id: {
			$in: this.comments
		}
	});
});

module.exports = mongoose.model("Campground",campgroundSchema);