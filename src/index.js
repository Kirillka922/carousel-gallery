const STEP_TRANSITION = 5;
const ALPHA_ANGLE = 2 * 3.14;
const SCROLL_START_POSITION = 1;
const START_TIME = 1304;
const FIX_DISTANCE_PICTURES = 60;
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
    elem.firstElementChild.src = "";
    return;
  }

  elem.firstElementChild.src = link;
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

  function hideElem(elem) {
    elem.style.display = "none";
    elem.style.left = lastElemLeft;
    elem.style.top = lastElemTop;

    addImgToCont(elem);

    setTimeout(() => {
      elem.style.display = "block";
      if (direction === -1) arrayContainers.unshift(arrayContainers.pop());
      if (direction === 1) arrayContainers.push(arrayContainers.shift());
    }, 500);
  }

  if (direction === -1) {
    positionNow++;
    lastElemLeft = arrayContainers[0].style.left;
    lastElemTop = arrayContainers[0].style.top;
    for (let i = 0; i < arrayContainers.length; i++) {
      if (i === arrayContainers.length - 1) {
        hideElem(arrayContainers[arrayContainers.length - 1]);
      } else {
        const leftNextElement = arrayContainers[i + 1].style.left;
        const topNextElement = arrayContainers[i + 1].style.top;
        arrayContainers[i].style.left = leftNextElement;
        arrayContainers[i].style.top = topNextElement;
      }
    }
  } else {
    positionNow--;

    lastElemLeft = arrayContainers[arrayContainers.length - 1].style.left;
    lastElemTop = arrayContainers[arrayContainers.length - 1].style.top;

    for (let i = arrayContainers.length - 1; i >= 0; i--) {
      if (i === 0) {
        hideElem(arrayContainers[0]);
      } else {
        const leftPrevElement = arrayContainers[i - 1].style.left;
        const topPrevElement = arrayContainers[i - 1].style.top;
        arrayContainers[i].style.left = leftPrevElement;
        arrayContainers[i].style.top = topPrevElement;
      }
    }
  }

  isFinishReplacement = true;
}

function printContainers() {
  for (let i = 0; i < 7; i++) {
    createDiv("element", container);
  }

  notVisibleElem = createDiv("notVisibleElem", container);
  createDiv("volumeElem", notVisibleElem);

  notVisibleElem.scrollTop = SCROLL_START_POSITION;
  const timeArray = createTime();

  let windowSize = container.getBoundingClientRect().width;
  if (windowSize < MINIMAL_WINDOW_SIZE) windowSize = MINIMAL_WINDOW_SIZE;
  const centerX = windowSize / 2;
  const centerY = container.getBoundingClientRect().height;
  const radiusY = centerY;
  const widthPicture = windowSize / (arrayContainers.length + 1);
  const widthHalfElement = widthPicture / 2;
  const heightPicture = (widthPicture / 3) * 2;
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
    addImgToCont(object);
  });

  notVisibleElem.addEventListener("scroll", function () {
    let direction = -1;
    if (notVisibleElem.scrollTop > SCROLL_START_POSITION) direction = 1;
    notVisibleElem.scrollTop = SCROLL_START_POSITION;
    if (!isFinishReplacement) return;

    if (direction == -1 && positionNow === 0) return;

    isFinishReplacement = false;

    setTimeout(() => addPoz(direction), SCROLL_INTERVAL);
  });
}

function createTime() {
  const galleryContainers = container.querySelectorAll(".element");

  const time = [];

  galleryContainers.forEach((elem, i) => {
    time[i] = [START_TIME + i * FIX_DISTANCE_PICTURES];
    arrayContainers[i] = elem;
  });

  return time;
}

function createDiv(className, container) {
  const div = document.createElement("div");
  div.className = className;
  container.append(div);
  return div;
}

printContainers();
