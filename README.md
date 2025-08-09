## Prerequisites

Before proceeding, ensure that the following software packages are installed and properly configured on your local machine:

- **Java Development Kit (JDK) 17 or higher**  
  (Recommended: OpenJDK or Oracle JDK)  
  _Check installation:_  
  java -version

- **Node.js (Latest LTS version recommended)**  
  (Includes npm by default)  
  _Check installation:_  
  node -v  
  npm -v

- **MySQL Server (version 8.0 or higher preferred)**  
  _Ensure the MySQL service is running and accessible through MySQL Workbench or the command line._

- **Git**  
  _Check installation:_  
  git --version

- **IDE/Text Editor**  
  - Backend: Eclipse, IntelliJ IDEA, or Visual Studio Code  
  - Frontend: Visual Studio Code (recommended)

## Setup Instructions

### 1. Database Initialization

1. **Create a new database:**  
   Connect to MySQL and run:  
   CREATE DATABASE gym_db;  
   USE gym_db;

2. **Insert initial user data for testing:**  
   Run the following SQL statements (via MySQL Workbench or CLI):  

   INSERT INTO users (username, password, full_name, email, role)  
   VALUES ('test', '$2a$10$orOrxmZEPzXXGEc5cfWYT.nUY/oA.D7.OC1LcWFM0YlVjIt7xeJzW', 'test', 'test@gmail.com', 'MEMBER');  
   -- Password: test1

   INSERT INTO users (username, password, full_name, email, role)  
   VALUES ('test2', '$2a$10$VXIOuCC8ykTXLmUeeQtMfODcVi.XFW/7XEn2bMlisb1KGrp0GruEC', 'test2', 'test2@gmail.com', 'TRAINER');  
   -- Password: test2

   INSERT INTO users (username, password, full_name, email, active, role)  
   VALUES (  
     'admin',  
     '$2a$10$WMAxv4NktWr/CIA.LTmBXe/l51WCG0EDfR4uzZB8UE9EH6GBHjwES',   
     'admin',  
     'admin@gmail.com',  
     true,  
     'ADMIN'  
   );  
   -- Password: admin

### 2. Backend Configuration & Setup

1. **Open the backend project:**  
   Import the `gym-management-backend` folder as a Maven project in your preferred IDE.

2. **Configure database connection:**  
   Edit `src/main/resources/application.properties`:  

   spring.datasource.url=jdbc:mysql://localhost:3306/gym_db  
   spring.datasource.username=your_mysql_username  
   spring.datasource.password=your_mysql_password

3. **Install Maven dependencies and build the project:**  
   mvn clean install

4. **Start the backend server:**  
   mvn spring-boot:run  
   By default, the backend will run on http://localhost:8080

### 3. Frontend Setup

1. **Open the frontend project folder (`gym-management-frontend`) in VS Code (or similar).**

2. **Install frontend dependencies:**  
   npm install

3. **Verify API base URL:**  
   In `src/services/api.ts` (or similar), confirm:  

   baseURL: 'http://localhost:8080/api',

4. **Start the React development server:**  
   npm start  
   This runs the app on http://localhost:3000

## Running the Application

- **Backend:** Ensure `gym-management-backend` is running and connected to MySQL.
- **Frontend:** With `npm start`, go to http://localhost:3000 in your web browser.
- **Default Login Credentials:**  
  - Member: test / test1  
  - Trainer: test2 / test2  
  - Admin: admin / admin  
  - Or register new users if enabled on your setup.

**Tip:**  
If you face any issues, double-check your database credentials, ensure both backend and frontend servers are running, and no port conflicts exist.
