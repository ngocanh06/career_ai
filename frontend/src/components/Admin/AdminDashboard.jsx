import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './AdminDashboard.css';
import { 
  FaUsers, 
  FaChartLine, 
  FaRoute, 
  FaUserShield,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSearch,
  FaEye
} from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_roadmaps: 0,
    portfolio_count: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit modal
  const [editingUser, setEditingUser] = useState(null);
  
  // View Details Modal
  const [viewingUser, setViewingUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // To get current admin id
  const adminUser = JSON.parse(localStorage.getItem('career_user'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Admin-User-Id': adminUser?.user_id
      };
      
      const [statsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', { headers }),
        fetch('http://localhost:5000/api/admin/users', { headers })
      ]);
      
      const statsJson = await statsRes.json();
      const usersJson = await usersRes.json();
      
      if (statsJson.success) setStats(statsJson.data);
      if (usersJson.success) setUsers(usersJson.data);
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    }
    setLoading(false);
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user, password: user.password_hash || '', dob: user.dob || '' });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-User-Id': adminUser?.user_id
        },
        body: JSON.stringify({
          role: editingUser.role,
          status: editingUser.status,
          full_name: editingUser.full_name,
          password: editingUser.password,
          dob: editingUser.dob
        })
      });
      
      const json = await res.json();
      if (json.success) {
        alert('Cập nhật thành công');
        setEditingUser(null);
        fetchData();
      } else {
        alert(json.message || 'Cập nhật thất bại');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteUser = async (user_id, email) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn người dùng ${email} không?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user_id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-User-Id': adminUser?.user_id
        }
      });
      
      const json = await res.json();
      if (json.success) {
        alert('Xóa thành công');
        fetchData();
      } else {
        alert(json.message || 'Xóa thất bại');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleViewUser = async (user) => {
    setDetailsLoading(true);
    setViewingUser({ basic: user, details: null }); // Open modal immediately with basic info
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.user_id}/details`, {
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-User-Id': adminUser?.user_id
        }
      });
      
      const json = await res.json();
      if (json.success) {
        setViewingUser({ basic: user, details: json.data });
      } else {
        alert(json.message || 'Lỗi khi tải chi tiết người dùng');
        setViewingUser(null);
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ');
      setViewingUser(null);
    }
    setDetailsLoading(false);
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="admin-container">
        <h1 className="admin-title">
          <FaUserShield style={{ marginRight: 10, color: 'var(--primary-color, #3b5bdb)' }} /> 
          Bảng điều khiển Quản trị viên
        </h1>
        
        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-info">
              <h3>Tổng người dùng</h3>
              <p>{loading ? '...' : stats.total_users}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><FaChartLine /></div>
            <div className="stat-info">
              <h3>Đang hoạt động</h3>
              <p>{loading ? '...' : stats.active_users}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><FaRoute /></div>
            <div className="stat-info">
              <h3>Lộ trình đã tạo</h3>
              <p>{loading ? '...' : stats.total_roadmaps}</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><FaUserShield /></div>
            <div className="stat-info">
              <h3>Số Portfolio</h3>
              <p>{loading ? '...' : stats.portfolio_count}</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          <div className="table-header">
            <h2>Quản lý Người dùng</h2>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm email, tên..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="admin-loading">Đang tải dữ liệu...</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.full_name || '-'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>{user.status}</span>
                    </td>
                    <td>{user.created_at?.split(' ')[0]}</td>
                    <td>
                      <button className="admin-btn-icon admin-btn-view" onClick={() => handleViewUser(user)} title="Xem chi tiết">
                        <FaEye />
                      </button>
                      <button className="admin-btn-icon admin-btn-edit" onClick={() => handleEditUser(user)} title="Chỉnh sửa">
                        <FaEdit />
                      </button>
                      <button 
                        className="admin-btn-icon admin-btn-delete" 
                        onClick={() => handleDeleteUser(user.user_id, user.email)}
                        disabled={user.user_id === adminUser.user_id}
                        title="Xóa người dùng"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="admin-text-center" style={{ padding: '20px' }}>Không tìm thấy người dùng nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Chỉnh sửa người dùng</h3>
                <button className="btn-close" onClick={() => setEditingUser(null)}><FaTimes /></button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Email (Không thể đổi)</label>
                  <input type="text" value={editingUser.email} disabled className="admin-disabled-input" />
                </div>
                <div className="admin-form-group">
                  <label>Họ và Tên</label>
                  <input 
                    type="text" 
                    value={editingUser.full_name || ''} 
                    onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} 
                  />
                </div>
                <div className="admin-form-group">
                  <label>Ngày sinh</label>
                  <input 
                    type="date" 
                    value={editingUser.dob || ''} 
                    onChange={e => setEditingUser({...editingUser, dob: e.target.value})} 
                  />
                </div>
                <div className="admin-form-group">
                  <label>Mật khẩu (Sửa để đổi mật khẩu)</label>
                  <input 
                    type="text" 
                    value={editingUser.password || ''} 
                    onChange={e => setEditingUser({...editingUser, password: e.target.value})} 
                  />
                </div>
                <div className="admin-form-group">
                  <label>Vai trò</label>
                  <select 
                    value={editingUser.role}
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    disabled={editingUser.user_id === adminUser.user_id}
                  >
                    <option value="user">Người dùng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Trạng thái</label>
                  <select 
                    value={editingUser.status}
                    onChange={e => setEditingUser({...editingUser, status: e.target.value})}
                    disabled={editingUser.user_id === adminUser.user_id}
                  >
                    <option value="active">Hoạt động (Active)</option>
                    <option value="inactive">Không hoạt động (Inactive)</option>
                    <option value="locked">Bị khóa (Locked)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="btn-cancel" onClick={() => setEditingUser(null)}>Hủy</button>
                <button className="btn-save" onClick={handleSaveUser}><FaSave style={{ marginRight: 6 }} /> Lưu thay đổi</button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {viewingUser && (
          <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
            <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Hồ sơ người dùng: {viewingUser.basic.email}</h3>
                <button className="btn-close" onClick={() => setViewingUser(null)}><FaTimes /></button>
              </div>
              <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {detailsLoading && !viewingUser.details ? (
                  <div className="admin-loading">Đang tải dữ liệu...</div>
                ) : viewingUser.details ? (
                  <div className="user-details-grid">
                    {/* Basic Info */}
                    <div className="details-section">
                      <h4>Thông tin cơ bản</h4>
                      <p><strong>Họ và tên:</strong> {viewingUser.details.full_name || 'Chưa cập nhật'}</p>
                      <p><strong>Email:</strong> {viewingUser.details.email}</p>
                      <p><strong>Ngày sinh:</strong> {viewingUser.details.dob || 'Chưa cập nhật'}</p>
                      <p><strong>Số điện thoại:</strong> {viewingUser.details.phone || 'Chưa cập nhật'}</p>
                      <p><strong>Tiểu sử (Bio):</strong> {viewingUser.details.bio || 'Chưa cập nhật'}</p>
                    </div>

                    {/* Security Info */}
                    <div className="details-section">
                      <h4>Bảo mật & Tài khoản</h4>
                      <p><strong>Vai trò:</strong> <span className={`role-badge ${viewingUser.details.role}`}>{viewingUser.details.role}</span></p>
                      <p><strong>Trạng thái:</strong> <span className={`status-badge ${viewingUser.details.status}`}>{viewingUser.details.status}</span></p>
                      <p><strong>Ngày tạo:</strong> {viewingUser.details.created_at}</p>
                      <p>
                        <strong>Mật khẩu đã lưu (Hash):</strong> 
                        <code className="password-hash">{viewingUser.details.password_hash}</code>
                      </p>
                    </div>

                    {/* Activity Log */}
                    <div className="details-section full-width">
                      <h4>Nhật ký hoạt động (Activity Log)</h4>
                      {viewingUser.details.sessions && viewingUser.details.sessions.length > 0 ? (
                        <table className="admin-table activity-table">
                          <thead>
                            <tr>
                              <th>Thời gian</th>
                              <th>Địa chỉ IP</th>
                              <th>Vị trí</th>
                              <th>Thiết bị</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingUser.details.sessions.map((session, idx) => (
                              <tr key={idx}>
                                <td>{session.last_active} {session.is_current ? <span className="current-session-badge">Hiện tại</span> : ''}</td>
                                <td>{session.ip_address}</td>
                                <td>{session.location || 'Unknown'}</td>
                                <td>{session.device_info}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="no-data">Chưa có lịch sử hoạt động.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="admin-error">Lỗi khi tải dữ liệu</div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button className="btn-cancel" onClick={() => setViewingUser(null)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
