# Quick Start Guide - HyperGov Frontend

## Prerequisites
- Node.js installed
- Project dependencies installed (`npm install`)

## Running the Application

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   Open your browser and navigate to: `http://localhost:3000`

## Available Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` or `/index.html` | Landing page with features |
| Sign In | `/signin.html` | User authentication |
| Sign Up | `/signup.html` | User registration |
| About | `/about.html` | About the platform |
| FAQs | `/faq.html` | Frequently asked questions |
| Analytics | `/analytics.html` | Platform statistics and charts |
| Feedback | `/feedback.html` | Submit feedback or report issues |

## Features Implemented

### ✅ Pages
- [x] Home page with hero section
- [x] Sign in page
- [x] Sign up page
- [x] About page
- [x] FAQs page with accordion
- [x] Analytics page with charts
- [x] Feedback page

### ✅ Components
- [x] Responsive header with navigation
- [x] Mobile hamburger menu
- [x] Footer with links
- [x] Feature cards
- [x] Statistics cards
- [x] Forms with validation

### ✅ Animations
- [x] Page load fade-in
- [x] Scroll-triggered animations
- [x] Hover effects on buttons/links
- [x] Smooth transitions
- [x] Animated counters
- [x] Interactive charts
- [x] Accordion expand/collapse

### ✅ Functionality
- [x] Form validation
- [x] API integration ready
- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] Keyboard accessibility

## Testing the Forms

### Sign Up
1. Go to `/signup.html`
2. Fill in all fields
3. Password must be at least 6 characters
4. Passwords must match
5. Submit to see success message

### Sign In
1. Go to `/signin.html`
2. Enter email and password
3. Submit to see success message

### Feedback
1. Go to `/feedback.html`
2. Fill in all fields
3. Select a category
4. Submit to see success message

## Customization

### Change Colors
Edit `public/css/styles.css` and modify CSS variables:
```css
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --dark: #1f2937;
  --light: #f9fafb;
}
```

### Add New Page
1. Create new HTML file in `public/`
2. Copy header/footer from existing page
3. Add your content
4. Link CSS and JS files

### Modify Navigation
Edit the `<nav>` section in each HTML file to add/remove links.

## API Endpoints

The frontend is configured to work with these API endpoints:

- `POST /api/v1/auth/signin` - Sign in
- `POST /api/v1/auth/signup` - Sign up
- `POST /api/v1/feedback` - Submit feedback

## Troubleshooting

### Port Already in Use
If port 3000 is busy, modify `src/config/env.js` to use a different port.

### Static Files Not Loading
Ensure the server is running and check browser console for errors.

### Forms Not Submitting
Check browser console for network errors and verify API endpoints are accessible.

## Next Steps

1. Implement actual authentication logic in backend
2. Add database models for users and feedback
3. Create protected routes for authenticated users
4. Add real-time project data to analytics
5. Implement notification system
6. Add user dashboard

## Support

For issues or questions, use the Feedback page or check the main README.md file.
