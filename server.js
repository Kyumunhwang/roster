const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'roster.json');

// Middleware to parse JSON data from client
app.use(bodyParser.json());
// Serve static files (HTML, JS, CSS) from the current folder
app.use(express.static(__dirname));

// API Endpoint: Get all roster data (for index.html)
app.get('/api/roster', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });
        res.json(JSON.parse(data));
    });
});

// API Endpoint: Add new student data (for add.html)
app.post('/api/roster', (req, res) => {
    const newStudent = req.body;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let roster = [];
        if (!err) {
            roster = JSON.parse(data);
        }
        
        // Add new student to the array
        roster.push(newStudent);

        // Write updated array back to roster.json
        fs.writeFile(DATA_FILE, JSON.stringify(roster, null, 4), 'utf8', (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save data' });
            res.status(201).json({ message: 'Student added successfully!', student: newStudent });
        });
    });
});

// API Endpoint: Delete a student by name
app.delete('/api/roster/:name', (req, res) => {
    const nameToDelete = req.params.name;

    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read data' });
        
        let roster = JSON.parse(data);
        const originalLength = roster.length;
        
        // Filter out the student with the matching name
        roster = roster.filter(student => student.name !== nameToDelete);

        if (roster.length === originalLength) {
            return res.status(404).json({ error: 'Student not found' });
        }

        fs.writeFile(DATA_FILE, JSON.stringify(roster, null, 4), 'utf8', (err) => {
            if (err) return res.status(500).json({ error: 'Failed to save data' });
            res.json({ message: `Student '${nameToDelete}' deleted successfully!` });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
