import buttons from "./keyboard.json" assert { type: "json" };

let keyPressed = {};
let lang = !localStorage.getItem("lang") ? "en" : localStorage.getItem("lang");
let isUpperCase = false;
let isShiftPressed = false;

function createElements() {
  const title = document.createElement("h1");
  title.textContent = "Виртуальная клавиатура";

  const text = document.createElement("textarea");
  text.rows = "5";
  text.cols = "50";

  const keyboard = document.createElement("div");
  keyboard.classList.add("keyboard");

  const description = document.createElement("p");
  description.classList.add("description");
  description.textContent =
    "Клавиатура создана в операционной системе Windows.";
  const language = document.createElement("p");
  language.classList.add("language");
  language.textContent =
    "Для переключения языка используйте комбинацию клавиш: Ctrl + пробел.";

  document
    .querySelector("body")
    .append(title, text, keyboard, description, language);
}

createElements();
let input = document.querySelector("textarea");

function createRow() {
  for (let row of buttons) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    for (let button of row) {
      let buttonDiv = createButton(button);
      rowDiv.append(buttonDiv);
      button.element = buttonDiv;
      document.querySelector(".keyboard").append(rowDiv);
    }
  }
}

function createButton(button) {
  const buttonDiv = document.createElement("div");
  buttonDiv.classList.add("button");

  buttonDiv.textContent = getLocalizedText(button);
  buttonDiv.id = button.keyCode;

  if (button.blackButton) {
    buttonDiv.classList.add("blackButton");
  } else {
    buttonDiv.classList.add("whiteButton");
  }

  buttonDiv.addEventListener("mousedown", (event) => {
    if (!buttonDiv.classList.contains("blackButton")) {
      printSymbol(event.target.textContent);
    } else {
      handleSpecialButtons(event.target.id);
    }

    if (buttonDiv.id !== "CapsLock") {
      buttonDiv.classList.add("greenButton");
    }
  });

  buttonDiv.style.flexGrow = button.grow;
  buttonDiv.style.width =
    buttonDiv.style.flexGrow * Number(buttonDiv.style.width);
  return buttonDiv;
}

document.addEventListener("mouseup", () => {
  let buttons = document.querySelectorAll(".greenButton");
  for (const button of buttons) {
    if (button.id !== "CapsLock") {
      button.classList.remove("greenButton");
    }
  }
});

createRow();

document.addEventListener("keydown", (event) => {
  let buttonElement = document.querySelector("#" + event.code);

  if (buttonElement) {
    buttonElement.classList.add("greenButton");
  }

  if (!buttonElement.classList.contains("blackButton")) {
    printSymbol(event.key);
  } else {
    handleSpecialButtons(event.key);
  }

  if (buttonElement.id === "ShiftLeft" || buttonElement.id === "ShiftRight") {
    isShiftPressed = true;
    redrawButtons();
  }

  // изменение языка
  keyPressed[event.code] = true;

  if (
    (keyPressed["ControlLeft"] && event.code === "Space") ||
    (keyPressed["ControlRight"] && event.code === "Space")
  ) {
    lang = lang === "en" ? "ru" : "en";
    localStorage.setItem("lang", lang);

    redrawButtons();
  }

  event.preventDefault();
  return false;
});

document.addEventListener("keyup", (event) => {
  let buttonElement = document.querySelector("#" + event.code);
  if (buttonElement && buttonElement.id !== "CapsLock") {
    buttonElement.classList.remove("greenButton");
  }

  if (buttonElement.id === "ShiftLeft" || buttonElement.id === "ShiftRight") {
    isShiftPressed = false;
    redrawButtons();
  }

  delete keyPressed[event.code];
});

function printSymbol(key) {
  let selectionStart = input.selectionStart;
  console.log("selectionStart " + selectionStart);
  input.textContent =
    input.textContent.substring(0, selectionStart) +
    key +
    input.textContent.substring(selectionStart);

  selectionStart++;
  input.setSelectionRange(selectionStart, selectionStart);
}

function getLocalizedText(button) {
  let isRegisterUpper = Boolean(isShiftPressed) !== Boolean(isUpperCase); //XOR

  if (isShiftPressed && lang === "ru" && button.shiftCaseRu) {
    return button.shiftCaseRu;
  }

  if (isShiftPressed && lang === "en" && button.shiftCase) {
    return button.shiftCase;
  }

  if (!isRegisterUpper && lang === "en") {
    return button.text;
  }

  if (!isRegisterUpper && lang === "ru") {
    return button.textRu ? button.textRu : button.text;
  }

  if (isRegisterUpper && lang === "en") {
    return button.blackButton ? button.text : button.text.toUpperCase();
  }

  if (isRegisterUpper && lang === "ru") {
    return button.textRu ? button.textRu.toUpperCase() : button.text;
  }
}

function handleSpecialButtons(key) {
  if (
    key === "ArrowDown" ||
    key === "ArrowUp" ||
    key === "ArrowRight" ||
    key === "ArrowLeft"
  ) {
    let button = findButtonByKey(key);
    printSymbol(button.text);
  }

  if (key === "Enter") {
    printSymbol("\n");
  }

  if (key === "Tab") {
    printSymbol("\t");
  }

  if (key === "Backspace") {
    let selectionStart = input.selectionStart;
    input.textContent =
      input.textContent.substring(0, selectionStart - 1) +
      input.textContent.substring(selectionStart);
    selectionStart = selectionStart === 0 ? 0 : selectionStart - 1;
    input.setSelectionRange(selectionStart, selectionStart);
  }

  if (key === "CapsLock") {
    let button = findButtonByKey(key);
    isUpperCase = !isUpperCase;
    redrawButtons();
    if (isUpperCase) {
      button.element.classList.add("greenButton");
    } else {
      button.element.classList.remove("greenButton");
    }
  }

  if (key === "Delete") {
    let selectionStart = input.selectionStart;
    input.textContent =
      input.textContent.substring(0, selectionStart) +
      input.textContent.substring(selectionStart + 1);
    input.setSelectionRange(selectionStart, selectionStart);
  }
}

function findButtonByKey(key) {
  for (let row of buttons) {
    for (let button of row) {
      if (key === button.keyCode) {
        return button;
      }
    }
  }
  return null;
}

function redrawButtons() {
  for (let row of buttons) {
    for (let button of row) {
      button.element.textContent = getLocalizedText(button);
    }
  }
}
