document.addEventListener('DOMContentLoaded', function() {
    // Calendar functionality
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const modal = document.getElementById('scheduleModal');
    const closeBtn = document.querySelector('.close');
    const scheduleForm = document.getElementById('scheduleForm');
    const selectedDateElement = document.getElementById('selectedDate');
    const eventForm = document.getElementById('eventForm');
    const eventsListElement = document.getElementById('eventsList');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Load saved data from localStorage
    // Change schedules to store arrays of classes for each date
    let schedules = JSON.parse(localStorage.getItem('schedules')) || {};
    // Convert old format to new format if needed
    for (const dateKey in schedules) {
        if (!Array.isArray(schedules[dateKey])) {
            schedules[dateKey] = [schedules[dateKey]];
        }
    }
    let events = JSON.parse(localStorage.getItem('events')) || [];
    
    // Initialize calendar
    function initCalendar() {
        renderCalendar();
        displayEvents();
        
        // Event listeners
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
        
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSchedule();
        });
        
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addEvent();
        });
    }
    
    // Render the calendar
    function renderCalendar() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        currentMonthElement.textContent = `${months[currentMonth]} ${currentYear}`;
        
        // Clear previous days
        calendarDays.innerHTML = '';
        
        // Get first day of month and total days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Add days from previous month
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthLastDay - i, true);
            dayElement.classList.add('other-month');
            calendarDays.appendChild(dayElement);
        }
        
        // Add days of current month
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = createDayElement(day, false);
            
            // Check if it's today
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Check if it's a Sunday
            if (new Date(currentYear, currentMonth, day).getDay() === 0) {
                dayElement.classList.add('sunday');
            }
            
            // Check if day has events
            const dateString = formatDate(currentYear, currentMonth, day);
            if ((schedules[dateString] && schedules[dateString].length > 0) || 
                events.some(event => event.date === dateString)) {
                dayElement.classList.add('has-event');
                
                // Add event indicators (dots) for each event/class
                const totalItems = (schedules[dateString] ? schedules[dateString].length : 0) + 
                                  events.filter(event => event.date === dateString).length;
                
                if (totalItems > 0) {
                    const indicatorsContainer = document.createElement('div');
                    indicatorsContainer.classList.add('event-indicators');
                    
                    // Limit to showing max 3 indicators
                    const maxIndicators = Math.min(totalItems, 3);
                    for (let i = 0; i < maxIndicators; i++) {
                        const indicator = document.createElement('span');
                        indicator.classList.add('event-indicator');
                        indicatorsContainer.appendChild(indicator);
                    }
                    
                    dayElement.appendChild(indicatorsContainer);
                }
            }
            
            calendarDays.appendChild(dayElement);
        }
        
        // Add days from next month if needed
        const totalCells = 42; // 6 rows of 7 days
        const remainingCells = totalCells - (startingDay + totalDays);
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = createDayElement(i, true);
            dayElement.classList.add('other-month');
            calendarDays.appendChild(dayElement);
        }
    }
    
    // Create a day element for the calendar
    function createDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        const dateElement = document.createElement('div');
        dateElement.classList.add('date');
        dateElement.textContent = day;
        dayElement.appendChild(dateElement);
        
        // Only add click event for current month days
        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => {
                const clickedDate = new Date(currentYear, currentMonth, day);
                openScheduleModal(clickedDate);
            });
        }
        
        return dayElement;
    }
    
    // Open the schedule modal for a specific date
    function openScheduleModal(date) {
        selectedDateElement.textContent = formatDateForDisplay(date);
        
        // Store the selected date as a data attribute
        scheduleForm.dataset.date = formatDate(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Clear the form for new entry
        scheduleForm.reset();
        
        // Show existing schedules for this date
        const dateString = scheduleForm.dataset.date;
        displayExistingSchedules(dateString);
        
        modal.style.display = 'block';
    }
    
    // Display existing schedules for a date
    function displayExistingSchedules(dateString) {
        // Check if there's a container for existing schedules
        let existingContainer = document.getElementById('existingSchedules');
        if (!existingContainer) {
            existingContainer = document.createElement('div');
            existingContainer.id = 'existingSchedules';
            existingContainer.classList.add('existing-schedules');
            
            // Insert after the selected date heading
            const selectedDateElement = document.getElementById('selectedDate');
            selectedDateElement.insertAdjacentElement('afterend', existingContainer);
        }
        
        existingContainer.innerHTML = '<h3>Existing Classes</h3>';
        
        if (!schedules[dateString] || schedules[dateString].length === 0) {
            existingContainer.innerHTML += '<p>No classes scheduled for this day.</p>';
            return;
        }
        
        const schedulesList = document.createElement('div');
        schedulesList.classList.add('schedules-list');
        
        schedules[dateString].forEach((schedule, index) => {
            const scheduleItem = document.createElement('div');
            scheduleItem.classList.add('schedule-item');
            
            scheduleItem.innerHTML = `
                <div class="schedule-details">
                    <strong>${schedule.className}</strong>
                    <p>Time: ${formatTime(schedule.classTime)}</p>
                    <p>Professor: ${schedule.professor || 'N/A'}</p>
                    <p>Room: ${schedule.room || 'N/A'}</p>
                </div>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            
            schedulesList.appendChild(scheduleItem);
        });
        
        existingContainer.appendChild(schedulesList);
        
        // Add event listeners to delete buttons
        const deleteButtons = existingContainer.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deleteSchedule(dateString, index);
            });
        });
    }
    
    // Delete a schedule
    function deleteSchedule(dateString, index) {
        schedules[dateString].splice(index, 1);
        
        // If no more schedules for this date, remove the date entry
        if (schedules[dateString].length === 0) {
            delete schedules[dateString];
        }
        
        localStorage.setItem('schedules', JSON.stringify(schedules));
        displayExistingSchedules(dateString);
        renderCalendar(); // Update calendar to show events
    }
    
    // Save schedule data
    function saveSchedule() {
        const dateString = scheduleForm.dataset.date;
        
        const newSchedule = {
            className: document.getElementById('className').value,
            classTime: document.getElementById('classTime').value,
            professor: document.getElementById('professor').value,
            room: document.getElementById('room').value
        };
        
        // Initialize array if it doesn't exist
        if (!schedules[dateString]) {
            schedules[dateString] = [];
        }
        
        // Add new schedule
        schedules[dateString].push(newSchedule);
        
        localStorage.setItem('schedules', JSON.stringify(schedules));
        scheduleForm.reset();
        displayExistingSchedules(dateString);
        renderCalendar(); // Update calendar to show events
    }
    
    // Add a new event
    function addEvent() {
        const newEvent = {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            description: document.getElementById('eventDescription').value
        };
        
        events.push(newEvent);
        
        // Sort events by date
        events.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
        
        localStorage.setItem('events', JSON.stringify(events));
        eventForm.reset();
        displayEvents();
        renderCalendar(); // Update calendar to show events
    }
    
    // Display events in the upcoming events section
    function displayEvents() {
        eventsListElement.innerHTML = '';
        
        if (events.length === 0) {
            eventsListElement.innerHTML = '<p>No upcoming events</p>';
            return;
        }
        
        // Filter to show only upcoming events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
        });
        
        if (upcomingEvents.length === 0) {
            eventsListElement.innerHTML = '<p>No upcoming events</p>';
            return;
        }
        
        // Display only the next 5 events
        const eventsToShow = upcomingEvents.slice(0, 5);
        
        eventsToShow.forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.classList.add('event-item');
            
            eventElement.innerHTML = `
                <h3>${event.title}</h3>
                <p class="event-date">${formatDateForDisplay(new Date(event.date))}</p>
                <p class="event-time">${formatTime(event.time)}</p>
                ${event.description ? `<p>${event.description}</p>` : ''}
                <button class="delete-event-btn" data-index="${events.indexOf(event)}">Delete</button>
            `;
            
            eventsListElement.appendChild(eventElement);
        });
        
        // Add event listeners to delete buttons
        const deleteButtons = eventsListElement.querySelectorAll('.delete-event-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deleteEvent(index);
            });
        });
    }
    
    // Delete an event
    function deleteEvent(index) {
        events.splice(index, 1);
        localStorage.setItem('events', JSON.stringify(events));
        displayEvents();
        renderCalendar(); // Update calendar to show events
    }
    
    // Helper function to format date as YYYY-MM-DD
    function formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // Helper function to format date for display
    function formatDateForDisplay(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Helper function to format time
    function formatTime(timeString) {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        
        return `${formattedHour}:${minutes} ${period}`;
    }
    
    // Initialize the calendar
    initCalendar();
});