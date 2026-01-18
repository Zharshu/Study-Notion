import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getPendingCourses,
  updateCourseApproval,
  updateFeaturedStatus,
} from "../../../../services/operations/adminAPI";
import { VscCheck, VscClose, VscStarFull, VscStarEmpty } from "react-icons/vsc";
import ConfirmationModal from "../../../common/ConfirmationModal";

const CourseModeration = () => {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (token) {
        fetchPendingCourses();
    }
  }, [token]);

  const fetchPendingCourses = async () => {
    setLoading(true);
    const result = await getPendingCourses(token);
    if (result) {
      setCourses(result);
    }
    setLoading(false);
  };

  const handleApprove = async (courseId) => {
    const result = await updateCourseApproval(
      courseId,
      "Approved",
      "",
      token
    );
    if (result) {
      fetchPendingCourses();
    }
    setConfirmationModal(null);
  };

  const handleReject = async (courseId, reason) => {
    const result = await updateCourseApproval(
      courseId,
      "Rejected",
      reason,
      token
    );
    if (result) {
      fetchPendingCourses();
    }
    setConfirmationModal(null);
  };

  const handleToggleFeatured = async (courseId) => {
    const result = await updateFeaturedStatus(courseId, token);
    if (result) {
        // Optimistic update
        const updatedCourses = courses.map(c => 
            c._id === courseId ? { ...c, featured: !c.featured } : c
        );
        setCourses(updatedCourses);
    }
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
      <h1 className="text-2xl font-bold text-richblack-5 mb-6">
        Course Moderation
      </h1>

      {courses.length === 0 ? (
        <div className="grid min-h-[400px] place-items-center">
          <div className="text-center">
            <p className="text-2xl font-semibold text-richblack-5">
              No Pending Courses
            </p>
            <p className="mt-2 text-richblack-300">
              All courses have been reviewed
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="rounded-lg border border-richblack-700 bg-richblack-800 p-3"
            >
              {/* Course Image */}
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="h-24 w-full rounded-md object-cover"
              />

              {/* Course Info */}
              <div className="mt-2">
                <h3 className="text-base font-semibold text-richblack-5 line-clamp-1">
                  {course.courseName}
                </h3>
                <p className="mt-1 text-[11px] text-richblack-300 line-clamp-2">
                  {course.courseDescription}
                </p>

                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <div>
                    <span className="text-richblack-400">Instructor: </span>
                    <span className="text-richblack-5">
                      {course.instructor?.firstName}{" "}
                      {course.instructor?.lastName}
                    </span>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-3 text-[11px]">
                  <div>
                    <span className="text-richblack-400">Price: </span>
                    <span className="text-richblack-5">
                      ₹{course.price}
                    </span>
                  </div>
                  <div>
                    <span className="text-richblack-400">Category: </span>
                    <span className="text-richblack-5">
                      {course.category?.name}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {course.tag && course.tag.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {course.tag.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-richblack-700 px-1.5 py-0.5 text-[9px] text-richblack-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Approve Course",
                      text2: `Are you sure you want to approve "${course.courseName}"?`,
                      btn1Text: "Approve",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleApprove(course._id),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                  className="flex-1 rounded-md bg-green-700 px-2 py-1.5 text-xs font-medium text-richblack-5 hover:bg-green-600 flex items-center justify-center gap-1"
                >
                  <VscCheck className="text-sm" />
                  Approve
                </button>
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Reject Course",
                      text2: `Are you sure you want to reject "${course.courseName}"?`,
                      btn1Text: "Reject",
                      btn2Text: "Cancel",
                      btn1Handler: () =>
                        handleReject(course._id, "Does not meet quality standards"),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                  className="flex-1 rounded-md bg-pink-700 px-2 py-1.5 text-xs font-medium text-richblack-5 hover:bg-pink-600 flex items-center justify-center gap-1"
                >
                  <VscClose className="text-sm" />
                  Reject
                </button>
              </div>

               {/* Featured Toggle */}
               <button
                onClick={async () => {
                   await handleToggleFeatured(course._id);
                }}
                className={`mt-2 w-full rounded-md border px-2 py-1 text-[11px] font-medium transition-all flex items-center justify-center gap-2 ${
                    course.featured 
                    ? "bg-yellow-100 text-yellow-900 border-yellow-200" 
                    : "border-richblack-700 text-richblack-300 hover:text-richblack-5"
                }`}
              >
                {course.featured ? <VscStarFull className="text-yellow-600"/> : <VscStarEmpty />}
                {course.featured ? "Featured" : "Mark as Featured"}
              </button>

              {/* View Details Button */}
              <button
                onClick={() => setSelectedCourse(course)}
                className="mt-2 w-full rounded-md border border-richblack-700 px-2 py-1 text-[11px] font-medium text-richblack-5 hover:bg-richblack-700"
              >
                View Full Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
          <div className="w-11/12 max-w-lg rounded-lg border border-richblack-700 bg-richblack-800 p-4">
            <h2 className="text-lg font-bold text-richblack-5 mb-3">
              {selectedCourse.courseName}
            </h2>
            
            <img
              src={selectedCourse.thumbnail}
              alt={selectedCourse.courseName}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />

            <div className="space-y-3 text-sm text-richblack-100">
              <div>
                <strong className="text-richblack-5">Description:</strong>
                <p className="mt-1 text-xs">{selectedCourse.courseDescription}</p>
              </div>

              <div>
                <strong className="text-richblack-5">What You'll Learn:</strong>
                <p className="mt-1 text-xs">{selectedCourse.whatYouWillLearn}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <strong className="text-richblack-5">Price:</strong> ₹{selectedCourse.price}
                </div>
                <div>
                  <strong className="text-richblack-5">Category:</strong> {selectedCourse.category?.name}
                </div>
                <div>
                  <strong className="text-richblack-5">Instructor:</strong> {selectedCourse.instructor?.firstName} {selectedCourse.instructor?.lastName}
                </div>
                <div>
                  <strong className="text-richblack-5">Status:</strong> {selectedCourse.status}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCourse(null)}
              className="mt-4 w-full rounded-md bg-richblack-700 px-3 py-1.5 text-sm font-medium text-richblack-5 hover:bg-richblack-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default CourseModeration;
