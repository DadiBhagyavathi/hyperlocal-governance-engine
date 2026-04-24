const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/requireRole.middleware');
const RbacProject = require('./RbacProject.model');
const ProgressUpdate = require('../progressUpdate/ProgressUpdate.model');
const User = require('../auth/User.model');

// GET /public — Public endpoint for map display (no auth required)
router.get('/public', async (req, res) => {
  try {
    const projects = await RbacProject.find({})
      .select('title description status reportId createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
});

// POST /:id/assign — Government assigns engineers to a project
router.post('/:id/assign', authMiddleware, requireRole('GOVERNMENT'), async (req, res) => {
  try {
    const project = await RbacProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const { engineerIds } = req.body;
    if (!Array.isArray(engineerIds) || engineerIds.length === 0) {
      return res.status(400).json({ success: false, message: 'engineerIds must be a non-empty array' });
    }

    const users = await User.find({ _id: { $in: engineerIds } });
    const invalidIds = engineerIds.filter(id => {
      const u = users.find(u => u._id.toString() === id);
      return !u || u.role !== 'ENGINEER';
    });

    if (invalidIds.length > 0) {
      return res.status(400).json({ success: false, message: 'Invalid engineer IDs', invalidIds });
    }

    project.assignedEngineers = engineerIds;
    await project.save();

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
});

// PATCH /:id/status — Government updates project status
router.patch('/:id/status', authMiddleware, requireRole('GOVERNMENT'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PLANNING', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const project = await RbacProject.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
});

// GET / — List projects (ENGINEER sees assigned, GOVERNMENT sees all they created, ADMIN sees all)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ENGINEER') {
      if (req.query.assigned === 'true') {
        query.assignedEngineers = req.user.id;
      } else {
        query.assignedEngineers = req.user.id;
      }
    } else if (req.user.role === 'GOVERNMENT') {
      query.createdBy = req.user.id;
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const projects = await RbacProject.find(query)
      .populate('assignedEngineers', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
});

// GET /:id/updates — Get progress updates for a project (all authenticated users)
router.get('/:id/updates', authMiddleware, async (req, res) => {
  try {
    const project = await RbacProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const updates = await ProgressUpdate.find({ projectId: req.params.id })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, updates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
});

// POST /:id/updates — Engineer posts a progress update
router.post('/:id/updates', authMiddleware, requireRole('ENGINEER'), async (req, res) => {
  try {
    const project = await RbacProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const isAssigned = project.assignedEngineers.map(id => id.toString()).includes(req.user.id);
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Not assigned to this project' });
    }

    const { text, completionPercentage, photoUrl } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'text is required' });
    if (completionPercentage === undefined || completionPercentage === null) {
      return res.status(400).json({ success: false, message: 'completionPercentage is required' });
    }
    if (!Number.isInteger(Number(completionPercentage)) || completionPercentage < 0 || completionPercentage > 100) {
      return res.status(400).json({ success: false, message: 'completionPercentage must be an integer between 0 and 100' });
    }

    const update = await ProgressUpdate.create({
      projectId: req.params.id,
      text,
      completionPercentage: Number(completionPercentage),
      photoUrl,
      postedBy: req.user.id
    });

    res.status(201).json({ success: true, update });

    // Fire-and-forget: notify the citizen about the progress update
    (async () => {
      try {
        const Notification = require('../notification/Notification.model');
        const Report = require('../report/Report.model');
        const proj = await RbacProject.findById(req.params.id).select('reportId title');
        if (proj?.reportId) {
          const rep = await Report.findById(proj.reportId).select('submittedBy title');
          if (rep) {
            await Notification.create({
              userId: rep.submittedBy,
              type: 'PROGRESS_UPDATE',
              title: 'Progress update on your report',
              message: `Engineer posted an update on "${rep.title}": ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}`,
              relatedId: proj._id
            });
          }
        }
      } catch(e) { /* non-blocking */ }
    })();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
});

module.exports = router;
