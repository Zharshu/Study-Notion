import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { editCourseDetails } from "../../../../../services/operations/courseDetailsAPI"
import { setStep, setCourse } from "../../../../../slices/courseSlice"
import { toast } from "react-hot-toast"

export default function PublishCourse() {
  const dispatch = useDispatch()
  const { course, token } = useSelector((state) => ({
    course: state.course.course,
    token: state.auth.token,
  }))

  const handlePublish = async () => {
    if (!course?._id) {
      toast.error("No course to publish")
      return
    }
    const formData = new FormData()
    formData.append("courseId", course._id)
    formData.append("status", "Published")

    const result = await editCourseDetails(formData, token)
    if (result) {
      toast.success("Course published successfully")
      dispatch(setCourse(result))
      dispatch(setStep(3))
    } else {
      toast.error("Failed to publish course")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-richblack-700 bg-richblack-800 p-6">
      <h2 className="text-xl font-semibold text-richblack-5">Publish Course</h2>
      <p className="text-center text-richblack-300">
        Click the button below to publish your course and make it available to
        students.
      </p>
      <button
        onClick={handlePublish}
        className="rounded bg-yellow-50 px-6 py-2 font-semibold text-richblack-900 hover:bg-yellow-100"
      >
        Publish Course
      </button>
    </div>
  )
}
