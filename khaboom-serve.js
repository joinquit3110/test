#!/usr/bin/env node

// Kha-Boom! Custom Server
// This script extends the original Mathigon server with our custom Kha-Boom! routes

const path = require('path');
const fs = require('fs');
const express = require('express');

// Import the original MathigonStudioApp class
const { MathigonStudioApp } = require('@mathigon/studio/server/app');

// Create a new MathigonStudioApp instance
const app = new MathigonStudioApp();

// Configure the app
app.secure()
   .setup({sessionSecret: 'khaboom-secret'});

// Add our custom view paths
app.express.set('views', [
  path.join(__dirname, 'templates'),  // Our custom templates directory
  path.join(__dirname, 'node_modules/@mathigon/studio/server/templates')  // Original templates
]);

// Ensure the sidebar component directory exists and is accessible
const sidebarSourceDir = path.join(__dirname, 'frontend/components/sidebar');
const serverFrontendDir = path.join(__dirname, 'server/frontend/components/sidebar');
if (!fs.existsSync(serverFrontendDir)) {
  fs.mkdirSync(serverFrontendDir, { recursive: true });
  
  // Copy sidebar.pug and share.pug to the server directory
  const files = ['sidebar.pug', 'share.pug'];
  files.forEach(file => {
    const source = path.join(sidebarSourceDir, file);
    const dest = path.join(serverFrontendDir, file);
    if (fs.existsSync(source) && !fs.existsSync(dest)) {
      fs.copyFileSync(source, dest);
      console.log(`Copied ${file} to server directory`);
    }
  });
}

// Intercept course rendering to use our custom Kha-Boom! template
app.express.use('/course/:courseId*', (req, res, next) => {
  // Store the original render function
  const originalRender = res.render;
  
  // Override the render function
  res.render = function(view, options, callback) {
    // If this is the course template, replace it with our custom template
    if (view === 'course') {
      console.log('Using Kha-Boom! custom course template');
      view = 'khaboom-course';
    }
    
    // Call the original render function with our modified options
    return originalRender.call(this, view, options, callback);
  };
  
  next();
});

// Serve static files from our public directory
app.express.use('/khaboom', express.static(path.join(__dirname, 'public/khaboom')));

// Helper function to generate course data
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

// Make sure frontend directory exists for the logo
const logoDir = path.join(__dirname, 'public/frontend');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Copy the logo to make it accessible via public URL
const logoSource = path.join(__dirname, 'frontend/logokb.png');
const logoDest = path.join(logoDir, 'logokb.png');
if (fs.existsSync(logoSource) && !fs.existsSync(logoDest)) {
  fs.copyFileSync(logoSource, logoDest);
}

// Kha-Boom! routes
app.express.get('/khaboom', (req, res) => {
  res.render('khaboom/index', {
    title: 'Kha-Boom! - Interactive Learning',
    bodyClass: 'landing-page'
  });
});

app.express.get('/khaboom/dashboard', (req, res) => {
  const courses = getCourseMetadata(path.join(__dirname, 'content'));
  
  res.render('khaboom/dashboard', {
    title: 'Dashboard - Kha-Boom!',
    bodyClass: 'dashboard-page',
    courses: courses
  });
});

app.express.get('/khaboom/about', (req, res) => {
  res.render('khaboom/index', {
    title: 'About - Kha-Boom!',
    bodyClass: 'about-page'
  });
});

// Process SCSS file to CSS
app.express.get('/khaboom/styles.css', (req, res) => {
  const scss = fs.readFileSync(path.join(__dirname, 'templates/khaboom/styles.scss'), 'utf8');
  // In a real implementation, this would use a SCSS processor
  res.type('text/css');
  res.send(scss);
});

// Serve main.js
app.express.get('/khaboom/main.js', (req, res) => {
  const js = fs.readFileSync(path.join(__dirname, 'templates/khaboom/main.js'), 'utf8');
  res.type('application/javascript');
  res.send(js);
});

// Original routes modified to include redirection to Kha-Boom!
app.get('/', (req, res) => {
  // Redirect to our Kha-Boom! landing page
  res.redirect('/khaboom');
})
.course({})  // Add course functionality from original Mathigon
.errors()    // Add error handling
.listen(5000);

console.log('Kha-Boom! server running at http://localhost:5000/khaboom');
