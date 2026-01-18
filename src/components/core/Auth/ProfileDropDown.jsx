import { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"

export default function ProfileDropdown() {

  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  //ref dropdown box ko refer karta hai (for outside click detection)
  const ref = useRef(null)
  
  useOnClickOutside(ref, () => setOpen(false))
// dropdown div ko reference deta hai.
//Is reference ki madad se, agar user dropdown ke bahar click kare, toh dropdown band ho jata hai.

  if (!user) return null

  return (
    <button className="relative" onClick={() => setOpen(true)}>
      {/*Jab user profile image par click karta hai, setOpen(true) chalta hai, aur open true ho jata hai.*/}

      <div className="flex items-center gap-x-1">
        <img
          src={user?.image}
          alt={`profile-${user?.firstName}`}
          className="aspect-square w-[30px] rounded-full object-cover"
        />
        <AiOutlineCaretDown className="text-sm text-richblack-100" />
      </div>
      {open && (
        //Is div ko ref diya gaya hai, taki React ka useRef is element ko identify kar sake.
        //ye reference custom hook (useOnClickOutside) ko diya jata hai, jo detect karta 
        // hai ki user ne dropdown ke bahar click kiya ya nahi.
         //Agar bahar click hota hai, toh dropdown band ho jata hai.
        <div
          onClick={(e) => e.stopPropagation()}
          //stopPropagation() se dropdown ke andar click karne par dropdown band nahi hota.
          className="absolute top-[118%] right-0 z-[1000] divide-y-[1px] divide-richblack-700 overflow-hidden rounded-md border-[1px] border-richblack-700 bg-richblack-800"
          ref={ref}
        >
          <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
            <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
              <VscDashboard className="text-lg" />
              Dashboard
            </div>
          </Link>
          <div
            onClick={() => {
              dispatch(logout(navigate))
              setOpen(false)
            }}
            className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25"
          >
            <VscSignOut className="text-lg" />
            Logout
          </div>
        </div>
      )}
    </button>
  )
}
