import "./main.css";
const THROTTLE_TIME = 500;
const HALF_CIRCLE = 180;
const TIMEOUT_LOADING = 3000;
const LOADED_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const linkBase = [];
let widthPicture = 0;
let positionNow = 0;

async function fetchHandler() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), TIMEOUT_LOADING);
    const response = await fetch(url, {
      signal: controller.signal,
    });

    const data = await response.json();
    const link = data.drinks[0].strDrinkThumb;
    setTimeout(() => controller.abort(), TIMEOUT_LOADING);
    const response1 = await fetch(link, {
      signal: controller.signal,
    });

    const blob = await response1.blob();
    return checkImg(URL.createObjectURL(blob));
  } catch (err) {
    if (err.name == "AbortError") {
      console.log("Загрузка остановлена! Повторите загрузку позже");
    } else {
      console.error(err);
    }
  }
}
function runGallery() {
  printContainers();

  scrollGallery = throttle(scrollGallery, THROTTLE_TIME);

  container.addEventListener("wheel", function (e) {
    let direction = Math.sign(e.deltaY);
    if (direction == -1 && positionNow === 0) return;

    scrollGallery(direction);
  });
}

function printContainers() {
  widthPicture = window.innerWidth / AMOUNT_OF_CONTAINERS;
  const heightPicture = (widthPicture / 3) * 2;

  const radius = (window.innerWidth - widthPicture) / 2;
  const degreeOfRotation = HALF_CIRCLE / LOADED_ELEMENTS;
  let currentAngle = 0;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    const newContainer = createElem("div", "element", container);

    newContainer.style.width = `${widthPicture}px`;
    newContainer.style.height = `${heightPicture}px`;

    newContainer.style.left = `${Math.cos(currentAngle) * radius + radius}px`;
    newContainer.style.top = `${
      Math.sin(-currentAngle) * radius + window.innerHeight
    }px`;
    currentAngle += (Math.PI / HALF_CIRCLE) * degreeOfRotation;
    addImg(newContainer, i);
  }
}

function scrollGallery(direction) {
  const galleryContainers = container.querySelectorAll(".element");
  let lastElementPosition = 0;
  let positionElemForTransition = 0;

  positionNow = positionNow + direction;
  let newPositionId = positionNow;

  if (direction === 1) {
    lastElementPosition = AMOUNT_OF_CONTAINERS - 1;
    newPositionId += LOADED_ELEMENTS;
  } else {
    positionElemForTransition = AMOUNT_OF_CONTAINERS - 1;
  }
  const lastElement = galleryContainers[lastElementPosition];
  const lastElemLeft = lastElement.style.left;
  const lastElemTop = lastElement.style.top;

  let index = 0;
  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    direction === 1 ? (index = LOADED_ELEMENTS - i) : (index = i);
    changePositionElement(index, galleryContainers);
  }

  function changePositionElement(positionElement, galleryContainers) {
    if (positionElement === positionElemForTransition) {
      galleryContainers[positionElemForTransition].remove();
      const newContainer = createElem(
        "div",
        "element",
        container,
        lastElemLeft,
        lastElemTop
      );
      addContainer(newContainer, direction);
      addImg(newContainer, newPositionId);

      return;
    }
    const prevElement = galleryContainers[positionElement - direction];
    const leftPrevElement = prevElement.style.left;
    const topPrevElement = prevElement.style.top;
    const nextElement = galleryContainers[positionElement];

    nextElement.style.left = leftPrevElement;
    nextElement.style.top = topPrevElement;
  }
}

async function addImg(elem, positionPicture) {
  if (linkBase[positionPicture] !== undefined) {
    const newImg = createElem("img", "imgContainer", elem);
    newImg.src = linkBase[positionPicture];
    return;
  }

  elem.classList.add("loadingImg");
  const response = await fetchHandler();

  if (response === undefined) {
    elem.classList.remove("loadingImg");
    elem.innerHTML = "";
    addButtonReload(elem, positionPicture);
    return;
  }

  elem.classList.remove("loadingImg");
  elem.innerHTML = "";
  const newImg = createElem("img", "imgContainer", elem);
  linkBase[positionPicture] = response;
  newImg.src = response;
}

function addContainer(newContainer, direction) {
  if (direction === -1) {
    container.prepend(newContainer);
  } else {
    container.append(newContainer);
  }
}

function createElem(
  tag,
  className,
  container,
  lastElemLeft = null,
  lastElemTop = null
) {
  const elem = document.createElement(tag);
  elem.className = className;
  container.append(elem);

  if (lastElemLeft && lastElemTop) {
    elem.style.left = lastElemLeft;
    elem.style.top = lastElemTop;
    elem.style.width = `${widthPicture}px`;
    elem.style.height = `${(widthPicture / 3) * 2}px`;
  }
  return elem;
}

function addButtonReload(elem, positionPicture) {
  const button = createElem("button", "buttonReload", elem);
  let textNode = document.createTextNode("Try again");
  button.append(textNode);
  button.addEventListener(
    "click",
    (ev) => {
      ev.target.remove();
      addImg(elem, positionPicture);
    },
    {
      once: true,
    }
  );
}

function checkImg(url) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.onload = function () {
      resolve(url);
    };
    img.onerror = function () {
      reject(url);
    };
    img.src = url;
  });
}

function throttle(callback, time) {
  let isThrottled = false;

  function wrapper() {
    if (isThrottled) {
      return;
    }
    callback.apply(this, arguments);
    isThrottled = true;
    setTimeout(function () {
      isThrottled = false;
    }, time);
  }
  return wrapper;
}

runGallery();
