const express = require('express');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

const router = express.Router();

// GET all issues
router.get('/', async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST create issue
router.post('/', auth, async (req, res) => {
    const { title, description, category, lat, lng, imageUrl } = req.body;
    try {
        const newIssue = new Issue({
            title,
            description,
            category,
            location: { lat, lng },
            imageUrl,
            status: 'Reported' // Default
        });
        const savedIssue = await newIssue.save();
        res.status(201).json(savedIssue);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating issue' });
    }
});

// PUT update status (Admin Only)
router.put('/:id/status', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        issue.status = status;
        await issue.save();

        // SOCKET IO: Emit update
        const io = req.app.get('io');
        io.emit('statusUpdated', { id: issue._id, status: issue.status });

        res.json(issue);
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// PUT upvote
router.put('/:id/upvote', auth, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        // Check if user already upvoted
        if (issue.upvotes.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already upvoted' });
        }

        issue.upvotes.push(req.user.id);
        await issue.save();
        res.json(issue);
    } catch (err) {
        res.status(500).json({ message: 'Upvote failed' });
    }
});

module.exports = router;
