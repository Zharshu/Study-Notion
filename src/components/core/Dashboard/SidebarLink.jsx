import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../features/instructor/slices/courseSlice"

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <NavLink
      to={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative px-8 py-2 text-sm font-medium transition-all duration-200 group ${
        matchRoute(link.path)
          ? "text-yellow-50"
          : "text-richblack-300"
      }`}
    >
      {/* Left accent bar - visible on active, shows on hover */}
      <span
        className={`absolute left-0 top-0 h-full w-[3px] bg-yellow-400 transition-all duration-200 ${
          matchRoute(link.path) 
            ? "opacity-100" 
            : "opacity-0 group-hover:opacity-100"
        }`}
      />
      
      {/* Background - subtle on active, very light on hover */}
      <span 
        className={`absolute inset-0 transition-all duration-200 ${
          matchRoute(link.path)
            ? "bg-gradient-to-r from-yellow-900/20 via-yellow-800/10 to-transparent"
            : "bg-richblack-700 opacity-0 group-hover:opacity-50"
        }`}
      />
      
      <div className="relative flex items-center gap-x-2">
        <Icon 
          className={`text-lg transition-colors duration-200 ${
            matchRoute(link.path) 
              ? "text-yellow-400" 
              : "text-richblack-300 group-hover:text-yellow-400"
          }`} 
        />
        <span className="font-medium">{link.name}</span>
      </div>
    </NavLink>
  )
}