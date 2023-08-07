const STEP_TRANSITION = 5;
const ALPHA_ANGLE = 2 * Math.PI.toFixed(2);
const SCROLL_START_POSITION = 1;
const START_TIME = 1241;
const FIX_DISTANCE_PICTURES = 61;
const MINIMAL_WINDOW_SIZE = 800;
const SCROLL_INTERVAL = 500;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

async function fetchHandler() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const link = data.drinks[0].strDrinkThumb;
    const dataLink = await fetch(link);
    const blob = await dataLink.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.log(error);
  }
}

function addLoading(elem) {
  function createImg(className, link, cont) {
    const img = document.createElement("img");
    img.className = className;
    img.setAttribute("src", link);
    cont.append(img);
  }
  if (elem.childNodes.length > 0) {
    elem.innerHTML = "";
  }
  createImg(
    "imgContainer",
    "https://otkritkis.com/wp-content/uploads/2022/07/gufde.gif",
    elem
  );
}

async function addImgToCont(elem) {
  addLoading(elem);

  let link = await fetchHandler();
  if (link === undefined) {
    const button = document.createElement("button");
    button.className = "buttonReload";
    elem.append(button);
    let textNode = document.createTextNode("Try again");
    button.append(textNode);
    button.addEventListener("click", addImgToCont.bind(null, elem), {
      once: true,
    });

    elem.querySelector("img").src = "";
    return;
  }

  elem.querySelector("img").src = link;
}
const container = document.getElementById("container");
let notVisibleElem = null;
let positionNow = 0;
let arrayContainers = [];
let isFinishReplacement = true;

function addPoz(direction) {
  notVisibleElem.scrollTop = SCROLL_START_POSITION;
  let lastElemLeft = null;
  let lastElemTop = null;

  positionNow = positionNow + direction;

  if (direction === 1) {
    lastElemLeft = arrayContainers[0].style.left;
    lastElemTop = arrayContainers[0].style.top;

    for (let i = 0; i < arrayContainers.length; i++) {
      if (i === arrayContainers.length - 1)
        hideElem(arrayContainers[arrayContainers.length - 1]);
      if (i !== arrayContainers.length - 1)
        replacementElements(arrayContainers, i);
    }
  }
  if (direction === -1) {
    lastElemLeft = arrayContainers[arrayContainers.length - 1].style.left;
    lastElemTop = arrayContainers[arrayContainers.length - 1].style.top;
    for (let i = arrayContainers.length - 1; i >= 0; i--) {
      if (i === 0) hideElem(arrayContainers[0]);
      if (i !== 0) replacementElements(arrayContainers, i);
    }
  }

  function replacementElements(mass, i) {
    const leftPrevElement = mass[i + direction].style.left;
    const topPrevElement = mass[i + direction].style.top;
    arrayContainers[i].style.left = leftPrevElement;
    arrayContainers[i].style.top = topPrevElement;
  }

  function hideElem(elem) {
    elem.style.display = "none";
    elem.style.left = lastElemLeft;
    elem.style.top = lastElemTop;

    addImgToCont(elem);

    setTimeout(() => {
      elem.style.display = "block";
      if (direction === 1) arrayContainers.unshift(arrayContainers.pop());
      if (direction === -1) arrayContainers.push(arrayContainers.shift());
      isFinishReplacement = true;
    }, 500);
  }
}

function printContainers() {
  let windowSize = container.getBoundingClientRect().width;
  if (windowSize < MINIMAL_WINDOW_SIZE) windowSize = MINIMAL_WINDOW_SIZE;

  for (let i = 0; i < 9; i++) {
    const contForPicture = createDiv("element", container);
    arrayContainers[i] = contForPicture;
  }
  createNotVisibleElem("notVisibleElem");

  const timeArray = createTime(arrayContainers.length);

  const centerX = windowSize / 2;
  const centerY = container.getBoundingClientRect().height;
  const widthPicture = windowSize / (arrayContainers.length + 1);
  const heightPicture = (widthPicture / 3) * 2;
  const widthHalfElement = widthPicture / 2;
  const radiusY = centerY - heightPicture;
  const radiusX = widthPicture * 2 - centerX * 2;

  arrayContainers.forEach((object, i) => {
    timeArray[i] = timeArray[i] - STEP_TRANSITION;

    object.style.width = `${widthPicture}px`;
    object.style.height = `${heightPicture}px`;

    object.style.left = `${
      centerX -
      widthHalfElement +
      radiusX * Math.cos(ALPHA_ANGLE * timeArray[i])
    }px`;
    object.style.top = `${
      centerY + heightPicture + radiusY * Math.sin(-ALPHA_ANGLE * timeArray[i])
    }px`;

    if (i !== 0) addImgToCont(object);
  });

  notVisibleElem.scrollTop = SCROLL_START_POSITION;
  addEventScroll(notVisibleElem);
}

function addEventScroll(object) {
  object.addEventListener("scroll", function () {
    let direction = 1;
    if (object.scrollTop > SCROLL_START_POSITION) direction = -1;
    object.scrollTop = SCROLL_START_POSITION;
    if (!isFinishReplacement) return;

    if (direction == 1 && positionNow === 0) return;

    isFinishReplacement = false;

    addPoz(direction);
  });
}

function createTime(length) {
  const time = [];
  for (let i = 0; i < length; i++) {
    time[i] = [START_TIME + i * FIX_DISTANCE_PICTURES];
  }
  return time;
}

function createDiv(className, container) {
  const div = document.createElement("div");
  div.className = className;
  container.append(div);
  return div;
}

function createNotVisibleElem(className) {
  notVisibleElem = createDiv(className, container);
  notVisibleElem.style.height = `${window.innerHeight}px`;
  const volumeElem = createDiv("volumeElem", notVisibleElem);
  volumeElem.style.height = `${window.innerHeight + 3}px`;
}

printContainers();
