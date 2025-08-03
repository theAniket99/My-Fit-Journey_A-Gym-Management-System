import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ParticlesBackground from '../../components/common/ParticlesBackground';
import './AdminDashboard.css';

const logout = () => {
  sessionStorage.removeItem('jwtToken');
};

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Highlight active links based on current path
  const isActive = (path: string) => location.pathname.toLowerCase().endsWith(path.toLowerCase());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      {/* Background Particles */}
      <div className="particles-wrapper">
        <ParticlesBackground />
      </div>

      {/* Foreground Content (Sidebar + Main Area) */}
      <div className="admin-content">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar glass-panel">
          <nav>
            <ul>
              <li>
                <Link to="/admin/users" className={isActive('users') ? 'active-link' : ''}>
                  👥 User Management
                </Link>
              </li>
              <li>
                <Link to="/admin/plans" className={isActive('plans') ? 'active-link' : ''}>
                  📑 Plan Management
                </Link>
              </li>
              <li>
                <Link to="/admin/trainers" className={isActive('trainers') ? 'active-link' : ''}>
                  🏋️ Trainer Management
                </Link>
              </li>
              <li>
                <Link to="/admin/revenue" className={isActive('revenue') ? 'active-link' : ''}>
                  💰 Revenue Management
                </Link>
              </li>
            </ul>
          </nav>
          <button className="logout-btn" onClick={handleLogout}>
            🔒 Logout
          </button>
        </aside>

        {/* Main Content Area (Dynamic Pages) */}
        <main className="admin-main glass-panel">
          <Outlet /> {/* Renders Users, Plans, Trainers, Revenue components */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
