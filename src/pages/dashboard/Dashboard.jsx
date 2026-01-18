import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"

import Sidebar from "../../shared/components/layout/Sidebar"

function Dashboard() {
  const { loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)

  if (profileLoading || authLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="relative bg-richblack-900">
      <Sidebar />
      <div className="min-h-[calc(100vh-3.5rem)] md:ml-[220px] flex-1 overflow-auto bg-richblack-900">
        <div className="mx-auto w-full px-4 sm:w-11/12 max-w-[1000px] py-6 sm:py-10 min-h-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
