const L = require("leaflet");


const PlayMarkerIcon = L.icon({
  iconUrl: require('./Icon_Sound.png'),
  iconSize: [40,40],
  iconAnchor: [20,40],
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});


const PlayMarkerActiveIcon = L.icon({
  iconUrl: require('./Icon_Sound_Playing.png'),
  iconSize: [60,60],
  iconAnchor: [30,60],
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});

const MeasurementMarkerIcon = L.icon({
  iconUrl: require('./Icon_Normal.png'),
  iconSize: [30,30],
  iconAnchor: [15,30],
  popupAnchor: [0,-30],
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null
});


export { PlayMarkerIcon, MeasurementMarkerIcon, PlayMarkerActiveIcon };