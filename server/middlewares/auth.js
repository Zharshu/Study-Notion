// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		const authHeader = req.header("Authorization");
		console.log("Auth header:", authHeader);
		
		console.log("Cookies:", req.cookies);
		const token =
			req.cookies?.token ||
			req.body?.token ||
			(authHeader ? authHeader.replace("Bearer ", "") : null);

		console.log("Extracted token:", token ? "Token exists" : "No token found");

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ 
				success: false, 
				message: `Token Missing`,
				debug: {
					cookies: req.cookies,
					headers: req.headers,
					authHeader: authHeader
				}
			});
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			console.log("Decoded JWT payload:", decode);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			console.error("JWT verification error:", error);
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ 
					success: false, 
					message: "Token is invalid",
					error: error.message
				});
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		console.error("Auth middleware error:", error);
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
			error: error.message
		});
	}
};
exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		console.log(userDetails);

		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};