import React from 'react'

import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Autoplay,FreeMode,Navigation, Pagination}  from 'swiper'

import CourseCard from './CourseCard'

const CourseSlider = ({Courses}) => {
  // Ensure Courses is an array
  if (!Array.isArray(Courses)) {
    console.error("Courses is not an array:", Courses);
    return <p className="text-xl text-richblack-5">No Course Found</p>;
  }

  return (
    <>
      {Courses?.length ? (
        <Swiper
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          modules={[FreeMode, Pagination]}
          breakpoints={{// Ye responsive design ke liye use hota hai, jaise mobile me 1 slide aur desktop me 3 slides dikhani ho.
            1024: {
              slidesPerView: 3,
            },
          }}
          className="max-h-[30rem]"
        >
          {Courses?.map((course, i) => (
            <SwiperSlide key={course?._id || i}>
              <CourseCard course={course} Height={"h-[250px]"} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  )
}

export default CourseSlider

