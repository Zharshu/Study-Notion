import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { ACCOUNT_TYPE } from "../../utils/constants"

import ConfirmationModal from "../../shared/components/modals/ConfirmationModal"
import Footer from "../../components/common/Footer"
import RatingStars from "../../components/common/RatingStars"
import CourseAccordionBar from "../../components/course/CourseAccordionBar"
import CourseDetailsCard from "../../components/course/CourseDetailsCard"
import { formatDate } from "../../services/formatDate"
import { fetchCourseDetails } from "../../services/operations/courseDetailsAPI"
import { buyCourse } from "../../services/operations/studentFeaturesAPI"
import GetAvgRating from "../../shared/utils/formatters/avgRating"
import Error from "../public/Error"

function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Getting courseId from url parameter
  const { courseId } = useParams()
  // console.log(`course id: ${courseId}`)

  // Declear a state to save the course details
  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  useEffect(() => {
    // Calling fetchCourseDetails fucntion to fetch the details
    ;(async () => {
      try {
        const res = await fetchCourseDetails(courseId)
        // console.log("course details res: ", res)
        setResponse(res)
      } catch (error) {
        console.log("Could not fetch Course Details")
      }
    })()
  }, [courseId])

  // console.log("response: ", response)

  // Calculating Avg Review count
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const reviews = response?.data?.courseDetails?.ratingAndReviews || response?.data?.ratingAndReviews
    const count = GetAvgRating(reviews)
    setAvgReviewCount(count)
  }, [response])
  // console.log("avgReviewCount: ", avgReviewCount)

  // // Collapse all
  // const [collapse, setCollapse] = useState("")
  const [isActive, setIsActive] = useState(Array(0))
  const handleActive = (id) => {
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])//concat islie kuki push krte to Orginal Array me Modofy ho jata 
        : isActive.filter((e) => e != id)// filter islie kuki ye bhi Orginal Array ko Modify X X nhi krta
        
    )
  }

  // Total number of lectures
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  useEffect(() => {
    let lectures = 0
    const content = response?.data?.courseDetails?.courseContent || response?.data?.courseContent
    content?.forEach((sec) => {
      lectures += sec.subSection.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])

  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }
  if (!response.success) {
    return <Error />
  }

  const courseData = response.data?.courseDetails || response.data;
  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
  } = courseData;

  const handleBuyCourse = () => {
    if (token) {
      buyCourse(token, [courseId], user, navigate, dispatch)
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  if (paymentLoading) {
    // console.log("payment loading")
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <div className={`relative w-full bg-richblack-800`}>
        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative ">
          <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
            
            {/* Mobile Layout - Cleaner Card Design */}
            <div className="lg:hidden py-6">
              {/* Course Thumbnail - Smaller on Mobile */}
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={thumbnail}
                  alt="course thumbnail"
                  className="w-full h-48 object-cover"
                />
              </div>
              
              {/* Course Title */}
              <h1 className="text-2xl font-bold text-richblack-5 mb-3">
                {courseName}
              </h1>
              
              {/* Course Description */}
              <p className="text-sm text-richblack-200 mb-4 line-clamp-3">
                {courseDescription}
              </p>
              
              {/* Rating & Stats - Compact */}
              <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-25 font-semibold">{avgReviewCount}</span>
                  <RatingStars Review_Count={avgReviewCount} Star_Size={16} />
                </div>
                <span className="text-richblack-400">•</span>
                <span className="text-richblack-300">{ratingAndReviews.length} reviews</span>
                <span className="text-richblack-400">•</span>
                <span className="text-richblack-300">{studentsEnrolled.length} students</span>
              </div>
              
              {/* Instructor Info - Compact */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-richblack-700">
                <img
                  src={
                    instructor.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt="Instructor"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs text-richblack-400">Instructor</p>
                  <p className="text-sm font-medium text-richblack-5">{`${instructor.firstName} ${instructor.lastName}`}</p>
                </div>
              </div>
              
              {/* Course Meta Info */}
              <div className="flex flex-wrap gap-3 text-xs text-richblack-300 mb-4">
                <div className="flex items-center gap-1">
                  <BiInfoCircle />
                  <span>Created {formatDate(createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HiOutlineGlobeAlt />
                  <span>English</span>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Original */}
            <div className="hidden lg:grid min-h-[450px] justify-items-start py-0">
              <div
                className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}
              >
                <div>
                  <p className="text-4xl font-bold text-richblack-5 sm:text-[42px]">
                    {courseName}
                  </p>
                </div>
                <p className="text-richblack-200">{courseDescription}</p>
                <div className="text-md flex flex-wrap items-center gap-2">
                  <span className="text-yellow-25">{avgReviewCount}</span>
                  <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                  <span>{`(${ratingAndReviews.length} reviews)`}</span>
                  <span>{`${studentsEnrolled.length} students enrolled`}</span>
                </div>
                <div>
                  <p className="">
                    Created By {`${instructor.firstName} ${instructor.lastName}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-5 text-lg">
                  <p className="flex items-center gap-2">
                    {" "}
                    <BiInfoCircle /> Created at {formatDate(createdAt)}
                  </p>
                  <p className="flex items-center gap-2">
                    {" "}
                    <HiOutlineGlobeAlt /> English
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Courses Card - Desktop */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute  lg:block">
            <CourseDetailsCard
              course={response?.data?.courseDetails || response?.data}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>
      
      {/* Sticky Bottom Price Bar - Mobile Only */}
      {(!user || user?.accountType === ACCOUNT_TYPE.STUDENT) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-richblack-800 border-t border-richblack-700 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-bold text-richblack-5">
                Rs. {price}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-md font-semibold text-sm hover:bg-yellow-100 transition-all" onClick={handleBuyCourse}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add padding bottom on mobile to account for sticky footer */}
      <div className={`mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px] ${(!user || user?.accountType === ACCOUNT_TYPE.STUDENT) ? 'pb-24 lg:pb-0' : ''}`}>
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* What will you learn section */}
          <div className="my-8 border border-richblack-600 p-4 sm:p-8">
            <p className="text-xl sm:text-3xl font-semibold">What you'll learn</p>
            <div className="mt-5">
              <ReactMarkdown>{whatYouWillLearn}</ReactMarkdown>
            </div>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px] ">
            <div className="flex flex-col gap-3">
              <p className="text-xl sm:text-[28px] font-semibold">Course Content</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>
                    {courseContent.length} {`section(s)`}
                  </span>
                  <span>
                    {totalNoOfLectures} {`lecture(s)`}
                  </span>
                  <span>{response.data?.totalDuration} total length</span>
                </div>
                <div>
                  <button
                    className="text-yellow-25"
                    onClick={() => setIsActive([])}
                  >
                    Collapse all sections
                  </button>
                </div>
              </div>
            </div>

            {/* Course Details Accordion */}
            <div className="py-4">
              {courseContent?.map((course, index) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Author Details */}
            <div className="mb-12 py-4">
              <p className="text-xl sm:text-[28px] font-semibold">Author</p>
              <div className="flex items-center gap-4 py-4">
                <img
                  src={
                    instructor.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`
                  }
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="text-lg">{`${instructor.firstName} ${instructor.lastName}`}</p>
              </div>
              <p className="text-richblack-50">
                {instructor?.additionalDetails?.about}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails
