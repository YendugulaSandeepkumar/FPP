# Farmer Paddy Portal (FPP)

## Overview
A web portal for farmers to sell paddy, involving verification by Village Agriculture Officer (VAO).

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Sequelize (SQLite)

## Setup & Run

### Prerequisites
- Node.js installed.

### Installation
1.  **Server:**
    ```bash
    cd server
    npm install
    ```
2.  **Client:**
    ```bash
    cd client
    npm install
    ```

### Running the App
1.  **Start Backend:**
    ```bash
    cd server
    npm run dev
    ```
    Runs on `http://localhost:3000`.

2.  **Start Frontend:**
    ```bash
    cd client
    npm run dev
    ```
    Runs on `http://localhost:5173`.

## Usage
1.  Open `http://localhost:5173`.
2.  **Register a VAO (Admin):**
    - Select "VAO" role.
    - Use Secret Key: `FPP-VAO-SECRET-2026`
3.  **Register a Farmer:**
    - Select "Farmer" role.
    - Login and submit harvest request.
4.  **VAO Flow:**
    - Login as VAO.
    - Approve request (Assigns Serial Number).
5.  **Farmer Flow:**
    - See approval and Serial Number.
    - Upload Final Docs.
6.  **VAO Flow:**
    - Verify docs and Generate Bill.

## Project Structure
- `/server` - Backend API and Database
- `/client` - React Frontend
