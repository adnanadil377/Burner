# Burner - Subtitle Customization for Short-Form Content

A project to customize and add burnt subtitles to your short-form content. New features coming soon.

## Overview

Burner is a full-stack application that allows you to enhance your short-form videos with customizable burnt-in subtitles. The application consists of a React + TypeScript frontend and a FastAPI backend, providing a seamless experience for subtitle customization and video processing.

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- ESLint

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- Python Jose (JWT authentication)
- Passlib (password hashing)

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) and npm
- **Python** (v3.8 or higher)
- **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/adnanadil377/Burner/
cd Burner
```

### 2. Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirments.txt
```

#### Configure Environment Variables

Create a `.env` file in the backend directory based on the `.env.example` file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration settings.

#### Run the Backend Server

```bash
python main.py
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173` (default Vite port)

## Development

### Backend Development

- The FastAPI backend uses SQLAlchemy for database management
- API routes are organized in the `api` directory
- Models are defined in the `models` directory
- Database schemas are in the `schemas` directory
- Core functionality is in the `core` directory

To run the backend in development mode with auto-reload:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Development

- React components are located in the `src` directory
- TypeScript configuration is managed through `tsconfig.json`
- Vite is used for fast development and building

Available scripts:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

Please ensure your code follows the existing style and passes all linting checks.

## Project Structure

```
Burner/
├── backend/
│   ├── api/           # API routes
│   ├── controller/    # Business logic controllers
│   ├── core/          # Core functionality
│   ├── db/            # Database configuration
│   ├── models/        # Database models
│   ├── schemas/       # Pydantic schemas
│   ├── main.py        # Application entry point
│   ├── requirments.txt
│   └── .env.example
├── frontend/
│   ├── src/           # React components and logic
│   ├── public/        # Static assets
│   ├── package.json
│   └── vite.config.ts
└── readme.md
```

## License

MIT License

## Contact
adnanadil377@gmail.com