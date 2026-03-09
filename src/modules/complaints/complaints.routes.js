const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../../public/data/complaints-data.json');

async function readComplaints() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeComplaints(complaints) {
  await fs.writeFile(DATA_FILE, JSON.stringify(complaints, null, 2));
}

function detectClusters(complaints) {
  const now = new Date();
  const clusters = {};
  
  complaints.forEach(complaint => {
    const complaintTime = new Date(complaint.timestamp);
    const hoursDiff = (now - complaintTime) / (1000 * 60 * 60);
    
    if (hoursDiff <= 48) {
      const key = `${complaint.location}|${complaint.category}`;
      if (!clusters[key]) {
        clusters[key] = {
          location: complaint.location,
          category: complaint.category,
          count: 0,
          complaints: []
        };
      }
      clusters[key].count++;
      clusters[key].complaints.push(complaint);
    }
  });
  
  return Object.values(clusters)
    .filter(cluster => cluster.count >= 3)
    .map(cluster => ({
      ...cluster,
      severity: cluster.count >= 5 ? 'Critical' : 'High',
      alert: 'High Issue Cluster'
    }));
}

function getAnalytics(complaints) {
  const byCategory = {};
  const byLocation = {};
  const byStatus = { resolved: 0, unresolved: 0 };
  const byDate = {};
  
  complaints.forEach(c => {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byLocation[c.location] = (byLocation[c.location] || 0) + 1;
    byStatus[c.status]++;
    
    const date = c.timestamp.split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });
  
  return {
    byCategory: Object.entries(byCategory).map(([name, count]) => ({ name, count })),
    byLocation: Object.entries(byLocation).map(([name, count]) => ({ name, count })),
    byStatus,
    byDate: Object.entries(byDate).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
    total: complaints.length
  };
}

router.get('/', async (req, res) => {
  try {
    const complaints = await readComplaints();
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const complaints = await readComplaints();
    const newComplaint = {
      id: complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1,
      ...req.body,
      timestamp: new Date().toISOString(),
      status: 'unresolved'
    };
    complaints.push(newComplaint);
    await writeComplaints(complaints);
    res.json({ success: true, data: newComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/clusters', async (req, res) => {
  try {
    const complaints = await readComplaints();
    const clusters = detectClusters(complaints);
    res.json({ success: true, data: clusters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const complaints = await readComplaints();
    const analytics = getAnalytics(complaints);
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
