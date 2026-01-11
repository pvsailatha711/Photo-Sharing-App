# Photo-Sharing-App

A full-stack web application for sharing and managing photos with social features including user authentication, photo uploads, comments, and likes.

## Overview

This photo-sharing platform allows users to create accounts, upload photos, view other users' photos, and interact through comments and likes. Built with React on the frontend and Express.js with MongoDB on the backend, the application provides a modern, responsive interface for social photo sharing.

## Features

### User Management
- User registration with unique login credentials
- Secure login and logout functionality
- Session-based authentication
- User profiles with personal information (location, occupation, description)

### Photo Management
- Upload photos with automatic file naming
- View photos organized by user
- Photo metadata including upload date and time
- Like/unlike photos

### Social Features
- Comment on photos
- View user lists and profiles
- Browse photos by user
- Real-time interaction tracking

## Technology Stack

### Frontend
- React 18.2.0
- React Router 6.27.0 for navigation
- Material-UI (MUI) for UI components
- Axios for HTTP requests
- Webpack for bundling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Express-session for authentication
- Multer for file uploads
- Body-parser for request parsing

## Project Structure

```
project8/
├── components/          # React components
│   ├── TopBar/         # Navigation bar component
│   ├── UserList/       # User listing component
│   ├── UserDetail/     # User profile component
│   ├── UserPhotos/     # Photo gallery component
│   ├── LoginRegister/  # Authentication component
│   └── CommentsPopup/  # Comment interface component
├── schema/             # MongoDB schemas
│   ├── user.js        # User model
│   ├── photo.js       # Photo model
│   └── schemaInfo.js  # Schema metadata
├── images/            # Uploaded photo storage
├── lib/               # Utility libraries
├── styles/            # CSS stylesheets
├── webServer.js       # Express server configuration
├── photoShare.jsx     # Main React application
└── loadDatabase.js    # Database initialization
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn package manager

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/pvsailatha711/Photo-Sharing-App.git
cd Photo-Sharing-App
```

2. Install dependencies:
```bash
npm install
```

3. Start MongoDB:
```bash
mongod
```

4. Load initial database (if available):
```bash
node loadDatabase.js
```

5. Build the frontend:
```bash
npm run build
```

6. Start the server:
```bash
node webServer.js
```

7. Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /admin/login` - User login
- `POST /admin/logout` - User logout
- `POST /user` - User registration

### User Operations
- `GET /user/list` - Get all users
- `GET /user/:id` - Get user details

### Photo Operations
- `GET /photosOfUser/:id` - Get photos for a specific user
- `POST /photos/new` - Upload a new photo
- `POST /likePhoto/:photoId` - Like/unlike a photo

### Comments
- `POST /commentsOfPhoto/:photo_id` - Add a comment to a photo

### Testing
- `GET /test/info` - Database schema information
- `GET /test/counts` - Collection document counts

## Development

### Build Commands
- `npm run build` - Build the project once
- `npm run build:w` - Build with watch mode for development
- `npm run lint` - Run ESLint for code quality

### Configuration Files
- `.eslintrc.json` - ESLint configuration
- `.babelrc` - Babel transpiler configuration
- `webpack.config.js` - Webpack bundler configuration
- `nodemon.json` - Nodemon development server configuration

## Database Schema

### User Collection
- login_name (unique)
- password
- first_name
- last_name
- location
- description
- occupation

### Photo Collection
- file_name
- date_time
- user_id (reference to User)
- comments (array)
- likes (array of user IDs)

### Comment Schema
- comment (text)
- user_id (reference to User)
- date_time

## Security Considerations

- Session-based authentication
- Login required for photo uploads and comments
- User validation on all protected routes
- Unique username enforcement