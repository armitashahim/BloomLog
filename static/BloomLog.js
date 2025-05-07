window.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");
});

function showGuestBanner() {
    const email = localStorage.getItem("email");
    const pathname = window.location.pathname;

    const isJournal = pathname.includes("journal");
    const isTodo = pathname.includes("todoList");

    if (email || (!isJournal && !isTodo)) return; 

    const banner = document.createElement("div");
    banner.textContent = "✨ Feel free to explore! Your changes are temporary until you sign in or register.";
    banner.style = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: #ffe58f;
        color: #333;
        padding: 5px;
        text-align: center;
        font-weight: bold;
        border-top: 2px solid #f0ad4e;
        font-family: sans-serif;
        z-index: 9999;
        box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    `;

    document.body.insertBefore(banner, document.body.firstChild);
}

function setupRegisterForm() {
    const signUpBtn = document.getElementById("sUBtn");
    if (!signUpBtn) return;
  
    signUpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const username = document.getElementById("username")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value.trim();
  
      if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
      }
  
      fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server error ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.message === "User already exists") {
          alert("This email is already registered.");
        } else {
          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);
          localStorage.setItem("journals", JSON.stringify(data.journals || []));
          localStorage.setItem("todos", JSON.stringify(data.todos || []));
          window.location.href = "/profile";
        }
      })
      .catch(err => {
        alert("Something went wrong during registration.");
        console.error("Registration error:", err);
      });
    });
}
  
function setupLoginForm() {
    const signInBtn = document.getElementById("sIBtn");
    if (!signInBtn) return;
  
    signInBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value.trim();
  
      if (!email || !password) {
        alert("Please fill in all fields.");
        return;
      }
  
      fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.message === "Invalid credentials") {
            alert("Incorrect email or password.");
          } else {
            localStorage.setItem("username", data.username);
            localStorage.setItem("email", data.email);
            localStorage.setItem("journals", JSON.stringify(data.journals || []));
            localStorage.setItem("todos", JSON.stringify(data.todos || []));
            window.location.href = "/profile";
          }
        })
        .catch(err => {
          console.error("Login error:", err);
          alert("Something went wrong.");
        });
    });
}

function showProfileIconIfLoggedIn() {
    const email = localStorage.getItem("email");
    if (!email) return;
  
    document.getElementById("signIn")?.remove();
    document.getElementById("register")?.remove();
  
    const img = document.createElement("img");
    img.src = "/Images/user.svg";
    img.className = "circlebtn";
    img.onclick = () => window.location.href = "/profile";
  
    document.querySelector(".header-right")?.appendChild(img);
}
  

// 🌗 THEME MANAGEMENT
function setupThemeListeners() {
    const darkSwitch = document.getElementById("theme-switch");
    const contrastSwitch = document.getElementById("high-contrast");

    const modes = [
        { key: "darkmode", class: "darkmode", toggle: darkSwitch },
        { key: "contrast", class: "contrast", toggle: contrastSwitch },
    ];

    modes.forEach(({ key, class: className, toggle }) => {
        if (localStorage.getItem(key) === "active") {
            document.body.classList.add(className);
        }
        toggle?.addEventListener("click", () => {
            const active = document.body.classList.toggle(className);
            localStorage.setItem(key, active ? "active" : null);
            updateGlobalProgress();
        });
    });
}
  
  
// MENU FUNCTIONS
function openMenu() { 
    document.getElementById("myMenu").style.width = "250px"; 
}
function closeMenu() { 
    document.getElementById("myMenu").style.width = "0"; 
}
function toggleSubmenu(id) {
    const submenu = document.getElementById(id);
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}

function openCustomize() { 
    document.getElementById("myStyle").style.width = "250px"; 
}
function closeCustomize() { 
    document.getElementById("myStyle").style.width = "0"; 
}
  
// PAGE & TEXT CUSTOMIZATION 
function formatText(command) { 
    document.execCommand(command, false, null); 
}

function changeFontSize(size) { 
    document.execCommand("fontSize", false, size); 
}

function changeFontColor(color) {
    document.execCommand("styleWithCSS", false, true);
    document.execCommand("foreColor", false, color);
}

function changeBgColor(color) {
    document.execCommand("hiliteColor", false, color);
}

function insertOrderedList() { 
    document.execCommand("insertOrderedList", false, null); 
}

function insertUnorderedList() { 
    document.execCommand("insertUnorderedList", false, null); 
}

function alignText(direction) { 
    document.execCommand(direction, false, null); 
}

function goToPage() {
    const input = document.getElementById("goToPageInput");
    const pageNum = parseInt(input.value);
    const editor = document.getElementById("editorContainer");
    const pages = editor?.querySelectorAll(".page");

    if (!pages || isNaN(pageNum) || pageNum < 1 || pageNum > pages.length) {
        alert(`Please enter a valid page number (1–${pages?.length || "?"})`);
        return;
    }

    const target = pages[pageNum - 1];
    target.scrollIntoView({ behavior: "smooth" });
    target.focus();
}
  
function setPageColor(color) {
    document.querySelectorAll('.page').forEach(p => p.style.backgroundColor = color);
    localStorage.setItem('journalPageColor', color);
}

function setTextColor(color) {
    document.querySelectorAll('.page').forEach(p => p.style.color = color);
    localStorage.setItem('baseTextColor', color);
}

function changeBackground(bg) {
    const body = document.body;
    if (bg.startsWith("url")) {
        body.style.backgroundImage = bg;
        body.style.backgroundSize = "cover";
        body.style.backgroundRepeat = "no-repeat";
        body.style.backgroundPosition = "center";
        body.style.backgroundAttachment = "fixed";
        body.style.backgroundColor = "transparent";
    } 
    else {
        body.style.backgroundImage = "none";
        body.style.backgroundColor = bg;
    }
    localStorage.setItem("customBg", bg);
    document.querySelectorAll('.bg-option').forEach(btn => btn.classList.remove('selected'));
    
    [...document.querySelectorAll('.bg-option')].find(btn =>
      btn.style.backgroundImage.includes(bg) || btn.style.backgroundColor === bg
    )?.classList.add('selected');
}

function resetBackground() {
  const body = document.body;

  body.style.backgroundImage = "none";
  body.style.backgroundColor = "";

  localStorage.removeItem("customBg");
  
  document.querySelectorAll('.color-choice, .bg-option, .submenu img').forEach(btn => {
    btn.classList?.remove('selected');
  });
}

function setupRandomBackgroundButton() {
  const randomBackgrounds = [
    {
      bg: "url('Images/bg_randomCat.jpg')",
      message: "touch some grass!"
    },
    {
      bg: "url('Images/bg_randomGhibli.gif')",
      message: "Ghibli vibes!:sparkles:"
    },
    {
      bg:  "url('Images/bg_randomshrek.jpg')",
      message:"Us looking at the screen after we found the little mistake that messes up the whole js "
    },
    {
      bg: "url('Images/bg_randomNyan.gif')",
      message: "NYAN CAT!"
    },
    {
      bg: "url('Images/bg_randomkirby.png')",
      message: "Typical microsoft background! or is it?..."
    }
  ];

  const btn = document.getElementById("randomBgBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const chosen = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
    changeBackground(chosen.bg); 
    alert(chosen.message);
  });
}

function setupStickerSystem() {
    let dragged = null;
  
    // Handle dragging
    function dragStart(e) {
      dragged = e.target;
    }
  
    document.addEventListener("dragover", e => e.preventDefault());
  
    document.addEventListener("drop", e => {
      if (!dragged) return;
      const page = e.target.closest(".page");
      if (!page) return;
  
      const rect = page.getBoundingClientRect();
      dragged.style.left = `${e.clientX - rect.left}px`;
      dragged.style.top = `${e.clientY - rect.top}px`;
  
      page.appendChild(dragged);
      dragged = null;
    });
  
    // Add sticker on click
    document.querySelectorAll(".sticker-option").forEach(sticker => {
      sticker.addEventListener("click", () => {
        const currentPage = document.querySelector(".page:last-child");
        if (!currentPage) {
          alert("Please open a journal page before adding stickers!");
          return;
        }
  
        const newSticker = document.createElement("img");
        newSticker.src = sticker.src;
        newSticker.classList.add("sticker");
        newSticker.setAttribute("draggable", "true");
        newSticker.style.position = "absolute";
        newSticker.style.left = "100px";
        newSticker.style.top = "100px";
  
        // Drag
        newSticker.addEventListener("dragstart", dragStart);
  
        // Delete on double-click
        newSticker.addEventListener("dblclick", () => {
          if (confirm("Delete this sticker?")) {
            newSticker.remove();
          }
        });
  
        currentPage.appendChild(newSticker);
      });
    });
}



// JOURNAL MANAGEMENT
function addJournal(nameFromPrompt = null) {
  const name = nameFromPrompt || prompt("Enter journal name:");
  if (!name) return;

  const email = localStorage.getItem("email");

  if (!email) {
    // Offline/Guest mode
    const journals = JSON.parse(localStorage.getItem("journals")) || [];
    journals.push({ name, pages: ["New Page"] });
    localStorage.setItem("journals", JSON.stringify(journals));
    loadJournals();
    return;
  }

  // Logged-in user → sync to backend
  fetch("http://localhost:3000/addJournal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, journalName: name })
  })
    .then(res => res.json())
    .then(data => {
      if (data.journals) {
        localStorage.setItem("journals", JSON.stringify(data.journals));
        loadJournals();
      }
    })
    .catch(err => {
      console.error("Add journal failed:", err);
      alert("Could not add journal. Check the server or your login status.");
    });
}

function loadJournals() {
  const menu = document.getElementById("journalsSubmenu");
  if (!menu) return;

  const email = localStorage.getItem("email");
  if (!email) return;

  menu.innerHTML = "";

  fetch(`http://localhost:3000/getJournals?email=${email}`)
    .then(res => res.json())
    .then(data => {
      const journals = data.journals;
      localStorage.setItem("journals", JSON.stringify(journals)); // Update localStorage

      // Handle each journal
      journals.forEach((journal, i) => {
        const link = document.createElement("a");
        link.textContent = journal.name;
        link.href = "#";
        link.onclick = e => {
          e.preventDefault();
          openJournal(i);
        };
        link.ondblclick = e => {
          e.preventDefault();
          renameJournal(i);
        };

        //  ICON LOGIC
        const icon = document.createElement("i");
        icon.style.marginLeft = "8px";
        icon.style.cursor = "pointer";

        if (journal.name === "Diary") {
          const diaryLocked = localStorage.getItem("diaryLocked") === "true";
          icon.className = diaryLocked ? "fa-solid fa-lock" : "fa-solid fa-lock-open";
          icon.onclick = e => {
            e.stopPropagation();
            toggleDiaryLock(icon);
          };
          link.appendChild(icon);
        } else if (journal.locked) {
          icon.className = "fa-solid fa-lock";
          icon.onclick = e => {
            e.stopPropagation();
            toggleJournalLock(i, icon);
          };
          link.appendChild(icon);
        }

        menu.appendChild(link);
      });

      // ➕ Add new journal option
      const addNew = document.createElement("a");
      addNew.textContent = "+ New Journal";
      addNew.href = "#";
      addNew.onclick = () => {
        const name = prompt("Enter journal name:");
        if (name) addJournal(name);
      };
      menu.appendChild(addNew);
    });
}

function toggleJournalLock(index, icon) {
  const journals = JSON.parse(localStorage.getItem("journals"));
  const journal = journals[index];
  const isLocked = journal.locked;

  const password = prompt(isLocked ? "Enter password to unlock:" : "Set a password to lock this journal:");
  if (!password) return;

  if (isLocked && password !== journal.password) {
    alert("Incorrect password!");
    return;
  }

  // Update lock state and password
  journal.locked = !isLocked;
  journal.password = isLocked ? "" : password;

  // Update UI
  icon.className = journal.locked ? "fa-solid fa-lock" : ""; // Remove open lock

  // Save locally and remotely
  localStorage.setItem("journals", JSON.stringify(journals));

  const email = localStorage.getItem("email");
  if (email) {
    fetch("http://localhost:3000/updateJournals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, journals })
    });
  }

  // Re-open journal if currently selected
  const currentIndex = parseInt(localStorage.getItem("currentJournalIndex"));
  const editorContainer = document.getElementById("editorContainer");
  if (currentIndex === index && editorContainer) {
    openJournal(index);
  }
}
  
function renameJournal(index) {
    const journals = JSON.parse(localStorage.getItem("journals")) || [];
    const newName = prompt("Enter new name:", journals[index].name);

    if (!newName || newName.trim() === "") return alert("Invalid name");

    journals[index].name = newName.trim();
    localStorage.setItem("journals", JSON.stringify(journals));

    const email = localStorage.getItem("email");
    if (!email) return;
    fetch("http://localhost:3000/renameJournal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, journalIndex: index, newName })
    });
    loadJournals();
}
  
function toggleDiaryLock(icon) {
  const isLocked = localStorage.getItem("diaryLocked") === "true";

  if (isLocked) {
    const password = prompt("Enter password to unlock:");
    if (password !== localStorage.getItem("diaryPassword")) {
      alert("Incorrect password!");
      return;
    }
    localStorage.setItem("diaryLocked", "false");
    localStorage.removeItem("diaryPassword");
    icon.className = "fa-solid fa-lock-open";
  } else {
    const password = prompt("Set a password to lock your Diary:");
    if (!password) return;
    localStorage.setItem("diaryLocked", "true");
    localStorage.setItem("diaryPassword", password);
    icon.className = "fa-solid fa-lock";
  }
}

function openDiary() {
  const locked = localStorage.getItem("diaryLocked") === "true";
  if (locked) {
    const entered = prompt("Enter diary password:");
    if (entered !== localStorage.getItem("diaryPassword")) {
      alert("Incorrect password!");
      return;
    }
  }
  openJournal(0); // open the first journal (the Diary)
}
  
function openJournal(index) {
  const journals = JSON.parse(localStorage.getItem("journals"));
  const journal = journals[index];

  if (index === 0) {
    const locked = localStorage.getItem("diaryLocked") === "true";
    if (locked) {
      const entered = prompt("Enter diary password:");
      if (entered !== localStorage.getItem("diaryPassword")) {
        alert("Incorrect password!");
        return;
      }
    }
  }

  // Check if locked
  if (index !== 0 && journal.locked) {
    const input = prompt("This journal is locked. Enter password to continue:");
    if (input !== journal.password) {
      alert("Incorrect password!");
      return;
    }
  }

  const editor = document.getElementById("editorContainer");
  if (!editor) return;

  editor.dataset.journalIndex = index;
  editor.innerHTML = "";

  if (!journal.pages || journal.pages.length === 0) {
      journal.pages = ["Start typing here..."];
  }

  journal.pages.forEach((page, i) => {
      const div = document.createElement("div");
      div.className = "page";
      div.contentEditable = true;
      div.oninput = () => savePage(index, i, div.innerHTML);
      div.innerHTML = page;
      editor.appendChild(div);
  });
}

function savePage(journalIndex, pageIndex, htmlContent = null) {
    const journals = JSON.parse(localStorage.getItem("journals")) || [];
    if (!journals[journalIndex]) return;

    if (htmlContent === null) {
        const editor = document.getElementById("editorContainer");
        const pageDiv = editor?.children[pageIndex];
        htmlContent = pageDiv?.innerHTML || "";
    }

    journals[journalIndex].pages[pageIndex] = htmlContent;
    localStorage.setItem("journals", JSON.stringify(journals));

    const email = localStorage.getItem("email");
    if (!email) return;
  
    fetch("http://localhost:3000/savePage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          journalIndex,
          pageIndex,
          content: htmlContent
        })  
    })
    .then(res => {
        if (!res.ok) throw new Error("Server failed to save");
        return res.json();
    })
    .then(() => {
        console.log("Saved page", pageIndex, "to journal", journalIndex);
    })
    .catch(err => {
        console.error("Error saving to server:", err);
    });
}

// JOURNAL PAGE SYSTEM
function addPageManually() {
  const container = document.getElementById("editorContainer");
  const journalIndex = parseInt(container?.dataset?.journalIndex);
  const email = localStorage.getItem("email");
  const journals = JSON.parse(localStorage.getItem("journals")) || [];

  if (!container || !email || isNaN(journalIndex) || !journals[journalIndex]) {
    console.warn("Cannot add page. Missing container, email, or journal index.");
    return;
  }

  // Add blank page to journal data
  journals[journalIndex].pages.push("");

  // Update localStorage
  localStorage.setItem("journals", JSON.stringify(journals));

  // Immediately reflect in UI
  const pageIndex = container.children.length;
  const newPage = document.createElement("div");
  newPage.className = "page";
  newPage.contentEditable = true;
  newPage.innerHTML = `<h3>Page ${pageIndex + 1}</h3><p></p>`;
  newPage.dataset.createdByButton = "true";

  // Trigger autosave if user starts typing
  newPage.oninput = () => {
    savePage(journalIndex, pageIndex, newPage.innerHTML);
    checkAutoAddPage(newPage);
  };

  container.appendChild(newPage);
  newPage.scrollIntoView({ behavior: "smooth" });
  newPage.focus();

  // Sync updated journals with server
  fetch("http://localhost:3000/updateJournals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, journals })
  })
  .then(res => {
    if (!res.ok) throw new Error("Failed to save new page to server.");
    return res.json();
  })
  .then(() => {
    console.log("New page saved to server.");
    showToast("Page added!");
  })
  .catch(err => {
    console.error("Save failed:", err);
    showToast("Failed to save page!", true);
  });
}

function checkAutoAddPage(page) {
    setTimeout(() => {
      const container = document.getElementById("editorContainer");
      const isLast = page === container.lastElementChild;
      const fullyScrolled = page.scrollHeight > page.offsetHeight + 10;
      if (isLast && fullyScrolled) {
        addPageManually();
      }
    }, 0);
}

function savePageContent(journalIndex, pageIndex, content) {
    const email = localStorage.getItem("email");
    if (!email) return;
  
    fetch("http://localhost:3000/savePage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, journalIndex, pageIndex, content })
    })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("journals", JSON.stringify(data.journals));
      });
}
  

// CATEGORY & TASK MANAGEMENT
function setupCategorySystem() {
    const addCategoryBtn = document.getElementById("addCategoryBtn");
    const categoriesContainer = document.getElementById("categoriesContainer");

    if (!addCategoryBtn || !categoriesContainer) return;

    addCategoryBtn.addEventListener("click", () => {
        const categoryName = prompt("Enter a category name:");
        if (!categoryName) return;

        const categoryDiv = document.createElement("div");
        categoryDiv.className = "category";
        categoryDiv.innerHTML = `
            <h3 class="category-title">${categoryName}</h3>
            <div class="progress-bar-wrapper">
            <div class="progress-bar" style="width: 0%"></div>
            </div>
            <ul class="task-list"></ul>
            <div class="category-actions">
                <button class="add-task-btn">+ Add Task</button>
                <button class="delete-category-btn" title="Delete category"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
            </div>
        `;
        categoriesContainer.appendChild(categoryDiv);

        const deleteBtn = categoryDiv.querySelector(".delete-category-btn");
        deleteBtn.addEventListener("click", () => {
            if (confirm("Delete this category and all its tasks?")) {
                categoryDiv.remove();
                updateGlobalProgress();
                saveTodoData();
            }
        });
        const addTaskBtn = categoryDiv.querySelector(".add-task-btn");
        const taskList = categoryDiv.querySelector(".task-list");

        addTaskBtn.addEventListener("click", () => addTaskToCategory(categoryDiv, taskList));
    });
}

function addTaskToCategory(categoryDiv, taskList) {
    const taskText = prompt("Enter task description:");
    if (!taskText) return;

    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
        <input type="checkbox" class="task-check">
        <span class="task-text">${taskText}</span>
        <i class="fa-solid fa-trash delete-icon" style="display: none;"></i>
    `;

    li.addEventListener("mouseenter", () => li.querySelector(".delete-icon").style.display = "inline");
    li.addEventListener("mouseleave", () => li.querySelector(".delete-icon").style.display = "none");

    li.querySelector(".delete-icon").addEventListener("click", () => {
        li.remove();
        updateProgressBar(categoryDiv);
        updateGlobalProgress();
        saveTodoData();
    });

    li.querySelector(".task-text").addEventListener("dblclick", e => {
        const newText = prompt("Edit task description:", e.target.textContent);
        if (newText !== null) {
            e.target.textContent = newText;
            saveTodoData(); 
        }
    });

    li.querySelector(".task-check").addEventListener("change", () => {
        updateProgressBar(categoryDiv);
        updateGlobalProgress();
        saveTodoData(); 
    });

    taskList.appendChild(li);
    updateProgressBar(categoryDiv);
    updateGlobalProgress();
    saveTodoData(); 
}

function getTodoDataFromDOM() {
    const categories = [];

    document.querySelectorAll(".category").forEach(categoryDiv => {
        const categoryName = categoryDiv.querySelector(".category-title").textContent;
        const tasks = [];
        categoryDiv.querySelectorAll(".task-item").forEach(taskItem => {
            const taskText = taskItem.querySelector(".task-text").textContent;
            const done = taskItem.querySelector(".task-check").checked;
            tasks.push({ text: taskText, done });
        });
        categories.push({ category: categoryName, tasks });
    });

    return categories;
}

function saveTodoData() {
    const todos = getTodoDataFromDOM();
    console.log("📤 Sending todos to server:", todos);
    localStorage.setItem("todos", JSON.stringify(todos));

    const email = localStorage.getItem("email");
    if (!email) return;

    fetch("http://localhost:3000/updateTasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, todos })
    })
    .then(res => res.json())
    .then(data => console.log("✅ Server response:", data))
    .catch(err => console.error("🚨 Save failed:", err));
}

function loadTodoData() {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const container = document.getElementById("categoriesContainer");
  
    todos.forEach(({ category, tasks }) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "category";
        categoryDiv.innerHTML = `
            <h3 class="category-title">${category}</h3>
            <div class="progress-bar-wrapper">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <ul class="task-list"></ul>
            <div class="category-actions">
                <button class="add-task-btn">+ Add Task</button>
                <button class="delete-category-btn" title="Delete category"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg></button>
            </div>
        `;
  
        container.appendChild(categoryDiv);
        const deleteBtn = categoryDiv.querySelector(".delete-category-btn");
        deleteBtn.addEventListener("click", () => {
            if (confirm("Delete this category and all its tasks?")) {
                categoryDiv.remove();
                updateGlobalProgress();
                saveTodoData();
            }
        });

        const taskList = categoryDiv.querySelector(".task-list");
  
        tasks.forEach(({ text, done }) => {
            const li = document.createElement("li");
            li.className = "task-item";
            li.innerHTML = `
                <input type="checkbox" class="task-check" ${done ? "checked" : ""}>
                <span class="task-text">${text}</span>
                <i class="fa-solid fa-trash delete-icon" style="display: none;"></i>
            `;
  
            li.addEventListener("mouseenter", () => li.querySelector(".delete-icon").style.display = "inline");
            li.addEventListener("mouseleave", () => li.querySelector(".delete-icon").style.display = "none");
  
            li.querySelector(".delete-icon").addEventListener("click", () => {
                li.remove();
                updateProgressBar(categoryDiv);
                updateGlobalProgress();
                saveTodoData();
            });
  
            li.querySelector(".task-text").addEventListener("dblclick", e => {
                const newText = prompt("Edit task description:", e.target.textContent);
                if (newText !== null) {
                    e.target.textContent = newText;
                    saveTodoData();
                }
            });
  
            li.querySelector(".task-check").addEventListener("change", () => {
                updateProgressBar(categoryDiv);
                updateGlobalProgress();
                saveTodoData();
            });
  
            taskList.appendChild(li);
        });
  
        categoryDiv.querySelector(".add-task-btn").addEventListener("click", () => {
            addTaskToCategory(categoryDiv, taskList);
        });
  
        updateProgressBar(categoryDiv);
    });
    updateGlobalProgress();
}
  
  
// BUBBLIE PROGRESS INDICATOR
function updateBubblieImage(percent) {
    const bubblieImg = document.getElementById("bubblie-img");
    if (!bubblieImg) return;
  
    let stage = 0;
    if (percent == 100) stage = 3;
    else if (percent >= 50) stage = 2;
    else if (percent >= 25) stage = 1;
  
    const isDark = document.body.classList.contains("darkmode") || document.body.classList.contains("contrast");
    const prefix = isDark ? "dark_" : "";
  
    bubblieImg.src = `Images/bubblie_${prefix}${stage}.png`;
}
  
function updateProgressBar(categoryDiv) {
    const tasks = categoryDiv.querySelectorAll(".task-check");
    const completed = categoryDiv.querySelectorAll(".task-check:checked");
    const bar = categoryDiv.querySelector(".progress-bar");
  
    const percent = tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100);
    bar.style.width = percent + "%";
}
  
function updateGlobalProgress() {
    const allTasks = document.querySelectorAll(".task-check");
    const completed = document.querySelectorAll(".task-check:checked");
    const globalBar = document.getElementById("globalProgressBar");
  
    const percent = allTasks.length === 0 ? 0 : Math.round((completed.length / allTasks.length) * 100);
    if (globalBar) globalBar.style.width = percent + "%";
    updateBubblieImage(percent);
}
  
function setupTaskListeners() {
    document.querySelectorAll(".task-check").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const categoryDiv = checkbox.closest(".category");
            updateProgressBar(categoryDiv);
            updateGlobalProgress();
        });
    });
}
  
  
// ✨ UI COMPONENTS
function revealOnScrollFor(selector) {
    const elements = document.querySelectorAll(selector);
    function reveal() {
        elements.forEach(el => {
            const pos = el.getBoundingClientRect().top;
            const screenPos = window.innerHeight / 1.3;
            if (pos < screenPos) {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            }
        });
    }
    window.addEventListener("scroll", reveal);
    reveal();
}
  
function initQuotes() {
    const quotes = [
      "Believe in yourself and all that you are.",
      "Every day is a second chance.",
      "The best way to get started is to quit talking and begin doing.",
      "Don’t watch the clock; do what it does. Keep going.",
      "Your only limit is your mind.",
      "Start where you are. Use what you have. Do what you can.",
      "You are capable of amazing things.",
      "Push yourself, because no one else is going to do it for you."
    ];
  
    const quoteText = document.getElementById("quote-text");
    let index = 0;
  
    function updateQuote() {
        if (!quoteText) return;
        quoteText.textContent = quotes[index];
        quoteText.style.animation = "none";
        void quoteText.offsetWidth;
        quoteText.style.animation = "quoteFlow 8s ease-in-out forwards";
        index = (index + 1) % quotes.length;
    }
  
    updateQuote();
    setInterval(updateQuote, 8000);
}
  
function initVideoControls() {
    const video = document.getElementById("vlogVideo");
    const container = document.querySelector(".vlog");
    if (!video) return;
  
    video.addEventListener("click", () => {
        video.paused || video.ended ? video.play() : video.pause();
    });
  
    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
        if (Math.abs(window.scrollY - lastScrollY) > 50 && !video.paused) {
            video.pause();
        }
        lastScrollY = window.scrollY;
    });
  
    video.addEventListener("play", () => {
        container?.classList.add("enlarge");
    });
}

// PROFILE JOURNAL SYSTEM
function setupProfileJournals() {
    const dashboard = document.getElementById("dashboard");
    const addJournalBtn = document.getElementById("addJournal");
    const email = localStorage.getItem("email");
  
    // Prevent crash if dashboard or button is missing
    if (!dashboard || !addJournalBtn) {
      console.warn("Profile dashboard or add journal button not found.");
      return;
    }
  
    // 🚧 Prevent continuing if not logged in
    if (!email) {
      alert("You're not logged in!");
      window.location.href = "/signIn";
      return;
    }
  
    // 📥 Load journals from server
    fetch(`http://localhost:3000/getJournals?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (!data.journals) {
          alert("Couldn't load journals. Please try again.");
          return;
        }
  
        localStorage.setItem("journals", JSON.stringify(data.journals));
        data.journals.forEach((j, i) => createJournal(j.name, i, data.journals));
      })
      .catch(err => {
        console.error("Failed to fetch journals:", err);
        alert("Server error. Try restarting your server.");
      });
  
    // ➕ Add new journal
    addJournalBtn.addEventListener("click", () => {
      const name = prompt("Enter journal name:");
      if (!name || name.trim() === "") return;
  
      fetch("http://localhost:3000/addJournal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, journalName: name.trim() })
      })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem("journals", JSON.stringify(data.journals));
          createJournal(name.trim(), data.journals.length - 1);
        })
        .catch(err => {
          console.error("Failed to add journal:", err);
          alert("Couldn't add journal.");
        });
    });
  
    // Create journal box
    function createJournal(name, index, fullJournals) {
      const container = document.createElement("div");
      container.classList.add("journal-container");

      const rectangle = document.createElement("div");
      rectangle.classList.add("journal-rectangle");
      rectangle.setAttribute("data-locked", "false");

      const lockIcon = document.createElement("span");
      lockIcon.classList.add("lock-icon");

      const isDiary = index === 0 || name.trim().toLowerCase() === "diary";
      const diaryLocked = localStorage.getItem("diaryLocked") === "true";
      const journalLocked = fullJournals[index]?.locked || rectangle.getAttribute("data-locked") === "true";
      const email = localStorage.getItem("email");
      const journals = JSON.parse(localStorage.getItem("journals")) || [];

      // VISUAL LOCK STYLING ON LOAD
      if (isDiary) {
        if (diaryLocked) {
          rectangle.classList.add("locked");
          lockIcon.innerHTML = "🔒";
          lockIcon.style.opacity = "1";
        } 
        else {
          rectangle.classList.remove("locked");
          lockIcon.innerHTML = "🔓";
          lockIcon.style.opacity = "0.4";
        }
      } 
      else {
        if (journalLocked) {
          rectangle.classList.add("locked");
          lockIcon.innerHTML = "🔒";
          lockIcon.style.opacity = "1";
        }
        else {
          rectangle.classList.remove("locked");
          lockIcon.innerHTML = "🔓";
          lockIcon.style.opacity = "0.4";
        }
      }

      rectangle.appendChild(lockIcon);

      // Journal title setup
      const title = document.createElement("div");
      title.classList.add("journal-title");
      title.textContent = name;

      // ✏ Rename journal
      title.addEventListener("dblclick", () => {
      const newName = prompt("Enter new journal name:", title.textContent);
      if (!newName || newName.trim() === "") return;

      fetch("http://localhost:3000/renameJournal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, journalIndex: index, newName: newName.trim() })
      })
      .then(res => res.json())
      .then(data => {
        title.textContent = newName.trim();
        localStorage.setItem("journals", JSON.stringify(data.journals));
        loadJournals();
      })
      .catch(err => {
        console.error("Rename failed:", err);
        alert("Couldn't rename journal.");
      });
      });

      // Options dropdown
      const optionsContainer = document.createElement("div");
      optionsContainer.classList.add("options-container");

      const options = document.createElement("span");
      options.classList.add("options");
      options.innerHTML = "\u22EE";

      const menu = document.createElement("ul");
      menu.classList.add("menu");

      // Lock/Unlock journal
      const lockToggle = document.createElement("li");
      lockToggle.textContent = (isDiary ? diaryLocked : journalLocked) ? "Unlock" : "Lock";

      lockToggle.addEventListener("click", () => {
        if (isDiary) {
          if (diaryLocked) {
            const password = prompt("Enter password to unlock:");
            if (password !== localStorage.getItem("diaryPassword")) {
              alert("Incorrect password!");
              return;
            }
            localStorage.setItem("diaryLocked", "false");
            localStorage.removeItem("diaryPassword");
            rectangle.classList.remove("locked");
            lockIcon.innerHTML = "🔓";
            lockIcon.style.opacity = "0.4";
            lockToggle.textContent = "Lock";
          } 
          else {
            const password = prompt("Set a password to lock your Diary:");
            if (!password) return;
            localStorage.setItem("diaryLocked", "true");
            localStorage.setItem("diaryPassword", password);
            rectangle.classList.add("locked");
            lockIcon.innerHTML = "🔒";
            lockIcon.style.opacity = "1";
            lockToggle.textContent = "Unlock";
          }
          return;
        }

        const isLocked = rectangle.getAttribute("data-locked") === "true";
        const password = prompt(isLocked ? "Enter password to unlock:" : "Set a password to lock this journal:");
        if (!password) return;
        if (isLocked && password !== rectangle.getAttribute("data-password")) {
          alert("Incorrect password!");
          return;
        }

        rectangle.setAttribute("data-locked", String(!isLocked));
        rectangle.setAttribute("data-password", isLocked ? "" : password);
        rectangle.classList.toggle("locked", !isLocked);
        lockIcon.innerHTML = !isLocked ? "🔒" : "🔓";
        lockIcon.style.opacity = !isLocked ? "1" : "0.4";
        lockToggle.textContent = isLocked ? "Lock" : "Unlock";

        if (journals[index]) {
          journals[index].locked = !isLocked;
          journals[index].password = isLocked ? "" : password;
          localStorage.setItem("journals", JSON.stringify(journals));

          fetch("http://localhost:3000/updateJournals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, journals })
          });
          loadJournals();
        }

        menu.style.display = "none";
      });

      // 🗑 Delete journal
      const deleteBtn = document.createElement("li");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
      if (!confirm("Are you sure you want to delete this journal?")) return;

      fetch("http://localhost:3000/deleteJournal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, index })
      })
      .then(res => res.json())
      .then(data => {
        container.remove();
        localStorage.setItem("journals", JSON.stringify(data.journals));
        loadJournals();
      })
      .catch(err => {
        console.error("Error deleting journal:", err);
        alert("Failed to delete journal.");
      });
      });

      menu.appendChild(lockToggle);
      menu.appendChild(deleteBtn);

      options.addEventListener("click", e => {
        e.stopPropagation();
        closeAllMenus();
        menu.style.display = "block";
      });

      document.addEventListener("click", e => {
        if (!optionsContainer.contains(e.target)) {
          menu.style.display = "none";
        }
      });

      optionsContainer.appendChild(options);
      optionsContainer.appendChild(menu);
      container.appendChild(rectangle);
      container.appendChild(title);
      container.appendChild(optionsContainer);
      dashboard.insertBefore(container, addJournalBtn);

      // 📂 Open journal
      rectangle.addEventListener("click", () => {
        const journal = fullJournals[index];

        if (isDiary) {
          const isDiaryLocked = localStorage.getItem("diaryLocked") === "true";
          if (isDiaryLocked) {
            const pass = prompt("Enter Diary password:");
            if (pass !== localStorage.getItem("diaryPassword")) {
              alert("Incorrect password!");
              return;
            }
          }
        }
        else {
          if (journal.locked) {
            const pass = prompt("This journal is locked. Enter password:");
            if (pass !== journal.password) {
              alert("Incorrect password!");
              return;
            }
          }
        }

        localStorage.setItem("journals", JSON.stringify(fullJournals));
        localStorage.setItem("currentJournalIndex", index);
        window.location.href = "/journal";
      });
    }
  
    function closeAllMenus() {
      document.querySelectorAll(".menu").forEach(menu => {
        menu.style.display = "none";
      });
    }
}

function loadUserProfile() {
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
  
    const nameHeading = document.getElementById("UserName");
    const emailPara = document.getElementById("Mail");
  
    if (nameHeading) nameHeading.textContent = username || "User's name";
    if (emailPara) emailPara.textContent = email || "User's email address";

    document.getElementById("iconPen")?.addEventListener("click", () => {
        const newName = prompt("Enter a new name:", nameHeading.textContent);
        if (newName) {
            localStorage.setItem("username", newName.trim());
            nameHeading.textContent = newName.trim();
        }
    });

    document.getElementById("signOut")?.addEventListener("click", e => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "/";
    });
}
  
// 🚀 INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
    showGuestBanner();
    // register ans login forms
    setupRegisterForm();
    setupLoginForm();
    // theme and menu listeners
    setupThemeListeners();
    showProfileIconIfLoggedIn();
    initQuotes();
    initVideoControls();
    revealOnScrollFor(".aboutUs");
    revealOnScrollFor(".keyFeatures");
    revealOnScrollFor(".nameCard");
    // todo list page
    setupTaskListeners();
    setupCategorySystem();
    if (document.getElementById("categoriesContainer")) {
        loadTodoData();
    } 
    updateGlobalProgress();
    // profile page
    loadUserProfile();
    setupProfileJournals();
    // journal page
    const input = document.getElementById("goToPageInput");
    input?.addEventListener("change", goToPage);
    input?.addEventListener("keydown", e => {
        if (e.key === "Enter") goToPage();
    });
    setupRandomBackgroundButton();
    setupStickerSystem();
    if (document.getElementById("journalsSubmenu")) loadJournals();
    const index = parseInt(localStorage.getItem("currentJournalIndex"));
    const email = localStorage.getItem("email");

  if (!isNaN(index) && email && document.getElementById("editorContainer")) {
    fetch(`http://localhost:3000/getJournals?email=${email}`)
    .then(res => res.json())
    .then(data => {
      if (!data.journals) {
        alert("Couldn't load journal.");
        return;
      }
      localStorage.setItem("journals", JSON.stringify(data.journals)); 
      openJournal(index); 
    });
  }
});