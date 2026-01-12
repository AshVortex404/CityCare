import { useState, useContext } from 'react';
import { upvoteIssue, updateIssueStatus } from '../utils/api';
import { AuthContext } from '../utils/AuthContext';
import './IssueCard.css';

const IssueCard = ({ issue, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [updating, setUpdating] = useState(false);

    const handleUpvote = async () => {
        try {
            await upvoteIssue(issue._id);
            onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to upvote');
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            await updateIssueStatus(issue._id, newStatus);
            onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Reported': return '#ed8936';
            case 'In Progress': return '#4299e1';
            case 'Resolved': return '#48bb78';
            default: return '#718096';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="issue-card">
            <div className="issue-header">
                <div>
                    <h3 className="issue-title">{issue.title}</h3>
                    <span className="issue-category">📍 {issue.category}</span>
                </div>
                <span
                    className="issue-status"
                    style={{ background: getStatusColor(issue.status) }}
                >
                    {issue.status}
                </span>
            </div>

            <p className="issue-description">{issue.description}</p>

            {issue.imageUrl && (
                <img src={issue.imageUrl} alt="Issue" className="issue-image" />
            )}

            <div className="issue-footer">
                <div className="issue-meta">
                    <span className="issue-date">🕒 {formatDate(issue.createdAt)}</span>
                    <span className="issue-location">
                        📍 {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}
                    </span>
                </div>

                <div className="issue-actions">
                    <button
                        onClick={handleUpvote}
                        className="upvote-btn"
                        disabled={issue.upvotes?.includes(user?.userId)}
                    >
                        👍 {issue.upvotes?.length || 0}
                    </button>

                    {user?.role === 'admin' && (
                        <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="status-select"
                            disabled={updating}
                        >
                            <option value="Reported">Reported</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueCard;
