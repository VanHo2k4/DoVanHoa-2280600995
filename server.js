const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const postsFile = path.join(__dirname, 'data', 'posts.json');
const commentsFile = path.join(__dirname, 'data', 'comments.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Helper to read JSON
function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Helper to write JSON
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Get max ID
function getMaxId(data) {
  if (data.length === 0) return 0;
  return Math.max(...data.map(item => parseInt(item.id)));
}

// Posts routes
app.get('/posts', (req, res) => {
  const posts = readJSON(postsFile);
  res.json(posts);
});

app.post('/posts', (req, res) => {
  const posts = readJSON(postsFile);
  const maxId = getMaxId(posts);
  const newId = (maxId + 1).toString();
  const newPost = { id: newId, ...req.body, isDeleted: false };
  posts.push(newPost);
  writeJSON(postsFile, posts);
  res.json(newPost);
});

app.put('/posts/:id', (req, res) => {
  const posts = readJSON(postsFile);
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Post not found' });
  posts[index] = { ...posts[index], ...req.body };
  writeJSON(postsFile, posts);
  res.json(posts[index]);
});

app.delete('/posts/:id', (req, res) => {
  const posts = readJSON(postsFile);
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Post not found' });
  posts[index].isDeleted = true;
  writeJSON(postsFile, posts);
  res.json({ message: 'Post soft deleted' });
});

// Comments routes
app.get('/comments', (req, res) => {
  const comments = readJSON(commentsFile);
  const postId = req.query.postId;
  if (postId) {
    res.json(comments.filter(c => c.postId === postId));
  } else {
    res.json(comments);
  }
});

app.post('/comments', (req, res) => {
  const comments = readJSON(commentsFile);
  const maxId = getMaxId(comments);
  const newId = (maxId + 1).toString();
  const newComment = { id: newId, ...req.body };
  comments.push(newComment);
  writeJSON(commentsFile, comments);
  res.json(newComment);
});

app.put('/comments/:id', (req, res) => {
  const comments = readJSON(commentsFile);
  const index = comments.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Comment not found' });
  comments[index] = { ...comments[index], ...req.body };
  writeJSON(commentsFile, comments);
  res.json(comments[index]);
});

app.delete('/comments/:id', (req, res) => {
  const comments = readJSON(commentsFile);
  const index = comments.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Comment not found' });
  comments.splice(index, 1);
  writeJSON(commentsFile, comments);
  res.json({ message: 'Comment deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});