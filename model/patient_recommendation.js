'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var patient_RecomendationSchame = new Schema({
    name : {
        type : String
    },
    tags : [],
    count : {
        type : Number
    },
    percent : {
        type : Number
    },
    transcription_id: {
        //type : String
        type: Schema.Types.ObjectId, 
        ref: 'transcript'
    },
    created: {
                type: Date,
                default: Date.now
            }
});

module.exports = mongoose.model('Patient_Recomendation', patient_RecomendationSchame);