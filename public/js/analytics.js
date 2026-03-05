// Animate numbers
function animateValue(element, start, end, duration, prefix = '', suffix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = prefix + value.toLocaleString() + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Load analytics data
document.addEventListener('DOMContentLoaded', async () => {
  // Simulate loading analytics data
  setTimeout(() => {
    animateValue(document.getElementById('totalProjects'), 0, 247, 2000);
    animateValue(document.getElementById('totalUsers'), 0, 15432, 2000);
    animateValue(document.getElementById('totalBudget'), 0, 45, 2000, '$', 'M');
    animateValue(document.getElementById('completionRate'), 0, 68, 2000, '', '%');
    animateValue(document.getElementById('notifications'), 0, 89234, 2000);
    animateValue(document.getElementById('feedback'), 0, 3421, 2000);
    animateValue(document.getElementById('avgResponse'), 0, 12, 2000, '', 'h');
    animateValue(document.getElementById('satisfaction'), 0, 94, 2000, '', '%');
  }, 300);

  // Simple bar chart for categories
  drawCategoryChart();
  drawEngagementChart();
});

function drawCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  
  const categories = [
    { name: 'Infrastructure', value: 35, color: '#2563eb' },
    { name: 'Parks & Recreation', value: 25, color: '#10b981' },
    { name: 'Water & Sanitation', value: 20, color: '#f59e0b' },
    { name: 'Public Buildings', value: 15, color: '#8b5cf6' },
    { name: 'Other', value: 5, color: '#6b7280' }
  ];
  
  const barWidth = canvas.width / categories.length - 20;
  const maxValue = Math.max(...categories.map(c => c.value));
  
  categories.forEach((cat, index) => {
    const barHeight = (cat.value / maxValue) * (canvas.height - 60);
    const x = index * (barWidth + 20) + 10;
    const y = canvas.height - barHeight - 40;
    
    // Draw bar
    ctx.fillStyle = cat.color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw value
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cat.value + '%', x + barWidth / 2, y - 5);
    
    // Draw label
    ctx.font = '12px sans-serif';
    ctx.fillText(cat.name, x + barWidth / 2, canvas.height - 20);
  });
}

function drawEngagementChart() {
  const canvas = document.getElementById('engagementChart');
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = [1200, 1900, 2400, 2100, 2800, 3200];
  
  const maxValue = Math.max(...data);
  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const pointSpacing = chartWidth / (data.length - 1);
  
  // Draw axes
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();
  
  // Draw line
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  data.forEach((value, index) => {
    const x = padding + index * pointSpacing;
    const y = canvas.height - padding - (value / maxValue) * chartHeight;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Draw points
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw labels
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(months[index], x, canvas.height - padding + 20);
    
    // Draw values
    ctx.fillText(value, x, y - 10);
  });
  
  ctx.stroke();
}
