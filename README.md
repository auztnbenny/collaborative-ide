# Collaborative Online IDE with AI Assistance and QR Code-Based App Testing

## Table of Contents
- [Overview](#overview)  
- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Use Case Diagram](#use-case-diagram)  
- [ER Diagram](#er-diagram)  
- [Contributing](#contributing)  
- [License](#license)  
- [Acknowledgments](#acknowledgments)

## Overview  
This project introduces a **Collaborative Online IDE** that simplifies the development of **React Native applications** through **AI-powered code assistance** and **QR code-based app testing**. It enables developers to work together in real-time with a seamless environment for coding, debugging, and testing mobile applications.

The platform offers two roles—**Leader/Admin** and **Developer**—where the Leader manages the project and assigns roles. Developers collaborate based on their permissions (Editor or Viewer) without requiring admin approval to update the code.

## Features  
- **Real-Time Collaboration:** Multiple developers can work on the codebase simultaneously.  
- **AI Code Assistance:** Intelligent suggestions and error detection for enhanced code quality.  
- **QR Code-Based Testing:** Easily test mobile apps by scanning a generated QR code.  
- **Role-Based Access Control:** Leader assigns permissions (Editor/Viewer) to developers.  
- **User-Friendly Interface:** Modern design ensuring easy navigation and an optimal user experience.

## Technologies Used  
- **Frontend:** React.js  
- **Backend:** Node.js, Socket.io  
- **AI Assistance:** Integrated with AI libraries to enhance code suggestions  
- **Mobile App Testing:** QR code generation and scanning  
- **Database:** MongoDB (for project and user role management)

## Installation  
2. **Install Dependencies**  
   - Backend:
     ```bash
     cd server
     npm install
     ```
   - Frontend:
     ```bash
     cd client
     npm install
     ```

3. **Run the Servers**  
   - Backend server:
     ```bash
     npm run dev
     ```
   - Frontend server:
     ```bash
     npm run dev
     ```

4. **Access the IDE**  
   Open your browser and go to:
