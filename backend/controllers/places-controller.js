const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsFromAddress = require("../util/location");
const Place = require("../models/place");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId); // if you want to receive a promise you can also call .exec()
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find any place.", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find a place for the provided ID.", 404)); // one option
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const uid = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: uid });
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find any place.", 500));
  }

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find places for the provided user ID.", 404)); // better for asynchronous calls, rather than throws
  }

  res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // we replace throw with next() because throw does not work correcty in asynchronous code in Express
    return next(new HttpError("Invalid data. Please check the inputs.", 422));
  }

  const { title, description, address, creator } = req.body;
  let coordinates;

  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://rsr.akvo.org/media/db/project/305/update/2276/ProjectUpdate_2276_photo_2012-12-03_10.37.58.jpg",
    creator
  });

  try {
    // mongoose handles all mongodb needed to store a new document in the collection - it also creates the id
    await createdPlace.save();
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid data. Please check the inputs.", 422));
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(placeId); // if you want to receive a promise you can also call .exec()
  } catch (err) {
    return next(new HttpError("Something went wrong, could not find any place.", 500));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError("Something went wrong, could not update the place.", 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete the place.", 500));
  }

  try {
    await place.remove();
  } catch (err) {
    return next(new HttpError("Something went wrong, could not delete the place.", 500));
  }

  res.status(200).json({ message: "Place successfully deleted." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
