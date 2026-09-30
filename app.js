// Import required packages
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

// Create the Express application
const app = express();

// The server must run on port 5000
const PORT = 5000;

// Store courses.json in the same directory as this app.js file
const DATA_FILE = path.join(__dirname, "courses.json");

// Allowed course status values
const VALID_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed"
];

// Middleware that allows Express to read JSON request bodies
app.use(express.json());

/*
  Helper function: Read courses from courses.json.

  If courses.json does not exist, this function creates it
  with an empty array and returns that empty array.
*/
async function readCourses() {
  try {
    const fileContents = await fs.readFile(DATA_FILE, "utf8");

    // Convert the JSON text into a JavaScript array
    return JSON.parse(fileContents);
  } catch (error) {
    // File does not exist, so create it automatically
    if (error.code === "ENOENT") {
      const emptyCourses = [];

      await writeCourses(emptyCourses);

      return emptyCourses;
    }

    // Handle invalid JSON or other file read errors
    throw error;
  }
}

/*
  Helper function: Write courses to courses.json.

  JSON.stringify converts the JavaScript array into formatted JSON text.
*/
async function writeCourses(courses) {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(courses, null, 2),
    "utf8"
  );
}

/*
  Helper function: Validate a date.

  This checks that the date uses YYYY-MM-DD format and
  represents a real calendar date.
*/
function isValidDate(dateString) {
  // First check the basic format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  // Make sure JavaScript did not automatically adjust an invalid date
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/*
  Helper function: Validate course input.

  Returns an error message if validation fails.
  Returns null if the data is valid.
*/
function validateCourseInput(body) {
  const requiredFields = [
    "name",
    "description",
    "target_date",
    "status"
  ];

  // Check for missing or empty required fields
  for (const field of requiredFields) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      String(body[field]).trim() === ""
    ) {
      return `${field} is required`;
    }
  }

  // Check that the status is one of the allowed values
  if (!VALID_STATUSES.includes(body.status)) {
    return (
      `status must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }

  // Check the target date format and validity
  if (!isValidDate(body.target_date)) {
    return "target_date must be a valid date in YYYY-MM-DD format";
  }

  return null;
}

/*
  Helper function: Generate the next course ID.

  IDs start at 1. Deleted IDs are not reused.

  For example, if the highest current ID is 4,
  the next course receives ID 5.
*/
function getNextCourseId(courses) {
  if (courses.length === 0) {
    return 1;
  }

  const highestId = Math.max(
    ...courses.map(course => Number(course.id) || 0)
  );

  return highestId + 1;
}

/*
  POST /api/courses

  Add a new course.
*/
app.post("/api/courses", async (req, res, next) => {
  try {
    const validationError = validateCourseInput(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const courses = await readCourses();

    const now = new Date().toISOString();

    const newCourse = {
      id: getNextCourseId(courses),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: now
    };

    courses.push(newCourse);

    await writeCourses(courses);

    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
});

/*
  GET /api/courses

  Get all courses.
*/
app.get("/api/courses", async (req, res, next) => {
  try {
    const courses = await readCourses();

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
});

app.get('/api/courses/stats/status', async (req, res) => {
  try {
    const courses = await readCourses();

    const statusCounts = {
      'Not Started': 0,
      'In Progress': 0,
      Completed: 0
    };

    courses.forEach((course) => {
      if (Object.prototype.hasOwnProperty.call(statusCounts, course.status)) {
        statusCounts[course.status]++;
      }
    });

    res.status(200).json({
      total: courses.length,
      by_status: statusCounts
    });
  } catch (error) {
    console.error('Error reading courses:', error);
    res.status(500).json({
      error: 'Unable to retrieve course statistics'
    });
  }
});

/*
  GET /api/courses/:id

  Get one specific course by ID.

  Example:
  GET /api/courses/1
*/
app.get("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();

    const courseId = Number(req.params.id);

    const course = courses.find(
      course => course.id === courseId
    );

    if (!course) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
});

/*
  PUT /api/courses/:id

  Update an existing course.

  PUT expects all required course fields to be provided.
  The original id and created_at values are preserved.
*/
app.put("/api/courses/:id", async (req, res, next) => {
  try {
    const validationError = validateCourseInput(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const courses = await readCourses();
    const courseId = Number(req.params.id);

    const courseIndex = courses.findIndex(
      course => course.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    const existingCourse = courses[courseIndex];

    const updatedCourse = {
      id: existingCourse.id,
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: existingCourse.created_at
    };

    courses[courseIndex] = updatedCourse;

    await writeCourses(courses);

    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
});

/*
  DELETE /api/courses/:id

  Delete a course by ID.

  Example:
  DELETE /api/courses/1
*/
app.delete("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();
    const courseId = Number(req.params.id);

    const courseIndex = courses.findIndex(
      course => course.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    // Remove one course from the array
    courses.splice(courseIndex, 1);

    await writeCourses(courses);

    // 204 means the deletion succeeded with no response body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/*
  Handle malformed JSON sent in a request body.

  For example, this catches invalid JSON in a POST or PUT request.
*/
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: "Request body contains invalid JSON"
    });
  }

  next(error);
});

/*
  General error-handling middleware.

  This catches file read errors, file write errors,
  invalid JSON in courses.json, and unexpected errors.
*/
app.use((error, req, res, next) => {
  console.error("Error:", error);

  // JSON.parse errors usually mean courses.json is invalid
  if (error instanceof SyntaxError) {
    return res.status(500).json({
      error: "courses.json contains invalid JSON"
    });
  }

  // Handle file system errors
  if (error.code === "EACCES") {
    return res.status(500).json({
      error: "Permission denied while reading or writing courses.json"
    });
  }

  if (error.code === "ENOSPC") {
    return res.status(500).json({
      error: "Not enough disk space to write courses.json"
    });
  }

  // Generic server error
  res.status(500).json({
    error: "An internal server error occurred"
  });
});

/*
  Start the server.

  Calling readCourses() first ensures courses.json
  is created automatically if it does not exist.
*/
async function startServer() {
  try {
    await readCourses();

    app.listen(PORT, () => {
      console.log(
        `CodeCraftHub API is running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Could not start the server because courses.json could not be prepared:",
      error
    );

    process.exit(1);
  }
}

startServer();