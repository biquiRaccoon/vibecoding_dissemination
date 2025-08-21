import os
import json
import csv
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file
import pytz

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Ensure data directory exists
DATA_DIR = 'data'
STUDENTS_FILE = os.path.join(DATA_DIR, 'students.json')
CSV_FILE = os.path.join(DATA_DIR, 'milk_check.csv')

def ensure_data_directory():
    """Create data directory if it doesn't exist"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        logging.info(f"Created directory: {DATA_DIR}")

def get_korea_time():
    """Get current time in Asia/Seoul timezone"""
    korea_tz = pytz.timezone('Asia/Seoul')
    return datetime.now(korea_tz)

def initialize_students_file():
    """Create initial students.json if it doesn't exist"""
    if not os.path.exists(STUDENTS_FILE):
        students_data = {}
        
        # Boys: 1-11
        for i in range(1, 12):
            students_data[str(i)] = str(i)
        
        # Girls: 51-59
        for i in range(51, 60):
            students_data[str(i)] = str(i)
        
        with open(STUDENTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(students_data, f, ensure_ascii=False, indent=2)
        
        logging.info(f"Created initial students file: {STUDENTS_FILE}")

def initialize_csv_file():
    """Create CSV file with header if it doesn't exist"""
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(['날짜', '이름', '체크상태'])
        logging.info(f"Created CSV file with header: {CSV_FILE}")

def load_students():
    """Load students data from JSON file"""
    try:
        with open(STUDENTS_FILE, 'r', encoding='utf-8') as f:
            students_data = json.load(f)
        
        students_list = []
        for number, name in students_data.items():
            gender = "M" if int(number) <= 11 else "F"
            students_list.append({
                "number": int(number),
                "name": name,
                "gender": gender
            })
        
        # Sort by number
        students_list.sort(key=lambda x: x["number"])
        return students_list
    
    except Exception as e:
        logging.error(f"Error loading students: {e}")
        return []

@app.route('/')
def index():
    """Main page"""
    korea_time = get_korea_time()
    today = korea_time.strftime('%Y-%m-%d')
    return render_template('index.html', today=today)

@app.route('/api/students')
def get_students():
    """Get students data"""
    students = load_students()
    return jsonify(students)

@app.route('/api/save', methods=['POST'])
def save_results():
    """Save check results to CSV"""
    try:
        data = request.get_json()
        date = data.get('date')
        results = data.get('results', [])
        
        if not date or not results:
            return jsonify({"error": "Missing date or results"}), 400
        
        # Append to CSV file
        with open(CSV_FILE, 'a', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            for result in results:
                check_status = "checked" if result.get('checked', False) else "unchecked"
                writer.writerow([date, result.get('name', ''), check_status])
        
        logging.info(f"Saved {len(results)} records for date {date}")
        return jsonify({"success": True, "saved_count": len(results)})
    
    except Exception as e:
        logging.error(f"Error saving results: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/download')
def download_csv():
    """Download CSV file"""
    try:
        if os.path.exists(CSV_FILE):
            return send_file(CSV_FILE, 
                           as_attachment=True, 
                           download_name='milk_check.csv',
                           mimetype='text/csv')
        else:
            return jsonify({"error": "CSV file not found"}), 404
    
    except Exception as e:
        logging.error(f"Error downloading CSV: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize data directory and files
    ensure_data_directory()
    initialize_students_file()
    initialize_csv_file()
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)
