import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector, useDispatch } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"
import { IoClose } from "react-icons/io5"

import logo from "../../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../../data/navbar-links"
import { fetchCourseCategories } from "../../../services/operations/categoryAPI"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import ProfileDropdown from "../../../components/core/Auth/ProfileDropDown"

function Navbar() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  // Retrieve categories from Redux store
  const { allCategories: subLinks, loading } = useSelector((state) => state.category)
  const location = useLocation()
  const dispatch = useDispatch()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)

  useEffect(() => {
    // Fetch categories on mount if not already available, or just always fetch to ensure freshness
    // For now, always fetch to be safe
    dispatch(fetchCourseCategories())
  }, [dispatch])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : "bg-richblack-900"
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
        </Link>
        {/* Navigation links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-800 border border-richblack-700 p-4 text-richblack-5 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-800 border-l border-t border-richblack-700"></div>
                        {loading ? (
                          <p className="text-center text-richblack-100">Loading...</p>
                        ) : (subLinks && subLinks.length) ? (
                          <>
                            {subLinks?.map((subLink, i) => (
                              <Link
                                to={`/catalog/${subLink.name
                                  .split(" ")
                                  .join("-")
                                  .toLowerCase()}`}
                                className="rounded-lg bg-transparent py-3 px-4 hover:bg-richblack-700 transition-all duration-200 text-center"
                                key={i}
                              >
                                <p className="text-richblack-5">{subLink.name}</p>
                              </Link>
                            ))}
                          </>
                        ) : (
                          <p className="text-center text-richblack-300">No Categories Available</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Login / Signup / Dashboard */}
        <div className="hidden sm:flex items-center gap-x-2 md:gap-x-4">
          {user && user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </Link>
          )}
          {token === null && (
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
          )}
          {token === null && (
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          )}
          {token !== null && <ProfileDropdown />}
        </div>
        {/* Hamburger Menu for Mobile - Hide on dashboard pages */}
        {!location.pathname.startsWith('/dashboard') && (
          <button 
            className="mr-4 md:hidden text-richblack-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <IoClose fontSize={24} fill="#AFB2BF" />
            ) : (
              <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
            )}
          </button>
        )}
        {/* Dashboard Sidebar Toggle - Show only on dashboard pages */}
        {location.pathname.startsWith('/dashboard') && (
          <button 
            className="mr-4 md:hidden text-richblack-100"
            onClick={() => {
              if (window.toggleDashboardSidebar) {
                window.toggleDashboardSidebar()
              }
            }}
          >
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-richblack-900 opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative bg-richblack-800 p-6 shadow-lg">
            <nav className="flex flex-col gap-4">
              {/* Login/Signup for non-logged-in users */}
              {token === null && (
                <div className="flex flex-col gap-4 mb-4 border-b border-richblack-700 pb-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md bg-yellow-50 py-2 px-4 text-center font-semibold text-richblack-900"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md border border-richblack-700 bg-richblack-700 py-2 px-4 text-center font-semibold text-richblack-100"
                  >
                    Sign up
                  </Link>
                </div>
              )}
              {/* Navigation Links */}
              {NavbarLinks.map((link, index) => (
                link.title === "Catalog" ? (
                  <div key={index} className="border-t border-b border-richblack-700 py-3">
                    <button
                      onClick={() => setCatalogOpen(!catalogOpen)}
                      className="w-full flex items-center justify-between text-richblack-25 text-lg font-semibold mb-3"
                    >
                      <span>{link.title}</span>
                      <span className="text-richblack-400">{catalogOpen ? '−' : '+'}</span>
                    </button>
                    {catalogOpen && (
                      <div className="max-h-[200px] overflow-y-auto bg-richblack-700/50 rounded-md p-3">
                        <div className="flex flex-col gap-3">
                          {subLinks.length > 0 ? (
                            subLinks.map((subLink, i) => (
                              <Link
                                key={i}
                                to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setCatalogOpen(false);
                                }}
                                className="text-richblack-100 hover:text-yellow-25 text-sm py-1 px-2 bg-richblack-800 rounded"
                              >
                                {subLink.name}
                              </Link>
                            ))
                          ) : (
                            <p className="text-richblack-300 text-sm">Loading...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={index}
                    to={link?.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-richblack-25 hover:text-yellow-25 text-lg"
                  >
                    {link.title}
                  </Link>
                )
              ))}
              

            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar
