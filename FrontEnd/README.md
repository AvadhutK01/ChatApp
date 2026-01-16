# 💻 ChatApp Frontend

The user interface for the ChatApp, built with **React** and **Bootstrap**. It provides a responsive and interactive chat experience.

## ⚙️ Prerequisites

*   **Node.js**: v16+
*   **npm**: included with Node.js.

## 📦 Key Libraries

*   **react**: A JavaScript library for building user interfaces.
*   **bootstrap**: The world’s most popular framework for building responsive, mobile-first sites.
*   **socket.io-client**: Real-time client-side communication engine.
*   **axios**: Promise based HTTP client for the browser and node.js.
*   **emoji-mart**: A Slack-like emoji picker for React.
*   **react-toastify**: React notifications made easy.
*   **moment**: Parse, validate, manipulate, and display dates and times in JavaScript.

## 🚀 Installation & Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd FrontEnd
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configuration**:
    If necessary, check `src/utils` or constant files for API base URL configurations to ensure it points to your backend (default usually `http://localhost:5000`).

4.  **Start the Development Server**:
    Runs the app in the development mode.
    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
    ```bash
    npm start
    ```
    The page will reload when you make changes.

## 🛠️ Build for Production

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.
```bash
npm run build
```
The build is minified and the filenames include the hashes.

## 📂 Project Structure

*   `public/` - Static assets.
*   `src/`
    *   `Components/` - Reusable UI components.
    *   `Pages/` - Main application pages (Login, Register, Chat).
    *   `utils/` - Utility functions and API helpers.
    *   `App.js` - Main application entry point.
    *   `index.js` - React DOM rendering.
