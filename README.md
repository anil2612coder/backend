# Maxtron Backend

This is the backend server for the Maxtron talent form application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### POST /sendData
Handles the talent form submission.

**Request Body:**
- Form data with the following fields:
  - firstName (string)
  - lastName (string)
  - email (string)
  - phone (string)
  - areaOfInterest (string)
  - experienceLevel (string)
  - city (string)
  - state (string)
  - country (string)
  - consentEmail (boolean)
  - consentSMS (boolean)
  - resume (file) - PDF, DOC, or DOCX (max 5MB)

**Response:**
- Success (200):
```json
{
  "message": "Form submitted successfully",
  "data": {
    // Form data and uploaded file information
  }
}
```
- Error (400/500):
```json
{
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Features
- File upload handling with size and type restrictions
- CORS enabled
- Error handling middleware
- Environment variable configuration 