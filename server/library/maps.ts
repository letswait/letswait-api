import config from "../config"
import sidewalk from './sidewalk'

const googleMapsClient = require('@google/maps').createClient({
  key: config.googleMapsKey,
  Promise: Promise,
});
sidewalk.emphasize('starting Google Maps Services')

export function toRadians(a: number) {
  return a * (Math.PI/180)
}

export function coordinateDistance([lat1, lon1]: number[], [lat2, lon2]: number[]) {
  const R = 6371e3; // metres
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2-lat1);
  const Δλ = toRadians(lon2-lon1);
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d
}

export function coordinateMidpoint([lat1, lon1]: number[], [lat2, lon2]: number[]) {
  var Bx = Math.cos(lat2) * Math.cos(lon2-lon1);
  var By = Math.cos(lat2) * Math.sin(lon2-lon1);
  var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
                      Math.sqrt( (Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By ) );
  var lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);
  return [lat3, lon3]
}

export default googleMapsClient
