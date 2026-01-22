import React from 'react'

import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import { Autoplay, FreeMode, Pagination}  from 'swiper'

import CourseCard from './CourseCard'

const CourseSlider = ({Courses}) => {
  // Ensure Courses is an array
  if (!Array.isArray(Courses)) {
    console.error("Courses is not an array:", Courses);
    return <p className="text-xl text-richblack-5">No Course Found</p>;
  }

  return (
    <>
      <style>
        {`
          .course-slider .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.5);
            opacity: 1;
            width: 10px;
            height: 10px;
          }
          .course-slider .swiper-pagination-bullet-active {
            background: #47A5C5;
            opacity: 1;
          }
        `}
      </style>
      {Courses?.length ? (
        <div className="w-full">
          <Swiper
            slidesPerView={1}
            spaceBetween={25}
            loop={Courses.length > 3}
            modules={[Autoplay, FreeMode, Pagination]}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 3,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="max-h-[30rem] course-slider"
            style={{ paddingBottom: "40px" }}
          >
            {Courses?.map((course, i) => (
              <SwiperSlide key={course?._id || i}>
                <CourseCard course={course} Height={"h-[250px]"} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  )
}

export default CourseSlider


