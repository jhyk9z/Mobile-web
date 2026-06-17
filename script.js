const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

const setMessage = (message, type = "info") => {
  loginMessage.textContent = message;
  loginMessage.dataset.type = type;
};

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const userId = String(formData.get("userId")).trim();
  const password = String(formData.get("password")).trim();

  if (!userId || !password) {
    setMessage("아이디와 비밀번호를 입력해 주세요.", "error");
    return;
  }

  localStorage.setItem(
    "jbLoginSession",
    JSON.stringify({
      userId,
      loggedInAt: new Date().toISOString(),
    }),
  );

  setMessage("로그인되었습니다.", "success");
  loginForm.reset();
});
