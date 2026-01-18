const categoryService = require('../services/category.service');
const { successResponse, createdResponse } = require('../../../shared/utils/responseHandler');

/**
 * Create Category
 */
exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return createdResponse(res, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Categories
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return successResponse(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Category By ID
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryService.getCategoryById(categoryId);
    return successResponse(res, 200, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Category
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryService.updateCategory(categoryId, req.body);
    return successResponse(res, 200, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Category
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const result = await categoryService.deleteCategory(categoryId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Category Page Details
 */
exports.getCategoryPageDetails = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const data = await categoryService.getCategoryPageDetails(categoryId);
    return successResponse(res, 200, 'Category page details retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};