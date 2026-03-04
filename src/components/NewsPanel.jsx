import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ChevronRight } from 'lucide-react';

const news = [
    {
        id: 1,
        title: "GPT-5 Intelligence Leak",
        source: "TechDaily",
        time: "2h ago",
        category: "LLM"
    },
    {
        id: 2,
        title: "AI Regulation in 2026",
        source: "GlobalNews",
        time: "5h ago",
        category: "Policy"
    },
    {
        id: 3,
        title: "Robotics Breakthrough",
        source: "ScienceHub",
        time: "8h ago",
        category: "Robotics"
    },
    {
        id: 4,
        title: "AI Chip Efficiency",
        source: "HardwareWire",
        time: "1d ago",
        category: "Hardware"
    }
];

export function NewsPanel() {
    return (
        <aside className="glass-card news-sidebar">
            <div className="sidebar-header">
                <h3 className="flex items-center gap-2">
                    <Newspaper size={20} style={{ color: 'var(--primary)' }} />
                    AI News Center
                </h3>
                <button className="view-all-btn">View All</button>
            </div>

            <div className="news-list">
                {news.map((item) => (
                    <div key={item.id} className="news-item">
                        <div className="flex gap-4">
                            <div className="item-thumb">
                                <div className="thumb-gradient">
                                    <Newspaper size={24} style={{ opacity: 0.2 }} />
                                </div>
                            </div>
                            <div className="item-content">
                                <span className="category-tag">{item.category}</span>
                                <h4>{item.title}</h4>
                                <div className="item-meta">
                                    <span>{item.source}</span>
                                    <span className="dot" />
                                    <span>{item.time}</span>
                                </div>
                            </div>
                        </div>
                        <div className="divider" />
                    </div>
                ))}
            </div>

            <Link to="/admin" style={{ display: 'contents' }}>
                <button className="admin-btn group">
                    <span>Open Admin Panel</span>
                    <ChevronRight size={16} className="arrow-icon" />
                </button>
            </Link>
            <style>{`
        .news-sidebar {
          padding: 1.5rem;
          height: fit-content;
          position: sticky;
          top: 6rem;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .sidebar-header h3 {
          font-weight: 700;
          font-size: 1.125rem;
        }
        .view-all-btn {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--primary);
        }
        .view-all-btn:hover { text-decoration: underline; }
        .news-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .news-item { cursor: pointer; }
        .item-thumb {
          width: 4rem;
          height: 4rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .thumb-gradient {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-content { flex: 1; }
        .category-tag {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary);
          margin-bottom: 0.25rem;
          display: block;
        }
        .item-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.25;
          margin-bottom: 0.25rem;
          transition: color 0.2s;
        }
        .news-item:hover h4 { color: var(--primary); }
        .item-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.4);
        }
        .item-meta .dot {
          width: 4px;
          height: 4px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.2);
        }
        .divider {
          margin-top: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .admin-btn {
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.75rem;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        .admin-btn:hover { background: rgba(255, 255, 255, 0.1); }
        .arrow-icon { transition: transform 0.2s; }
        .admin-btn:hover .arrow-icon { transform: translateX(0.25rem); }
      `}</style>
        </aside>
    );
}
