import * as d3 from "react-d3-library";
import axios from "axios";

const GLOBE_BACKGROUND = "#114e60";
const CONTINENT_BACKGROUND_COLOR = "#50929B";
const SIBLING_COUNTRY_COLOR = "#f4ac45";
const CURRENT_COUNTRY_COLOR = "#fff";
const CURRENT_CONTINENT_COLOR = "#694a38";
const SIMMULATE_DAYLIGHT_ENABLED = true;
const DEFAULT_COUNTRY = "TWN";
const DEFAULT_STROKE_WIDTH = 0.5;
const DEFAULT_STROKE_COLOR = "#114e60";
const GRATICULE_COLOR = "#e3e9e9";
const ANIMATION_DURATION = 2000;
const PROJECTION_SCALE = 350;
const FONT_TYPE = "7px Arial";
const FONT_COLOR = "#fff";

const easeTypeFunc = d3.easeCubic;

let countryGeojson = {};
let continentGeojson = {};
let currentCountry = {};
let currentContinent = {};
let canvasWidth = 1000;
let canvasHeight = 460;
let canvas, context, projection, geoGenerator;
let timer;
let currentPos = [0, 0];

const drawStroke = ({
  lineWidth = DEFAULT_STROKE_WIDTH,
  strokeStyle = DEFAULT_STROKE_COLOR,
  features
}) => {
  context.lineWidth = lineWidth;
  context.strokeStyle = strokeStyle;
  context.beginPath();
  geoGenerator({ type: "FeatureCollection", features });
  context.stroke();
};

const drawFillColor = ({ color, features }) => {
  context.beginPath();
  geoGenerator({ type: "FeatureCollection", features });
  context.stroke();
  context.fillStyle = color;
  context.fill();
};

const drawGraticule = () => {
  const graticule = d3.geoGraticule();
  context.beginPath();
  context.strokeStyle = GRATICULE_COLOR;
  geoGenerator(graticule());
  context.stroke();
};

const drawBackground = (position = [0, 0]) => {
  const circle = d3.geoCircle();
  circle.center(position);
  context.beginPath();
  context.strokeStyle = GRATICULE_COLOR;
  geoGenerator(circle());
  context.fillStyle = GLOBE_BACKGROUND;
  context.fill();
  if (!SIMMULATE_DAYLIGHT_ENABLED) {
    circle.center([0 - position[0], 0 - position[1]]);
    context.beginPath();
    context.strokeStyle = GRATICULE_COLOR;
    geoGenerator(circle());
    context.fillStyle = GLOBE_BACKGROUND;
    context.fill();
  }
};

const writeText = country => {
  const coordinates = d3.geoCentroid(country);
  context.font = FONT_TYPE;
  context.fillStyle = FONT_COLOR;
  context.fillText(
    country.properties.GEOUNIT,
    projection(coordinates)[0] + 10,
    projection(coordinates)[1] + 2
  );
};

const drawGlobe = (t = 1, position) => {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  drawBackground(position);
  drawGraticule();
  drawStroke({ features: continentGeojson.features });
  drawFillColor({
    color: CONTINENT_BACKGROUND_COLOR,
    features: continentGeojson.features
  });

  if (currentCountry.type) {
    const continentNameOfCountry = currentCountry.properties.CONTINENT;
    const siblingCountries = countryGeojson.features.filter(
      country =>
        country.properties.CONTINENT === continentNameOfCountry &&
        country.properties.ISO_A3 !== currentCountry.properties.ISO_A3
    );

    drawFillColor({ color: SIBLING_COUNTRY_COLOR, features: siblingCountries });
    drawStroke({ features: siblingCountries });
    drawFillColor({ color: CURRENT_COUNTRY_COLOR, features: [currentCountry] });
    siblingCountries.forEach(country => writeText(country));
    writeText(currentCountry);
  }
  if (currentContinent.type) {
    drawFillColor({
      color: CURRENT_CONTINENT_COLOR,
      features: [currentContinent]
    });
    countryGeojson.features
      .filter(
        country =>
          country.properties.CONTINENT === currentContinent.properties.CONTINENT
      )
      .forEach(country => writeText(country));
  }
};

function rotate(invertedLatLong) {
  const targetLatLong = [0 - invertedLatLong[0], 0 - invertedLatLong[1]];
  const offset = [
    targetLatLong[0] - currentPos[0],
    targetLatLong[1] - currentPos[1]
  ];
  const tempPos = currentPos;
  if (timer) {
    timer.stop();
    timer = undefined;
  }
  timer = d3.timer(elapsed => {
    // compute how far through the animation we are (0 to 1)
    const t = Math.min(1, easeTypeFunc(elapsed / ANIMATION_DURATION));

    if (t === 1) {
      timer.stop();
      timer = undefined;
      return;
    }
    const position = [tempPos[0] + offset[0] * t, tempPos[1] + offset[1] * t];
    currentPos = [...position];
    projection.rotate(position);
    drawGlobe(t, position);
  });
}

const findCountry = ({ countryCode }) => {
  return countryGeojson.features.find(
    country => country.properties.ISO_A3 === countryCode
  );
};
const findContinent = ({ continent }) => {
  return continentGeojson.features.find(
    x => x.properties.CONTINENT === continent
  );
};

const reset = () => {
  currentCountry = {};
  currentContinent = {};
};

const rotateToCountry = countryCode => {
  const country = findCountry({ countryCode });
  if (country) {
    reset();
    currentCountry = country;
    const defaultLatLong = d3.geoCentroid(country);
    rotate(defaultLatLong);
  } else {
    console.log("country not found");
  }
};
const rotateToContinent = continentName => {
  const continent = findContinent({ continent: continentName });
  if (continent) {
    reset();
    currentContinent = continent;
    const defaultLatLong = d3.geoCentroid(continent);
    rotate(defaultLatLong);
  } else {
    console.log("continent not found");
  }
};

// click to rotate
const select = () => {
  const position = d3.mouse(this);
  const latlong = projection.invert(position);
  rotate(latlong);
};

export const initGlobe = (
  canvasNode,
  { country = DEFAULT_COUNTRY, clickEnabled = false } = {}
) => {
  if (canvas) {
    console.log("Globe initialized!");
    return;
  }
  canvas = d3.select(canvasNode);
  canvasHeight = canvas.node().offsetHeight;
  canvasWidth = canvas.node().offsetWidth;
  context = canvas.node().getContext("2d");

  projection = d3
    .geoOrthographic()
    .scale(PROJECTION_SCALE)
    .translate([350, 260]);

  geoGenerator = d3
    .geoPath()
    .projection(projection)
    .pointRadius(4)
    .context(context);

  if (clickEnabled) {
    canvas.on("click", select);
  }

  // from external sources
  const countrySource =
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
  const continentSource =
    "https://gist.githubusercontent.com/hrbrmstr/91ea5cc9474286c72838/raw/59421ff9b268ff0929b051ddafafbeb94a4c1910/continents.json";

  Promise.all([
    axios.get(continentSource).then(res => (continentGeojson = res.data)),
    axios.get(countrySource).then(res => (countryGeojson = res.data))
  ]).then(() => rotateToCountry(country));

  // from internal source
  // const loadCountries = async () => {
  //   const data = await import('../public/countries.json')
  //   countryGeojson = data.default
  // }
  // const loadContinents = async () => {
  //   const data = await import('../public/continents.json')
  //   continentGeojson = data.default
  // }
  // Promise.all([
  //   loadCountries(),
  //   loadContinents()
  // ]).then(() => rotateToCountry(country))

  return {
    rotateToCountry,
    rotateToContinent
  };
};
