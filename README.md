# React + Node.js App

A basic React application with Node.js backend, featuring modern development tools and a clean, responsive UI.

## Features

- ⚛️ **React 18** with functional components and hooks
- 🚀 **Node.js/Express** backend server
- 📦 **Webpack 5** for bundling and development
- 🎨 **Modern CSS** with responsive design
- 🔥 **Hot reload** for development
- 📱 **Mobile-friendly** interface

## Components

- **Header**: Navigation bar with gradient background
- **Counter**: Interactive counter with increment/decrement/reset
- **TodoList**: Full CRUD todo list with add, toggle, and delete functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server (React frontend):
```bash
npm run dev
```
This will start the webpack dev server on http://localhost:3000

In a separate terminal, start the Node.js backend:
```bash
npm run server
```
This will start the Express server on http://localhost:5000

### Production

Build the React app for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Header.js
│   │   ├── Counter.js
│   │   └── TodoList.js
│   ├── App.js             # Main App component
│   ├── index.js           # React entry point
│   └── *.css              # Component styles
├── server.js              # Node.js/Express server
├── webpack.config.js      # Webpack configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/todos` - Get all todos (mock data)

## Technologies Used

- **Frontend**: React, Webpack, Babel
- **Backend**: Node.js, Express
- **Styling**: CSS3 with modern features
- **Development**: Webpack Dev Server, Hot Module Replacement

## Scripts

- `npm run dev` - Start development server (React)
- `npm run server` - Start Node.js server
- `npm run build` - Build for production
- `npm start` - Start production server

Enjoy building with React and Node.js! 🎉
