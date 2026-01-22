import React, { useEffect, useState } from 'react'
import RatingStars from '../common/RatingStars'
import GetAvgRating from '../../shared/utils/formatters/avgRating';
import { Link } from 'react-router-dom';

const CourseCard = ({course, Height}) => {


    const [avgReviewCount, setAvgReviewCount] = useState(0);

    useEffect(()=> {
        const count = GetAvgRating(course.ratingAndReviews);
        setAvgReviewCount(count);
    },[course])


    
  return (
    <>
    {/*Pura card ek <Link> me wrap hai, taki card par click karne par course detail page khul jaye.
 */}
      <Link to={`/courses/${course._id}`} className="block w-full">
        <div className="hover:scale-[1.02] transition-all duration-200 w-full bg-richblack-800 rounded-xl overflow-hidden shadow-lg">
          <div className="rounded-lg">
            <img
              src={course?.thumbnail}
              alt="course thumnail"
              className="h-[180px] sm:h-[200px] w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2 px-3 py-3 sm:px-4 sm:py-4">
            <p className="text-base sm:text-lg font-semibold text-richblack-5 line-clamp-2">{course?.courseName}</p>{/* COURSE NAME*/}
            <p className="text-xs sm:text-sm text-richblack-300">
              {course?.instructor?.firstName} {course?.instructor?.lastName} {/* Instructor NAME*/}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-yellow-5 text-sm font-semibold">{avgReviewCount || 0}</span>
              <RatingStars Review_Count={avgReviewCount} />
              <span className="text-richblack-400 text-xs sm:text-sm">
                {course?.ratingAndReviews?.length} Ratings
              </span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-richblack-5">Rs. {course?.price}</p>
          </div>
        </div>
      </Link>
    </>
  )
}

export default CourseCard

