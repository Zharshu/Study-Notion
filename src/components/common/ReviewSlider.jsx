import React, { useEffect, useRef, useState } from "react"
import RatingStars from "./RatingStars"
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"

// Import required modules
import { Autoplay, FreeMode, Pagination } from "swiper"

// Get apiFunction and the endpoint
import { apiConnector } from "../../services/api/client"
import { ratingsEndpoints } from "../../services/api/endpoints"

function ReviewSlider() {
  const [reviews, setReviews] = useState([])
  const truncateWords = 40 // Increased from 15
  const containerRef = useRef(null)
  const swiperRef = useRef(null)
  const [isInView, setIsInView] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const loopEnabled = reviews.length > 1
  const loopCloneCount = loopEnabled
    ? Math.min(reviews.length, isMobile ? 4 : 8)
    : 0
  const swiperKey = `${reviews.length}-${isMobile ? "m" : "d"}`

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await apiConnector(
          "GET",
          ratingsEndpoints.REVIEWS_DETAILS_API
        )
        // console.log("REVIEWS RESPONSE:", data)
        if (data?.success) {
          const reviewsData = data?.data?.reviews || data?.data;
          if (Array.isArray(reviewsData)) {
             setReviews(reviewsData);
          } else {
             console.debug("Reviews data is not an array:", data);
             setReviews([]);
          }
        } else {
          console.debug("No reviews data or invalid format:", data)
          setReviews([])
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
        setReviews([])
      }
    })()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const handleChange = (e) => setIsMobile(e.matches)

    setIsMobile(mediaQuery.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting))
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper || !swiper.autoplay) return

    if (isInView) {
      swiper.autoplay.start()
    } else {
      swiper.autoplay.stop()
    }
  }, [isInView])

  // console.log(reviews)

  return (
    <div className="w-full" ref={containerRef}>
      {reviews.length === 0 ? (
        <div className="text-center text-richblack-400 py-10">No reviews yet</div>
      ) : (
        <div className="w-full">
            <Swiper
              key={`reviews-${reviews.length}`}
              slidesPerView={1}
              spaceBetween={20}
              loop={reviews.length > 1}
              modules={[Autoplay, Pagination]}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              breakpoints={{
                800: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="review-swiper"
              style={{ paddingBottom: "40px" }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
                if (!isInView && swiper?.autoplay) {
                  swiper.autoplay.stop()
                }
              }}
            >
              {reviews.map((review, i) => {
                // Handle undefined names properly
                const firstName = review?.user?.firstName || "Anonymous"
                const lastName = review?.user?.lastName || "User"
                const fullName = `${firstName} ${lastName}`.trim()
                
                return (
                  <SwiperSlide key={review?._id ?? i}>
                    <div className="flex flex-col gap-6 bg-richblack-800 p-8 text-[18px] text-richblack-25 rounded-xl min-h-[250px] w-full shadow-lg">
                      <div className="flex items-center gap-5">
                        <img
                          src={
                            review?.user?.image
                              ? review?.user?.image
                              : `https://api.dicebear.com/5.x/initials/svg?seed=${fullName}`
                          }
                          alt=""
                          className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <h1 className="font-semibold text-richblack-5 truncate text-xl">
                            {fullName}
                          </h1>
                          <h2 className="text-[16px] font-medium text-richblack-500 truncate">
                            {review?.course?.courseName || "Course"}
                          </h2>
                        </div>
                      </div>
                      <p className="font-medium text-richblack-25 flex-1 leading-relaxed text-[17px]">
                        {(() => {
                          const text = review?.review || "No review text available"
                          const words = text.split(" ")
                          return words.length > truncateWords
                            ? `${words.slice(0, truncateWords).join(" ")} ...`
                            : text
                        })()}
                      </p>
                      <div className="flex items-center gap-4 mt-auto">
                        <h3 className="font-semibold text-yellow-100 text-xl">
                          {review?.rating?.toFixed(1) || "0.0"}
                        </h3>
                        <div className="flex items-center">
                          <RatingStars 
                            Review_Count={review?.rating || 0} 
                            Star_Size={20} 
                          />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>
        )}
    </div>
  )
}

export default ReviewSlider