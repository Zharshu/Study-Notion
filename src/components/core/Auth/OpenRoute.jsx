// This will prevent authenticated users from accessing this route
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"

function OpenRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
//Agar token null hai (user login nahi hai), toh children render karo (matlab Login/Signup page dikhado).

  if (token === null) {
    return children
  } else {
    return <Navigate to="/dashboard/my-profile" />
  }
}

export default OpenRoute
