document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const courseNameInput = document.getElementById('courseName');
    const courseUnitsInput = document.getElementById('courseUnits');
    const courseGradeSelect = document.getElementById('courseGrade');
    const addCourseBtn = document.getElementById('addCourse');
    const coursesListDiv = document.getElementById('coursesList');
    const currentGPASpan = document.getElementById('currentGPA');
    const totalCreditsSpan = document.getElementById('totalCredits');
    const remarksSpan = document.getElementById('remarks');
    const clearAllBtn = document.getElementById('clearAll');

    // Initialize courses array from localStorage or empty array
    let courses = JSON.parse(localStorage.getItem('gpaCourses')) || [];

    // Load saved courses on page load
    loadCourses();
    calculateGPA();

    // Add course event listener
    addCourseBtn.addEventListener('click', function() {
        addCourse();
    });

    // Add keypress event listener for Enter key
    courseNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addCourse();
    });
    courseUnitsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addCourse();
    });

    // Clear all courses
    clearAllBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all subjects?')) {
            courses = [];
            localStorage.setItem('gpaCourses', JSON.stringify(courses));
            loadCourses();
            calculateGPA();
        }
    });

    // Function to add a course
    function addCourse() {
        const name = courseNameInput.value.trim();
        const units = parseInt(courseUnitsInput.value);
        const grade = courseGradeSelect.value;

        // Validate inputs
        if (!name) {
            alert('Please enter a subject name');
            courseNameInput.focus();
            return;
        }
        if (isNaN(units) || units <= 0) {
            alert('Please enter a valid number of units');
            courseUnitsInput.focus();
            return;
        }
        if (!grade) {
            alert('Please select a grade');
            courseGradeSelect.focus();
            return;
        }

        // Create course object
        const course = {
            id: Date.now(), // Unique ID using timestamp
            name: name,
            units: units,
            grade: grade
        };

        // Add to courses array
        courses.push(course);

        // Save to localStorage
        localStorage.setItem('gpaCourses', JSON.stringify(courses));

        // Clear inputs
        courseNameInput.value = '';
        courseUnitsInput.value = '';
        courseGradeSelect.value = '';
        
        // Focus on name input for next entry
        courseNameInput.focus();

        // Reload courses and recalculate GPA
        loadCourses();
        calculateGPA();
    }

    // Function to load courses
    function loadCourses() {
        // Clear courses list
        coursesListDiv.innerHTML = '';

        // If no courses, show message
        if (courses.length === 0) {
            coursesListDiv.innerHTML = '<p>No subjects added yet.</p>';
            return;
        }

        // Add each course to the list
        courses.forEach(function(course) {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item';
            
            // Get grade text for display
            let gradeText = course.grade;
            if (course.grade !== 'INC' && course.grade !== 'DRP') {
                const gradeOption = courseGradeSelect.querySelector(`option[value="${course.grade}"]`);
                if (gradeOption) {
                    gradeText = gradeOption.textContent;
                }
            }

            courseItem.innerHTML = `
                <div class="course-info">
                    <div class="course-name">${course.name}</div>
                    <div class="course-details">
                        ${course.units} unit${course.units > 1 ? 's' : ''} | ${gradeText}
                    </div>
                </div>
                <button class="delete-course" data-id="${course.id}">×</button>
            `;
            
            coursesListDiv.appendChild(courseItem);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-course').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteCourse(id);
            });
        });
    }

    // Function to delete a course
    function deleteCourse(id) {
        courses = courses.filter(course => course.id !== id);
        localStorage.setItem('gpaCourses', JSON.stringify(courses));
        loadCourses();
        calculateGPA();
    }

    // Function to calculate GPA
    function calculateGPA() {
        let totalPoints = 0;
        let totalUnits = 0;

        courses.forEach(function(course) {
            // Skip INC and DRP grades
            if (course.grade === 'INC' || course.grade === 'DRP') {
                return;
            }

            const gradeValue = parseFloat(course.grade);
            totalPoints += gradeValue * course.units;
            totalUnits += course.units;
        });

        // Calculate GPA
        let gpa = 0;
        if (totalUnits > 0) {
            gpa = totalPoints / totalUnits;
        }

        // Update UI
        currentGPASpan.textContent = gpa.toFixed(2);
        totalCreditsSpan.textContent = totalUnits;
        
        // Set remarks based on GPA
        let remarks = '';
        if (gpa === 0) {
            remarks = '-';
        } else if (gpa <= 1.5) {
            remarks = 'Excellent';
        } else if (gpa <= 2.0) {
            remarks = 'Very Good';
        } else if (gpa <= 2.5) {
            remarks = 'Good';
        } else if (gpa <= 3.0) {
            remarks = 'Satisfactory';
        } else {
            remarks = 'Needs Improvement';
        }
        
        remarksSpan.textContent = remarks;
        
        // Set color based on GPA
        if (gpa <= 1.5) {
            currentGPASpan.style.color = '#4CAF50'; // Green for excellent
        } else if (gpa <= 2.5) {
            currentGPASpan.style.color = '#2196F3'; // Blue for good
        } else if (gpa <= 3.0) {
            currentGPASpan.style.color = '#FF9800'; // Orange for satisfactory
        } else {
            currentGPASpan.style.color = '#F44336'; // Red for needs improvement
        }
    }
});