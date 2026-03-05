# HyperGov Frontend

A modern, responsive frontend for the Hyperlocal Governance Engine with smooth animations and interactive features.

## Pages

### 1. Home Page (`index.html`)
- Hero section with call-to-action buttons
- Feature cards showcasing platform capabilities
- Responsive grid layout
- Smooth scroll animations

### 2. Sign In (`signin.html`)
- Email and password authentication
- Form validation
- Error/success alerts
- Redirect to home on success

### 3. Sign Up (`signup.html`)
- User registration form
- Password confirmation
- Client-side validation
- Redirect to sign in on success

### 4. About Page (`about.html`)
- Mission statement
- Problem and solution overview
- Technology stack details
- Core values

### 5. FAQs Page (`faq.html`)
- Interactive accordion
- 10 common questions
- Keyboard accessible
- Smooth expand/collapse animations

### 6. Analytics Page (`analytics.html`)
- Animated statistics counters
- Project distribution chart
- Engagement trends visualization
- Recent project updates

### 7. Feedback Page (`feedback.html`)
- Multi-field feedback form
- Category selection
- Character counter
- Form submission with loading state

## Features

### Animations
- Fade-in on page load
- Slide-up for cards and sections
- Hover effects on buttons and links
- Smooth transitions throughout
- Animated number counters
- Interactive charts

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile
- Flexible grid layouts
- Touch-friendly interactions

### Accessibility
- Keyboard navigation
- ARIA labels
- Focus states
- Semantic HTML

### Performance
- Minimal dependencies (vanilla JS)
- Optimized animations
- Lazy loading for scroll animations
- Efficient event handlers

## File Structure

```
public/
├── css/
│   └── styles.css          # All styles and animations
├── js/
│   ├── main.js            # Common functionality
│   ├── auth.js            # Authentication handlers
│   ├── faq.js             # FAQ accordion
│   ├── analytics.js       # Charts and counters
│   └── feedback.js        # Feedback form handler
├── images/                # Image assets
├── index.html             # Home page
├── signin.html            # Sign in page
├── signup.html            # Sign up page
├── about.html             # About page
├── faq.html               # FAQs page
├── analytics.html         # Analytics page
└── feedback.html          # Feedback page
```

## API Endpoints Used

- `POST /api/v1/auth/signin` - User authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/feedback` - Submit feedback

## Styling

### Color Scheme
- Primary: #2563eb (Blue)
- Secondary: #10b981 (Green)
- Dark: #1f2937
- Light: #f9fafb
- Gray: #6b7280

### Typography
- Font Family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Base Size: 16px
- Line Height: 1.6

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Getting Started

1. Start the backend server:
```bash
npm run dev
```

2. Open browser and navigate to:
```
http://localhost:3000
```

## Customization

### Adding New Pages
1. Create HTML file in `public/` directory
2. Include header and footer from existing pages
3. Link CSS and JS files
4. Add navigation link in header

### Modifying Styles
- Edit `public/css/styles.css`
- Use CSS variables for consistent theming
- Follow existing naming conventions

### Adding Functionality
- Create new JS file in `public/js/`
- Include in relevant HTML pages
- Use async/await for API calls
- Handle errors gracefully

## Notes

- All forms include client-side validation
- API calls use fetch API
- Animations use CSS transitions and keyframes
- Charts are drawn using Canvas API
- No external libraries required (vanilla JS)
