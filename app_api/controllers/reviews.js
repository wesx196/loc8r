const mongoose = require("mongoose");
const Loc = mongoose.model("Location");

const reviewsCreate = async (req, res) => {
  const locationId = req.params.locationid;

  if (!locationId) {
    return res.status(404).json({ message: "Location not found" });
  }

  try {
    // Find the location by ID and select only the reviews field
    const location = await Loc.findById(locationId).select('reviews');

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Call doAddReview to add the review to the location
    await doAddReview(req, res, location);

  } catch (err) {
    res.status(400).json(err);
  }
};


const doSetAverageRating = (location) => {
  if (location.reviews && location.reviews.length > 0) {
    const count = location.reviews.length;
    const total = location.reviews.reduce((acc, { rating }) => acc + rating, 0);

    location.rating = parseInt(total / count, 10);

    location
      .save()
      .then(() => {
        console.log(`Average rating updated to ${location.rating}`);
      })
      .catch((err) => {
        console.error('Error updating average rating:', err);
      });
  }
};

const updateAverageRating = (locationId) => {
  Loc.findById(locationId)
    .select('rating reviews')
    .exec()
    .then((location) => {
      if (location) {
        doSetAverageRating(location);
      }
    })
    .catch((err) => {
      console.error('Error fetching location:', err);
    });
};

const doAddReview = (req, res, location) => {
  if (!location) {
    return res.status(404).json({ message: "Location not found" });
  }

  const { author, rating, reviewText } = req.body;

  // Add the new review
  location.reviews.push({
    author,
    rating,
    reviewText,
  });

  // Save the location and handle the result with promises
  location
    .save()
    .then((updatedLocation) => {
      console.log(updatedLocation.rating);
      updateAverageRating(updatedLocation._id);

      // Get the most recently added review
      const thisReview = updatedLocation.reviews.slice(-1).pop();
      res.status(201).json(thisReview);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};



const reviewsReadOne = (req, res) => {
  Loc.findById(req.params.locationid)
    .select("name reviews")
    .then((location) => {
      if (!location) {
        return res.status(404).json({ message: "location not found" });
      }

      if (location.reviews && location.reviews.length > 0) {
        const review = location.reviews.id(req.params.reviewid);

        if (!review) {
          return res.status(404).json({ message: "review not found" });
        } else {
          const response = {
            location: {
              name: location.name,
              id: req.params.locationid,
            },
            review,
          };

          return res.status(200).json(response);
        }
      } else {
        return res.status(404).json({ message: "No reviews found" });
      }
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
};

const reviewsUpdateOne = (req, res) => {
  if (!req.params.locationid || !req.params.reviewid) {
    return res.status(404).json({
      message: "Not found, locationid and reviewid are both required"
    });
  }

  Loc.findById(req.params.locationid)
    .select('reviews')
    .exec()
    .then((location) => {
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      if (location.reviews && location.reviews.length > 0) {
        const thisReview = location.reviews.id(req.params.reviewid);

        if (!thisReview) {
          return res.status(404).json({ message: "Review not found" });
        }

        // Update the review
        thisReview.author = req.body.author;
        thisReview.rating = req.body.rating;
        thisReview.reviewText = req.body.reviewText;

        // Save the location
        return location.save().then((updatedLocation) => {
          updateAverageRating(updatedLocation._id);
          res.status(200).json(thisReview);
        });
      } else {
        return res.status(404).json({ message: "No review to update" });
      }
    })
    .catch((err) => {
      console.error('Error:', err);
      res.status(400).json(err);
    });
};


const reviewsDeleteOne = async (req, res) => {
  const { locationid, reviewid } = req.params;
  if (!locationid || !reviewid) {
    return res.status(404).json({ message: "Not found, locationid and reviewid are both required" });
  }

  try {
    const location = await Loc.findById(locationid).select("reviews");
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    if (!location.reviews.id(reviewid)) {
      return res.status(404).json({ message: "Review not found" });
    }

    location.reviews.id(reviewid).deleteOne();  
    await location.save();  

    doSetAverageRating(location._id);  
    res.status(204).json(null);  
  } catch (err) {
    console.error("Error deleting review:", err);  
    res.status(400).json({ error: "An error occurred during the deletion process", details: err.message });
  }
};

module.exports = {
  reviewsCreate,
  reviewsReadOne,
  reviewsUpdateOne,
  reviewsDeleteOne,
};
