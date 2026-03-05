// Feedback Form Handler
const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      category: document.getElementById('category').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };
    
    const alertContainer = document.getElementById('alertContainer');
    const submitButton = feedbackForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading"></span> Submitting...';
    
    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alertContainer.innerHTML = '<div class="alert alert-success">Thank you for your feedback! We\'ll review it shortly.</div>';
        feedbackForm.reset();
        
        // Scroll to alert
        alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        alertContainer.innerHTML = `<div class="alert alert-error">${data.message || 'Failed to submit feedback'}</div>`;
      }
    } catch (error) {
      alertContainer.innerHTML = '<div class="alert alert-error">Network error. Please try again later.</div>';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

// Add character counter for message field
const messageField = document.getElementById('message');
if (messageField) {
  const counterDiv = document.createElement('div');
  counterDiv.style.textAlign = 'right';
  counterDiv.style.fontSize = '0.875rem';
  counterDiv.style.color = 'var(--gray)';
  counterDiv.style.marginTop = '0.25rem';
  messageField.parentElement.appendChild(counterDiv);
  
  messageField.addEventListener('input', () => {
    const length = messageField.value.length;
    counterDiv.textContent = `${length} characters`;
    
    if (length > 500) {
      counterDiv.style.color = '#ef4444';
    } else {
      counterDiv.style.color = 'var(--gray)';
    }
  });
}
