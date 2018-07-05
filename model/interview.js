const mongoose          =   require('mongoose')
    , Schema            =   mongoose.Schema;

/**      Interview Schema
 ---------------------------------*/
var InterviewSchema = new Schema({

    markers: { type: Array, required: true },

    blob_str: { type: String, required: true},

    user: { type: Schema.Types.ObjectId, ref: 'User' },

    media_length:{ type:Number, required:true } //Length of the media in secs

    //datetime: { created_at: { type: Date, default: Date.now }, updated_at: { type: Date, default: Date.now } }

}, { timestamps: { createdAt : "created_at",  updatedAt : "updated_at" } } );

/**      User Models
 ---------------------------------*/
InterviewSchema.statics =  {

    /**
     * User By ID - fetching the data through the user's id
     */
    findById : function(id, callback) {
        return this.findOne({ _id: id }, callback);
    },


};

InterviewSchema.pre('save', function (next) {
    next();
});





module.exports = mongoose.model('Interview', InterviewSchema);