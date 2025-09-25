const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/todos', (req, res) => {
  // Mock data - in a real app, this would come from a database
  const todos = [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build a Node.js app', completed: false },
    { id: 3, text: 'Deploy to production', completed: false }
  ];
  res.json(todos);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000 (run 'npm run dev')`);
  console.log(`🔧 Backend API: http://localhost:${PORT}/api/health`);
});
