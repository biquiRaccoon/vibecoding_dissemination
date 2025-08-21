// Global state
let students = [];
let checkStates = {};
let allChecked = false;

// DOM elements
const studentsGrid = document.getElementById('students-grid');
const dateInput = document.getElementById('date-input');
const genderFilter = document.getElementById('gender-filter');
const toggleAllBtn = document.getElementById('toggle-all');
const saveBtn = document.getElementById('save-btn');
const downloadBtn = document.getElementById('download-btn');
const statusMessage = document.getElementById('status-message');
const loading = document.getElementById('loading');

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    await loadStudents();
    setupEventListeners();
    renderStudents();
});

// Load students data from API
async function loadStudents() {
    try {
        loading.style.display = 'block';
        const response = await fetch('/api/students');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        students = await response.json();
        
        // Initialize check states (all unchecked)
        checkStates = {};
        students.forEach(student => {
            checkStates[student.number] = false;
        });
        
        console.log('Loaded students:', students);
        
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('학생 데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
        loading.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    genderFilter.addEventListener('change', renderStudents);
    toggleAllBtn.addEventListener('click', toggleAll);
    saveBtn.addEventListener('click', saveResults);
    downloadBtn.addEventListener('click', downloadCSV);
}

// Render student cards
function renderStudents() {
    const filterValue = genderFilter.value;
    
    // Filter students based on selected gender
    const filteredStudents = students.filter(student => {
        if (filterValue === 'all') return true;
        return student.gender === filterValue;
    });
    
    studentsGrid.innerHTML = '';
    
    filteredStudents.forEach(student => {
        const card = createStudentCard(student);
        studentsGrid.appendChild(card);
    });
    
    updateToggleAllButton();
}

// Create individual student card
function createStudentCard(student) {
    const card = document.createElement('div');
    const isChecked = checkStates[student.number];
    const genderIcon = student.gender === 'M' ? '👦' : '👧';
    const statusText = isChecked ? '체크' : '미체크';
    const statusClass = isChecked ? 'checked' : 'unchecked';
    
    card.className = `student-card ${statusClass}`;
    card.dataset.studentNumber = student.number;
    
    card.innerHTML = `
        <div class="card-header">
            <span class="student-number">${student.number}</span>
            <span class="gender-icon">${genderIcon}</span>
        </div>
        <div class="student-name">${student.name}</div>
        <div class="status-badge ${statusClass}">${statusText}</div>
    `;
    
    // Add click event listener
    card.addEventListener('click', function() {
        toggleStudentState(student.number);
    });
    
    return card;
}

// Toggle individual student state
function toggleStudentState(studentNumber) {
    checkStates[studentNumber] = !checkStates[studentNumber];
    
    // Update the card visually
    const card = document.querySelector(`[data-student-number="${studentNumber}"]`);
    const isChecked = checkStates[studentNumber];
    const statusText = isChecked ? '체크' : '미체크';
    const statusClass = isChecked ? 'checked' : 'unchecked';
    
    card.className = `student-card ${statusClass}`;
    
    const statusBadge = card.querySelector('.status-badge');
    statusBadge.className = `status-badge ${statusClass}`;
    statusBadge.textContent = statusText;
    
    updateToggleAllButton();
}

// Toggle all students
function toggleAll() {
    const filterValue = genderFilter.value;
    
    // Get currently visible students
    const visibleStudents = students.filter(student => {
        if (filterValue === 'all') return true;
        return student.gender === filterValue;
    });
    
    // Check if all visible students are checked
    const allVisibleChecked = visibleStudents.every(student => checkStates[student.number]);
    
    // Toggle all visible students to opposite state
    visibleStudents.forEach(student => {
        checkStates[student.number] = !allVisibleChecked;
    });
    
    renderStudents();
}

// Update toggle all button text
function updateToggleAllButton() {
    const filterValue = genderFilter.value;
    
    const visibleStudents = students.filter(student => {
        if (filterValue === 'all') return true;
        return student.gender === filterValue;
    });
    
    const allVisibleChecked = visibleStudents.every(student => checkStates[student.number]);
    
    toggleAllBtn.textContent = allVisibleChecked ? '모두 해제' : '모두 체크';
}

// Save results to CSV
async function saveResults() {
    try {
        const date = dateInput.value;
        if (!date) {
            showMessage('날짜를 선택해주세요.', 'error');
            return;
        }
        
        // Prepare results for all students
        const results = students.map(student => ({
            number: student.number,
            name: student.name,
            checked: checkStates[student.number]
        }));
        
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: date,
                results: results
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`${result.saved_count}개 레코드가 저장되었습니다.`, 'success');
        } else {
            throw new Error(result.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error saving results:', error);
        showMessage('저장에 실패했습니다: ' + error.message, 'error');
    }
}

// Download CSV file
async function downloadCSV() {
    try {
        const response = await fetch('/api/download');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'milk_check.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showMessage('CSV 파일이 다운로드되었습니다.', 'success');
        
    } catch (error) {
        console.error('Error downloading CSV:', error);
        showMessage('다운로드에 실패했습니다: ' + error.message, 'error');
    }
}

// Show status message
function showMessage(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 3000);
}

// Utility function to format date
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
