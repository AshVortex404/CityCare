import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../utils/api';
import './ReportIssue.css';

const ReportIssue = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Road',
        lat: '',
        lng: '',
        imageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate coordinates
        const lat = parseFloat(formData.lat);
        const lng = parseFloat(formData.lng);

        if (isNaN(lat) || isNaN(lng)) {
            setError('Please enter valid latitude and longitude');
            setLoading(false);
            return;
        }

        try {
            await createIssue({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                lat,
                lng,
                imageUrl: formData.imageUrl || undefined
            });

            alert('Issue reported successfully!');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to report issue');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        lat: position.coords.latitude.toFixed(6),
                        lng: position.coords.longitude.toFixed(6)
                    });
                },
                (error) => {
                    alert('Unable to get your location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    return (
        <div className="report-issue">
            <div className="report-container">
                <div className="report-header">
                    <h1>Report an Issue</h1>
                    <p>Help improve your community by reporting civic issues</p>
                </div>

                <form onSubmit={handleSubmit} className="report-form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Brief title of the issue"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Describe the issue in detail"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="Road">🛣️ Road</option>
                            <option value="Garbage">🗑️ Garbage</option>
                            <option value="Light">💡 Street Light</option>
                            <option value="Water">💧 Water</option>
                            <option value="Other">📌 Other</option>
                        </select>
                    </div>

                    <div className="location-group">
                        <div className="form-group">
                            <label>Latitude *</label>
                            <input
                                type="text"
                                name="lat"
                                value={formData.lat}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 19.0760"
                            />
                        </div>

                        <div className="form-group">
                            <label>Longitude *</label>
                            <input
                                type="text"
                                name="lng"
                                value={formData.lng}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 72.8777"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="location-btn"
                        >
                            📍 Use My Location
                        </button>
                    </div>

                    <div className="form-group">
                        <label>Image URL (Optional)</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Report Issue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
