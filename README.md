# Heritage Mist Perfumery - Full Stack

This is the full-stack version of the Heritage Mist Perfumery application, featuring a React frontend and a Node.js/Express.js backend.

## Project Structure

- `/` (root): Contains the frontend React application.
- `/server`: Contains the backend Node.js/Express.js server.

## How to Run

You will need to run two separate processes in two different terminal windows: one for the frontend and one for the backend.

### 1. Running the Backend Server

1.  **Navigate to the server directory:**

    ```bash
    cd server
    ```

2.  **Install dependencies:**
    This project requires `express`, `cors`, `jsonwebtoken`, and `bcryptjs`. You would typically install these with npm or yarn. For this environment, the dependencies are pre-loaded.

    ```bash
    # For a local setup, you would run:
    # npm install express cors jsonwebtoken bcryptjs
    ```

3.  **Start the server:**
    The server will run on 'https://heritage-mist-backend.onrender.com/api',
    ```bash
    node server.js
    ```
    You should see the message "Server running on port 5001" in your terminal.

### 2. Running the Frontend Application

1.  **Open a new terminal window.**

2.  **Navigate to the project's root directory.**

3.  **Start the frontend development server.**
    This application uses a standard setup. In a local environment, you would typically run `npm start`. The environment here handles this for you. The frontend will be accessible on its own port and will communicate with the backend server running on port 5001.

Once both are running, you can open the frontend URL in your browser and use the application as intended. All data will now be handled by the backend server instead of `localStorage`.
