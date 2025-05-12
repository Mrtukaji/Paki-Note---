document.addEventListener('DOMContentLoaded', function() {
    // Floor plan navigation
    const floorButtons = document.querySelectorAll('.floor-btn');
    const floorPlans = document.querySelectorAll('.floor-plan');

    // Modal elements
    const addModal = document.getElementById('addClassModal');
    const editModal = document.getElementById('editClassModal');
    const addClassBtn = document.getElementById('addClassButton');
    const closeAddBtn = document.querySelector('.close');
    const closeEditBtn = document.querySelector('.close-edit');
    const addClassForm = document.getElementById('addClassForm');
    const editClassForm = document.getElementById('editClassForm');
    
    // Search and filter elements
    const searchInput = document.getElementById('roomSearch');
    const searchButton = document.getElementById('searchButton');
    const floorFilter = document.getElementById('floorFilter');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Sample data - this would normally come from a database
    let classRooms = [];
    
    // Initialize the display
    loadClassRooms();
    
    // Floor plan navigation
    floorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and floor plans
            floorButtons.forEach(btn => btn.classList.remove('active'));
            floorPlans.forEach(plan => plan.classList.remove('active'));

            // Add active class to clicked button and corresponding floor plan
            button.classList.add('active');
            const floor = button.getAttribute('data-floor');
            document.querySelector(`.floor-plan[data-floor="${floor}"]`).classList.add('active');
        });
    });
    
    // Modal functionality
    addClassBtn.addEventListener('click', function() {
        addModal.style.display = 'block';
    });
    
    closeAddBtn.addEventListener('click', function() {
        addModal.style.display = 'none';
    });
    
    closeEditBtn.addEventListener('click', function() {
        editModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === addModal) {
            addModal.style.display = 'none';
        }
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Form submission
    addClassForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const newClass = {
            roomNumber: document.getElementById('roomNumber').value,
            roomType: document.getElementById('roomType').value,
            subject: document.getElementById('subject').value,
            floor: document.getElementById('floor').value,
            professor: document.getElementById('professor').value,
            time: document.getElementById('time').value
        };
        
        // Add to array
        classRooms.push(newClass);
        
        // Update display
        displayRooms(filterRooms());
        
        // Reset form and close modal
        addClassForm.reset();
        modal.style.display = 'none';
        
        // Save to localStorage
        saveClassRooms();
    });
    
    // Search functionality
    searchButton.addEventListener('click', () => {
        displayRooms(filterRooms());
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            displayRooms(filterRooms());
        }
    });
    
    // Floor filter functionality
    floorFilter.addEventListener('change', () => {
        displayRooms(filterRooms());
    });
    
    // Filter rooms based on search and floor filter
    function filterRooms() {
        const searchTerm = searchInput.value.toLowerCase();
        const floorValue = floorFilter.value;
        
        return classRooms.filter(room => {
            const matchesSearch = 
                room.roomNumber.toLowerCase().includes(searchTerm) ||
                room.subject.toLowerCase().includes(searchTerm) ||
                room.professor.toLowerCase().includes(searchTerm);
                
            const matchesFloor = floorValue === '' || room.floor === floorValue;
            
            return matchesSearch && matchesFloor;
        });
    }
    
    // Form submission for editing a class
    editClassForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const index = document.getElementById('editIndex').value;
        
        // Update the class data
        classRooms[index] = {
            roomNumber: document.getElementById('editRoomNumber').value,
            roomType: document.getElementById('editRoomType').value,
            subject: document.getElementById('editSubject').value,
            floor: document.getElementById('editFloor').value,
            professor: document.getElementById('editProfessor').value,
            time: document.getElementById('editTime').value
        };
        
        // Update display
        displayRooms(filterRooms());
        
        // Close modal
        editModal.style.display = 'none';
        
        // Save to localStorage
        saveClassRooms();
    });
    
    // Function to open edit modal with class data
    function openEditModal(index) {
        const room = classRooms[index];
        
        // Set form values
        document.getElementById('editIndex').value = index;
        document.getElementById('editRoomNumber').value = room.roomNumber;
        document.getElementById('editRoomType').value = room.roomType;
        document.getElementById('editSubject').value = room.subject;
        document.getElementById('editFloor').value = room.floor;
        document.getElementById('editProfessor').value = room.professor;
        document.getElementById('editTime').value = room.time;
        
        // Show modal
        editModal.style.display = 'block';
    }
    
    // Display rooms in the results container
    function displayRooms(rooms) {
        resultsContainer.innerHTML = '';
        
        if (rooms.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No rooms found matching your criteria.</div>';
            return;
        }
        
        rooms.forEach((room, index) => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            roomCard.innerHTML = `
                <div class="room-header">
                    <h3>Room ${room.roomNumber}</h3>
                    <span class="room-type">${room.roomType}</span>
                </div>
                <div class="room-details">
                    <p><strong>Subject:</strong> ${room.subject}</p>
                    <p><strong>Floor:</strong> ${getFloorText(room.floor)}</p>
                    <p><strong>Professor:</strong> ${room.professor}</p>
                    <p><strong>Time:</strong> ${room.time}</p>
                </div>
                <div class="room-actions">
                    <button class="edit-btn" data-index="${findRoomIndex(room)}">Edit</button>
                    <button class="delete-btn" data-index="${findRoomIndex(room)}">Delete</button>
                </div>
            `;
            
            resultsContainer.appendChild(roomCard);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteRoom(index);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                openEditModal(index);
            });
        });
    }
    
    // Find the index of a room in the classRooms array
    function findRoomIndex(roomToFind) {
        return classRooms.findIndex(room => 
            room.roomNumber === roomToFind.roomNumber && 
            room.subject === roomToFind.subject && 
            room.professor === roomToFind.professor &&
            room.time === roomToFind.time
        );
    }
    
    // Delete a room from the classRooms array
    function deleteRoom(index) {
        if (index !== -1) {
            // Confirm before deleting
            if (confirm('Are you sure you want to delete this class?')) {
                classRooms.splice(index, 1);
                saveClassRooms();
                displayRooms(filterRooms());
            }
        }
    }
    
    // Helper function to convert floor number to text
    function getFloorText(floor) {
        const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'];
        const floorNum = parseInt(floor);
        
        if (floorNum >= 11 && floorNum <= 13) {
            return `${floorNum}th Floor`;
        }
        
        return `${floorNum}${suffixes[floorNum % 10]} Floor`;
    }
    
    // Save to localStorage
    function saveClassRooms() {
        localStorage.setItem('classRooms', JSON.stringify(classRooms));
    }
    
    // Load from localStorage
    function loadClassRooms() {
        const saved = localStorage.getItem('classRooms');
        if (saved) {
            classRooms = JSON.parse(saved);
        } else {
            // Default data if nothing is saved
            classRooms = [
                {
                    roomNumber: '406',
                    roomType: 'Lecture',
                    subject: 'Computer Science',
                    floor: '4',
                    professor: 'Hazel Espinorio',
                    time: '9:00 AM - 10:30 AM'
                },
                {
                    roomNumber: '101',
                    roomType: 'Laboratory',
                    subject: 'Human Computer Interaction',
                    floor: '5',
                    professor: 'Rey Bautista',
                    time: '1:00 PM - 4:00 PM'
                }
            ];
        }
        displayRooms(classRooms);
    }
});