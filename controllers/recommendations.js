	var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const watson = require('watson-developer-cloud');
const vcapServices = require('vcap_services');

var Recommendation = mongoose.model('Recommendation', new Schema({ name: String, tags:[], factor: Number, type: Number /*0 Recommendations,1 Danger*/  }));

var PatientRecomendation = require('./../model/patient_recommendation');
var Transcript = require('./../model/transcript')
exports.fetch = function(req, res, next) {
  	Recommendation.find({type:req.params.type}).exec(function(err,recommendations){
		if(err){
			res.status(404).jsonp({"msg":err});
		}else if(recommendations){
			res.status(200).jsonp({"data":recommendations,"msg":""});
		}else{
			res.status(404).jsonp({"msg":(req.params.type==1?"Recommendations":"Danger Harms")+" not found"});
		}
	});
}

exports.save = function(req, res, next) {
  	var recommendation = {};
  	var query = {};
  	if(req.body.tags){
		recommendation.tags=[];
		recommendation.tags=req.body.tags;
	}
	if(req.body.name)
		recommendation.name=req.body.name;
	if(req.body.factor)
		recommendation.factor=req.body.factor;
	if(req.body.type)
		recommendation.type=req.body.type;
	if(req.body.id){
		query['_id']=req.body.id
	}
  	if(recommendation){
  		if(query["_id"]){
			Recommendation.update(query,{$set:recommendation}).exec(function(err, rec){
	  			if(err){
	  				res.status(404).jsonp({"msg":err});
	  			}else{
	  				res.status(200).jsonp({"data":rec});
	  			}
	  		})
		}else{
			Recommendation(recommendation).save(function(err, rec){
				if(err){
	  				res.status(404).jsonp({"msg":err});
	  			}else{
	  				res.status(200).jsonp({"data":rec});
	  			}
			})
		}
  	}else{
  		if(query["_id"]){
  			res.status(404).jsonp({"msg":"Either type or tags or name is/are required to update the record"});
  		}else{
  			res.status(404).jsonp({"msg":"type, name and Tags are required"});	
  		}  		
  	}
}

var transcript='';
// tra, socket, transciption_id,userId, patientId
exports.fetchAll = function(text, socket, transcription_id, patient) {
	transcript=text.toLowerCase();
	var result = [];
	var danger = [];
	var resulti=0;
	var dangeri=0;
	Recommendation.find({type:2}).exec(function(err,recommendations){
		if(recommendations){
			for(var i=0; i<recommendations.length; i++){
				dangeri=i;
				danger.push({"name":recommendations[dangeri].name, tags:[], count:0});
				for(var j=0; j<recommendations[dangeri].tags.length; j++){
					if((transcript.split(recommendations[dangeri].tags[j].value.toLowerCase()).length-1)>0){
						danger[dangeri].count+=transcript.split(recommendations[dangeri].tags[j].value).length-1;
						danger[dangeri].percent=danger[dangeri].count*(recommendations[dangeri].factor)*100;
						danger[dangeri].tags.push({"tag":recommendations[dangeri].tags[j].value, "count":transcript.split(recommendations[dangeri].tags[j].value).length-1});
					}						
				}
			}
			var d=0;
			var x=0;
			for(var i=0; i<danger.length; i++){
				if(danger[i].tags.length){
					d+=danger[i].percent;
					x++;
				}
			}
			process.emit('danger',{danger:(d/x),user:socket,patient:patient});
			var self_harmObj = d/x;
			if(isNaN(self_harmObj)) {
				self_harmObj = 0;
			}
			Transcript.update({_id: transcription_id},{$set : { self_harm : self_harmObj }}).exec();
		}		
	});
  	Recommendation.find({type:1}).exec(function(err,recommendations){
		if(recommendations){
			for(var i=0; i<recommendations.length; i++){
				resulti=i;
				result.push({"name":recommendations[resulti].name,tags:[], count:0});
				for(var j=0; j<recommendations[resulti].tags.length; j++){
					if((transcript.split(recommendations[resulti].tags[j].value.toLowerCase()).length-1)>0){
						result[resulti].count+=transcript.split(recommendations[resulti].tags[j].value).length-1;
						result[resulti].percent=result[resulti].count*(recommendations[resulti].factor)*100;
						result[resulti].tags.push({"tag":recommendations[resulti].tags[j].value, "count":transcript.split(recommendations[resulti].tags[j].value).length-1});
					}						
				}				
			}//{ name: 'Risky', tags: [ [Object] ], count: 1, percent: 10 }			
			process.emit('recommendations',{reco:result,user:socket,patient:patient});
			PatientRecomendation.remove({transcription_id:transcription_id}).exec(function(err,trs){
				var patientRec = new PatientRecomendation({ name : result[0].name, tags :result[0].tags , count :result[0].count , percent : result[0].percent, transcription_id : transcription_id  });
				patientRec.save(function(err,data){
					if(err){
						console.log(err);
					}else {
						if(data){
							//console.log("Patient Recomendations saved")
						}
					}
				})
			})			
		}
	});
}

var sttAuthService = new watson.AuthorizationV1(
  Object.assign(
    {
	username: "69b171a5-3727-435c-8284-53ad30e9c281",
 	password: "oC05nCtWB23E"
    },
    vcapServices.getCredentials('speech_to_text') // pulls credentials from environment in bluemix, otherwise returns {}
  )
);
exports.getToken = function(req, res) {
  sttAuthService.getToken(
    {
      url: watson.SpeechToTextV1.URL
    },
    function(err, token) {
      if (err) {
        console.log('Error retrieving token: ', err);
        res.status(500).send('Error retrieving token');
        return;
      }
      res.jsonp({token:token});
    }
  );
}

exports.getPatientRecommendations = function(req, res){
	var query={$where:'this.tags.length > 0'}
	if(req.params.transcriptionId){
		query['transcription_id'] = req.params.transcriptionId;
	}
	PatientRecomendation.find(query,{tags:1}).exec(function(err, pr){
		if(!err){
			var tags={};
			for(var i=0; i < pr.length; i++){
				for(var j=0; j < pr[i].tags.length; j++){
					if(tags[pr[i].tags[j].tag]){
						tags[pr[i].tags[j].tag]+=pr[i].tags[j].count;
					}else{
						tags[pr[i].tags[j].tag]=pr[i].tags[j].count;
					}
				}
			}
			res.status(200).jsonp({msg:'',tags:tags})
		}else{
			res.status(404).jsonp({msg:err})
		}
	})
}
