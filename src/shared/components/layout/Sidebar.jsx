import { useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from "../../../data/dashboard-links"
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../modals/ConfirmationModal"
import SidebarLink from "../../../components/core/Dashboard/SidebarLink"

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  )
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Mobile sidebar toggle state - starts closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  const closeSidebar = () => setIsSidebarOpen(false)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // Expose toggle function to parent (Dashboard page will use this)
  if (typeof window !== 'undefined') {
    window.toggleDashboardSidebar = toggleSidebar
  }

  if (profileLoading || authLoading) {
    return (
      <div className="hidden md:grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      {/* Overlay - Only on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar - Fixed position, never scrolls */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen md:h-[calc(100vh-3.5rem)] md:top-[3.5rem] min-w-[220px] flex flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Scrollable navigation area */}
        <div className="flex flex-col flex-1 overflow-y-auto py-4">
          {sidebarLinks.map((link) => {
            if (link.type && user?.accountType !== link.type) return null
            return (
              <div key={link.id} onClick={closeSidebar}>
                <SidebarLink link={link} iconName={link.icon} />
              </div>
            )
          })}
          {/* Settings moved here with other nav items */}
          <div onClick={closeSidebar}>
            <SidebarLink
              link={{ name: "Settings", path: "/dashboard/settings" }}
              iconName="VscSettingsGear"
            />
          </div>
        </div>
        
        {/* Divider */}
        <div className="mx-auto h-[1px] w-10/12 bg-richblack-700" />
        
        {/* Logout at bottom - always visible */}
        <button
          onClick={() => {
            closeSidebar()
            setConfirmationModal({
              text1: "Are you sure?",
              text2: "You will be logged out of your account.",
              btn1Text: "Logout",
              btn2Text: "Cancel",
              btn1Handler: () => dispatch(logout(navigate)),
              btn2Handler: () => setConfirmationModal(null),
            })
          }}
          className="relative px-8 py-3 text-sm font-medium text-richblack-300 transition-all duration-200 text-left group"
        >
          {/* Left accent bar on hover - red for logout */}
          <span className="absolute left-0 top-0 h-full w-[3px] bg-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
          
          {/* Background on hover */}
          <span className="absolute inset-0 bg-richblack-700 opacity-0 group-hover:opacity-50 transition-all duration-200" />
          
          <div className="relative flex items-center gap-x-2">
            <VscSignOut className="text-lg text-richblack-300 group-hover:text-red-400 transition-colors duration-200" />
            <span>Logout</span>
          </div>
        </button>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

