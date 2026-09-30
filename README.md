# CodeCraftHub

CodeCraftHub is a personal learning goal tracker API built with Node.js and Express.

The API allows developers to create, view, update, and delete courses they want to learn. Course data is stored in a local `courses.json` file, so no database is required.

## Features

- REST API built with Express
- Create courses
- Retrieve all courses
- Retrieve course status statistics
- Retrieve a specific course by ID
- Update existing courses
- Delete courses
- Automatically generated numeric IDs starting from `1`
- Automatically generated `created_at` timestamps
- Course status validation
- Target date validation
- Automatic creation of `courses.json`
- File-based JSON data storage
- Error handling for invalid requests and file errors

## Technologies Used

- Node.js
- Express
- JavaScript
- JSON file storage

## Project Structure

```text
codecrafthub/
├── app.js
├── courses.json
├── package.json
└── README.md
```

### File Descriptions

- `app.js` — Main Express application and API routes
- `courses.json` — Stores course data
- `package.json` — Project metadata and dependencies
- `README.md` — Project documentation

The `courses.json` file is created automatically when the application starts if it does not already exist.

## Course Data

Each course contains the following fields:

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | Number | Automatically generated | Unique course ID starting at `1` |
| `name` | String | Yes | Name of the course |
| `description` | String | Yes | Description of the course |
| `target_date` | String | Yes | Target completion date in `YYYY-MM-DD` format |
| `status` | String | Yes | Current course status |
| `created_at` | String | Automatically generated | Course creation timestamp |

### Allowed Status Values

The `status` field must be one of the following values:

- `Not Started`
- `In Progress`
- `Completed`

### Example Course

```json
{
  "id": 1,
  "name": "Learn REST APIs",
  "description": "Study HTTP methods, status codes, and Express routes.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-30T12:00:00.000Z"
}
```

## Installation

### Prerequisites

Install Node.js and npm before running the application.

Check that they are installed:

```bash
node --version
npm --version
```

### Install the Project

Open a terminal in the project directory:

```bash
cd codecrafthub
```

Install the project dependencies:

```bash
npm install
```

This installs Express using the dependencies defined in `package.json`.

## Running the Application

Start the server using:

```bash
npm start
```

The API will run on port `5000`: `http://localhost:5000`

You can also start the application directly with:

```bash
node app.js
```

When the server starts, it automatically creates `courses.json` if the file does not exist. The initial contents of the file will be:

```json
[]
```

## API Documentation

### Base URL

`http://localhost:5000`

All JSON requests should include this header:

`Content-Type: application/json`

---

### Add a Course

Creates a new course.

#### Request

`POST /api/courses`

#### cURL Example

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Learn REST APIs",
    "description": "Study HTTP methods, status codes, and Express routes.",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }'
```

#### Successful Response

**Status:** `201 Created`

**Response:**

```json
{
  "id": 1,
  "name": "Learn REST APIs",
  "description": "Study HTTP methods, status codes, and Express routes.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-30T12:00:00.000Z"
}
```

---

### Get All Courses

Returns all stored courses.

#### Request

`GET /api/courses`

A trailing slash is also supported: `GET /api/courses/`

#### cURL Example

```bash
curl http://localhost:5000/api/courses
```

#### Successful Response

**Status:** `200 OK`

**Response:**

```json
[
  {
    "id": 1,
    "name": "Learn REST APIs",
    "description": "Study HTTP methods, status codes, and Express routes.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-09-30T12:00:00.000Z"
  }
]
```

If there are no courses, the response is:

```json
[]
```

---

### Get Course Counts by Status

Returns the total number of courses and the number of courses in each status category.

#### Request

`GET /api/courses/stats/status`

#### cURL Example

```bash
curl http://localhost:5000/api/courses/stats/status
```

#### Successful Response

**Status:** `200 OK`

**Response:**

```json
{
  "total": 3,
  "by_status": {
    "Not Started": 1,
    "In Progress": 1,
    "Completed": 1
  }
}
```

If no courses have been created, the response is:

```json
{
  "total": 0,
  "by_status": {
    "Not Started": 0,
    "In Progress": 0,
    "Completed": 0
  }
}
```

**Notes:**
- The endpoint will return counts for:
  - `Not Started`
  - `In Progress`
  - `Completed`
- This endpoint assumes your application uses a helper function such as `readCourses()` to access stored data.

---

### Get a Specific Course

Returns one course using its ID.

#### Request

`GET /api/courses/:id`

#### cURL Example

```bash
curl http://localhost:5000/api/courses/1
```

#### Successful Response

**Status:** `200 OK`

**Response:**

```json
{
  "id": 1,
  "name": "Learn REST APIs",
  "description": "Study HTTP methods, status codes, and Express routes.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-30T12:00:00.000Z"
}
```

#### Course Not Found Response

**Status:** `404 Not Found`

**Response:**

```json
{
  "error": "Course not found"
}
```

---

### Update a Course

Updates an existing course. The `PUT` request must include all required fields.

#### Request

`PUT /api/courses/:id`

#### cURL Example

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Learn REST APIs with Express",
    "description": "Build REST APIs using Node.js and Express.",
    "target_date": "2027-01-15",
    "status": "In Progress"
  }'
```

#### Successful Response

**Status:** `200 OK`

**Response:**

```json
{
  "id": 1,
  "name": "Learn REST APIs with Express",
  "description": "Build REST APIs using Node.js and Express.",
  "target_date": "2027-01-15",
  "status": "In Progress",
  "created_at": "2026-09-30T12:00:00.000Z"
}
```

The `id` and `created_at` values are preserved during an update.

---

### Delete a Course

Deletes a course using its ID.

#### Request

`DELETE /api/courses/:id`

#### cURL Example

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

#### Successful Response

**Status:** `204 No Content`

A successful delete request returns no response body.

#### Course Not Found Response

**Status:** `404 Not Found`

**Response:**

```json
{
  "error": "Course not found"
}
```

---

## Error Responses

### Missing Required Fields

The following fields are required:
- `name`
- `description`
- `target_date`
- `status`

**Status:** `400 Bad Request`

**Example Response:**

```json
{
  "error": "name is required"
}
```

### Invalid Status

The `status` field must be one of:
- `Not Started`
- `In Progress`
- `Completed`

**Example Response:**

```json
{
  "error": "status must be one of: Not Started, In Progress, Completed"
}
```

### Invalid Target Date

The `target_date` must use the `YYYY-MM-DD` format and must be a valid date.

**Example Response:**

```json
{
  "error": "target_date must be a valid date in YYYY-MM-DD format"
}
```

### Invalid JSON

If a request contains malformed JSON, the API returns:

```json
{
  "error": "Request body contains invalid JSON"
}
```

### Internal Server Errors

File read/write errors and other unexpected errors return:

```json
{
  "error": "An internal server error occurred"
}
```

---

## Troubleshooting

### `npm: command not found`

Node.js and npm may not be installed. Install Node.js, then verify:

```bash
node --version
npm --version
```

### `Cannot find module 'express'`

Install the project dependencies:

```bash
npm install
npm start
```

### Port 5000 Is Already in Use

Another application may already be using port `5000`.

On macOS or Linux:

```bash
lsof -i :5000
```

On Windows:

```cmd
netstat -ano | findstr :5000
```

Stop the conflicting process and run the application again:

```bash
npm start
```

### `courses.json` Does Not Exist

The application creates `courses.json` automatically when it starts. Run:

```bash
npm start
```

If necessary, create the file manually with this content:

```json
[]
```

### `courses.json` Contains Invalid JSON

If the file contains invalid JSON, the application cannot read the courses. To reset the file, replace its contents with:

```json
[]
```

> **Warning:** Resetting the file permanently removes all stored courses.

### Permission Denied

If you receive a permission error while reading or writing `courses.json`, make sure the application has permission to access the project directory. Avoid running the project from a read-only folder.

### The API Returns `400 Bad Request`

Check that:
- The request includes the `Content-Type: application/json` header.
- The request body contains valid JSON.
- All required fields are included.
- The `status` value is valid.
- The `target_date` uses the `YYYY-MM-DD` format.
- The correct HTTP method is being used.

---

## Limitations

This project uses a JSON file instead of a database, which makes it useful for learning and small personal projects.

However:
- It is not designed for many simultaneous users.
- Concurrent writes may cause data conflicts.
- There are no user accounts or authentication features.
- The JSON file should be backed up manually.
- Large datasets may be slower to search and update.
- There are no database transactions.

For a larger production application, consider migrating to a database such as SQLite, PostgreSQL, or MongoDB.