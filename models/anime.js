var mongoose   = require("mongoose");
const Comment = require('./comment');

var AnimeSchema = new mongoose.Schema({
  name: String,
  image: String,
  genre:String,
  description: String,
  createdAt:{type:Date,default:Date.now},
  releaseDate: String,
  ratings:
  {
    imdbRating: Number,
    usersRating: {type:Number, default:0} 
  },
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
	]})
  AnimeSchema.pre('remove', async function() {
  await Comment.remove({
    _id: {
      $in: this.comments
    }
  });
});

module.exports = mongoose.model("Anime",AnimeSchema);
