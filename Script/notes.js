document.addEventListener("DOMContentLoaded", loadNotes);

document.getElementById("saveNote").addEventListener("click", function() {
    let tag = document.getElementById("noteTag").value.trim();
    let noteText = document.getElementById("noteInput").value.trim();
    if (!noteText) return;
    
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({ tag, text: noteText, date: new Date().toISOString(), pinned: false });
    localStorage.setItem("notes", JSON.stringify(notes));
    
    document.getElementById("noteTag").value = "";
    document.getElementById("noteInput").value = "";
    loadNotes();
});

document.getElementById("searchNote").addEventListener("input", function() {
    loadNotes();
});

document.getElementById("sortNotes").addEventListener("change", function() {
    loadNotes();
});

document.getElementById("toggleDarkMode").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});

function loadNotes() {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let searchQuery = document.getElementById("searchNote").value.toLowerCase();
    let sortOption = document.getElementById("sortNotes").value;
    let noteList = document.getElementById("noteList");
    noteList.innerHTML = "";

    if (sortOption === "date") {
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === "tag") {
        notes.sort((a, b) => (a.tag || "").localeCompare(b.tag || ""));
    }

    notes = notes.filter(note => note.text.toLowerCase().includes(searchQuery));

    notes.forEach((note, index) => {
        let div = document.createElement("div");
        div.classList.add("note-item");
        div.innerHTML = `
            <strong>${note.tag ? note.tag : "No Tag"}:</strong> ${note.text} 
            <button onclick="deleteNote(${index})">❌</button>
            <button onclick="pinNote(${index})">📌</button>
            <button onclick="exportNote('${note.text}')">📄</button>
        `;
        noteList.appendChild(div);
    });
}

function deleteNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes();
}

function pinNote(index) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes[index].pinned = !notes[index].pinned;
    notes.sort((a, b) => b.pinned - a.pinned);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes();
}

function exportNote(text) {
    let blob = new Blob([text], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "note.txt";
    a.click();
}