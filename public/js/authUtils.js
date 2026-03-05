// Authentication utility functions
function isAuthenticated() {
  return localStorage.getItem('user') !== null;
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/auth.html';
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/auth.html';
    return false;
  }
  return true;
}

// Update navigation based on auth status
function updateNavigation() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;
  
  // Remove any existing auth elements
  const existingAuthElements = navLinks.querySelectorAll('.auth-element');
  existingAuthElements.forEach(el => el.remove());
  
  const user = getUser();
  
  if (user) {
    // Hide original auth buttons
    const authLinks = navLinks.querySelectorAll('.btn');
    authLinks.forEach(link => {
      if (link.textContent.includes('Sign')) {
        link.style.display = 'none';
      }
    });
    
    // Add user info
    const userInfo = document.createElement('li');
    userInfo.className = 'auth-element';
    userInfo.innerHTML = `<span style="color: #3498db;">Welcome, ${user.name || user.email}</span>`;
    navLinks.appendChild(userInfo);
    
    // Add logout button
    const logoutBtn = document.createElement('li');
    logoutBtn.className = 'auth-element';
    logoutBtn.innerHTML = '<a href="#" class="btn btn-secondary" onclick="logout()">Logout</a>';
    navLinks.appendChild(logoutBtn);
  } else {
    // Show original auth buttons
    const authLinks = navLinks.querySelectorAll('.btn');
    authLinks.forEach(link => {
      if (link.textContent.includes('Sign')) {
        link.style.display = '';
      }
    });
  }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();
});