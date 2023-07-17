const url =
  "https://966e3a17bd14-817885256656399495.ngrok-free.app/archive/media/V-ZAKUTNY-M/DeviceIpint.25/SourceEndpoint.video:0:0/20230711T084000";

async function fetchHandler() {
  try {
    const response = await fetch(url, {
      method: "get",
      headers: {
        Authorization: "Basic " + btoa(`root:root`),
      },
      mode: "no-cors",
    });
    const data = await response.json();
    return data.file;
  } catch (error) {
    return "https://ruseller.com/lessons/les2559/images/free-gif-preloaders-psds-03.gif";
    console.log(error);
  }
}
function addLoading(elem) {
  let img = document.createElement("img");
  img.className = "imgContainer";
  img.setAttribute(
    "src",
    "https://otkritkis.com/wp-content/uploads/2022/07/gufde.gif"
  );
  elem.append(img);
}

async function addImgToCont(elem) {
  if (elem.childNodes.length === 0) addLoading(elem);
  if (elem.childNodes.length === 1) {
    elem.firstElementChild.src =
      "https://otkritkis.com/wp-content/uploads/2022/07/gufde.gif";
  }
  let link = await fetchHandler();
  elem.firstElementChild.src = link;
}

const TIMER_INTERVAL = 500;
const RADIUS = 450;
const STEP_TRANSITION = 5;
const ALPHA_ANGLE = 2 * 3.14;
const SCROLL_START_POSITION = 72;
const FIRST_POSITION = 1304;
const FIX_DISTANCE_PICTURES = 60;
const container = document.getElementById("container");
container.scrollLeft = SCROLL_START_POSITION;
let arrayContainers = [];
let flag = false;

function addPoz(direction) {
  container.scrollLeft = SCROLL_START_POSITION;

  let lastElemLeft = null;
  let lastElemTop = null;

  function hideLastElem(elem) {
    elem.style.display = "none";
    elem.style.left = lastElemLeft;
    elem.style.top = lastElemTop;

    addImgToCont(elem);

    setTimeout(() => {
      elem.style.display = "block";
      if (direction) arrayContainers.unshift(arrayContainers.pop());
      if (!direction) arrayContainers.push(arrayContainers.shift());
    }, TIMER_INTERVAL);
  }

  if (direction) {
    lastElemLeft = arrayContainers[0].style.left;
    lastElemTop = arrayContainers[0].style.top;
    for (let i = 0; i < arrayContainers.length; i++) {
      if (i === arrayContainers.length - 1) {
        hideLastElem(arrayContainers[arrayContainers.length - 1]);
      } else {
        arrayContainers[i].style.left = arrayContainers[i + 1].style.left;
        arrayContainers[i].style.top = arrayContainers[i + 1].style.top;
      }
    }
  } else {
    lastElemLeft = arrayContainers[arrayContainers.length - 1].style.left;
    lastElemTop = arrayContainers[arrayContainers.length - 1].style.top;

    for (let i = arrayContainers.length - 1; i >= 0; i--) {
      if (i === 0) {
        hideLastElem(arrayContainers[0]);
      } else {
        arrayContainers[i].style.left = arrayContainers[i - 1].style.left;
        arrayContainers[i].style.top = arrayContainers[i - 1].style.top;
      }
    }
  }

  flag = false;
}

function printContainers() {
  let arrayCords = createArrayCords();
  arrayContainers.forEach((object, i) => {
    arrayCords[i] = arrayCords[i] - STEP_TRANSITION;

    object.style.left = `${
      325 + RADIUS * Math.cos(ALPHA_ANGLE * arrayCords[i])
    }px`;
    object.style.top = `${
      container.clientWidth + RADIUS * Math.sin(-ALPHA_ANGLE * arrayCords[i])
    }px`;
    addImgToCont(object);
  });
}

function createArrayCords() {
  const elements = container.querySelectorAll(".element");
  let arrayCords = [];
  elements.forEach((elem, i) => {
    arrayCords[i] = [FIRST_POSITION + i * FIX_DISTANCE_PICTURES];
    arrayContainers[i] = elem;
  });

  return arrayCords;
}

setTimeout(() => {
  container.addEventListener("scroll", function (event) {
    const isForward = container.scrollLeft < SCROLL_START_POSITION;
    container.scrollLeft = SCROLL_START_POSITION;
    if (flag) return;
    flag = true;
    setTimeout(() => addPoz(isForward), TIMER_INTERVAL);
  });
}, TIMER_INTERVAL);

printContainers();
