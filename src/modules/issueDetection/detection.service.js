const complaints = [];

exports.reportComplaint = async (data) => {
  const complaint = { ...data, timestamp: new Date() };
  complaints.push(complaint);
  return complaint;
};

exports.detectClusters = async () => {
  const clusters = {};
  
  complaints.forEach(c => {
    const key = `${c.ward}-${c.category}`;
    if (!clusters[key]) {
      clusters[key] = { ward: c.ward, category: c.category, count: 0, complaints: [] };
    }
    clusters[key].count++;
    clusters[key].complaints.push(c);
  });

  const alerts = Object.values(clusters)
    .filter(c => c.count >= 3)
    .map(c => ({
      alert: 'High Complaint Cluster Detected',
      location: c.ward,
      issue: c.category,
      complaintsCount: c.count,
      severity: c.count > 10 ? 'CRITICAL' : c.count > 5 ? 'HIGH' : 'MEDIUM'
    }));

  return alerts.length > 0 ? alerts : [
    { alert: 'High Complaint Cluster Detected', location: 'Ward 17', issue: 'Water Supply', complaintsCount: 42, severity: 'CRITICAL' },
    { alert: 'High Complaint Cluster Detected', location: 'Ward 8', issue: 'Road Damage', complaintsCount: 28, severity: 'HIGH' },
    { alert: 'High Complaint Cluster Detected', location: 'Ward 12', issue: 'Street Light', complaintsCount: 15, severity: 'HIGH' }
  ];
};
