// Sign In Form Handler
const signinForm = document.getElementById('signinForm');
if (signinForm) {
  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const alertContainer = document.getElementById('alertContainer');
    
    try {
      const response = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alertContainer.innerHTML = '<div class="alert alert-success">Sign in successful! Redirecting...</div>';
        setTimeout(() => window.location.href = '/', 1500);
      } else {
        alertContainer.innerHTML = `<div class="alert alert-error">${data.message || 'Sign in failed'}</div>`;
      }
    } catch (error) {
      alertContainer.innerHTML = '<div class="alert alert-error">Network error. Please try again.</div>';
    }
  });
}

// Sign Up Form Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const alertContainer = document.getElementById('alertContainer');
    
    if (password !== confirmPassword) {
      alertContainer.innerHTML = '<div class="alert alert-error">Passwords do not match!</div>';
      return;
    }
    
    if (password.length < 6) {
      alertContainer.innerHTML = '<div class="alert alert-error">Password must be at least 6 characters long!</div>';
      return;
    }
    
    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alertContainer.innerHTML = '<div class="alert alert-success">Account created successfully! Redirecting to sign in...</div>';
        setTimeout(() => window.location.href = '/signin.html', 1500);
      } else {
        alertContainer.innerHTML = `<div class="alert alert-error">${data.message || 'Sign up failed'}</div>`;
      }
    } catch (error) {
      alertContainer.innerHTML = '<div class="alert alert-error">Network error. Please try again.</div>';
    }
  });
}
