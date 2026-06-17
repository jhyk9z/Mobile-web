const authPage = document.querySelector("#authPage");
const studyPage = document.querySelector("#studyPage");
const tabButtons = document.querySelectorAll("[data-auth-mode]");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const authMessage = document.querySelector("#authMessage");
const logoutButton = document.querySelector("#logoutButton");
const userBadge = document.querySelector("#userBadge");

const SUPABASE_URL = "https://zhgdrbcyxnqflxsrzysh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2RyYmN5eG5xZmx4c3J6eXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTE5NDYsImV4cCI6MjA5NzI2Nzk0Nn0.4JZX5ysG5O0-nkbkfY3WzQAlS7tPQTi_1trDLJNfh1s";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const setMessage = (message, type = "info") => {
  authMessage.textContent = message;
  authMessage.dataset.type = type;
};

const getDisplayName = (user) => {
  return user?.user_metadata?.name || user?.email || "사용자";
};

const showStudyPage = (user) => {
  authPage.classList.add("hidden");
  studyPage.classList.remove("hidden");
  document.body.style.overflow = "auto";
  userBadge.textContent = getDisplayName(user);
};

const showAuthPage = () => {
  studyPage.classList.add("hidden");
  authPage.classList.remove("hidden");
  document.body.style.overflow = "hidden";
};

const renderApp = async () => {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    showStudyPage(data.session.user);
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

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password")).trim();

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    setMessage(error.message, "error");
    return;
  }

  signupForm.reset();
  setMessage("회원가입이 완료되었습니다.", "success");

  if (data.session?.user) {
    showStudyPage(data.session.user);
    return;
  }

  setMessage("가입 확인 메일을 확인한 뒤 로그인해 주세요.", "success");
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password")).trim();

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage("이메일 또는 비밀번호를 확인해 주세요.", "error");
    return;
  }

  loginForm.reset();
  showStudyPage(data.user);
});

logoutButton?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  setMessage("");
  showAuthPage();
});

supabaseClient.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    showStudyPage(session.user);
    return;
  }
  showAuthPage();
});

renderApp();
