# User Registration & Login API

A simple REST API built with Node.js, Express.js, and MongoDB for user registration and login.

## Problem Statement
Develop a backend service that allows users to register, log in, and authenticate securely using JWT tokens. The application should validate user input, prevent duplicate email registrations, and store passwords securely using bcrypt hashing.

## Features
- User registration with name, email, and password
- User login using email and password
- Secure password hashing with bcrypt
- Duplicate email prevention
- JWT token generation after successful login
- Input validation and error handling
- MongoDB database integration

## Tech Stack
- React
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JWT
- dotenv
- React Router DOM

## Project Structure
```bash
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── server.js
│   └── package.json
├── README.md
└── package.json