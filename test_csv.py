"""
Simple unit tests for CSV functionality
"""
import os
import csv
import tempfile
import unittest
from datetime import datetime
import pytz

class TestCSVFunctionality(unittest.TestCase):
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.test_csv = os.path.join(self.test_dir, 'test_milk_check.csv')
    
    def tearDown(self):
        """Clean up test environment"""
        import shutil
        shutil.rmtree(self.test_dir)
    
    def test_csv_header_creation(self):
        """Test CSV file creation with proper header"""
        # Create CSV with header
        with open(self.test_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['날짜', '이름', '체크상태'])
        
        # Verify header
        with open(self.test_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            self.assertEqual(header, ['날짜', '이름', '체크상태'])
    
    def test_csv_append_functionality(self):
        """Test appending records to CSV"""
        # Create initial CSV with header
        with open(self.test_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['날짜', '이름', '체크상태'])
        
        # Test data
        test_records = [
            ['2024-08-21', '학생1', 'checked'],
            ['2024-08-21', '학생2', 'unchecked'],
            ['2024-08-21', '학생51', 'checked']
        ]
        
        # Append records
        with open(self.test_csv, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            for record in test_records:
                writer.writerow(record)
        
        # Verify records
        with open(self.test_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            # Check header + 3 records = 4 total rows
            self.assertEqual(len(rows), 4)
            
            # Check specific records
            self.assertEqual(rows[1], ['2024-08-21', '학생1', 'checked'])
            self.assertEqual(rows[2], ['2024-08-21', '학생2', 'unchecked'])
            self.assertEqual(rows[3], ['2024-08-21', '학생51', 'checked'])
    
    def test_multiple_append_operations(self):
        """Test multiple append operations (accumulative behavior)"""
        # Create initial CSV
        with open(self.test_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['날짜', '이름', '체크상태'])
        
        # First append
        with open(self.test_csv, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['2024-08-21', '학생1', 'checked'])
        
        # Second append
        with open(self.test_csv, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['2024-08-21', '학생1', 'unchecked'])
        
        # Verify accumulative behavior
        with open(self.test_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            
            # Should have header + 2 records = 3 rows
            self.assertEqual(len(rows), 3)
            self.assertEqual(rows[1], ['2024-08-21', '학생1', 'checked'])
            self.assertEqual(rows[2], ['2024-08-21', '학생1', 'unchecked'])
    
    def test_korea_timezone(self):
        """Test Korea timezone functionality"""
        korea_tz = pytz.timezone('Asia/Seoul')
        korea_time = datetime.now(korea_tz)
        date_str = korea_time.strftime('%Y-%m-%d')
        
        # Should be in YYYY-MM-DD format
        self.assertRegex(date_str, r'^\d{4}-\d{2}-\d{2}$')
    
    def test_student_data_structure(self):
        """Test student data structure"""
        # Test student numbering rules
        boys_numbers = list(range(1, 12))  # 1-11
        girls_numbers = list(range(51, 60))  # 51-59
        
        self.assertEqual(len(boys_numbers), 11)
        self.assertEqual(len(girls_numbers), 9)
        self.assertEqual(len(boys_numbers) + len(girls_numbers), 20)
        
        # Test gender assignment
        for num in boys_numbers:
            gender = "M" if num <= 11 else "F"
            self.assertEqual(gender, "M")
        
        for num in girls_numbers:
            gender = "M" if num <= 11 else "F"
            self.assertEqual(gender, "F")

if __name__ == '__main__':
    unittest.main()
