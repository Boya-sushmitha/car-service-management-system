# 🚗 Car Service Management System

A Full Stack Web Application developed to simplify car service requests and manage service operations through separate User and Admin modules.

## 🌐 Live Demo

[Click here to access the Car Service Management System](https://car-service-web-lpry.onrender.com/)

## 📌 Project Overview

The Car Service Management System is a web-based application that allows users to register, log in, add their vehicle details, request car services, and track their service status.

The application also provides an Admin module to manage customer service requests, accept or reject requests, update service statuses, and notify users through email.

## ✨ Features

### 👤 User Module

* User Registration and Login
* Add and Manage Car Details
* Request Car Services
* View Estimated Service Costs
* Track Service Request Status
* Receive Email Notifications

### 👨‍💻 Admin Module

* Admin Login
* View All User Service Requests
* Accept or Reject Service Requests
* Update Service Status
* Manage Service Requests
* Send Email Notifications to Users

### 📋 Service Status

* Waiting
* Under Service
* Completed

## 🔄 Application Workflow

### User Workflow

1. Register as a new user.
2. Log in using registered credentials.
3. Add your car details.
4. Select the required car service.
5. Submit a service request.
6. View the estimated service cost.
7. Track the service status.
8. Receive email notifications regarding service updates.

### Admin Workflow

1. Log in using admin credentials.
2. View customer service requests.
3. Accept or reject service requests.
4. Update the service status.
5. Notify users about service updates.

## 🔐 Demo Admin Credentials

For demonstration purposes:

* **Username:** admin
* **Password:** admin

*Note: These are demo credentials. Do not use these credentials for production environments.*

## 🛠️ Technologies Used

| Technology | Purpose                        |
| ---------- | ------------------------------ |
| Python     | Backend Programming            |
| Django     | Backend Framework              |
| React.js   | Frontend Development           |
| JavaScript | Frontend Functionality         |
| MySQL      | Database Management            |
| HTML       | Web Page Structure             |
| CSS        | Styling                        |
| REST API   | Frontend-Backend Communication |

## 📁 Project Structure

```text
car-service-management-system/
│
├── backend/
│   └── Django Backend Files
│
├── frontend/
│   └── React Frontend Files
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Boya-sushmitha/car-service-management-system.git
```

### 2. Navigate to the Project

```bash
cd car-service-management-system
```

### 3. Backend Setup

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Configure your MySQL database settings in Django's settings.py file.

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React application using the start command configured in package.json.

For example:

```bash
npm start
```

If your project uses Vite, use:

```bash
npm run dev
```

## 🎯 Project Objectives

* Simplify the car service request process.
* Provide an easy-to-use interface for customers.
* Enable efficient service request management.
* Improve communication between users and administrators.
* Gain practical experience in Full Stack Web Development.

## 👩‍💻 Developed By

**Boya Sushmitha**

Python Full Stack Developer

### 🔗 Connect with My Project

* **Live Application:** https://car-service-web-lpry.onrender.com/
* **GitHub Repository:** https://github.com/Boya-sushmitha/car-service-management-system

---

⭐ If you find this project interesting, feel free to explore the repository!
