
// author model schema

const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      max: 100
    },
    family_name: {
      type: String,
      required: true,
      max: 100
    },
    date_of_birth: {
      type: Date
    },
    date_of_death: {
      type: Date
    }
  }
);

// virtual properties for getting/setting data but which
// DO NOT persist to the database

// virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(function () {
    return `${this.family_name}, ${this.first_name}`;
  });


// virtual for author's URL
AuthorSchema
  .virtual('url')
  .get(function () {
    return `/catalog/author/${this._id}`;
  });

// virtual for author's lifespan
AuthorSchema
  .virtual('lifespan')
  .get(function () {
    var dob = '';
    var dod = '';
    this.date_of_birth ? dob = moment(this.date_of_birth).format('MMMM Do, YYYY') : dob = 'no date';
    this.date_of_death ? dod = moment(this.date_of_death).format('MMMM Do, YYYY') : dod = 'no date';
    return `b: ${dob} - d: ${dod}`;
  });

// virtual for changing birth date format to YYYY-MM-DD
AuthorSchema
  .virtual('dob_yyyy_mm_dd')
  .get(function () {
    return moment(this.date_of_birth).format('YYYY-MM-DD');
  });

// virtual for changing death date format to YYYY-MM-DD
AuthorSchema
  .virtual('dod_yyyy_mm_dd')
  .get(function () {
    return moment(this.date_of_death).format('YYYY-MM-DD');
  });

// export model
module.exports = mongoose.model('Author', AuthorSchema);
