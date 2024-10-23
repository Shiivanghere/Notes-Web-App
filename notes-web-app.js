document.addEventListener("DOMContentLoaded", function () {
  const loginFormElement = document.getElementById("loginFormElement");

  const webAppName = document.getElementById("web-app-name") ;

  const firstPageLogin = document.getElementById("loginForm");

  const greeting = document.querySelector(".greeting");

  const showname = document.getElementById("showname");

  const noteholder = document.getElementById("noteholder");

  const noteentry = document.getElementById("noteentry");

  const thought = document.getElementById("thought");

  const notedata = document.getElementById("notedata");

  const categoryselected = document.getElementById("categoryselected");

  const notelist = document.getElementById("notelist");

  const logoutbtn = document.getElementById("logoutbtn");

  const searchquery = document.getElementById("searchquery");

  const sortOptions = document.getElementById("sortOptions");

  const noteHeading = document.getElementById("noteHeading");

  const toggleModeButton = document.getElementById("toggleModeButton");



  //USER EXISTS OR NOT



  const existingname = localStorage.getItem("username");
  if (existingname) {
    showname.textContent = existingname;
    noteholder.style.display = "block";
    loginFormElement.style.display = "none";
    firstPageLogin.style.display = "none";
    greeting.style.display = "block";
    thought.style.display = "none";
    webAppName.style.display = "none" ;
    fetchnotes();
  } else {
    loginFormElement.style.display = "block";
    greeting.style.display = "none";
    noteholder.style.display = "none";
  }

  // USER LOGGING IN

  loginFormElement.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;

    localStorage.setItem("username", username);
    showname.textContent = username;

    greeting.style.display = "block";
    noteholder.style.display = "block";
    loginFormElement.style.display = "none";
    firstPageLogin.style.display = "none";
    thought.style.display = "none";
    webAppName.style.display = "none" ;

    fetchnotes();
  });

  // LOGGING OUT

  logoutbtn.addEventListener("click", function () {
    localStorage.removeItem("username");
    firstPageLogin.style.display="block";
    loginFormElement.style.display = "block";
    thought.style.display = "block";
    webAppName.style.display = "block" ;
    greeting.style.display = "none";
    noteholder.style.display = "none";
    showname.textContent = " ";
    notelist.innerHTML = " ";
  });

   // LIGHT/DARK MODE

   const defaultmode = localStorage.getItem("mode");
   if (defaultmode) {
     document.body.classList.add(defaultmode);
     toggleModeButton.textContent =
       defaultmode === "dark-mode"
         ? "Switch to Light Mode"
         : "Switch to Dark Mode";
   } else {
     document.body.classList.add("light-mode");
   }
 
   toggleModeButton.addEventListener("click", function () {
     document.body.classList.toggle("dark-mode");
     document.body.classList.toggle("light-mode");
 
     const currentMode = document.body.classList.contains("dark-mode")
       ? "dark-mode"
       : "light-mode";
     localStorage.setItem("mode", currentMode);

      //BUTTON CONTENT CHANGED

    toggleModeButton.textContent =
    currentMode === "dark-mode"
      ? "Switch to Light Mode"
      : "Switch to Dark Mode";
});


  //LOADING THE NOTES AND ADDING PINNING FUNCTIONALITY

  function fetchnotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];

    const pinnedNotes = notes.filter((note) => note.pinned);
    const unpinnedNotes = notes.filter((note) => !note.pinned);
    const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

    notelist.innerHTML = "";
    sortedNotes.forEach((note, index) => {
      const li = document.createElement("li");
      li.className = note.pinned ? "pinned-note" : "";
      li.draggable = true;
      li.style.backgroundColor = note.category;
      li.innerHTML = `<strong>${note.title}</strong><br>${note.content} <br>
                            Created: ${new Date(
                              note.createdDate
                            ).toLocaleString()} <br>
                            Last Edited: ${new Date(
                              note.lastEdited
                            ).toLocaleString()} <br>
                            <button class="edit-button" data-index="${index}">Edit</button>
                            <button class="delete-button" data-index="${index}">Delete</button>
                            <button class="pin-button" data-index="${index}">${
        note.pinned ? "Unpin" : "Pin"
      }</button>`;
      notelist.appendChild(li);
    });
    addEditButtonListeners();
    addDeleteButtonListeners();
    addPinButtonListeners();
    addDragAndDropListeners();
  }

  
  // SUBMITTING THE NOTES USING SAVE NOTES

 noteentry.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = noteHeading.value;
    const content = notedata.value;
    const category = categoryselected.value;

    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const note = {
      title,
      content,
      category,
      createdDate: new Date(),
      lastEdited: new Date(),
      pinned: false,
    };
    notes.push(note);
    localStorage.setItem("notes", JSON.stringify(notes));

    noteHeading.value = "";
    notedata.value = "";
    categoryselected.value = "";
    fetchnotes();
  });

  //EDIT BUTTON

  
  function addEditButtonListeners() {
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        noteHeading.value = notes[index].title;
        notedata.value = notes[index].content;
        categoryselected.value = notes[index].category;

        notes[index].lastEdited = new Date();
        localStorage.setItem("notes", JSON.stringify(notes));

        notes.splice(index, 1);
        localStorage.setItem("notes", JSON.stringify(notes));
        fetchnotes();
      });
    });
  }

  //DELETE BUTTON

  function addDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        const notes = JSON.parse(localStorage.getItem("notes")) || [];

        notes.splice(index, 1);
        localStorage.setItem("notes", JSON.stringify(notes));
        fetchnotes();
      });
    });
  }

  //PIN BUTTON

  function addPinButtonListeners() {
    const pinButtons = document.querySelectorAll(".pin-button");
    pinButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index");
        const notes = JSON.parse(localStorage.getItem("notes")) || [];

        notes[index].pinned = !notes[index].pinned;

        localStorage.setItem("notes", JSON.stringify(notes));

        fetchnotes();
      });
    });
  }

  // SEARCHING FUNCTIONALITY IMPLEMENTATION


  searchquery.addEventListener("input", function () {
    const query = searchquery.value.toLowerCase();
    filterNotes(query);
  });

  function filterNotes(query) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notelist.innerHTML = "";
    notes.forEach((note, index) => {
      if (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      ) {
        const li = document.createElement("li");
        li.style.backgroundColor = note.category;
        li.innerHTML = `<strong>${note.title}</strong><br>${note.content} <br>
                                Created: ${new Date(
                                  note.createdDate
                                ).toLocaleString()}<br>
                                Last Edited: ${new Date(
                                  note.lastEdited
                                ).toLocaleString()} <br>
                                <button class="edit-button" data-index="${index}">Edit</button>
                                <button class="delete-button" data-index="${index}">Delete</button>
                                <button class="pin-button" data-index="${index}">${
          note.pinned ? "Unpin" : "Pin"
        }</button>`;
        notelist.appendChild(li);
      }
    });
    addEditButtonListeners();
    addDeleteButtonListeners();
    addPinButtonListeners();
  }

  //SORTING FUNCTIONALITY IMPLEMENTATION

  sortOptions.addEventListener("change", function () {
    const sortBy = this.value;
    sortNotes(sortBy);
  });

  function sortNotes(sortBy) {
    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    if (sortBy === "title") {
      notes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "date") {
      notes.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }
    localStorage.setItem("notes", JSON.stringify(notes));
    fetchnotes();
  }

  // DRAG AND DROP

  function addDragAndDropListeners() {
    const notes = notelist.querySelectorAll("li");
    notes.forEach((note) => {
      note.addEventListener("dragstart", function () {
        note.classList.add("dragging");
      });

      note.addEventListener("dragend", function () {
        note.classList.remove("dragging");
      });

      note.addEventListener("dragover", function (event) {
        event.preventDefault();
        const afterElement = getDragAfterElement(notelist, event.clientY);
        const dragging = document.querySelector(".dragging");
        if (afterElement == null) {
          notelist.appendChild(dragging);
        } else {
          notelist.insertBefore(dragging, afterElement);
        }
      });
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll("li:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
});
