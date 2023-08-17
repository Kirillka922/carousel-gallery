import "./main.css";
const THROTTLE_TIME = 500;
const LOADED_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const linkBase = [];
let widthPicture = 0;
let positionNow = 0;

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

async function addImg(elem, positionPicture) {
  if (linkBase[positionPicture] !== undefined) {
    const newImg = createElem("img", "imgContainer", elem);
    newImg.src = linkBase[positionPicture];
    return;
  }

  elem.classList.add("addLoading");

  let linkPicture = await fetchHandler();

  if (linkPicture === undefined) {
    elem.classList.remove("addLoading");
    elem.innerHTML = "";
    const button = createElem("button", "buttonReload", elem);
    let textNode = document.createTextNode("Try again");
    button.append(textNode);
    button.addEventListener("click", () => addImg(elem, positionPicture), {
      once: true,
    });
    return;
  }
  elem.classList.remove("addLoading");
  elem.innerHTML = "";
  const newImg = createElem("img", "imgContainer", elem);
  linkBase[positionPicture] = linkPicture;
  newImg.src = linkPicture;
}

function scrollGallery(direction) {
  const galleryContainers = container.querySelectorAll(".element");
  let lastElementPosition = 0;
  let positionElemForTransition = 0;

  positionNow = positionNow + direction;
  let positionContForPic = positionNow;

  if (direction === 1) {
    lastElementPosition = AMOUNT_OF_CONTAINERS - 1;
    positionContForPic = positionContForPic + LOADED_ELEMENTS;
  } else {
    positionElemForTransition = AMOUNT_OF_CONTAINERS - 1;
  }
  const lastElement = galleryContainers[lastElementPosition];
  const lastElemLeft = lastElement.style.left;
  const lastElemTop = lastElement.style.top;

  let index = 0;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    if (direction === -1)
      changePositionElement(Math.abs(index), galleryContainers);

    index = index + direction;
    if (direction === 1)
      changePositionElement(AMOUNT_OF_CONTAINERS - index, galleryContainers);
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
      addImg(newContainer, positionContForPic);

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
    const newContainer = createElem("div", "element", container);

    currentAngle -= 0.314;
    newContainer.style.width = `${widthPicture}px`;
    newContainer.style.height = `${heightPicture}px`;

    newContainer.style.left = `${Math.cos(currentAngle) * radius + radius}px`;
    newContainer.style.top = `${
      Math.sin(currentAngle) * radius + heightCont + heightPicture * 2
    }px`;
    addImg(newContainer, i);
  }
}

function addContainer(newContainer, direction) {
  if (direction === -1) container.prepend(newContainer);
  if (direction === 1) container.append(newContainer);
}

container.addEventListener("wheel", function (e) {
  let direction = Math.sign(e.deltaY);
  if (direction == -1 && positionNow === 0) return;

  scrollGallery(direction);
});

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

scrollGallery = throttle(scrollGallery, THROTTLE_TIME);

printContainers();
