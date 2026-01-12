import { useState, useEffect } from 'react';
import { getIssues } from '../utils/api';
import IssueCard from '../components/IssueCard';
import io from 'socket.io-client';
import './ListView.css';

const socket = io('http://localhost:5000');

const ListView = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchIssues = async () => {
        try {
            const { data } = await getIssues();
            setIssues(data);
        } catch (err) {
            console.error('Failed to fetch issues:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();

        // Listen for real-time status updates
        socket.on('statusUpdated', ({ id, status }) => {
            setIssues(prev =>
                prev.map(issue =>
                    issue._id === id ? { ...issue, status } : issue
                )
            );
        });

        return () => {
            socket.off('statusUpdated');
        };
    }, []);

    const filteredIssues = filter === 'All'
        ? issues
        : issues.filter(issue => issue.status === filter);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading issues...</p>
            </div>
        );
    }

    return (
        <div className="list-view">
            <div className="list-header">
                <h1>Civic Issues</h1>
                <div className="filter-buttons">
                    {['All', 'Reported', 'In Progress', 'Resolved'].map(status => (
                        <button
                            key={status}
                            className={filter === status ? 'active' : ''}
                            onClick={() => setFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {filteredIssues.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <h2>No issues found</h2>
                    <p>No issues match the current filter.</p>
                </div>
            ) : (
                <div className="issues-grid">
                    {filteredIssues.map(issue => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            onUpdate={fetchIssues}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListView;
