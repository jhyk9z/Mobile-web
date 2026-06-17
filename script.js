const authPage = document.querySelector("#authPage");
const studyPage = document.querySelector("#studyPage");
const tabButtons = document.querySelectorAll("[data-auth-mode]");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const authMessage = document.querySelector("#authMessage");
const logoutButton = document.querySelector("#logoutButton");
const userBadge = document.querySelector("#userBadge");

const USERS_KEY = "jbUsers";
const SESSION_KEY = "jbLoginSession";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const getSession = () => JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
const saveSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

const setMessage = (message, type = "info") => {
  authMessage.textContent = message;
  authMessage.dataset.type = type;
};

const showStudyPage = (user) => {
  authPage.classList.add("hidden");
  studyPage.classList.remove("hidden");
  document.body.style.overflow = "auto";
  userBadge.textContent = `${user.name} (${user.userId})`;
};

const showAuthPage = () => {
  studyPage.classList.add("hidden");
  authPage.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

const findSessionUser = () => {
  const session = getSession();
  if (!session) return null;
  return getUsers().find((user) => user.userId === session.userId) || null;
};

const renderApp = () => {
  const user = findSessionUser();
  if (user) {
    showStudyPage(user);
    return;
  }
  showAuthPage();
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.authMode;
    tabButtons.forEach((item) => item.classList.toggle("active", item === button));
    loginForm.classList.toggle("active", mode === "login");
    signupForm.classList.toggle("active", mode === "signup");
    setMessage("");
  });
});

signupForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const name = String(formData.get("name")).trim();
  const userId = String(formData.get("userId")).trim();
  const password = String(formData.get("password")).trim();
  const users = getUsers();

  if (users.some((user) => user.userId === userId)) {
    setMessage("이미 사용 중인 아이디입니다.", "error");
    return;
  }

  const newUser = {
    name,
    userId,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  saveSession({ userId, loggedInAt: new Date().toISOString() });
  signupForm.reset();
  setMessage("회원가입이 완료되었습니다.", "success");
  showStudyPage(newUser);
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const userId = String(formData.get("userId")).trim();
  const password = String(formData.get("password")).trim();
  const user = getUsers().find((item) => item.userId === userId && item.password === password);

  if (!user) {
    setMessage("아이디 또는 비밀번호를 확인해 주세요.", "error");
    return;
  }

  saveSession({ userId, loggedInAt: new Date().toISOString() });
  loginForm.reset();
  showStudyPage(user);
});

logoutButton?.addEventListener("click", () => {
  clearSession();
  setMessage("");
  renderApp();
});

renderApp();
