const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// File path for saving data
const DATA_FILE = "data.json";

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/journal', (req, res) => {
  res.sendFile(__dirname + '/views/journal.html');
});

app.get('/todoList', (req, res) => {
  res.sendFile(__dirname + '/views/todoList.html');
});

app.get('/contactUs', (req, res) => {
  res.sendFile(__dirname + '/views/contactUs.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/views/register.html');
});

app.get('/profile', (req, res) => {
  res.sendFile(__dirname + '/views/profile.html');
});

app.get('/signIn', (req, res) => {
  res.sendFile(__dirname + '/views/signIn.html');
});

app.use(express.static(__dirname + '/static'));

// Load data from file or set defaults
let data = {
  usernames: [],
  emails: [],
  passwords: [],
  journals: [],
  todoLists: []
};

if (fs.existsSync(DATA_FILE)) {
  const saved = fs.readFileSync(DATA_FILE);
  data = JSON.parse(saved);
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// REGISTER
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (data.emails.includes(email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  data.usernames.push(username);
  data.emails.push(email);
  data.passwords.push(password);
  data.journals.push([{ name: "Diary", pages: [], locked: true }]);
  data.todoLists.push([]);
  saveData();

  res.status(200).json({
    username,
    email,
    journals: data.journals[data.journals.length - 1],
    todos: []
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const index = data.emails.indexOf(email);
  if (index === -1 || data.passwords[index] !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.status(200).json({
    username: data.usernames[index],
    email: data.emails[index],
    journals: data.journals[index],
    todos: data.todoLists[index]
  });
});

// GET JOURNALS
app.get("/getJournals", (req, res) => {
  const { email } = req.query;
  const index = data.emails.indexOf(email);
  if (index === -1) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ journals: data.journals[index] });
});

// ADD JOURNAL
app.post("/addJournal", (req, res) => {
  const { email, journalName } = req.body;
  const index = data.emails.indexOf(email);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  data.journals[index].push({ 
    name: journalName, 
    pages: ["Start typing here..."]  // Default page added here
  });
  saveData();
  res.status(200).json({ message: "Journal added", journals: data.journals[index] });
});

// RENAME JOURNAL
app.post("/renameJournal", (req, res) => {
  const { email, journalIndex, newName } = req.body;
  const index = data.emails.indexOf(email);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  data.journals[index][journalIndex].name = newName;
  saveData();
  res.status(200).json({ message: "Journal renamed", journals: data.journals[index] });
});

app.post("/updateJournals", (req, res) => {
  const { email, journals: updated } = req.body;
  const index = data.emails.indexOf(email);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  data.journals[index] = updated;
  saveData();

  res.status(200).json({ message: "Journals updated" });
});

// DELETE JOURNAL
app.post("/deleteJournal", (req, res) => {
    const { email, index } = req.body;
    const userIndex = data.emails.indexOf(email);
    if (userIndex === -1) return res.status(404).json({ message: "User not found" });
  
    data.journals[userIndex].splice(index, 1); // remove it
    saveData();
    res.status(200).json({ message: "Journal deleted", journals: data.journals[userIndex] });
});

// SAVE PAGE
app.post("/savePage", (req, res) => {
  const { email, journalIndex, pageIndex, content } = req.body;
  const index = data.emails.indexOf(email);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  data.journals[index][journalIndex].pages[pageIndex] = content;
  saveData();
  res.status(200).json({ message: "Page saved", journals: data.journals[index] });
});

// GET TASKS
app.get("/getTasks", (req, res) => {
  const { email } = req.query;
  const index = data.emails.indexOf(email);
  if (index === -1) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ todos: data.todoLists[index] });
});

// UPDATE TASKS
app.post("/updateTasks", (req, res) => {
  const { email, todos } = req.body;
  const index = data.emails.indexOf(email);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  data.todoLists[index] = todos;
  saveData();
  res.status(200).json({ message: "Tasks updated" });
});

// START SERVER
if (require.main === module) {
  app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
  });
}
module.exports = app;
  