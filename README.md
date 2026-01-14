# Classer - University Classroom Management System

Classer is a full-stack web application designed to streamline classroom and resource management within a university setting. It provides role-based access for administrators and instructors, featuring functionalities like room booking, user management, and personalized dashboards.

## Architecture

This project follows a monorepo structure, containing a separate frontend client and a backend server.

*   **Frontend**: A responsive and modern user interface built with **React** and **Vite**. It uses **React Router** for navigation.

*   **Backend**: A robust RESTful API server built with **Node.js** and the **Express.js** framework. It handles all business logic, data persistence, and user authentication.

## Database

The application uses a **MySQL** database to store all persistent data, including information about users, rooms, and bookings.

The necessary SQL scripts to initialize the database schema (`001-create-database.sql`) and populate it with initial data (`002-seed-data.sql`) are located in the `/scripts` directory.

## Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing purposes.

### Prerequisites

You must have the following software installed on your system:

*   [Node.js](https://nodejs.org/) (which includes npm)
*   [MySQL](https://www.mysql.com/downloads/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/classer-fullstack.git
    cd classer-fullstack
    ```

2.  **Setup the Backend:**
    *   Navigate to the server directory:
        ```bash
        cd server
        ```
    *   Install backend dependencies:
        ```bash
        npm install
        ```
    *   Set up your database connection by creating a `.env` file in the `/server` directory. You can copy the example below:
        ```env
        DB_HOST=localhost
        DB_USER=your_mysql_user
        DB_PASSWORD=your_mysql_password
        DB_DATABASE=classer
        JWT_SECRET=your_jwt_secret
        ```
    *   In your MySQL instance, create a database named `classer`.
    *   Run the provided SQL scripts to set up the database schema and seed the initial data. You can use a MySQL client or the command line for this.
        ```bash
        # Example using mysql command line
        mysql -u your_mysql_user -p classer < ../scripts/001-create-database.sql
        mysql -u your_mysql_user -p classer < ../scripts/002-seed-data.sql
        ```

3.  **Setup the Frontend:**
    *   Navigate back to the project root directory:
        ```bash
        cd ..
        ```
    *   Install frontend dependencies:
        ```bash
        npm install
        ```

### Running the Application

1.  **Start the Backend Server:**
    *   In a terminal, navigate to the `/server` directory and run:
        ```bash
        npm run dev
        ```
    *   The server will start on the port configured in your backend code (e.g., `http://localhost:3001`).

2.  **Start the Frontend Client:**
    *   In a separate terminal, ensure you are in the project root directory and run:
        ```bash
        npm run dev
        ```
    *   The React development server will start, and you can access the application at `http://localhost:5173` (or the port specified by Vite in your terminal).

Now, the Classer application should be fully running on your local machine.
