import React, { useEffect, useState } from 'react'
import Footer from '../../components/common/Footer'
import { useParams } from 'react-router-dom'
import { apiConnector } from '../../services/api/client';
import { categories } from '../../services/api/endpoints';
import { getCatalogaPageData } from '../../services/operations/pageAndComponentData';
import CourseCard from '../../components/course/CourseCard';
import CourseSlider from '../../components/course/CourseSlider';
import { useSelector } from "react-redux"
import Error from "../public/Error"
import { toast } from "react-hot-toast"

const Catalog = () => {

    const { loading } = useSelector((state) => state.profile)
  const { catalogName } = useParams()
  const [active, setActive] = useState(1)
    const [catalogPageData, setCatalogPageData] = useState(null);
    const [categoryId, setCategoryId] = useState("");

    //Fetch all categories
    useEffect(()=> {
        const getCategories = async() => {
            try {
                const res = await apiConnector("GET", categories.CATEGORIES_API);
                const category = res?.data?.data?.filter((ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName)[0];
                if (category) {
                    setCategoryId(category._id);
                } else {
                    console.error("Category not found:", catalogName);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        getCategories();
    },[catalogName]);

    useEffect(() => {
        const getCategoryDetails = async() => {
            try{
                const res = await getCatalogaPageData(categoryId);
                console.log("PRinting res: ", res);
                if (res && res.success) {
                    setCatalogPageData(res);
                    
                    // Check if category has no courses
                    const coursesCount = res?.data?.selectedCategory?.courses?.length || 0;
                    if (coursesCount === 0) {
                        const categoryName = res?.data?.selectedCategory?.name || "this category";
                        toast.error(`No courses in ${categoryName}`);
                    }
                } else {
                    console.error("Invalid catalog page data:", res);
                    setCatalogPageData({ success: false });
                }
            }
            catch(error) {
                console.error("Error fetching catalog page data:", error);
                setCatalogPageData({ success: false });
            }
        }
        if(categoryId) {
            getCategoryDetails();
        }
        
    },[categoryId]);


    if (loading || !catalogPageData) {
        return (
          <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
            <div className="spinner"></div>
          </div>
        )
      }
      if (!loading && !catalogPageData.success) {
        return <Error />
      }
    
      return (
        <>
          {/* Hero Section */}
          <div className=" box-content bg-richblack-800 px-4">
            <div className="mx-auto flex min-h-[150px] max-w-maxContentTab flex-col justify-center gap-2 lg:max-w-maxContent ">
              <p className="text-sm text-richblack-300">
                {`Home / Catalog / `}
                <span className="text-yellow-25">
                  {catalogPageData?.data?.selectedCategory?.name}
                </span>
              </p>
              <p className="text-3xl text-richblack-5">
                {catalogPageData?.data?.selectedCategory?.name}
              </p>
              <p className="max-w-[870px] text-richblack-200">
                {catalogPageData?.data?.selectedCategory?.description}
              </p>
            </div>
          </div>
    
          {/* Section 1: Category Courses */}
          <div className=" mx-auto box-content w-full max-w-maxContentTab px-8 py-12 lg:max-w-maxContent">
            <div className="section_heading">{catalogPageData?.data?.selectedCategory?.name}</div>
            <div className="py-8">
              {catalogPageData?.data?.selectedCategory?.courses?.length > 0 ? (
                <CourseSlider Courses={catalogPageData?.data?.selectedCategory?.courses} />
              ) : (
                <div className="grid min-h-[200px] place-items-center">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-richblack-5">No Courses in This Category</p>
                    <p className="mt-2 text-richblack-300">{catalogPageData?.data?.selectedCategory?.name} doesn't have any courses yet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Courses to get you started */}
          <div className=" mx-auto box-content w-full max-w-maxContentTab px-8 py-12 lg:max-w-maxContent">
            <div className="section_heading">Courses to get you started</div>
            <div className="my-4 flex border-b border-b-richblack-600 text-sm">
              <p
                className={`px-4 py-2 ${
                  active === 1
                    ? "border-b border-b-yellow-25 text-yellow-25"
                    : "text-richblack-50"
                } cursor-pointer`}
                onClick={() => setActive(1)}
              >
                Most Popular
              </p>
              <p
                className={`px-4 py-2 ${
                  active === 2
                    ? "border-b border-b-yellow-25 text-yellow-25"
                    : "text-richblack-50"
                } cursor-pointer`}
                onClick={() => setActive(2)}
              >
                New
              </p>
            </div>
            <div>
              <CourseSlider
                Courses={
                  active === 1
                    ? catalogPageData?.data?.mostSellingCourses || []
                    : [...(catalogPageData?.data?.mostSellingCourses || [])].sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                }
              />
            </div>
          </div>
    
          {/* Section 3 */}
          <div className=" mx-auto box-content w-full max-w-maxContentTab px-8 py-12 lg:max-w-maxContent">
            <div className="section_heading">Frequently Bought</div>
            <div className="py-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {catalogPageData?.data?.mostSellingCourses
                  ?.slice(0, 6)
                  .map((course, i) => (
                    <CourseCard course={course} key={i} Height={"h-[350px]"} />
                  ))}
              </div>
            </div>
          </div>
    
          <Footer />
        </>
      )
    }
    
    export default Catalog


