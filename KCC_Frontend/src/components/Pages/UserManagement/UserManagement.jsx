import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  Edit3,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Shield,
  UserCog,
  AlertCircle,
} from "lucide-react";
import {
  httpGetService,
  httpPostService,
  httpPutService,
  httpDeleteService,
} from "../../../httpHandler";
import "./UserManagement.css";

const DEPARTMENTS = [
  "Operations",
  "IT",
  "Finance",
  "HR",
  "Compliance",
  "Credit",
  "Risk Management",
  "Customer Service",
  "Marketing",
  "Legal",
];

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userId: "",
    email: "",
    joinDate: "",
    status: "active",
    department: "",
    role: "user",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await httpGetService("admin/users");
      if (response && response.success) {
        setUsers(response.users || []);
      } else {
        setError(response?.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Error fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = "First name is required";
    if (!formData.lastName.trim()) errs.lastName = "Last name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      errs.email = "Invalid email format";
    if (!formData.department) errs.department = "Department is required";
    if (!formData.joinDate) errs.joinDate = "Join date is required";
    if (showCreateModal && !formData.userId.trim())
      errs.userId = "User ID is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      userId: "",
      email: "",
      joinDate: "",
      status: "active",
      department: "",
      role: "user",
    });
    setFormErrors({});
  };

  // Create User
  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const response = await httpPostService("admin/users", formData);
      if (response && response.success) {
        setSuccessMessage("User created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
      } else {
        setError(response?.message || "Failed to create user");
      }
    } catch (err) {
      setError("Error creating user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Update User
  const handleUpdate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const response = await httpPutService(
        `admin/users/${selectedUser._id}`,
        formData
      );
      if (response && response.success) {
        setSuccessMessage("User updated successfully!");
        setShowEditModal(false);
        resetForm();
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(response?.message || "Failed to update user");
      }
    } catch (err) {
      setError("Error updating user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Soft Delete
  const handleDelete = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const response = await httpDeleteService(
        `admin/users/${selectedUser._id}`
      );
      if (response && response.success) {
        setSuccessMessage(
          `User "${selectedUser.firstName} ${selectedUser.lastName}" has been deactivated.`
        );
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        setError(response?.message || "Failed to delete user");
      }
    } catch (err) {
      setError("Error deleting user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      userId: user.userId || user.username || "",
      email: user.email || "",
      joinDate: user.joinDate
        ? new Date(user.joinDate).toISOString().split("T")[0]
        : "",
      status: user.isDeleted ? "deleted" : user.status || "active",
      department: user.department || "",
      role: user.role || "user",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Filter
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.userId?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.department?.toLowerCase().includes(term);

    let matchesFilter = true;
    if (statusFilter === "active") matchesFilter = user.status === "active" && !user.isDeleted;
    else if (statusFilter === "inactive") matchesFilter = user.status === "inactive" && !user.isDeleted;
    else if (statusFilter === "deleted") matchesFilter = user.isDeleted === true;

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Stats
  const totalActive = users.filter((u) => u.status === "active" && !u.isDeleted).length;
  const totalInactive = users.filter((u) => u.status === "inactive" && !u.isDeleted).length;
  const totalDeleted = users.filter((u) => u.isDeleted).length;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Render Form Modal
  const renderFormModal = (isEdit) => (
    <div className="um-modal-overlay" onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); resetForm(); }}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal-header">
          <div className="um-modal-header-left">
            <div className="um-modal-icon">
              {isEdit ? <Edit3 size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h2 className="um-modal-title">
                {isEdit ? "Update User" : "Create New User"}
              </h2>
              <p className="um-modal-subtitle">
                {isEdit ? "Modify user details below" : "Fill in the details to create a new user"}
              </p>
            </div>
          </div>
          <button className="um-modal-close" onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); resetForm(); }}>
            <X size={18} />
          </button>
        </div>

        <div className="um-modal-body">
          <div className="um-form-grid">
            <div className="um-field">
              <label className="um-label">First Name <span className="um-required">*</span></label>
              <input className={`um-input ${formErrors.firstName ? "error" : ""}`} placeholder="Enter first name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              {formErrors.firstName && <div className="um-field-error">{formErrors.firstName}</div>}
            </div>

            <div className="um-field">
              <label className="um-label">Last Name <span className="um-required">*</span></label>
              <input className={`um-input ${formErrors.lastName ? "error" : ""}`} placeholder="Enter last name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              {formErrors.lastName && <div className="um-field-error">{formErrors.lastName}</div>}
            </div>

            <div className="um-field">
              <label className="um-label">User ID {!isEdit && <span className="um-required">*</span>}</label>
              <input className={`um-input ${formErrors.userId ? "error" : ""}`} placeholder="Enter user ID" value={formData.userId} disabled={isEdit} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} />
              {formErrors.userId && <div className="um-field-error">{formErrors.userId}</div>}
            </div>

            <div className="um-field">
              <label className="um-label">Email ID <span className="um-required">*</span></label>
              <input className={`um-input ${formErrors.email ? "error" : ""}`} type="email" placeholder="user@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              {formErrors.email && <div className="um-field-error">{formErrors.email}</div>}
            </div>

            <div className="um-field">
              <label className="um-label">Join Date <span className="um-required">*</span></label>
              <input className={`um-input ${formErrors.joinDate ? "error" : ""}`} type="date" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} />
              {formErrors.joinDate && <div className="um-field-error">{formErrors.joinDate}</div>}
            </div>

            <div className="um-field">
              <label className="um-label">Department <span className="um-required">*</span></label>
              <select className={`um-input ${formErrors.department ? "error" : ""}`} value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {formErrors.department && <div className="um-field-error">{formErrors.department}</div>}
            </div>

            <div className="um-field">
              <label className="um-label">Role</label>
              <select className="um-input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="um-field">
              <label className="um-label">Status</label>
              <div className="um-toggle-wrapper">
                <button type="button" className={`um-toggle ${formData.status === "active" ? "active" : ""}`} onClick={() => setFormData({ ...formData, status: formData.status === "active" ? "inactive" : "active" })}>
                  <span className="um-toggle-knob" />
                </button>
                <span className="um-toggle-label">
                  {formData.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="um-modal-footer">
            <button className="um-btn-cancel" onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); resetForm(); }}>Cancel</button>
            <button className="um-btn-submit" disabled={submitting} onClick={isEdit ? handleUpdate : handleCreate}>
              {submitting ? (
                <><RefreshCw size={14} className="um-spinning" /> Saving...</>
              ) : (
                <><CheckCircle size={14} /> {isEdit ? "Update User" : "Create User"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="um-container">
      {/* Header */}
      <div className="um-header">
        <div className="um-header-left">
          <div className="um-header-icon">
            <UserCog size={24} />
          </div>
          <div>
            <h1 className="um-title">User Management</h1>
            <p className="um-subtitle">Create, update, and manage user accounts</p>
          </div>
        </div>
        <div className="um-header-actions">
          <button className="um-btn-create" onClick={openCreateModal}>
            <UserPlus size={16} /> New User
          </button>
          <button className="um-btn-refresh" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={16} className={loading ? "um-spinning" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="um-stats-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon purple"><Users size={20} /></div>
          <div className="um-stat-info">
            <span className="um-stat-value">{users.length}</span>
            <span className="um-stat-label">Total Users</span>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon green"><CheckCircle size={20} /></div>
          <div className="um-stat-info">
            <span className="um-stat-value">{totalActive}</span>
            <span className="um-stat-label">Active</span>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon amber"><AlertCircle size={20} /></div>
          <div className="um-stat-info">
            <span className="um-stat-value">{totalInactive}</span>
            <span className="um-stat-label">Inactive</span>
          </div>
        </div>
        <div className="um-stat-card">
          <div className="um-stat-icon red"><Trash2 size={20} /></div>
          <div className="um-stat-info">
            <span className="um-stat-value">{totalDeleted}</span>
            <span className="um-stat-label">Deleted</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="um-alert um-alert-success">
          <CheckCircle size={18} /> <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="um-alert um-alert-error">
          <AlertTriangle size={18} /> <span>{error}</span>
        </div>
      )}

      {/* Controls */}
      <div className="um-controls">
        <div className="um-search-wrapper">
          <Search size={16} className="um-search-icon" />
          <input type="text" className="um-search-input" placeholder="Search by name, email, user ID, department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="um-filter-wrapper">
          <button className="um-filter-btn" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
            <Filter size={16} />
            {statusFilter === "all" ? "All Users" : statusFilter === "active" ? "Active" : statusFilter === "inactive" ? "Inactive" : "Deleted"}
            <ChevronDown size={14} />
          </button>
          {showFilterDropdown && (
            <div className="um-filter-dropdown">
              {["all", "active", "inactive", "deleted"].map((f) => (
                <button key={f} className={statusFilter === f ? "active" : ""} onClick={() => { setStatusFilter(f); setShowFilterDropdown(false); }}>
                  {f === "all" ? "All Users" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="um-loading">
          <div className="um-spinner" />
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="um-empty">
          <Shield size={48} />
          <h3>No Users Found</h3>
          <p>{searchTerm ? "No users match your search." : "No users to display."}</p>
        </div>
      ) : (
        <>
          <div className="um-table-wrapper">
            <table className="um-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="um-user-cell">
                        <div className="um-user-avatar">
                          {(user.firstName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="um-user-name">{user.firstName} {user.lastName}</div>
                          <div className="um-user-id">{user.userId || user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.department ? (
                        <span className="um-dept-badge">{user.department}</span>
                      ) : "—"}
                    </td>
                    <td>
                      <span className={`um-role-badge ${user.role === "admin" ? "um-role-admin" : "um-role-user"}`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td>{formatDate(user.joinDate || user.createdAt)}</td>
                    <td>
                      <span className={`um-status-badge ${user.isDeleted ? "um-status-deleted" : user.status === "active" ? "um-status-active" : "um-status-inactive"}`}>
                        <span className="um-status-dot" />
                        {user.isDeleted ? "Deleted" : user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="um-actions">
                        <button className="um-action-btn edit" title="Edit user" onClick={() => openEditModal(user)} disabled={user.isDeleted}>
                          <Edit3 size={14} />
                        </button>
                        <button className="um-action-btn delete" title="Delete user" onClick={() => openDeleteModal(user)} disabled={user.isDeleted}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="um-pagination">
            <div className="um-pagination-info">
              Showing <strong>{startIdx + 1}</strong> - <strong>{Math.min(startIdx + ITEMS_PER_PAGE, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users
            </div>
            <div className="um-pagination-nav">
              <button className="um-page-btn" disabled={safePage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((n) => (
                <button key={n} className={`um-page-btn ${safePage === n ? "active" : ""}`} onClick={() => setCurrentPage(n)}>
                  {n}
                </button>
              ))}
              <button className="um-page-btn" disabled={safePage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && renderFormModal(false)}

      {/* Edit Modal */}
      {showEditModal && renderFormModal(true)}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="um-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="um-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-body">
              <div className="um-delete-confirm">
                <div className="um-delete-icon-wrap">
                  <AlertTriangle size={28} />
                </div>
                <h3>Deactivate User</h3>
                <p>
                  Are you sure you want to deactivate{" "}
                  <span className="um-delete-name">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                  ?
                </p>
                <p>This is a soft delete. The user can be reactivated later.</p>
                <div className="um-delete-actions">
                  <button className="um-btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="um-btn-submit um-btn-danger" disabled={submitting} onClick={handleDelete}>
                    {submitting ? (
                      <><RefreshCw size={14} className="um-spinning" /> Deleting...</>
                    ) : (
                      <><Trash2 size={14} /> Deactivate User</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
