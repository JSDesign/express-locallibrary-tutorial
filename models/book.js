
// book model schema

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    author: { // with reference to associated author
      type: Schema.Types.ObjectId,
      ref: 'Author',
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    isbn: {
      type: String,
      required: true
    },
    genre: [ // with reference to any associated genres
      {
        type: Schema.Types.ObjectId,
        ref: 'Genre'
      }
    ]
  }
);

// virtual properties for getting/setting data but which
// DO NOT persist to the database

// virtual for book's URL
BookSchema
  .virtual('url')
  .get(function () {
    return `/catalog/book/${this._id}`;
  });

// export model
module.exports = mongoose.model('Book', BookSchema);
