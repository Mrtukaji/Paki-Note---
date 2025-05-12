document.addEventListener('DOMContentLoaded', function() {

    const noteInput = document.getElementById('inpt');
    const categorySelect = document.getElementById('category');
    const addButton = document.getElementById('btn');
    const noteList = document.getElementById('note-list');
    const modal = document.getElementById('category-modal');
    const manageCategories = document.getElementById('manage-categories');
    const modalClose = document.querySelector('.modal-close');
    const newCategoryInput = document.getElementById('new-category');
    const addCategoryBtn = document.getElementById('add-category');
    const categoryList = document.getElementById('category-list');
    const searchInput = document.getElementById('search-notes');
    const filterCategory = document.getElementById('filter-category');

    const fontSizeSelect = document.getElementById('font-size');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');
    const textColorInput = document.getElementById('text-color');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || ['General', 'Personal', 'Work', 'Study'];
    let currentFormatting = {
        fontSize: '16px',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        color: '#000000'
    };

    function saveNotesToStorage() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function saveCategoriesToStorage() {
        localStorage.setItem('categories', JSON.stringify(categories));
        updateCategorySelect();
        updateFilterCategories();
    }

    function updateTextFormatting() {
        noteInput.style.fontSize = currentFormatting.fontSize;
        noteInput.style.fontWeight = currentFormatting.isBold ? 'bold' : 'normal';
        noteInput.style.fontStyle = currentFormatting.isItalic ? 'italic' : 'normal';
        noteInput.style.textDecoration = currentFormatting.isUnderline ? 'underline' : 'none';
        noteInput.style.color = currentFormatting.color;
    }

    function toggleFormatButton(button, isActive) {
        if (isActive) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }

    fontSizeSelect.addEventListener('change', (e) => {
        currentFormatting.fontSize = e.target.value + 'px';
        updateTextFormatting();
    });

    boldBtn.addEventListener('click', () => {
        currentFormatting.isBold = !currentFormatting.isBold;
        toggleFormatButton(boldBtn, currentFormatting.isBold);
        updateTextFormatting();
    });

    italicBtn.addEventListener('click', () => {
        currentFormatting.isItalic = !currentFormatting.isItalic;
        toggleFormatButton(italicBtn, currentFormatting.isItalic);
        updateTextFormatting();
    });

    underlineBtn.addEventListener('click', () => {
        currentFormatting.isUnderline = !currentFormatting.isUnderline;
        toggleFormatButton(underlineBtn, currentFormatting.isUnderline);
        updateTextFormatting();
    });

    textColorInput.addEventListener('input', (e) => {
        currentFormatting.color = e.target.value;
        updateTextFormatting();
    });

    function updateCategorySelect() {
        categorySelect.innerHTML = '';
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    function updateFilterCategories() {
        // Keep the "All Categories" option
        filterCategory.innerHTML = '<option value="all">All Categories</option>';
        
        // Add all categories as options
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategory.appendChild(option);
        });
    }

    function displayCategories() {
        categoryList.innerHTML = '';
        categories.sort().forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            
            const categoryName = document.createElement('span');
            categoryName.textContent = category;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-category';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = () => deleteCategory(category);
            
            li.appendChild(categoryName);
            li.appendChild(deleteBtn);
            categoryList.appendChild(li);
        });
    }

    function addCategory(categoryName) {
        categoryName = categoryName.trim();
        if (!categoryName) {
            alert('Please enter a category name.');
            return;
        }
        
        if (categories.includes(categoryName)) {
            alert('This category already exists.');
            return;
        }

        categories.push(categoryName);
        saveCategoriesToStorage();
        displayCategories();
        newCategoryInput.value = '';
    }

    function deleteCategory(category) {
        if (categories.length <= 1) {
            alert('You must keep at least one category!');
            return;
        }
        
        const confirmDelete = confirm(`Are you sure you want to delete the category "${category}"?\nNotes with this category will keep it until you change them.`);
        if (confirmDelete) {
            categories = categories.filter(c => c !== category);
            saveCategoriesToStorage();
            displayCategories();
        }
    }

    function getFormattedTimestamp() {
        const now = new Date();
        return now.toLocaleString();
    }

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
        
        if (note.formatting) {
            text.style.fontSize = note.formatting.fontSize;
            text.style.fontWeight = note.formatting.isBold ? 'bold' : 'normal';
            text.style.fontStyle = note.formatting.isItalic ? 'italic' : 'normal';
            text.style.textDecoration = note.formatting.isUnderline ? 'underline' : 'none';
            text.style.color = note.formatting.color;
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = () => {
            const confirmDelete = confirm('Are you sure you want to delete this note?');
            if (confirmDelete) {
                notes = notes.filter(n => n.id !== note.id);
                saveNotesToStorage();
                displayNotes();
            }
        };
        
        noteContent.appendChild(categoryBadge);
        noteContent.appendChild(timestamp);
        noteContent.appendChild(text);
        li.appendChild(noteContent);
        li.appendChild(deleteBtn);
        
        return li;
    }

    function displayNotes() {
        noteList.innerHTML = '';
        
        // Get search and filter values
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterCategory.value;
        
        // Filter notes based on search term and category
        let filteredNotes = notes.filter(note => {
            const matchesSearch = note.text.toLowerCase().includes(searchTerm);
            const matchesCategory = filterValue === 'all' || note.category === filterValue;
            return matchesSearch && matchesCategory;
        });
        
        // Sort notes by timestamp (newest first)
        filteredNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (filteredNotes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            
            if (notes.length === 0) {
                emptyMessage.textContent = 'No notes yet. Start writing!';
            } else {
                emptyMessage.textContent = 'No notes match your search or filter criteria.';
            }
            
            noteList.appendChild(emptyMessage);
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteElement = createNoteElement(note);
            noteList.appendChild(noteElement);
        });
    }

    addButton.addEventListener('click', function() {
        const text = noteInput.value.trim();
        if (!text) {
            alert('Please enter some text for your note.');
            return;
        }

        const newNote = {
            id: Date.now(),
            text: text,
            category: categorySelect.options[categorySelect.selectedIndex].text,
            timestamp: getFormattedTimestamp(),
            formatting: { ...currentFormatting }
        };

        notes.push(newNote);
        saveNotesToStorage();
        displayNotes();
        noteInput.value = '';
    });

    noteInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addButton.click();
        }
    });

    // Add event listeners for search and filter
    searchInput.addEventListener('input', displayNotes);
    filterCategory.addEventListener('change', displayNotes);

    manageCategories.addEventListener('click', () => {
        modal.style.display = 'block';
        displayCategories();
    });

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    addCategoryBtn.addEventListener('click', () => {
        addCategory(newCategoryInput.value);
    });

    newCategoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCategory(newCategoryInput.value);
        }
    });

    updateCategorySelect();
    updateFilterCategories();
    displayNotes();
    updateTextFormatting();

    toggleFormatButton(boldBtn, currentFormatting.isBold);
    toggleFormatButton(italicBtn, currentFormatting.isItalic);
    toggleFormatButton(underlineBtn, currentFormatting.isUnderline);
});