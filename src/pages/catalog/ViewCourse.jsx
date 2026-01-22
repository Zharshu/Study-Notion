import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Outlet, useParams, useNavigate } from "react-router-dom"
import { HiMenu } from "react-icons/hi"

import CourseReviewModal from "../../components/course/CourseReviewModal"
import VideoDetailsSidebar from "../../components/course/VideoDetailsSidebar"
import IconBtn from "../../components/common/IconBtn"
import { getFullDetailsOfCourse } from "../../services/operations/courseDetailsAPI"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../../store/slices/viewCourseSlice"

export default function ViewCourse() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // Add fallback for useSelector to prevent crash if backend returns different structure
  const { courseSectionData = [] } = useSelector((state) => state.viewCourse || {}) 
  
  const [reviewModal, setReviewModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const courseData = await getFullDetailsOfCourse(courseId, token)
        // Add optional chaining safety
        if (courseData?.courseDetails) {
            dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
            dispatch(setEntireCourseData(courseData.courseDetails))
            dispatch(setCompletedLectures(courseData.completedVideos || [])) // Ensure array
            let lectures = 0
            courseData?.courseDetails?.courseContent?.forEach((sec) => {
            lectures += sec.subSection.length
            })
            dispatch(setTotalNoOfLectures(lectures))
        }
      } catch (error) {
        console.error("Error fetching course data:", error)
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId, token, dispatch])

  // Auto-redirect to first lecture if only courseId is present
  useEffect(() => {
    if (!courseSectionData || !courseSectionData.length) return
    const firstSection = courseSectionData[0]
    const firstSubSection = firstSection?.subSection?.[0]
    
    // Check if URL does not contain /section/ (meaning we are at root /view-course/:id)
    if(firstSubSection && !window.location.href.includes("/section/")) {
       navigate(`/view-course/${courseId}/section/${firstSection._id}/sub-section/${firstSubSection._id}`, { replace: true })
    }
  }, [courseSectionData, courseId, navigate])

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
        <VideoDetailsSidebar setReviewModal={setReviewModal} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="h-[calc(100vh-3.5rem)] md:ml-[320px]">
          <div className="flex flex-col h-full"> 
            {/* Mobile Menu Button - Fixed at top */}
            <div className="md:hidden flex items-center bg-richblack-800 p-2 text-richblack-25 z-20 shadow-sm border-b border-richblack-700">
               <button onClick={() => setSidebarOpen(true)} className="p-2">
                  <HiMenu size={24} />
               </button>
               <span className="font-semibold ml-2">Course Content</span>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-auto">
              <div className="mx-6 mt-4">
                <Outlet />
              </div>
              <div className="mx-6 mb-6 mt-4 flex justify-center">
                   <IconBtn 
                      text="Add Review"
                      onclick={() => setReviewModal(true)}
                   />
              </div>
            </div>
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  )
}
