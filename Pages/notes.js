// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const noteInput = document.getElementById('inpt');
    const categorySelect = document.getElementById('category');
    const addButton = document.getElementById('btn');
    const noteList = document.getElementById('note-list');
    const modal = document.getElementById('category-modal');
    const manageCategories = document.getElementById('manage-categories');
    const closeModal = document.getElementById('close-modal');
    const newCategoryInput = document.getElementById('new-category');
    const addCategoryBtn = document.getElementById('add-category');
    const categoryList = document.getElementById('category-list');

    // Load existing notes and categories from localStorage
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || [
        'Science', 'Math', 'History', 'PE' // Default categories
    ];

    // Function to save notes to localStorage
    function saveNotesToStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Function to save categories to localStorage
    function saveCategoriesToStorage() {
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    // Function to update category select options
    function updateCategorySelect() {
        categorySelect.innerHTML = '';
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Function to display categories in the modal
    function displayCategories() {
        categoryList.innerHTML = '';
        categories.sort().forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            
            const categoryName = document.createElement('span');
            categoryName.textContent = category;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-category';
            deleteBtn.textContent = '×';
            deleteBtn.onclick = () => deleteCategory(category);
            
            li.appendChild(categoryName);
            li.appendChild(deleteBtn);
            categoryList.appendChild(li);
        });
    }

    // Function to add a new category
    function addCategory(categoryName) {
        categoryName = categoryName.trim();
        if (categoryName && !categories.includes(categoryName)) {
            categories.push(categoryName);
            saveCategoriesToStorage();
            updateCategorySelect();
            displayCategories();
            newCategoryInput.value = '';
        }
    }

    // Function to delete a category
    function deleteCategory(category) {
        if (categories.length <= 1) {
            alert('You must keep at least one category!');
            return;
        }
        
        const confirmDelete = confirm(`Are you sure you want to delete the category "${category}"? Notes with this category will keep it until you change them.`);
        if (confirmDelete) {
            categories = categories.filter(c => c !== category);
            saveCategoriesToStorage();
            updateCategorySelect();
            displayCategories();
        }
    }

    // Function to create a formatted timestamp
    function getFormattedTimestamp() {
        const now = new Date();
        return now.toLocaleString();
    }

    // Function to create a new note element
    function createNoteElement(note) {
        const li = document.createElement('li');
        li.className = 'note-item';
        
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
        
        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'category-badge';
        categoryBadge.textContent = note.category;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = note.timestamp;
        
        const text = document.createElement('div');
        text.className = 'note-text';
        text.textContent = note.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = () => {
            notes = notes.filter(n => n.id !== note.id);
            saveNotesToStorage();
            displayNotes();
        };
        
        noteContent.appendChild(categoryBadge);
        noteContent.appendChild(timestamp);
        noteContent.appendChild(text);
        li.appendChild(noteContent);
        li.appendChild(deleteBtn);
        
        return li;
    }

    // Function to display all notes
    function displayNotes() {
        noteList.innerHTML = '';
        notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (notes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No notes yet. Start writing!';
            noteList.appendChild(emptyMessage);
            return;
        }
        
        notes.forEach(note => {
            const noteElement = createNoteElement(note);
            noteList.appendChild(noteElement);
        });
    }

    // Add note when button is clicked
    addButton.addEventListener('click', function() {
        const text = noteInput.value.trim();
        if (!text) return;

        const newNote = {
            id: Date.now(),
            text: text,
            category: categorySelect.options[categorySelect.selectedIndex].text,
            timestamp: getFormattedTimestamp()
        };

        notes.push(newNote);
        saveNotesToStorage();
        displayNotes();

        // Clear input
        noteInput.value = '';
    });

    // Add note when Enter is pressed (Shift + Enter for new line)
    noteInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addButton.click();
        }
    });

    // Modal event listeners
    manageCategories.addEventListener('click', () => {
        modal.style.display = 'block';
        displayCategories();
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add category when button is clicked
    addCategoryBtn.addEventListener('click', () => {
        addCategory(newCategoryInput.value);
    });

    // Add category when Enter is pressed
    newCategoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCategory(newCategoryInput.value);
        }
    });

    // Initialize the page
    updateCategorySelect();
    displayNotes();
}); 