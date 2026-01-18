import React,{ useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAllUsers, suspendUser, activateUser } from "../../api/adminAPI";
import { toast } from "react-hot-toast";

export default function UserManagement() {
  const { token } = useSelector((state) => state.auth);
  const { user: currentUser } = useSelector((state) => state.profile);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ role: "", status: "", search: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");


  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers(token, page, filters);
    if (data) {
      setUsers(data.data);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    const result = await suspendUser(token, selectedUser._id, suspendReason);
    if (result) {
      fetchUsers();
      setShowSuspendModal(false);
      setSuspendReason("");
      setSelectedUser(null);
    }
  };

  const handleActivate = async (userId) => {
    const result = await activateUser(token, userId);
    if (result) {
      fetchUsers();
    }
  };



  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-richblack-5">User Management</h1>

      {/* Filters */}
      <div className="flex flex-col gap-2 bg-richblack-800 p-2.5 rounded-lg">
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="rounded-md bg-richblack-700 py-2 px-2.5 text-richblack-5 w-full text-sm h-10"
        >
          <option value="">All Roles</option>
          <option value="Student">Student</option>
          <option value="Instructor">Instructor</option>
          <option value="Admin">Admin</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters,status: e.target.value })}
          className="rounded-md bg-richblack-700 py-2 px-2.5 text-richblack-5 w-full text-sm h-10"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="rounded-md bg-richblack-700 py-2 px-2.5 text-richblack-5 w-full text-sm h-10"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="grid place-items-center min-h-[400px]">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="rounded-lg bg-richblack-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
            <thead className="bg-richblack-700">
              <tr>
                <th className="p-4 text-left text-richblack-50">User</th>
                <th className="p-4 text-left text-richblack-50">Email</th>
                <th className="p-4 text-left text-richblack-50">Role</th>
                <th className="p-4 text-left text-richblack-50">Status</th>
                <th className="p-4 text-left text-richblack-50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-richblack-700">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.image}
                        alt={user.firstName}
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="text-richblack-5">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-richblack-100">{user.email}</td>
                  <td className="p-4">
                    <span className="text-richblack-100">{user.accountType}</span>
                  </td>
                  <td className="p-4">
                    {user.suspended ? (
                      <span 
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          display: 'inline-block'
                        }}
                      >
                        Suspended
                      </span>
                    ) : (
                      <span 
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                          display: 'inline-block'
                        }}
                      >
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {user.suspended ? (
                        <button
                          onClick={() => handleActivate(user._id)}
                          className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowSuspendModal(true);
                          }}
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="rounded bg-richblack-700 px-4 py-2 text-richblack-5 disabled:opacity-50 w-full sm:w-auto min-h-[44px]"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-richblack-5">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded bg-richblack-700 px-4 py-2 text-richblack-5 disabled:opacity-50 w-full sm:w-auto min-h-[44px]"
        >
          Next
        </button>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black bg-opacity-50">
          <div className="w-11/12 max-w-md rounded-lg bg-richblack-800 p-6">
            <h2 className="text-xl font-bold text-richblack-5">Suspend User</h2>
            <p className="mt-2 text-richblack-200">
              Suspend {selectedUser?.firstName} {selectedUser?.lastName}?
            </p>
            <textarea
              placeholder="Reason for suspension..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="mt-4 w-full rounded-md bg-richblack-700 p-3 text-richblack-5"
              rows="4"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason("");
                  setSelectedUser(null);
                }}
                className="rounded bg-richblack-700 px-4 py-2 text-richblack-5"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="rounded bg-red-600 px-4 py-2 text-white"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

