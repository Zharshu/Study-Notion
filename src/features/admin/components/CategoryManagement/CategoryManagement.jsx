import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { showAllCategories } from "../../../../services/operations/courseDetailsAPI";
import { updateCategory, deleteCategory } from "../../api/adminAPI";
import { createCategory } from "../../../../services/operations/courseDetailsAPI";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../../../../shared/components/modals/ConfirmationModal";

export default function CategoryManagement() {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [confirmationModal, setConfirmationModal] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    const result = await showAllCategories();
    setCategories(result || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editMode) {
      const result = await updateCategory(token, selectedCategory._id, formData);
      if (result) {
        fetchCategories();
        closeModal();
        // Reload page to update catalog and other components
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Small delay to show success toast
      }
    } else {
      const result = await createCategory(
        { name: formData.name, description: formData.description },
        token
      );
      if (result) {
        fetchCategories();
        closeModal();
      }
    }
  };

  const handleDelete = async (categoryId) => {
    const result = await deleteCategory(token, categoryId);
    if (result) {
      fetchCategories();
    }
    setConfirmationModal(null);
  };

  const openCreateModal = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditMode(true);
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", description: "" });
    setSelectedCategory(null);
    setEditMode(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">Category Management</h1>
        <button
          onClick={openCreateModal}
          className="rounded-md bg-yellow-50 px-4 py-2 font-semibold text-richblack-900 hover:bg-yellow-100 w-full sm:w-auto min-h-[44px]"
        >
          + Create Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid place-items-center min-h-[400px]">
          <div className="spinner"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg bg-richblack-800 p-8 text-center">
          <p className="text-richblack-300">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((category) => (
            <div
              key={category._id}
              className="rounded-lg bg-richblack-800 p-6 space-y-3"
            >
              <h3 className="text-xl font-bold text-richblack-5">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-richblack-300 line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="text-sm text-richblack-400">
                {category.courses?.length || 0} courses
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 rounded bg-richblack-700 px-3 py-2 text-sm text-richblack-5 hover:bg-richblack-600"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete Category?",
                      text2: `Are you sure you want to delete "${category.name}"?`,
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDelete(category._id),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                  disabled={category.courses?.length > 0}
                  className={`flex-1 rounded px-3 py-2 text-sm ${
                    category.courses?.length > 0
                      ? "bg-richblack-700 text-richblack-400 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                  title={
                    category.courses?.length > 0
                      ? `Cannot delete. This category has ${category.courses.length} course(s). Delete or reassign courses first.`
                      : "Delete this category"
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black bg-opacity-50">
          <div className="w-11/12 max-w-md rounded-lg bg-richblack-800 p-6">
            <h2 className="text-xl font-bold text-richblack-5">
              {editMode ? "Edit Category" : "Create Category"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-richblack-200">
                  Category Name <sup className="text-pink-200">*</sup>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Web Development"
                  className="mt-1 w-full rounded-md bg-richblack-700 p-3 text-richblack-5"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-richblack-200">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Category description..."
                  className="mt-1 w-full rounded-md bg-richblack-700 p-3 text-richblack-5"
                  rows="3"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded bg-richblack-700 px-4 py-2 text-richblack-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-yellow-50 px-4 py-2 font-semibold text-richblack-900"
                >
                  {editMode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
}




