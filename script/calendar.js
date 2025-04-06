class Calendar {
    constructor() {
        this.today = new Date();
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.schedules = JSON.parse(localStorage.getItem('schoolSchedules')) || {};
        this.initializeCalendar();
    }

    initializeCalendar() {
        const calendarSection = document.getElementById('calendar');
        calendarSection.innerHTML = `
            <div class="calendar-header">
                <button id="prevMonth">&lt;</button>
                <h2 id="monthDisplay"></h2>
                <button id="nextMonth">&gt;</button>
            </div>
            <div class="calendar-grid">
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
            </div>
            <div id="scheduleModal" class="modal">
                <div class="modal-content">
                    <h3>Add School Schedule</h3>
                    <input type="text" id="scheduleTitle" placeholder="Schedule Title">
                    <textarea id="scheduleDetails" placeholder="Schedule Details"></textarea>
                    <div class="modal-buttons">
                        <button id="saveSchedule">Save</button>
                        <button id="cancelSchedule">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
        
        this.renderCalendar();
    }

    renderCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        document.getElementById('monthDisplay').textContent = 
            `${this.months[this.currentMonth]} ${this.currentYear}`;

        const calendarGrid = document.querySelector('.calendar-grid');

        const weekdayElements = document.querySelectorAll('.weekday');
        calendarGrid.innerHTML = '';
        weekdayElements.forEach(el => calendarGrid.appendChild(el.cloneNode(true)));

        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'calendar-day';
            const dateString = this.formatDate(this.currentYear, this.currentMonth, day);
            
            if (this.schedules[dateString]) {
                dateCell.classList.add('has-schedule');
            }

            dateCell.innerHTML = `
                <span class="date-number">${day}</span>
                ${this.schedules[dateString] ? '<div class="schedule-indicator"></div>' : ''}
            `;

            dateCell.addEventListener('click', () => this.openScheduleModal(dateString));
            calendarGrid.appendChild(dateCell);
        }
    }

    formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
    }

    openScheduleModal(date) {
        const modal = document.getElementById('scheduleModal');
        const titleInput = document.getElementById('scheduleTitle');
        const detailsInput = document.getElementById('scheduleDetails');

        if (this.schedules[date]) {
            titleInput.value = this.schedules[date].title;
            detailsInput.value = this.schedules[date].details;
        } else {
            titleInput.value = '';
            detailsInput.value = '';
        }

        modal.style.display = 'block';

        const saveSchedule = () => {
            if (titleInput.value.trim()) {
                this.schedules[date] = {
                    title: titleInput.value.trim(),
                    details: detailsInput.value.trim()
                };
                localStorage.setItem('schoolSchedules', JSON.stringify(this.schedules));
                this.renderCalendar();
                modal.style.display = 'none';
            }
        };

        const closeModal = () => {
            modal.style.display = 'none';
        };

        document.getElementById('saveSchedule').onclick = saveSchedule;
        document.getElementById('cancelSchedule').onclick = closeModal;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
