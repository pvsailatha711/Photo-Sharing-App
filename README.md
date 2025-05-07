# Photo-Sharing-App

Project Overview:
The Photo Sharing App allows users to upload, view, and share photos with others in a social media-style platform. The app enables users to register, log in, post photos, like/dislike photos, and comment on them. It incorporates essential features for building a scalable and interactive web application, including user authentication, image storage, and interactive elements.

Features:
User Authentication: Users can register and log in to the app securely using their email and password.

Photo Uploading: Users can upload photos to the platform, which are stored in the database.

Likes and Dislikes: Users can like or dislike photos, creating engagement on posts.

Comments Section: Users can add comments to photos and mention other users using @mentions functionality.

User Profiles: View user profiles to see their posted photos, liked photos, and other activities.

Responsive Design: The app is built with a responsive design, ensuring compatibility with both mobile and desktop screens.

Technologies Used:
Frontend: React.js, React Router, Material-UI

Backend: Node.js, Express.js

Database: MongoDB

Image Storage: Cloudinary or local server storage

Authentication: JWT for secure user login and registration

State Management: React Context or Redux for global state handling

Setup Instructions:
Clone the repository: git clone https://github.com/pvsailatha711/Photo-Sharing-App.

Install backend dependencies: cd backend && npm install.

Install frontend dependencies: cd frontend && npm install.

Set up MongoDB (locally or through MongoDB Atlas).

Configure environment variables in the .env files for MongoDB connection, Cloudinary (for photo upload), etc.

Run the backend server: npm start.

Run the frontend app: npm start in the frontend folder.

Visit http://localhost:3000 to interact with the app.

Contributing
Feel free to fork the repository and contribute! Create an issue for any bugs or feature requests. Please follow the code of conduct and make sure to write tests for any new feature added.
