const API_BASE = 'http://localhost:3000';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return response.json();
}

async function loadPosts() {
  const posts = await fetchAPI('/posts');
  const postsList = document.getElementById('posts-list');
  postsList.innerHTML = '';
  posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.className = `post ${post.isDeleted ? 'deleted' : ''}`;
    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <button onclick="editPost('${post.id}')">Edit</button>
      <button onclick="deletePost('${post.id}')">Delete</button>
      <div class="comments" id="comments-${post.id}"></div>
      <div class="comment-form">
        <input type="text" placeholder="Comment" id="comment-input-${post.id}">
        <button onclick="createComment('${post.id}')">Add Comment</button>
      </div>
    `;
    postsList.appendChild(postDiv);
    loadComments(post.id);
  });
}

async function createPost() {
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  if (!title || !content) return alert('Please fill all fields');
  await fetchAPI('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
  loadPosts();
}

async function editPost(id) {
  const newTitle = prompt('New title:');
  const newContent = prompt('New content:');
  if (newTitle && newContent) {
    await fetchAPI(`/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, content: newContent })
    });
    loadPosts();
  }
}

async function deletePost(id) {
  await fetchAPI(`/posts/${id}`, { method: 'DELETE' });
  loadPosts();
}

async function loadComments(postId) {
  const comments = await fetchAPI(`/comments?postId=${postId}`);
  const commentsDiv = document.getElementById(`comments-${postId}`);
  commentsDiv.innerHTML = '';
  comments.forEach(comment => {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
      <p>${comment.content}</p>
      <button onclick="editComment('${comment.id}')">Edit</button>
      <button onclick="deleteComment('${comment.id}')">Delete</button>
    `;
    commentsDiv.appendChild(commentDiv);
  });
}

async function createComment(postId) {
  const content = document.getElementById(`comment-input-${postId}`).value;
  if (!content) return alert('Please enter comment');
  await fetchAPI('/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, content })
  });
  document.getElementById(`comment-input-${postId}`).value = '';
  loadComments(postId);
}

async function editComment(id) {
  const newContent = prompt('New comment:');
  if (newContent) {
    await fetchAPI(`/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent })
    });
    loadPosts(); // Reload all to update comments
  }
}

async function deleteComment(id) {
  await fetchAPI(`/comments/${id}`, { method: 'DELETE' });
  loadPosts(); // Reload all
}

window.onload = loadPosts;