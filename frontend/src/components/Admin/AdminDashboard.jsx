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
  FaSearch
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
    setEditingUser({ ...user });
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
          full_name: editingUser.full_name
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
                      <button className="btn-icon btn-edit" onClick={() => handleEditUser(user)} title="Chỉnh sửa">
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-icon btn-delete" 
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
                    <td colSpan="7" className="text-center" style={{ padding: '20px' }}>Không tìm thấy người dùng nào.</td>
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
                <div className="form-group">
                  <label>Email (Không thể đổi)</label>
                  <input type="text" value={editingUser.email} disabled className="disabled-input" />
                </div>
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input 
                    type="text" 
                    value={editingUser.full_name || ''} 
                    onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} 
                  />
                </div>
                <div className="form-group">
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
                <div className="form-group">
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
      </div>
    </DashboardLayout>
  );
}
