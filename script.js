const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelectorAll(".nav-links a");
const tabButtons = document.querySelectorAll("[data-auth-tab]");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const authMessage = document.querySelector("#authMessage");
const dataForm = document.querySelector("#dataForm");
const dataMessage = document.querySelector("#dataMessage");
const logoutButton = document.querySelector("#logoutButton");
const currentUserName = document.querySelector("#currentUserName");
const currentUserEmail = document.querySelector("#currentUserEmail");

const USERS_KEY = "mobileWebUsers";
const SESSION_KEY = "mobileWebCurrentUser";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const getCurrentEmail = () => localStorage.getItem(SESSION_KEY);
const setCurrentEmail = (email) => localStorage.setItem(SESSION_KEY, email);
const clearCurrentEmail = () => localStorage.removeItem(SESSION_KEY);

const setMessage = (element, message, type = "info") => {
  if (!element) return;
  element.textContent = message;
  element.dataset.type = type;
};

const findCurrentUser = () => {
  const email = getCurrentEmail();
  return getUsers().find((user) => user.email === email);
};

const renderDashboard = () => {
  const user = findCurrentUser();
  const fields = dataForm?.querySelectorAll("input, textarea, button") || [];

  if (!user) {
    currentUserName.textContent = "로그인이 필요합니다";
    currentUserEmail.textContent = "계정에 로그인하면 저장된 데이터가 표시됩니다.";
    logoutButton.disabled = true;
    fields.forEach((field) => {
      field.disabled = true;
    });
    if (dataForm) {
      dataForm.status.value = "";
      dataForm.memo.value = "";
    }
    return;
  }

  currentUserName.textContent = user.name;
  currentUserEmail.textContent = user.email;
  logoutButton.disabled = false;
  fields.forEach((field) => {
    field.disabled = false;
  });
  dataForm.status.value = user.data?.status || "";
  dataForm.memo.value = user.data?.memo || "";
};

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.authTab;
    tabButtons.forEach((item) => item.classList.toggle("active", item === button));
    loginForm.classList.toggle("active", tab === "login");
    signupForm.classList.toggle("active", tab === "signup");
    setMessage(authMessage, "");
  });
});

signupForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const users = getUsers();

  if (users.some((user) => user.email === email)) {
    setMessage(authMessage, "이미 가입된 이메일입니다.", "error");
    return;
  }

  users.push({
    name,
    email,
    password,
    data: {
      status: "",
      memo: "",
    },
    createdAt: new Date().toISOString(),
  });

  saveUsers(users);
  setCurrentEmail(email);
  signupForm.reset();
  setMessage(authMessage, "회원가입이 완료되었습니다.", "success");
  renderDashboard();
  document.querySelector("#dashboard")?.scrollIntoView({ behavior: "smooth" });
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const user = getUsers().find((item) => item.email === email && item.password === password);

  if (!user) {
    setMessage(authMessage, "이메일 또는 비밀번호를 확인해 주세요.", "error");
    return;
  }

  setCurrentEmail(email);
  loginForm.reset();
  setMessage(authMessage, "로그인되었습니다.", "success");
  renderDashboard();
  document.querySelector("#dashboard")?.scrollIntoView({ behavior: "smooth" });
});

dataForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentEmail = getCurrentEmail();
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.email === currentEmail);

  if (userIndex === -1) {
    setMessage(dataMessage, "먼저 로그인해 주세요.", "error");
    return;
  }

  users[userIndex].data = {
    status: dataForm.status.value.trim(),
    memo: dataForm.memo.value.trim(),
    updatedAt: new Date().toISOString(),
  };

  saveUsers(users);
  setMessage(dataMessage, "사용자 데이터가 저장되었습니다.", "success");
});

logoutButton?.addEventListener("click", () => {
  clearCurrentEmail();
  setMessage(dataMessage, "");
  renderDashboard();
});

renderDashboard();
