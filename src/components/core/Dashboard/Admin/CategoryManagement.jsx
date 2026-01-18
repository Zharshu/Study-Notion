import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiConnector } from "../../../../services/api/client";
import { categories } from "../../../../services/api/endpoints";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../../services/operations/adminAPI";
import { VscEdit, VscTrash, VscAdd } from "react-icons/vsc";
import ConfirmationModal from "../../../common/ConfirmationModal";
import { fetchCourseCategories } from "../../../../services/operations/categoryAPI";

const CategoryManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [confirmationModal, setConfirmationModal] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiConnector("GET", categories.CATEGORIES_API);
      if (response.data.success) {
        setCategoryList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingCategory) {
      const result = await updateCategory(editingCategory._id, formData, token);
      if (result) {
        fetchCategories();
        dispatch(fetchCourseCategories()); // Sync global state (Navbar)
        resetForm();
      }
    } else {
      const result = await createCategory(formData, token);
      if (result) {
        fetchCategories();
        dispatch(fetchCourseCategories()); // Sync global state (Navbar)
        resetForm();
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    const result = await deleteCategory(categoryId, token);
    if (result) {
      fetchCategories();
      dispatch(fetchCourseCategories()); // Sync global state (Navbar)
    }
    setConfirmationModal(null);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-richblack-5">
          Category Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="whitespace-nowrap flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-medium text-richblack-900 hover:bg-yellow-100"
        >
          <VscAdd className="text-lg" />
          Add Category
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-8 rounded-lg border border-richblack-700 bg-richblack-800 p-6">
          <h2 className="text-xl font-semibold text-richblack-5 mb-4">
            {editingCategory ? "Edit Category" : "Create New Category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-richblack-5">
                Category Name<sup className="text-pink-200">*</sup>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50"
                placeholder="e.g., Web Development"
              />
            </div>
            <div>
              <label className="text-sm text-richblack-5">
                Description<sup className="text-pink-200">*</sup>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows="4"
                className="mt-1 w-full rounded-md bg-richblack-700 p-3 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50"
                placeholder="Enter category description..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-md bg-yellow-50 px-6 py-2 font-medium text-richblack-900 hover:bg-yellow-100"
              >
                {editingCategory ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-richblack-700 px-6 py-2 font-medium text-richblack-5 hover:bg-richblack-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categoryList.map((category) => (
          <div
            key={category._id}
            className="rounded-lg border border-richblack-700 bg-richblack-800 p-6"
          >
            <h3 className="text-lg font-semibold text-richblack-5">
              {category.name}
            </h3>
            <p className="mt-2 text-sm text-richblack-300 line-clamp-3">
              {category.description}
            </p>
            <div className="mt-3 text-sm text-richblack-400">
              {category.courses?.length || 0} courses
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-richblack-700 px-4 py-2 text-sm font-medium text-richblack-5 hover:bg-richblack-600"
              >
                <VscEdit />
                Edit
              </button>
              
              {/* Only show delete button if category has no courses */}
              {(!category.courses || category.courses.length === 0) && (
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete Category",
                      text2: `Are you sure you want to delete "${category.name}"?`,
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDelete(category._id),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-2 rounded-md bg-pink-700 px-4 py-2 text-sm font-medium text-richblack-5 hover:bg-pink-600"
                >
                  <VscTrash />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {categoryList.length === 0 && (
        <div className="grid min-h-[400px] place-items-center">
          <div className="text-center">
            <p className="text-2xl font-semibold text-richblack-5">
              No Categories Yet
            </p>
            <p className="mt-2 text-richblack-300">
              Create your first category to get started
            </p>
          </div>
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default CategoryManagement;
