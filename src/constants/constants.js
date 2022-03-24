const DEFAULT_COORDINATES = { latitude: 33.753746, longitude: -84.386330 };

const POST_IMAGE_ASPECT = [4, 5];

const GEOHASH_PRECISION_AREAS = [
  2025.0, 63.28125, 1.9775390625, 0.061798095703125, parseFloat('0.0019311904907226562'), parseFloat('6.034970283508301e-05'),
  parseFloat('1.885928213596344e-06'), parseFloat('5.893525667488575e-08'), parseFloat('1.744670149253733e-09'), parseFloat('5.058365426240893e-11'),
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const GET_SAVED_POST_ID = ({ uid, timestamp }) => `${uid}_${timestamp}`;

const ADMIN_UIDS = new Set(['934304ca-c0bf-4cfd-83e3-7f1f5d7501f1', 'a8d8331f-6e6a-422b-bd20-65b4a8b3eec3']);

export {
  POST_IMAGE_ASPECT, GEOHASH_PRECISION_AREAS, MONTHS,
  GET_SAVED_POST_ID, DEFAULT_COORDINATES, ADMIN_UIDS,
};
