/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project7'.
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
 * /test/counts - Returns the population counts of the project7 collections in the
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


const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require('path');

app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project7", {
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

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function (request, response) {
  // response.status(200).send(models.userListModel());
  try {
    const users = await User.find({}, "_id first_name last_name");
    response.status(200).json(users);
  } catch (err) {
    console.error("Error fetching user list:", err);
    response.status(400).send(err);
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
  const id = request.params.id;
  // const photos = models.photoOfUserModel(id);
  try {
    const photos = await Photo.find({ user_id: id }, "_id user_id comments file_name date_time");
    if (photos.length === 0) {
      console.log("Photos for user with _id:" + id + " not found.");
      response.status(400).send("Not found");
      return;
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

    response.status(200).json(populatedPhotos);
  } catch (err) {
    console.error("Error fetching photos:", err);
    response.status(400).send("Invalid user ID");
  }
});

// Endpoint to log in a user
app.post('/admin/login', async function (req, res) {
    const { login_name } = req.body;
    if (!login_name) {
      return res.status(400).send('Missing login_name');
    }
    try {
      const user = await User.findOne({ login_name });
      if (!user) {
        return res.status(400).send('Invalid login_name');
      }
      req.session.user = { _id: user._id, first_name: user.first_name, last_name: user.last_name };
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
    await new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          reject(new Error('Error logging out'));
        } else {
          resolve();
        }
      });
    });
    return res.status(200).send('Logged out');
  } catch (error) {
    return res.status(500).send(error);
  }
});

// Middleware to check if user is logged in
app.use(function (req, res, next) {
  if (!req.session.user) {
      return res.redirect('/photo-share.html');
  }
  return next();
});
// POST endpoint to add a comment to a photo
app.post('/commentsOfPhoto/:photo_id', async function (req, res) {
    const { photo_id } = req.params;
    const { comment } = req.body;

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
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.user._id
    });
    await newPhoto.save();
    return res.status(200).send(newPhoto);
  } catch (err) {
    console.error('Error uploading photo:', err);
    return res.status(500).send('Internal Server Error');
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
