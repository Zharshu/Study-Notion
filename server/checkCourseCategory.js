const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    checkCourses();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function checkCourses() {
  const Course = mongoose.model("Course");
  const Category = mongoose.model("Category");

  try {
    // Find the Basic Java course
    const basicJavaCourse = await Course.findOne({
      courseName: /basic.*java/i,
    }).populate("category");

    console.log("\n=== BASIC JAVA COURSE ===");
    if (basicJavaCourse) {
      console.log("Course ID:", basicJavaCourse._id);
      console.log("Course Name:", basicJavaCourse.courseName);
      console.log("Approval Status:", basicJavaCourse.approvalStatus);
      console.log("Visibility Status:", basicJavaCourse.status);
      console.log("Category ID:", basicJavaCourse.category);
      console.log(
        "Category Name:",
        basicJavaCourse.category?.name || "NOT POPULATED",
      );
    } else {
      console.log("Basic Java course not found");
    }

    // Find all Java-related categories
    const javaCategories = await Category.find({ name: /java/i }).populate(
      "courses",
    );

    console.log("\n=== JAVA CATEGORIES ===");
    for (const cat of javaCategories) {
      console.log(`\nCategory: ${cat.name} (${cat._id})`);
      console.log(`Courses count: ${cat.courses.length}`);
      cat.courses.forEach((course) => {
        console.log(`  - ${course.courseName} (${course._id})`);
        console.log(
          `    Status: ${course.status}, Approval: ${course.approvalStatus}`,
        );
      });
    }

    // Check if the course is in the category's courses array
    if (basicJavaCourse && basicJavaCourse.category) {
      const category = await Category.findById(basicJavaCourse.category);
      const isInArray = category.courses.some(
        (courseId) => courseId.toString() === basicJavaCourse._id.toString(),
      );

      console.log("\n=== VERIFICATION ===");
      console.log("Course references category:", !!basicJavaCourse.category);
      console.log("Category contains course:", isInArray);

      if (!isInArray) {
        console.log(
          "\n⚠️  WARNING: Course is NOT in category's courses array!",
        );
        console.log("Run fix script to repair this relationship.");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
}
