exports.getAwarenessMetrics = async () => {
  return {
    citizensReached: 12500,
    engagementRate: 64,
    feedbackCollected: 2300,
    topProject: 'Smart Road Development',
    lastUpdated: new Date()
  };
};

exports.getProjectPerformance = async () => {
  return [
    { projectId: '1', name: 'Smart Road Development', engagement: 85, feedback: 450 },
    { projectId: '2', name: 'Bridge Construction', engagement: 72, feedback: 380 },
    { projectId: '3', name: 'Hospital Upgrade', engagement: 68, feedback: 320 },
    { projectId: '4', name: 'Water Supply System', engagement: 55, feedback: 280 }
  ];
};
