# Kafka Auth

This project is a Node.js application that provides authentication services using Kafka for event-driven communication. The application includes user registration, login, email verification, and multi-factor authentication.

## Table of Contents

- [Kafka Auth](#kafka-auth)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
    - [Environment Variables](#environment-variables)
    - [Docker Setup](#docker-setup)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)

## Prerequisites

- Docker
- Docker Compose

## Setup

### Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_DIALECT=postgres
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
KAFKA_BROKER=your_kafka_broker
KAFKA_CLIENT_ID=your_kafka_client_id
```

### Docker Setup
1. Build and start the Docker containers:
```
docker-compose up --build
```
2. The application will be avaiable at [http://localhost:3000.](http://localhost:3000.)

## Usage
To start the application, run the following command:

```
npm start
```

## API Endpoints

Authentication

- POST /auth/register: Register a new user
- POST /auth/login: Login a user
- GET /auth/verify/:token: Verify user email
- GET /auth/activateMFA/:token: Activate multi-factor authentication
- POST /auth/forgot-password/:token: Reset password
- POST /auth/confirm-login/:token: Confirm login

Users

- GET /users: Get all users (protected)
- DELETE /users/:id: Delete a user (protected)

## Contributing

We welcome contributions to improve this project. To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

Please ensure your code adheres to my coding standards and includes appropriate tests.

Thank you for your contributions!