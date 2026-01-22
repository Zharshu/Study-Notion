import { useEffect, useState } from "react"
import { FiTrash2 } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { deleteProfile } from "../../../../services/operations/SettingsAPI"
import ConfirmationModal from "../../../../shared/components/modals/ConfirmationModal"
import { apiConnector } from "../../../../services/api/client"
import { settingsEndpoints } from "../../../../services/api/endpoints"

export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [canDelete, setCanDelete] = useState(true)
  const [deleteMessage, setDeleteMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCanDelete = async () => {
      try {
        setLoading(true)
        const response = await apiConnector(
          "GET",
          settingsEndpoints.CAN_DELETE_ACCOUNT_API,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        )
        setCanDelete(response.data.data.canDelete)
        setDeleteMessage(response.data.data.message)
      } catch (error) {
        console.error("Error checking delete status:", error)
        setCanDelete(true) // Default to allowing deletion if check fails
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      checkCanDelete()
    }
  }, [token])

  async function handleDeleteAccount() {
    try {
      dispatch(deleteProfile(token, navigate))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <div className="my-10 flex flex-col sm:flex-row gap-4 sm:gap-x-5 rounded-md border-[1px] border-pink-700 bg-pink-900 p-4 sm:p-8 sm:px-12">
        <div className="flex aspect-square h-14 w-14 items-center justify-center rounded-full bg-pink-700 flex-shrink-0">
          <FiTrash2 className="text-3xl text-pink-200" />
        </div>
        <div className="flex flex-col space-y-2">
          <h2 className="text-lg font-semibold text-richblack-5">
            Delete Account
          </h2>
          <div className="w-full sm:w-3/5 text-sm sm:text-base text-pink-25">
            <p className="mb-2">Would you like to delete your account?</p>
            <p className="mb-2">
              Deleting your account is permanent and will remove all data associated with it.
            </p>
            {user?.accountType === "Instructor" && (
              <p className="text-xs text-pink-100">
                <strong>Note for Instructors:</strong> You cannot delete your account if you have courses with enrolled students. Please contact support for assistance.
              </p>
            )}
            {!canDelete && (
              <p className="mt-2 text-xs font-semibold text-yellow-100 bg-yellow-900/30 p-2 rounded">
                ⚠️ {deleteMessage}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={!canDelete || loading}
            className={`w-fit italic transition-colors ${
              canDelete && !loading
                ? "cursor-pointer text-pink-300 hover:text-pink-200"
                : "cursor-not-allowed text-pink-500 opacity-50"
            }`}
            onClick={() => {
              if (canDelete && !loading) {
                setConfirmationModal({
                  text1: "Are you sure?",
                  text2: "Your account will be permanently deleted. This action cannot be undone.",
                  btn1Text: "Delete Account",
                  btn2Text: "Cancel",
                  btn1Handler: () => {
                    handleDeleteAccount()
                    setConfirmationModal(null)
                  },
                  btn2Handler: () => setConfirmationModal(null),
                })
              }
            }}
          >
            {loading ? "Checking..." : "I want to delete my account."}
          </button>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}