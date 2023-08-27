import "./main.css";
const THROTTLE_TIME = 500;
const HALF_CIRCLE = 180;
const VISIBLE_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const imgArray = [];

let heightPicture = 0;
let widthPicture = 0;
let positionNow = 0;

async function fetchHandler(positionPicture) {
  try {
    const response = await fetch(getUniqueUrl(url));
    if (response.status !== 200) throw new Error("Server Error!");

    const data = await response.json();
    const link = data.drinks[0].strDrinkThumb;
    let nestedResponse = await fetch(link);

    if (nestedResponse.status !== 200) throw new Error("Server Error");

    const blob = await nestedResponse.blob();
    return getImg(URL.createObjectURL(blob));
  } catch (err) {
    console.error(err);
  }
}

async function addImg(elem, positionPicture) {
  if (imgArray[positionPicture] !== undefined) {
    elem.appendChild(imgArray[positionPicture]);
    return;
  }

  elem.classList.add("loadingImg");
  const response = await fetchHandler(positionPicture);
  elem.classList.remove("loadingImg");
  elem.innerHTML = "";

  if (response === undefined) {
    addButtonReload(elem, positionPicture);
    return;
  }

  elem.appendChild(response);
  imgArray[positionPicture] = response;
}

function getImg(url) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.className = "imgContainer";

    img.onload = function () {
      if (img.naturalHeight > 0) {
        resolve(img);
      } else {
        reject(new Error("Img was not loaded!"));
      }
    };
    img.onerror = function () {
      reject(new Error("Img was not loaded!"));
    };

    img.src = url;
  });
}

function runGallery() {
  printContainers();

  const throttleScroll = throttle(
    (direction) => scrollGallery(direction),
    THROTTLE_TIME
  );

  container.addEventListener("wheel", function (e) {
    if (e.deltaX !== 0) return;
    let direction = Math.sign(e.deltaY);
    if (direction === 0 && 1 / direction === -Infinity) direction = -1;
    if (direction == -1 && positionNow === 0) return;

    throttleScroll(direction);
  });
}

function printContainers() {
  widthPicture = window.innerWidth / AMOUNT_OF_CONTAINERS;
  heightPicture = (widthPicture / 3) * 2;

  const radius = (window.innerWidth - widthPicture) / 2;
  const degreeOfRotation = HALF_CIRCLE / VISIBLE_ELEMENTS;
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
  const lastElementPosition = direction === 1 ? AMOUNT_OF_CONTAINERS - 1 : 0;
  const positionElemForTransition =
    direction === 1 ? 0 : AMOUNT_OF_CONTAINERS - 1;

  positionNow = positionNow + direction;
  let newPositionId = positionNow;

  if (direction === 1) newPositionId += VISIBLE_ELEMENTS;

  const lastElement = galleryContainers[lastElementPosition];
  const lastElemLeft = lastElement.style.left;
  const lastElemTop = lastElement.style.top;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    changePositionElement(
      direction === 1 ? VISIBLE_ELEMENTS - i : i,
      galleryContainers
    );
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
    elem.style.height = `${heightPicture}px`;
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

function getUniqueUrl(url) {
  const randomNumber = Math.floor(Math.random() * 100);
  return `${url}?id=${new Date().getTime() + randomNumber}`;
}

runGallery();
