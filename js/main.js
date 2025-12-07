function createElemWithText(tagName = "p", text = "", className) {
  const elem = document.createElement(tagName);
  if (text) elem.textContent = text;
  if (className) elem.className = className;
  return elem;
}

function createSelectOptions(users) {
  if (!users) return undefined;
  const options = [];
  for (const user of users) {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    options.push(option);
  }
  return options;
}

function toggleCommentSection(postId) {
  if (!postId) return undefined;
  const section = document.querySelector(`section[data-post-id="${postId}"]`);
  if (!section) return null;
  section.classList.toggle("hide");
  return section;
}

function toggleCommentButton(postId) {
  if (!postId) return undefined;
  const button = document.querySelector(`button[data-post-id="${postId}"]`);
  if (!button) return null;
  button.textContent =
    button.textContent === "Show Comments" ? "Hide Comments" : "Show Comments";
  return button;
}

function deleteChildElements(parentElement) {
  if (!(parentElement instanceof HTMLElement)) return undefined;
  let child = parentElement.lastElementChild;
  if (!child) return parentElement;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
  return parentElement;
}

function addButtonListeners() {
  const buttons = document.querySelectorAll("main button");
  if (!buttons.length) return buttons;
  for (const button of buttons) {
    if (!button.dataset.postId) continue;
    const postId = button.dataset.postId;
    const handler = function (event) {
      toggleComments(event, postId);
    };
    button.addEventListener("click", handler);
    button._listener = handler;
  }
  return buttons;
}

function removeButtonListeners() {
  const buttons = document.querySelectorAll("main button");
  for (const button of buttons) {
    const postId = button.dataset.postId;
    if (postId && button._listener) {
      button.removeEventListener("click", button._listener);
      delete button._listener;
    }
  }
  return buttons;
}

function createComments(comments) {
  if (!comments) return undefined;
  const fragment = document.createDocumentFragment();
  for (const comment of comments) {
    const article = document.createElement("article");
    const h3 = createElemWithText("h3", comment.name);
    const pBody = createElemWithText("p", comment.body);
    const pEmail = createElemWithText("p", `From: ${comment.email}`);
    article.append(h3, pBody, pEmail);
    fragment.appendChild(article);
  }
  return fragment;
}

function populateSelectMenu(users) {
  if (!users) return undefined;
  const selectMenu = document.getElementById("selectMenu");
  const options = createSelectOptions(users);
  if (options) {
    for (const option of options) {
      selectMenu.appendChild(option);
    }
  }
  return selectMenu;
}

async function getUsers() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getUserPosts(userId) {
  if (!userId) return undefined;
  try {
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
    );
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getUser(userId) {
  if (!userId) return undefined;
  try {
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`
    );
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getPostComments(postId) {
  if (!postId) return undefined;
  try {
    const res = await fetch(
      `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
    );
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function displayComments(postId) {
  if (!postId) return undefined;
  const section = document.createElement("section");
  section.dataset.postId = postId;
  section.classList.add("comments", "hide");
  const comments = await getPostComments(postId);
  const fragment = createComments(comments);
  section.appendChild(fragment);
  return section;
}

async function createPosts(posts) {
  if (!posts) return undefined;
  const fragment = document.createDocumentFragment();
  for (const post of posts) {
    const article = document.createElement("article");
    const h2 = createElemWithText("h2", post.title);
    const p1 = createElemWithText("p", post.body);
    const p2 = createElemWithText("p", `Post ID: ${post.id}`);
    const author = await getUser(post.userId);
    const p3 = createElemWithText(
      "p",
      `Author: ${author.name} with ${author.company.name}`
    );
    const p4 = createElemWithText("p", author.company.catchPhrase);
    const button = createElemWithText("button", "Show Comments");
    button.dataset.postId = post.id;
    const section = await displayComments(post.id);
    article.append(h2, p1, p2, p3, p4, button, section);
    fragment.appendChild(article);
  }
  return fragment;
}

async function displayPosts(posts) {
  const main = document.querySelector("main");
  const element =
    posts && posts.length
      ? await createPosts(posts)
      : createElemWithText(
          "p",
          "Select an Employee to display their posts.",
          "default-text"
        );
  main.appendChild(element);
  return element;
}

function toggleComments(event, postId) {
  if (!postId) return undefined;
  if (event && event.target) event.target.listener = true;
  const section = toggleCommentSection(postId);
  const button = toggleCommentButton(postId);
  return [section, button];
}

async function refreshPosts(posts) {
  if (!posts) return undefined;
  const removeButtons = removeButtonListeners();
  const main = deleteChildElements(document.querySelector("main"));
  const fragment = await displayPosts(posts);
  const addButtons = addButtonListeners();
  return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
  if (!event) return undefined;
  const selectMenu = document.getElementById("selectMenu");
  if (selectMenu) selectMenu.disabled = true;

  const userId =
    event && event.target
      ? Number(event.target.value) || 1
      : Number(selectMenu && selectMenu.value) || 1;

  let posts = await getUserPosts(userId);
  posts = Array.isArray(posts) ? posts : [];
  const refreshPostsArray = await refreshPosts(posts);

  if (selectMenu) selectMenu.disabled = false;
  return [userId, posts, refreshPostsArray];
}

async function initPage() {
  const users = await getUsers();
  const select = populateSelectMenu(users);
  return [users, select];
}

function initApp() {
  initPage();
  const selectMenu = document.getElementById("selectMenu");
  if (selectMenu)
    selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", initApp);
