const authPage = document.querySelector("#authPage");
const studyPage = document.querySelector("#studyPage");
const tabButtons = document.querySelectorAll("[data-auth-mode]");
const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const authMessage = document.querySelector("#authMessage");
const logoutButton = document.querySelector("#logoutButton");
const userBadge = document.querySelector("#userBadge");
const unitList = document.querySelector("#unitList");
const unitCount = document.querySelector("#unitCount");
const lessonTitle = document.querySelector("#lessonTitle");
const lessonContent = document.querySelector("#lessonContent");
const lessonTabs = document.querySelectorAll("[data-view]");
const progressLabel = document.querySelector("#progressLabel");
const progressFill = document.querySelector("#progressFill");

const SUPABASE_URL = "https://zhgdrbcyxnqflxsrzysh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ2RyYmN5eG5xZmx4c3J6eXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTE5NDYsImV4cCI6MjA5NzI2Nzk0Nn0.4JZX5ysG5O0-nkbkfY3WzQAlS7tPQTi_1trDLJNfh1s";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const units = [
  {
    id: "unit-1",
    number: "01",
    title: "정보와 데이터",
    summary: [
      ["정보", "데이터를 목적에 맞게 해석하고 의미를 부여한 결과입니다."],
      ["데이터", "관찰이나 측정을 통해 얻은 값이며, 처리 전의 사실 자료입니다."],
      ["정보 처리", "데이터를 수집, 분류, 분석, 표현하여 문제 해결에 활용하는 과정입니다."],
    ],
    keywords: [
      ["데이터", "처리 전의 문자, 숫자, 이미지 같은 원자료"],
      ["정보", "의사 결정에 도움이 되도록 가공된 데이터"],
      ["디지털", "값을 0과 1의 이진 형태로 표현하는 방식"],
      ["정보 윤리", "정보를 올바르고 책임감 있게 사용하는 태도"],
    ],
    quiz: {
      question: "데이터를 목적에 맞게 해석해 의미를 부여한 것은?",
      options: ["정보", "하드웨어", "전송 속도", "파일 확장자"],
      answer: 0,
    },
  },
  {
    id: "unit-2",
    number: "02",
    title: "알고리즘",
    summary: [
      ["알고리즘", "문제를 해결하기 위한 명확하고 순서 있는 절차입니다."],
      ["순차 구조", "명령을 위에서 아래로 차례대로 실행하는 구조입니다."],
      ["조건 구조", "조건의 참과 거짓에 따라 실행 흐름이 달라지는 구조입니다."],
    ],
    keywords: [
      ["입력", "문제 해결에 필요한 값을 넣는 과정"],
      ["출력", "처리 결과를 사용자에게 보여주는 과정"],
      ["반복", "조건을 만족하는 동안 같은 명령을 되풀이하는 구조"],
      ["디버깅", "오류를 찾아 수정하는 과정"],
    ],
    quiz: {
      question: "조건에 따라 실행 흐름이 달라지는 구조는?",
      options: ["조건 구조", "저장 구조", "압축 구조", "표현 구조"],
      answer: 0,
    },
  },
  {
    id: "unit-3",
    number: "03",
    title: "프로그래밍 기초",
    summary: [
      ["변수", "프로그램에서 값을 저장하기 위한 이름 있는 공간입니다."],
      ["자료형", "숫자, 문자열, 참거짓처럼 데이터의 종류를 나타냅니다."],
      ["함수", "자주 쓰는 명령을 묶어 필요할 때 호출하는 코드 단위입니다."],
    ],
    keywords: [
      ["변수", "값을 저장하고 다시 사용할 수 있는 공간"],
      ["문자열", "글자들의 모음"],
      ["불린", "참 또는 거짓을 나타내는 자료형"],
      ["함수", "입력값을 받아 정해진 처리를 수행하는 코드 묶음"],
    ],
    quiz: {
      question: "값을 저장하기 위한 이름 있는 공간은?",
      options: ["변수", "해상도", "브라우저", "네트워크"],
      answer: 0,
    },
  },
];

let selectedUnitId = units[0].id;
let selectedView = "summary";

const progressKey = (unitId) => `jbProgress:${unitId}`;
const getProgress = (unitId) => Number(localStorage.getItem(progressKey(unitId)) || "0");
const setProgress = (unitId, value) => {
  localStorage.setItem(progressKey(unitId), String(Math.max(getProgress(unitId), value)));
};

const selectedUnit = () => units.find((unit) => unit.id === selectedUnitId) || units[0];

const setMessage = (message, type = "info") => {
  authMessage.textContent = message;
  authMessage.dataset.type = type;
};

const getDisplayName = (user) => user?.user_metadata?.name || user?.email || "사용자";

const showStudyPage = (user) => {
  authPage.classList.add("hidden");
  studyPage.classList.remove("hidden");
  document.body.style.overflow = "auto";
  userBadge.textContent = getDisplayName(user);
  renderStudy();
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

const renderUnits = () => {
  unitCount.textContent = String(units.length);
  unitList.innerHTML = units
    .map(
      (unit) => `
        <button class="unit-button ${unit.id === selectedUnitId ? "active" : ""}" type="button" data-unit-id="${unit.id}">
          <span>${unit.number}</span>
          <strong>${unit.title}</strong>
          <small>진행률 ${getProgress(unit.id)}%</small>
        </button>
      `,
    )
    .join("");
};

const renderSummary = (unit) => {
  setProgress(unit.id, 35);
  lessonContent.innerHTML = unit.summary
    .map(
      ([title, body]) => `
        <article class="concept-card">
          <h3>${title}</h3>
          <p>${body}</p>
        </article>
      `,
    )
    .join("");
};

const renderKeywords = (unit) => {
  setProgress(unit.id, 65);
  lessonContent.innerHTML = `
    <div class="keyword-grid">
      ${unit.keywords
        .map(
          ([word, meaning]) => `
            <article class="keyword-card">
              <h3>${word}</h3>
              <p>${meaning}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderQuiz = (unit) => {
  lessonContent.innerHTML = `
    <article class="quiz-card">
      <h3>${unit.quiz.question}</h3>
      <div class="quiz-options">
        ${unit.quiz.options
          .map((option, index) => `<button class="quiz-option" type="button" data-answer="${index}">${option}</button>`)
          .join("")}
      </div>
    </article>
  `;
};

const renderStudy = () => {
  const unit = selectedUnit();
  lessonTitle.textContent = unit.title;
  lessonTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === selectedView));
  renderUnits();

  if (selectedView === "summary") renderSummary(unit);
  if (selectedView === "keywords") renderKeywords(unit);
  if (selectedView === "quiz") renderQuiz(unit);

  const progress = getProgress(unit.id);
  progressLabel.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
  renderUnits();
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

lessonTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectedView = tab.dataset.view;
    renderStudy();
  });
});

unitList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-unit-id]");
  if (!button) return;
  selectedUnitId = button.dataset.unitId;
  selectedView = "summary";
  renderStudy();
});

lessonContent?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-answer]");
  if (!button) return;
  const unit = selectedUnit();
  const answerIndex = Number(button.dataset.answer);
  const options = lessonContent.querySelectorAll(".quiz-option");

  options.forEach((option) => {
    const optionIndex = Number(option.dataset.answer);
    option.disabled = true;
    if (optionIndex === unit.quiz.answer) option.classList.add("correct");
  });

  if (answerIndex !== unit.quiz.answer) {
    button.classList.add("wrong");
    return;
  }

  setProgress(unit.id, 100);
  renderStudy();
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
