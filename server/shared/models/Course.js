const mongoose = require("mongoose");

// Define the Courses schema
const coursesSchema = new mongoose.Schema({
	courseName: { type: String },
	courseDescription: { type: String },
	instructor: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	whatYouWillLearn: {
		type: String,
	},
	courseContent: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Section",
		},
	],
	ratingAndReviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "RatingAndReview",
		},
	],
	price: {
		type: Number,
	},
	thumbnail: {
		type: String,
	},
	tag: {
		type: [String],
		required: true,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		// required: true,
		ref: "Category",
	},
	studentsEnrolled: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
	],
	instructions: {
		type: [String],
	},
	status: {
		type: String,
		enum: ["Draft", "Published"],
	},
	// Admin approval fields
	approvalStatus: {
		type: String,
		enum: ["Pending", "Approved", "Rejected"],
		default: "Pending",
	},
	approvedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	approvedAt: {
		type: Date,
	},
	rejectionReason: {
		type: String,
	},
	featured: {
		type: Boolean,
		default: false,
	},
	featuredAt: {
		type: Date,
	},
	viewCount: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type:Date,
		default:Date.now
	},
});

// Export the Courses model
module.exports = mongoose.model("Course", coursesSchema);