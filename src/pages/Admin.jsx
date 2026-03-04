import React, { useState } from 'react';
import {
    Users,
    MessageSquare,
    Cpu,
    Settings,
    TrendingUp,
    Search,
    Edit,
    Trash2,
    Lock
} from 'lucide-react';
import { Button } from '../components/Button';

const stats = [
    { label: 'Total Users', value: '12,842', change: '+12%', icon: Users, color: '#A855F7' },
    { label: 'Active Chats', value: '84,291', change: '+18%', icon: MessageSquare, color: '#3B82F6' },
    { label: 'API Calls', value: '1.2M', change: '+24%', icon: Cpu, color: '#10B981' }
];

const newsItems = [
    { id: 1, title: 'Quantum Neural Networks Released', status: 'Published', date: '2026-02-20' },
    { id: 2, title: 'AI Ethics Framework Update', status: 'Draft', date: '2026-02-19' },
    { id: 3, title: 'New Multi-modal Capabilities', status: 'Published', date: '2026-02-18' }
];

export function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'efron666') setIsAuthenticated(true);
    };

    if (!isAuthenticated) {
        return (
            <div className="login-overlay">
                <div className="glass-card login-card">
                    <div className="login-icon">
                        <Lock size={32} />
                    </div>
                    <h2>Admin Access</h2>
                    <p>Please enter your secure credentials to continue.</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="Enter Access Key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button className="w-full">Initialize Access</Button>
                    </form>
                </div>
                <style>{`
          .login-overlay {
            height: calc(100vh - var(--nav-height));
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
          }
          .login-card {
            max-width: 400px;
            width: 100%;
            padding: 3rem 2rem;
            text-align: center;
          }
          .login-icon {
            width: 4rem;
            height: 4rem;
            background: rgba(168, 85, 247, 0.2);
            color: var(--primary);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }
          .login-card h2 { margin-bottom: 0.5rem; }
          .login-card p { color: rgba(255, 255, 255, 0.4); font-size: 0.875rem; margin-bottom: 2rem; }
          .login-card form { display: flex; flex-direction: column; gap: 1rem; }
          .login-card input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            padding: 0.75rem 1rem;
            color: white;
            outline: none;
            text-align: center;
          }
          .login-card input:focus { border-color: var(--primary); }
        `}</style>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <div>
                        <h1>Intelligence Dashboard</h1>
                        <p>Welcome back, Administrator. System status is nominal.</p>
                    </div>
                    <Button variant="secondary">Download Reports</Button>
                </div>

                <div className="stats-grid">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="glass-card stat-card">
                            <div className="stat-top">
                                <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-value">{stat.value}</div>
                                </div>
                            </div>
                            <div className="stat-bottom">
                                <TrendingUp size={14} style={{ color: '#10B981' }} />
                                <span className="stat-change">{stat.change} from last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="content-manager">
                    <div className="manager-header">
                        <h3>Manage Intelligence News</h3>
                        <div className="search-box">
                            <Search size={18} />
                            <input type="text" placeholder="Search articles..." />
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Article Title</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newsItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>
                                            <span className={`status-pill ${item.status.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>{item.date}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="action-btn"><Edit size={16} /></button>
                                                <button className="action-btn delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style>{`
        .admin-page { padding: 4rem 1.5rem; }
        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3rem;
        }
        .admin-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .admin-header p { color: rgba(255, 255, 255, 0.4); }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        .stat-card { padding: 1.5rem; }
        .stat-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .stat-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); }
        .stat-value { font-size: 1.5rem; font-weight: 700; }
        .stat-bottom { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); }
        .stat-change { color: #10B981; }

        .content-manager {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 1rem;
          overflow: hidden;
        }
        .manager-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .search-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .search-box input {
          background: transparent;
          border: none;
          color: white;
          outline: none;
          font-size: 0.875rem;
        }
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { 
          padding: 1rem 1.5rem; 
          font-size: 0.75rem; 
          font-weight: 700; 
          text-transform: uppercase; 
          color: rgba(255, 255, 255, 0.4); 
          border-bottom: 1px solid var(--border);
        }
        td { padding: 1rem 1.5rem; font-size: 0.875rem; border-bottom: 1px solid var(--border); }
        .status-pill {
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.published { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .status-pill.draft { background: rgba(234, 179, 8, 0.2); color: #EAB308; }
        .action-btns { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .action-btn { 
          padding: 0.375rem; 
          border-radius: 0.375rem; 
          color: rgba(255, 255, 255, 0.4); 
          transition: all 0.2s;
        }
        .action-btn:hover { background: rgba(255, 255, 255, 0.05); color: white; }
        .action-btn.delete:hover { color: #EF4444; }
      `}</style>
        </div>
    );
}
