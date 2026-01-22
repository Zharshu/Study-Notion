import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { BiDotsVerticalRounded } from "react-icons/bi"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getUserEnrolledCourses } from "../../../../services/operations/profileAPI"

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);

      setEnrolledCourses(res);
    } catch (error) {
      console.log("Could not fetch enrolled courses.")
    }
  };
  useEffect(() => {
    getEnrolledCourses();
  }, [])

  return (
    <>
      <div className="text-3xl text-richblack-50">Enrolled Courses</div>
      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
          {/* TODO: Modify this Empty State */}
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings - Hidden on mobile */}
          <div className="hidden md:flex rounded-t-lg bg-richblack-500">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>
          {/* Course Cards */}
          {enrolledCourses.map((course, i, arr) => (
            <div
              className={`flex flex-col md:flex-row md:items-center border border-richblack-700 ${
                i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
              } ${i === 0 ? "md:rounded-t-none rounded-t-lg" : ""}`}
              key={i}
            >
              <div
                className="flex w-full md:w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() => {
                  navigate(
                    `/view-course/${course?._id}/section/${course.courseContent?.[0]?._id}/sub-section/${course.courseContent?.[0]?.subSection?.[0]?._id}`
                  )
                }}
              >
                <img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <p className="font-semibold break-words">{course.courseName}</p>
                  <p className="text-xs text-richblack-300 break-words">
                    {course.courseDescription.length > 50
                      ? `${course.courseDescription.slice(0, 50)}...`
                      : course.courseDescription}
                  </p>
                </div>
              </div>
              
              {/* Duration - Mobile label */}
              <div className="flex md:w-1/4 px-5 md:px-2 py-2 md:py-3 items-center gap-2">
                <span className="md:hidden text-sm text-richblack-600 font-medium">Duration:</span>
                <span className="text-sm md:text-base">{course?.totalDuration}</span>
              </div>
              
              {/* Progress - Mobile label */}
              <div className="flex md:w-1/5 flex-col gap-2 px-5 md:px-2 py-3">
                <p className="text-sm md:text-base">
                  <span className="md:hidden text-richblack-600 font-medium">Progress: </span>
                  <span className="md:hidden">{course.progressPercentage || 0}%</span>
                  <span className="hidden md:inline">Progress: {course.progressPercentage || 0}%</span>
                </p>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
