# To-Do App

To-Do App is a web application built using Node.js, Express.js, MongoDB, and Axios. It allows users to manage their to-do lists with features such as adding, editing, and deleting items.

## Description

The To-Do App is a modern web application designed to help users manage their tasks effectively. With a sleek glassmorphic design, intuitive user interface, and robust functionality, this app provides users with a seamless experience for creating, editing, and deleting tasks.

## Features

<b>Create Tasks:</b> Add new tasks with ease using the input field provided.<br>
<b>Edit Tasks:</b> Modify existing tasks directly from the list by clicking the "Edit" button.<br>
<b>Delete Tasks:</b> Remove unwanted tasks by clicking the "Delete" button associated with each task.<br>
<b>Show More:</b> Load more tasks dynamically without refreshing the page.<br>
<b>User Authentication:</b> Secure user authentication system to protect user data.<br>
<b>Session Management:</b> Automatically manages user sessions to enhance security.<br>
<b>Rate Limiting:</b> Prevents abuse and ensures fair usage by implementing rate limiting on requests.<br>

## Technologies Used

<b>Frontend:</b> HTML, CSS, JavaScript<br>
<b>Frontend Frameworks/Libraries:</b> Bootstrap, Axios<br>
<b>Backend:</b> Node.js, Express.js<br>
<b>Database:</b> MongoDB<br>
<b>Authentication:</b> Session-based authentication<br>
<b>Security:</b> Rate limiting, Input validation<br>

## Installation

#### Clone the repository:

https://github.com/sainath161/Todo

#### Install dependencies:

`cd todo`
`npm install`

#### Set up environment variables:

Create a `.env` file in the root directory and add the following variables:

`PORT=3000`(optional)<br>
`MONGODB_URI=your_mongodb_url`<br>
`SESSION_SECRET=your_session_secret`

#### Run the application:

`npm start`

Access the application in your web browser at `http://localhost:3000`.

## Usage

<b>Creating a Task:</b> Enter a task in the input field and click "Add New Item".<br>
<b>Editing a Task:</b> Click the "Edit" button next to a task, enter the new task text, and press Enter.<br>
<b>Deleting a Task:</b> Click the "Delete" button next to a task to remove it from the list.<br>
<b>Showing More Tasks:</b> Click the "Show More" button to load additional tasks dynamically.<br>

## Check the live demo here

https://todo-app-t8k9.onrender.com
