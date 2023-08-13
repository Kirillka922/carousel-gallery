import loadImage from "../src/images/gufde.gif";
const THROTTLE_TIME = 500;
const LOADED_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const arrayContainers = [];
const linkBase = [];
let widthPicture = 0;
let positionNow = 0;
let throttleTimer = null;

async function fetchHandler() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const link = data.drinks[0].strDrinkThumb;
    const dataLink = await fetch(link);
    const blob = await dataLink.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(error);
  }
}

async function addImg(elem, i) {
  if (linkBase[i] !== undefined) {
    const newImg = createElem("imgContainer", elem, "img");
    newImg.src = linkBase[i];
    return;
  }

  elem.classList.add("addLoading");

  let linkPicture = await fetchHandler();

  if (linkPicture === undefined) {
    elem.classList.remove("addLoading");
    elem.innerHTML = "";
    const button = createElem("buttonReload", elem, "button");
    let textNode = document.createTextNode("Try again");
    button.append(textNode);
    button.addEventListener("click", () => addImg(elem, i), {
      once: true,
    });
    return;
  }
  elem.classList.remove("addLoading");
  elem.innerHTML = "";
  const newImg = createElem("imgContainer", elem, "img");
  linkBase[i] = linkPicture;
  newImg.src = linkPicture;
}

function scrollGallery(direction) {
  let lastElementPosition = 0;
  let numberElemForTransition = 0;

  positionNow = positionNow + direction;
  let positionContForPic = positionNow;

  if (direction === 1) lastElementPosition = arrayContainers.length - 1;
  if (direction !== 1) numberElemForTransition = arrayContainers.length - 1;
  if (direction === 1)
    positionContForPic = positionContForPic + LOADED_ELEMENTS;

  const lastElemLeft = arrayContainers[lastElementPosition].style.left;
  const lastElemTop = arrayContainers[lastElementPosition].style.top;

  if (direction === -1) {
    for (let i = 0; i < arrayContainers.length; i++) {
      replacementElements(i);
    }
  }
  if (direction === 1) {
    for (let i = arrayContainers.length - 1; i >= 0; i--) {
      replacementElements(i);
    }
  }

  function replacementElements(i) {
    if (i === numberElemForTransition) {
      arrayContainers[numberElemForTransition].remove();
      let newElemForPic = createHiddenElem(
        direction,
        lastElemLeft,
        lastElemTop
      );

      addImg(newElemForPic, positionContForPic);
    }
    if (i !== numberElemForTransition) replacementMiddleElements(i);
  }

  function replacementMiddleElements(i) {
    const leftPrevElement = arrayContainers[i - direction].style.left;
    const topPrevElement = arrayContainers[i - direction].style.top;
    arrayContainers[i].style.left = leftPrevElement;
    arrayContainers[i].style.top = topPrevElement;
  }
}

function createHiddenElem(direction, lastElemLeft, lastElemTop) {
  const newElem = createElem("element", container, "div");
  newElem.style.left = lastElemLeft;
  newElem.style.top = lastElemTop;
  newElem.style.width = `${widthPicture}px`;
  newElem.style.height = `${(widthPicture / 3) * 2}px`;

  if (direction === -1) {
    arrayContainers.pop();
    arrayContainers.unshift(newElem);
  }

  if (direction === 1) {
    arrayContainers.shift();
    arrayContainers.push(newElem);
  }

  return newElem;
}

function printContainers() {
  let currentAngle = 0;
  const widthCont = window.innerWidth;
  const heightCont = window.innerHeight;

  container.style.width = `${widthCont}px`;
  container.style.height = `${heightCont}px`;

  widthPicture = widthCont / AMOUNT_OF_CONTAINERS;
  const heightPicture = (widthPicture / 3) * 2;
  const radius = widthCont / 2 - widthPicture / 2;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    const contForPicture = createElem("element", container, "div");

    currentAngle -= 0.314;
    contForPicture.style.width = `${widthPicture}px`;
    contForPicture.style.height = `${heightPicture}px`;

    contForPicture.style.left = `${Math.cos(currentAngle) * radius + radius}px`;
    contForPicture.style.top = `${
      Math.sin(currentAngle) * radius + heightCont + heightPicture * 2
    }px`;

    arrayContainers[i] = contForPicture;
  }
  for (let i = 1; i < AMOUNT_OF_CONTAINERS; i++) {
    addImg(arrayContainers[i], i);
  }
}

container.addEventListener("wheel", function (e) {
  let direction = -1;
  if (e.deltaY < 0) direction = 1;
  if (direction == -1 && positionNow === 0) return;

  throttle(() => scrollGallery(direction));
});

function createElem(className, container, tag) {
  const elem = document.createElement(tag);
  elem.className = className;
  container.append(elem);
  return elem;
}

const throttle = (callback, time) => {
  if (throttleTimer) return;
  callback();
  throttleTimer = true;
  setTimeout(() => {
    throttleTimer = false;
  }, THROTTLE_TIME);
};

printContainers();
