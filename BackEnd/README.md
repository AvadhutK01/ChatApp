# 🔙 ChatApp Backend

The backend server for the ChatApp project, providing a robust REST API and WebSocket services. Built with **Node.js**, **Express**, **Sequelize**, and **Mysql**.

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
*   **Node.js**: v16+
*   **MySQL**: Ensure your MySQL server is running and you have a database created.
*   **npm**: Included with Node.js.

## 📦 Dependencies

Major libraries used in this project:
*   **express**: Web framework for Node.js.
*   **sequelize**: Promise-based Node.js ORM for Postgres, MySQL, command, MariaDB, SQLite and Microsoft SQL Server.
*   **mysql2**: MySQL client for Node.js.
*   **socket.io**: Enables real-time, bidirectional and event-based communication.
*   **bcrypt**: Library to help you hash passwords.
*   **jsonwebtoken**: Implementation of JSON Web Tokens.
*   **aws-sdk**: AWS SDK for JavaScript (for file storage/services).

## 🚀 Installation & Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd BackEnd
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root of the `BackEnd` directory. You will need to configure variables such as:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=chatapp_db
    JWT_SECRET=your_jwt_secret
    # Add other provider keys (AWS, etc.) as needed
    ```

4.  **Start the Server**:
    To run the application in development mode (with nodemon):
    ```bash
    npm start
    ```
    The server typically runs on `http://localhost:5000` (or your configured port).

## 📡 API Endpoints

(Below is a summary of expected API structures)

*   `POST /api/auth/register` - Register a new user
*   `POST /api/auth/login` - User login
*   `GET /api/users` - Fetch users
*   *...and more*

## 🔌 WebSockets

The server listens for socket connections for real-time chat updates.
*   **Events**: `connection`, `join_room`, `send_message`, `receive_message`, `disconnect`.
