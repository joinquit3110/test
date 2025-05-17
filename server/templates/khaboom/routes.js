// Kha-Boom! Routes
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Helper function to get course metadata
function getCourseMetadata(contentDir) {
  const courses = [];
  
  // Read all directories in the content folder
  const dirs = fs.readdirSync(contentDir).filter(dir => {
    // Only include directories and exclude hidden directories
    const stats = fs.statSync(path.join(contentDir, dir));
    return stats.isDirectory() && !dir.startsWith('_') && !dir.startsWith('.');
  });
  
  // Process each course directory
  for (const dir of dirs) {
    try {
      // Path to the content file
      const contentPath = path.join(contentDir, dir, 'content.md');
      
      // Check if content file exists
      if (fs.existsSync(contentPath)) {
        // Read the content file
        const content = fs.readFileSync(contentPath, 'utf8');
        
        // Extract the title from the first line (# Title)
        const titleMatch = content.match(/^# (.*)/m);
        const title = titleMatch ? titleMatch[1] : dir;
        
        // Extract other metadata
        const levelMatch = content.match(/> level: (.*)/m);
        const level = levelMatch ? levelMatch[1] : 'All Levels';
        
        const colorMatch = content.match(/> color: "(.*?)"/m);
        const color = colorMatch ? colorMatch[1] : '#6B46C1';
        
        // Add course to the list
        courses.push({
          id: dir,
          title: title,
          level: level,
          color: color,
          description: `Explore the fascinating world of ${title} through interactive lessons and engaging exercises.`
        });
      }
    } catch (err) {
      console.error(`Error processing course ${dir}:`, err);
    }
  }
  
  return courses;
}

// Landing page route
router.get('/', (req, res) => {
  res.render('khaboom/index', {
    title: 'Kha-Boom! - Interactive Learning',
    bodyClass: 'landing-page'
  });
});

// Dashboard page route
router.get('/dashboard', (req, res) => {
  const contentDir = path.join(__dirname, '../../content');
  const courses = getCourseMetadata(contentDir);
  
  res.render('khaboom/dashboard', {
    title: 'Dashboard - Kha-Boom!',
    bodyClass: 'dashboard-page',
    courses: courses
  });
});

// About page route (placeholder)
router.get('/about', (req, res) => {
  res.render('khaboom/index', {
    title: 'About - Kha-Boom!',
    bodyClass: 'about-page'
  });
});

// Serve static files
router.use(express.static(path.join(__dirname, '../../public/khaboom')));

// Process SCSS file to CSS
router.use((req, res, next) => {
  if (req.path === '/khaboom/styles.css') {
    const scss = fs.readFileSync(path.join(__dirname, 'styles.scss'), 'utf8');
    // In a real implementation, this would use a SCSS processor
    // For now, we're just serving the SCSS as CSS
    res.type('text/css');
    res.send(scss);
    return;
  }
  next();
});

// Serve main.js
router.use((req, res, next) => {
  if (req.path === '/khaboom/main.js') {
    const js = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
    res.type('application/javascript');
    res.send(js);
    return;
  }
  next();
});

module.exports = router;
