const mongoose = require("mongoose"),
    ObjectId = mongoose.Schema.Types.ObjectId,
    PassportLocalStrategy = require('passport-local').Strategy;

const passportLocalMongoose = require("passport-local-mongoose");

const school = new mongoose.Schema({
    shortName: {
        type: String,
        required: true,
        max: 70,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        max: 210,
        unique: true
    },
    shortDescription: {
        type: String,
        required: true,
        max: 630
    },
    fullDescription: {
        type: String,
        required: true,
        max: 4500
    },
    schoolType: {
        type: Number,
        required: true,
        index: true,
        default: 1
    },
    educationType: {
        type: Object,
        required: true,
        index: true,
        default: {0: true}
    },
    dormitory: {
        type: Boolean,
        required: true,
        index: true,
        default: false
    },
    govermentOwnership: {
        type: Boolean,
        required: true,
        default: false
    },
    educationPriceTypes: {
        type: Object,
        required: true,
        index: true,
        default: {budget: true, paid: false}
    },
    CollegeProff: {
        type: Object,
        required: false
    },
    CollegeSpecs: {
        type: Object,
        required: false
    },
    VuzBakalavriat: {
        type: Object,
        required: false
    },
    VuzMagistratura: {
        type: Object,
        required: false
    },
    VuzSpecialitet: {
        type: Object,
        required: false
    },
    logo: {
        type: Object  || null,
        required: false
    },
    schoolLink: {
        type: String,
        required: false,
        sparse: true,
        unique: true,
        default: null
    },
    creator: {
        type: String,
        required: true,
        index: true
    },

});
school.plugin(passportLocalMongoose);

module.exports = mongoose.model("schools",school);