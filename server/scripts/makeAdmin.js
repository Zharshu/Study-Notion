const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Database connected successfully"))
.catch((error) => {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
});

// Function to promote user to Admin
async function makeAdmin(email) {
  try {
    console.log(`🔍 Searching for user: ${email}`);
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      console.log("💡 Please make sure the user has signed up first.");
      process.exit(1);
    }
    
    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Current Role: ${user.accountType}`);
    
    if (user.accountType === "Admin") {
      console.log(`✅ User is already an Admin!`);
      process.exit(0);
    }
    
    // Update to Admin
    user.accountType = "Admin";
    await user.save();
    
    console.log(`✅ Successfully promoted ${user.firstName} ${user.lastName} to Admin!`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 New Role: ${user.accountType}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Get email from command line or use default
const emailToPromote = process.argv[2] || "harshitpalsingh690@gmail.com";

console.log("🚀 Admin Promotion Script");
console.log("========================");
console.log(`📧 Target Email: ${emailToPromote}`);
console.log("");

// Run the function
makeAdmin(emailToPromote);
