import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  deleteUser,
} from "../../../../services/operations/adminAPI";
import { VscTrash, VscCheck } from "react-icons/vsc";
import ConfirmationModal from "../../../common/ConfirmationModal";

const UserManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [confirmationModal, setConfirmationModal] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers(token);
    if (result) {
      setUsers(result);
    }
    setLoading(false);
  };

  const handleSuspendUser = async (userId, reason) => {
    const result = await suspendUser(userId, reason, token);
    if (result) {
      fetchUsers();
    }
    setConfirmationModal(null);
  };

  const handleUnsuspendUser = async (userId) => {
    const result = await unsuspendUser(userId, token);
    if (result) {
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await deleteUser(userId, token);
    if (result) {
      fetchUsers();
    }
    setConfirmationModal(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole =
      roleFilter === "All" || user.accountType === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-richblack-5 mb-6">
        User Management
      </h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-96 rounded-md bg-richblack-800 p-3 text-richblack-5 border border-richblack-700 focus:outline-none focus:border-yellow-50"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md bg-richblack-800 p-2 text-richblack-5 border border-richblack-700"
        >
          <option value="All">All Roles</option>
          <option value="Student">Students</option>
          <option value="Instructor">Instructors</option>
          <option value="Admin">Admins</option>
        </select>
      </div>

      {/* Users List - Mobile */}
      {filteredUsers.length === 0 ? (
        <div className="md:hidden rounded-lg border border-richblack-700 bg-richblack-800 p-6 text-center text-richblack-300">
          No users found
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-lg border border-richblack-700 bg-richblack-800 p-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.image}
                  alt={user.firstName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-richblack-5 font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-richblack-200 break-all">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      display: 'inline-block',
                      borderRadius: '9999px',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: user.accountType === "Admin"
                        ? 'rgba(219, 39, 119, 0.2)'
                        : user.accountType === "Instructor"
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(234, 179, 8, 0.2)',
                      color: user.accountType === "Admin"
                        ? '#FBCFE8'
                        : user.accountType === "Instructor"
                        ? '#BFDBFE'
                        : '#FEF08A'
                    }}
                  >
                    {user.accountType}
                  </span>
                  {user.suspended ? (
                    <span className="rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-xs font-semibold">Suspended</span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-block',
                        borderRadius: '9999px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user.suspended ? (
                    <button
                      onClick={() => handleUnsuspendUser(user._id)}
                      className="rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-richblack-5 hover:bg-green-600"
                      title="Unsuspend User"
                    >
                      Unsuspend
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Suspend User",
                          text2: `Are you sure you want to suspend ${user.firstName}?`,
                          btn1Text: "Suspend",
                          btn2Text: "Cancel",
                          btn1Handler: () =>
                            handleSuspendUser(user._id, "Admin action"),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                      className="rounded-md bg-yellow-700 px-3 py-1.5 text-xs font-medium text-richblack-5 hover:bg-yellow-600"
                      title="Suspend User"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setConfirmationModal({
                        text1: "Delete User",
                        text2: `Are you sure you want to delete ${user.firstName}? This action cannot be undone.`,
                        btn1Text: "Delete",
                        btn2Text: "Cancel",
                        btn1Handler: () => handleDeleteUser(user._id),
                        btn2Handler: () => setConfirmationModal(null),
                      })
                    }
                    className="rounded-md bg-pink-700 p-2 text-richblack-5 hover:bg-pink-600"
                    title="Delete User"
                    aria-label="Delete User"
                  >
                    <VscTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-richblack-700">
          <thead className="bg-richblack-800">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-richblack-100">
                User
              </th>
              <th className="p-4 text-left text-sm font-medium text-richblack-100">
                Email
              </th>
              <th className="p-4 text-left text-sm font-medium text-richblack-100">
                Role
              </th>
              <th className="p-4 text-left text-sm font-medium text-richblack-100">
                Status
              </th>
              <th className="p-4 text-right text-sm font-medium text-richblack-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-richblack-300"
                >
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-richblack-700 hover:bg-richblack-800"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.image}
                        alt={user.firstName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-richblack-5 font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-richblack-100">{user.email}</td>
                  <td className="p-4">
                    <span
                      style={{
                        display: 'inline-block',
                        borderRadius: '9999px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: user.accountType === "Admin"
                          ? 'rgba(219, 39, 119, 0.2)'
                          : user.accountType === "Instructor"
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(234, 179, 8, 0.2)',
                        color: user.accountType === "Admin"
                          ? '#FBCFE8'
                          : user.accountType === "Instructor"
                          ? '#BFDBFE'
                          : '#FEF08A'
                      }}
                    >
                      {user.accountType}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.suspended ? (
                      <span style={{ color: '#F87171' }}>Suspended</span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          borderRadius: '9999px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#16A34A',
                          color: '#FFFFFF',
                        }}
                      >
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="ml-auto flex justify-end gap-2">
                      {user.suspended ? (
                        <button
                          onClick={() => handleUnsuspendUser(user._id)}
                          className="rounded-md bg-green-700 p-2 text-sm font-medium text-richblack-5 hover:bg-green-600"
                          title="Unsuspend User"
                        >
                          <VscCheck />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setConfirmationModal({
                              text1: "Suspend User",
                              text2: `Are you sure you want to suspend ${user.firstName}?`,
                              btn1Text: "Suspend",
                              btn2Text: "Cancel",
                              btn1Handler: () =>
                                handleSuspendUser(user._id, "Admin action"),
                              btn2Handler: () => setConfirmationModal(null),
                            })
                          }
                          className="rounded-md bg-yellow-700 px-3 py-1.5 text-sm font-medium text-richblack-5 hover:bg-yellow-600"
                          title="Suspend User"
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setConfirmationModal({
                            text1: "Delete User",
                            text2: `Are you sure you want to delete ${user.firstName}? This action cannot be undone.`,
                            btn1Text: "Delete",
                            btn2Text: "Cancel",
                            btn1Handler: () => handleDeleteUser(user._id),
                            btn2Handler: () => setConfirmationModal(null),
                          })
                        }
                        className="rounded-md bg-pink-700 p-2 text-sm font-medium text-richblack-5 hover:bg-pink-600"
                        title="Delete User"
                      >
                        <VscTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div className="mt-4 text-sm text-richblack-300">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default UserManagement;
