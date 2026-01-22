const { Category, Course } = require("../../../shared/models");
const { ValidationError, NotFoundError } = require("../../../shared/errors");

/**
 * Create a new category
 * @param {Object} categoryData - { name, description }
 * @returns {Object} Created category
 */
exports.createCategory = async (categoryData) => {
  const { name, description } = categoryData;

  if (!name || !description) {
    throw new ValidationError("Name and description are required");
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ValidationError("Category already exists");
  }

  const category = await Category.create({ name, description });

  return category;
};

/**
 * Get all categories
 * @returns {Array} List of all categories
 */
exports.getAllCategories = async () => {
  const categories = await Category.find({})
    .populate({
      path: "courses",
      // For admin: show ALL courses (approved, pending, rejected)
      // match: { approvalStatus: "Approved" },  // Removed filter
      select: "courseName price thumbnail approvalStatus status",
    })
    .sort({ name: 1 });

  return categories.map((category) => ({
    ...category.toObject(),
    courseCount: category.courses.length,
  }));
};

/**
 * Get category by ID with courses
 * @param {string} categoryId - Category ID
 * @returns {Object} Category details
 */
exports.getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId).populate({
    path: "courses",
    match: { approvalStatus: "Approved", status: "Published" },
    populate: {
      path: "instructor",
      select: "firstName lastName",
    },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

/**
 * Update category
 * @param {string} categoryId - Category ID
 * @param {Object} updates - { name, description }
 * @returns {Object} Updated category
 */
exports.updateCategory = async (categoryId, updates) => {
  const { name, description } = updates;

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // Check if new name conflicts with existing category
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      throw new ValidationError("Category name already exists");
    }
    category.name = name;
  }

  if (description) {
    category.description = description;
  }

  await category.save();

  return category;
};

/**
 * Delete category
 * @param {string} categoryId - Category ID
 * @returns {Object} Success message
 */
exports.deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // Check if category has ANY courses (approved, pending, rejected, etc.)
  const totalCourses = await Course.countDocuments({
    category: categoryId,
  });

  if (totalCourses > 0) {
    throw new ValidationError(
      `Cannot delete category with ${totalCourses} course(s). Please reassign or delete all courses first.`,
    );
  }

  await Category.findByIdAndDelete(categoryId);

  return {
    message: "Category deleted successfully",
  };
};

/**
 * Get category page details (for students)
 * Shows all courses in a category with details
 * @param {string} categoryId - Category ID
 * @returns {Object} Category page data
 */
exports.getCategoryPageDetails = async (categoryId) => {
  const selectedCategory = await Category.findById(categoryId).populate({
    path: "courses",
    match: { approvalStatus: "Approved", status: "Published" },
    populate: [
      {
        path: "instructor",
        select: "firstName lastName image",
      },
      {
        path: "ratingAndReviews",
      },
    ],
  });

  if (!selectedCategory) {
    throw new NotFoundError("Category not found");
  }

  // Get a different category for suggestions
  const differentCategory = await Category.findOne({
    _id: { $ne: categoryId },
    courses: { $exists: true, $ne: [] },
  }).populate({
    path: "courses",
    match: { approvalStatus: "Approved", status: "Published" },
    limit: 10,
    populate: {
      path: "instructor",
      select: "firstName lastName",
    },
  });

  // Get most selling courses (top enrolled)
  const mostSellingCourses = await Course.find({
    approvalStatus: "Approved",
    status: "Published",
  })
    .sort({ studentsEnrolled: -1 })
    .limit(10)
    .populate("instructor", "firstName lastName")
    .populate("category", "name");

  return {
    selectedCategory,
    differentCategory: differentCategory || selectedCategory,
    mostSellingCourses,
  };
};
