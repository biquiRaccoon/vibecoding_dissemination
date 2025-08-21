# Overview

This is a Korean milk consumption tracking web application designed for teachers to quickly check and record student milk intake. The app provides a visual grid interface where teachers can toggle student check-in status and save the data to CSV files for record keeping. It serves 20 students with specific numbering (1-11 for boys, 51-59 for girls) and maintains persistent data storage through JSON and CSV files.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Single Page Application (SPA)**: Uses vanilla JavaScript with Flask-rendered templates
- **Grid-based UI**: Student cards displayed in a responsive grid layout with gender-specific icons (👦/👧)
- **Real-time State Management**: Client-side state tracking for check/uncheck status with immediate visual feedback
- **Color-coded Status System**: Red for unchecked, green for checked states

## Backend Architecture
- **Flask Web Framework**: Lightweight Python web server handling API endpoints and template rendering
- **RESTful API Design**: Clean separation between frontend interactions and backend data operations
- **File-based Data Storage**: Uses JSON for student configuration and CSV for check-in records
- **Timezone Handling**: Asia/Seoul timezone support using pytz library

## Data Storage Solutions
- **Student Configuration**: JSON file (`data/students.json`) storing student numbers and names
- **Check-in Records**: CSV file (`data/milk_check.csv`) with append-only record keeping
- **Data Directory Management**: Automatic creation and initialization of data files
- **No Database Dependency**: File-based storage for simplicity and portability

## Key Features
- **Auto-initialization**: Automatically creates student data and CSV files if missing
- **Multiple Save Operations**: Supports multiple saves per day without overwriting (append-only)
- **Date Flexibility**: Allows teachers to modify check-in dates
- **Gender Filtering**: Frontend filtering for male/female students
- **Bulk Operations**: Toggle all students at once functionality
- **CSV Export**: Direct browser download of accumulated records

## File Structure
- `main.py`: Flask application entry point and API handlers
- `templates/index.html`: Main application template
- `static/app.js`: Frontend JavaScript logic
- `static/styles.css`: Application styling
- `data/students.json`: Student configuration
- `data/milk_check.csv`: Check-in records (auto-generated)

# External Dependencies

## Python Libraries
- **Flask**: Web framework for handling HTTP requests and template rendering
- **pytz**: Timezone handling for Asia/Seoul time zone conversion
- **csv**: Built-in CSV file operations for data export/import
- **json**: Built-in JSON handling for student configuration
- **logging**: Built-in logging for debugging and monitoring
- **datetime**: Built-in date/time operations with timezone support

## Frontend Dependencies
- **Vanilla JavaScript**: No external JavaScript frameworks or libraries
- **HTML5/CSS3**: Modern web standards with responsive design
- **Browser APIs**: FileReader, Fetch API for client-server communication

## System Dependencies
- **File System**: Local file storage for data persistence
- **No External Databases**: Self-contained data storage solution
- **No External APIs**: Fully offline-capable application
- **No CDN Dependencies**: All assets served locally