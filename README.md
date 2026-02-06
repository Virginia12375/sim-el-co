Sim El Co. - Electrical Services Website
Project Overview
Sim El Co. is a professional electrical services website for a freelance electrician based in Nairobi, Kenya. The website showcases electrical services, customer reviews, contact information, and features a modern, responsive design with both frontend and backend functionality.

Technology Stack
Frontend
HTML5 - Semantic markup structure
CSS3 - Custom styling with animations and responsive design
JavaScript - Dynamic functionality (reviews system, animations, form handling)
Font Awesome - Icon library
Google Fonts - Pacifico and Tagesschrift fonts

Backend
Django 5.1.7 - Python web framework
Django REST Framework - API development
SQLite - Database (default for development)
CORS Headers - Cross-origin resource sharing

Project Structure
text
project/
├── backend/                    # Django backend
│   ├── __pycache__/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py            # Django settings
│   ├── urls.py                # URL routing
│   └── wsgi.py
├── reviews/                    # Django app for reviews
│   ├── migrations/
│   │   └── 0001_initial.py   # Database migration
│   ├── __pycache__/
│   ├── __init__.py
│   ├── admin.py              # Django admin config
│   ├── apps.py               # App configuration
│   ├── models.py             # Review data model
│   ├── serializers.py        # API serializers
│   ├── tests.py
│   ├── urls.py               # API endpoints
│   └── views.py              # API views
├── manage.py                  # Django management script
├── static/                    # Static files
│   ├── django.js             # Main JavaScript file
│   ├── index.html            # Main HTML file
│   ├── script.js             # Legacy JavaScript (optional)
│   ├── styles.css            # Main CSS file
│   └── images/               # Image assets
│       ├── logo.png
│       ├── home.jpg
│       ├── person.jpeg
│       └── service1.jpeg
└── README.md                  # This file

Features
1. Responsive Design
Mobile-first approach with hamburger menu
Grid and flexbox layouts
Smooth scrolling navigation

2. Django Backend API
RESTful API for customer reviews
CRUD operations for reviews
SQLite database with Review model
CORS enabled for frontend-backend communication

3. Interactive Reviews System
Submit new reviews with star ratings
Filter reviews by star rating (1-5 stars)
Pagination (4 reviews per page)
Show more/less functionality for long reviews
Server sync with localStorage fallback

4. Service Sections
Residential, Commercial, and Industrial electrical services
Energy solutions and specialized services
Animated service cards on scroll

6. Contact & Request Forms
Service request form with validation
Contact information with business hours
WhatsApp integration for instant chat

6. Visual Features
Gradient color schemes with gold/yellow accents
Custom logo design
Font Awesome icons throughout
Notification system for user feedback
Animated elements and hover effects

Setup Instructions
Prerequisites
Python 3.8+
Django 5.1.7+
Modern web browser
Backend Setup
bash

# Clone or navigate to project directory
cd project/

# Install dependencies
pip install django djangorestframework django-cors-headers

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
Server runs at: http://127.0.0.1:8000

Frontend Setup
Place all static files (HTML, CSS, JS, images) in your web server directory
Update API URL in django.js if needed (line 5)
Open index.html in a web browser

API Endpoints
GET /api/reviews/ - List all reviews
POST /api/reviews/ - Create new review
Reviews are ordered by -created_at (newest first)

Configuration
Django Settings (settings.py)
DEBUG = True (change to False in production)
ALLOWED_HOSTS = [] (add your domain in production)
CORS_ALLOW_ALL_ORIGINS = True (restrict in production)
SECRET_KEY should be changed in production
JavaScript Configuration (django.js)
javascript
const API_URL = "http://127.0.0.1:8000/api/reviews/";
const FALLBACK_TO_LOCAL = true; // Use localStorage if server unavailable

Responsive Breakpoints
Mobile: < 768px (hamburger menu, single-column layouts)
Tablet: 768px - 968px (adaptive grid layouts)
Desktop: > 968px (full navigation, multi-column grids)

Design Features
Color Scheme: Dark theme with gold/yellow accents
Typography: Pacifico for headings, Tagesschrift for accents
Animations: Fade-in, slide-up, hover transformations
Visual Hierarchy: Clear section separation with gradient headers

Security Notes
Change Django's SECRET_KEY in production
Set DEBUG = False in production
Configure proper ALLOWED_HOSTS
Restrict CORS origins in production
Use HTTPS in production
Consider using environment variables for sensitive data

Contact Integration

Fallback Systems
Reviews persist in localStorage if Django server is unavailable
Form validation prevents empty submissions
Graceful degradation for older browsers

Deployment Considerations
For Production:
Use PostgreSQL or MySQL instead of SQLite
Configure static files serving (WhiteNoise or CDN)
Set up proper CORS policies
Implement CSRF protection
Use environment variables for configuration
Set up SSL/TLS certificates
Configure Django admin with secure credentials

Troubleshooting
Common Issues:
CORS Errors
Ensure corsheaders is in INSTALLED_APPS
Check CORS_ALLOW_ALL_ORIGINS = True in development
Database Issues
Run python manage.py migrate
Check SQLite file permissions
Static Files Not Loading
Ensure correct file paths
Check browser console for 404 errors
API Not Responding
Verify Django server is running
Check API URL in django.js
Look for errors in Django terminal

Future Enhancements
User authentication for review management
Image uploads for project galleries
Appointment scheduling system
Email notification integration
Multi-language support
Analytics integration

License
© 2024 GinRev™. All rights reserved.

Developer Notes
The project uses a hybrid approach with Django API and vanilla JS frontend
CSS is organized with mobile-first responsive design
JavaScript includes comprehensive error handling and fallbacks

Code includes comments for major functionality sections
