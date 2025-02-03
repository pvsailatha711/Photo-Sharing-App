/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project8'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project8 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");

const server = http.createServer(app);
const io = socketIO(server);


const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require('fs');
const path = require('path');

app.use(session({secret: "secretKey",
resave: false,
saveUninitialized: false,
cookie: {
  secure: false,
  httpOnly: true,
  maxAge: 600000, // Session expiration time (10 minutes in milliseconds)
}}));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require("./schema/activity.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project8", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

app.get("/auth/check-session", (req, res) => {
  if (req.session.user) {
    res.status(200).send({ user: req.session.user });
  } else {
    res.status(401).send("Not authenticated");
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function (request, response) {
  if (!request.session.user) {
    return response.status(401).send("Unauthorized: Please log in.");
  }

  const loggedInUserId = request.session.user._id;
  try {
    // Step 1: Fetch all users
    const users = await User.find({}, "_id first_name last_name");

    // Step 2: Fetch the most recent activity for each user
    const activities = await Activity.aggregate([
      { $sort: { date_time: -1 } }, // Sort activities by latest first
      { $group: { _id: "$user_id", activity: { $first: "$$ROOT" } } }, // Group by user and pick the latest activity
    ]);

    // Step 3: Fetch all related photos in parallel
    const photoIds = activities
      .map((item) => item.activity.photo_id)
      .filter(Boolean); // Collect only valid photo IDs
    const photos = await Photo.find(
      {
        _id: { $in: photoIds },
        $or: [
          { sharing_list: { $exists: false } },
          { sharing_list: null },
          { sharing_list: { $size: 0 } },
          { user_id: loggedInUserId },
          { sharing_list: loggedInUserId },
        ],
      },
      "file_name _id"
    );

    const photoMap = photos.reduce((map, photo) => {
      map[photo._id] = photo.file_name;
      return map;
    }, {});

    // Step 4: Build the response
    const userList = users.map((user) => {
      const activity = activities.find((item) => item._id.equals(user._id));
      const activityDetails = activity
        ? {
            type: activity.activity.activity_type,
            date_time: activity.activity.date_time,
            thumbnail: photoMap[activity.activity.photo_id] || null,
          }
        : null;

      return {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        lastActivity: activityDetails,
      };
    });

    // Step 5: Send the response
    return response.status(200).json(userList);
  } catch (err) {
    console.error("Error fetching user list:", err);
    return response.status(500).send("Internal Server Error");
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
  const id = request.params.id;
  // const user = models.userModel(id);
  try {
    const user = await User.findById(id, "_id first_name last_name location description occupation");
    if (user === null) {
      console.log("User with _id:" + id + " not found.");
      response.status(400).send("Not found");
      return;
    }
    response.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    response.status(400).send("Invalid user ID");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  if (!request.session.user) {
    return response.status(401).send('Unauthorized: User must be logged in to view photos');
  }

  const loggedInUserId = request.session.user._id;
  const requestedUserId = request.params.id;
  try {
    const photos = await Photo.find({
      user_id: requestedUserId,
      $or: [
        { sharing_list: { $exists: false } },
        { sharing_list: null },
        { sharing_list: { $size: 0 } },
        { user_id: loggedInUserId },
        { sharing_list: loggedInUserId }
      ]
    });
    if (photos.length === 0) {
      console.log("Photos for user with _id:" + requestedUserId + " not found.");
      return response.status(400).send("Not found");
    }
    const populatedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const populatedComments = await Promise.all(
          photo.comments.map(async (comment) => {
            const user = await User.findById(comment.user_id, "_id first_name last_name");
            return { ...comment.toObject(), user };
          })
        );
        return { ...photo.toObject(), comments: populatedComments };
      })
    );

    return response.status(200).json(populatedPhotos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    return response.status(400).send("Invalid user ID");
  }
});

// Endpoint to log in a user
app.post('/admin/login', async function (req, res) {
    const { login_name, password } = req.body;
    if (!login_name || !password) {
      return res.status(400).send('Missing login_name');
    }
    try {
      const user = await User.findOne({ login_name });
      if (!user || user.password !== password) {
        return res.status(400).send('Invalid login_name or password');
      }
      req.session.user = { _id: user._id, first_name: user.first_name, last_name: user.last_name };
      const newActivity = new Activity({
        activity_type: "User Login",
        user_id: req.session.user._id,
      });
      await newActivity.save();

      // Broadcast the new activity
      io.emit("newActivity", {
          activity_type: "User Login",
          user_id: req.session.user._id,
          date_time: new Date()
      });
      return res.status(200).send({
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } catch (err) {
      return res.status(500).send('Internal Server Error');
    }
});

// Logout endpoint
app.post('/admin/logout', async function (req, res) {
  if (!req.session.user) {
    return res.status(400).send('Not logged in');
  }
  try {
    const userId = req.session.user._id;
    await new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          reject(new Error('Error logging out'));
        } else {
          resolve();
        }
      });
    });

    // Broadcast the new activity
    io.emit("newActivity", {
        activity_type: "User Logout",
        user_id: userId,
        date_time: new Date()
    });

    // Save the logout activity
    const newActivity = new Activity({
      activity_type: "User Logout",
      user_id: userId,
    });
    await newActivity.save();
    return res.status(200).send('Logged out');
  } catch (error) {
    return res.status(500).send(error);
  }
});

// POST endpoint to add a comment to a photo
app.post('/commentsOfPhoto/:photo_id', async function (req, res) {
    const { photo_id } = req.params;
    const { comment, fileName } = req.body;

    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).send('Unauthorized: User must be logged in to comment');
    }

    // Validate comment input
    if (!comment || comment.trim() === '') {
      return res.status(400).send('Comment cannot be empty');
    }

    try {
      // Find the photo to add the comment to
      const photo = await Photo.findById(photo_id);
      if (!photo) {
        return res.status(404).send('Photo not found');
      }

      // Create a comment object
      const newComment = {
          comment: comment,
          user_id: req.session.user._id,
          date_time: new Date(),
      };
      // Add the comment to the photo's comments array and save
      photo.comments.push(newComment);
      await photo.save();
      const newActivity = new Activity({
        activity_type: "New Comment",
        user_id: req.session.user._id,
        photo_id: photo._id,
      });

      // Broadcast the new activity
      io.emit("newActivity", {
          activity_type: "New Comment",
          user_id: req.session.user._id,
          date_time: new Date(),
          photo_id: fileName,
      });
      await newActivity.save();      
      return res.status(200).send(newComment); // Return the added comment
    } catch (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'images')); // Directory to store uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueName = req.session.user.last_name + '-' + Date.now() + '.jpg';
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

app.post('/photos/new', upload.single('photo'), async function (req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  if (!req.session.user) {
    return res.status(401).send('Unauthorized: User must be logged in to upload photos');
  }
  try {
    const sharingList = req.body.sharing_list ? JSON.parse(req.body.sharing_list) : null;
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.user._id,
      sharing_list: sharingList ? sharingList.map(id => new mongoose.Types.ObjectId(id)) : null
    });
    await newPhoto.save();
    const newActivity = new Activity({
      activity_type: "Photo Upload",
      user_id: req.session.user._id,
      photo_id: newPhoto._id,
    });
    await newActivity.save();    

    // Broadcast the new activity
    io.emit("newActivity", {
        activity_type: "Photo Upload",
        user_id: req.session.user._id,
        photo_id: req.file.filename,
        date_time: new Date()
    });
    return res.status(200).send(newPhoto);
  } catch (err) {
    console.error('Error uploading photo:', err);

    // Clean up the uploaded file if the database operation fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting file after upload failure:', unlinkErr);
        }
      });
    }
    return res.status(500).send('Internal Server Error');
  }
});

app.post('/user', async function (req, res) {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send('All required fields (login_name, password, first_name, last_name) must be provided');
  }

  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send('A user with this login_name already exists');
    }
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    await newUser.save();
    
    // Broadcast the new activity
    io.emit("newActivity", {
        activity_type: "Registered as a user",
        user_id: newUser._id,
        date_time: new Date()
    });
    const newActivity = new Activity({
      activity_type: "Registered as a user",
      user_id: newUser._id,
    });
    await newActivity.save();  

    return res.status(200).send({
      login_name: newUser.login_name,
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).send('Internal Server Error');
  }
});

app.get('/user/:id/photos/recent', async function (req, res) {
  const userId = new mongoose.Types.ObjectId(req.params.id);
  const loggedInUserId = req.session.user._id;

  try {
    const allPhotosUnsorted = await Photo.find({
      user_id: userId,
      $or: [
        { sharing_list: { $exists: false } },
        { sharing_list: null },
        { sharing_list: { $size: 0 } },
        { user_id: loggedInUserId },
        { sharing_list: loggedInUserId }
      ]
    });

    if (allPhotosUnsorted.length === 0) {
      return res.status(404).send('No photos found for user.');
    }

    const recentPhoto = await Photo.findOne({
      user_id: userId,
      $or: [
        { sharing_list: { $exists: false } },
        { sharing_list: null },
        { sharing_list: { $size: 0 } },
        { user_id: loggedInUserId },
        { sharing_list: loggedInUserId }
      ]
    }).sort({ date_time: -1 });

    const originalIndex = allPhotosUnsorted.findIndex(photo => photo._id.equals(recentPhoto._id));

    return res.status(200).json({ photo: recentPhoto, originalIndex });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});

app.get('/user/:id/photos/top-commented', async function (req, res) {
  const loggedInUserId = req.session.user._id;
  try {
    const userId = new mongoose.Types.ObjectId(req.params.id);

    // Step 1: Fetch all photos for the user
    const allPhotosUnsorted = await Photo.find({ user_id: userId });
    if (!allPhotosUnsorted || allPhotosUnsorted.length === 0) {
      return res.status(404).send('No photos found for user.');
    }

    // Step 2: Filter photos visible to the logged-in user
    const visiblePhotos = allPhotosUnsorted.filter(photo => {
      return (
        photo.sharing_list === null ||
        photo.sharing_list.length === 0 ||
        photo.sharing_list.includes(loggedInUserId.toString()) ||
        photo.user_id.equals(loggedInUserId)
      );
    });

    if (visiblePhotos.length === 0) {
      return res.status(404).send('No visible photos found for user.');
    }

    // Step 3: Find the most commented photo
    const topCommentedPhoto = visiblePhotos.reduce((maxPhoto, currentPhoto) => {
      const currentComments = currentPhoto.comments.length;
      const maxComments = maxPhoto ? maxPhoto.comments.length : 0;
      return currentComments > maxComments ? currentPhoto : maxPhoto;
    }, null);

    if (!topCommentedPhoto) {
      return res.status(404).send('No commented photos found.');
    }

    // Step 4: Find the original index of the most commented photo
    const originalIndex = allPhotosUnsorted.findIndex(photo => photo._id.equals(topCommentedPhoto._id));

    return res.status(200).json({ photo: topCommentedPhoto, originalIndex });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});

app.get("/activities", async function (req, res) {
  const loggedInUserId = req.session.user._id;

  try {
    // Step 1: Fetch a larger set of activities
    const activities = await Activity.find({})
      .sort({ date_time: -1 })
      .limit(20)
      .populate("user_id", "first_name last_name");

    // Step 2: Fetch all related photos in parallel
    const photoIds = activities.map(activity => activity.photo_id).filter(Boolean);
    const photos = await Photo.find({ _id: { $in: photoIds } });

    // Create a mapping of photoId -> photo for easy lookup
    const photoMap = photos.reduce((acc, photo) => {
      acc[photo._id] = photo;
      return acc;
    }, {});

    // Step 3: Filter activities based on visibility rules
    const visibleActivities = activities.filter(activity => {
      if (!activity.photo_id) {
        // Public activities (e.g., login, logout, registration)
        return true;
      }

      const photo = photoMap[activity.photo_id];
      if (!photo) {
        return false; // Skip if photo is not found
      }

      // Check visibility for the logged-in user
      const { sharing_list, user_id } = photo;
      return (
        sharing_list === null ||
        sharing_list.length === 0 ||
        sharing_list.includes(loggedInUserId.toString()) ||
        user_id.equals(loggedInUserId)
      );
    });

    // Step 4: Map visible activities to include `file_name` if applicable
    const responseActivities = visibleActivities.map(activity => {
      const photo = photoMap[activity.photo_id];
      return {
        ...activity.toObject(),
        photo: photo ? { file_name: photo.file_name } : null,
      };
    });

    res.status(200).json(responseActivities.slice(0, 5));
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/photos/:photoId/toggleLike', async (req, res) => {
  const loggedInUserId = req.session.user._id;
  const { photoId } = req.params;

  try {
    // Find the photo
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).send('Photo not found');
    }

    // Check if the user has already liked the photo
    const alreadyLiked = photo.likes.includes(loggedInUserId);

    if (alreadyLiked) {
      // Unlike the photo
      photo.likes = photo.likes.filter(userId => !userId.equals(loggedInUserId));
    } else {
      // Like the photo
      photo.likes.push(loggedInUserId);
    }

    // Save the changes
    await photo.save();
    
    return res.status(200).send({
      message: alreadyLiked ? "Photo unliked" : "Photo liked",
      likes: photo.likes,
      likeCount: photo.likes.length,
      liked: !alreadyLiked,
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    return res.status(500).send('Internal Server Error');
  }
});

server.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
