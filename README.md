# 💬 ChatApp

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-%5E18.2.0-blue.svg)

## 📖 Overview

**ChatApp** is a robust real-time messaging platform built using the modern JavaScript stack. It features a seamless communication experience powered by **Socket.io**, a secure RESTful API with **Express** & **Sequelize (MySQL)**, and a responsive **React** frontend styled with Bootstrap.

## 🚀 Key Features

*   **Real-time Messaging**: Instant communication using Socket.io.
*   **Secure Authentication**: JWT-based auth with encrypted passwords.
*   **Modern UI**: Responsive design built with React and Bootstrap.
*   **Emoji Support**: Rich text experience with Emoji Mart.
*   **Media Sharing**: Support for sharing multimedia files.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React.js
*   **Styling**: Bootstrap 5
*   **State/Data**: Axios, Lodash
*   **Socket**: Socket.io Client

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MySQL with Sequelize ORM
*   **Real-time Engine**: Socket.io
*   **Security**: Bcrypt, JsonWebToken

## 📂 Project Structure

The project is divided into two main directories:

*   **[FrontEnd](./FrontEnd/README.md)**: Contains the React client application.
*   **[BackEnd](./BackEnd/README.md)**: Contains the Node.js/Express server and database logic.

## 🚦 Quick Start

To get the application running locally, you need to set up both the backend and frontend servers.

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd ChatApp
    ```

2.  **Setup Backend**:
    *   Navigate to the `BackEnd` directory.
    *   Install dependencies.
    *   Configure your `.env` file (Database credentials, JWT keys).
    *   Start the server.
    *(See [Backend README](./BackEnd/README.md) for detailed instructions)*

3.  **Setup Frontend**:
    *   Navigate to the `FrontEnd` directory.
    *   Install dependencies.
    *   Start the development server.
    *(See [Frontend README](./FrontEnd/README.md) for detailed instructions)*
