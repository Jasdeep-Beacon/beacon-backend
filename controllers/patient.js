var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/* GET users listing. */
var Patient = mongoose.model('Patient', new Schema({ name: String, email: String, image: String}));
var Transcript = require('./../model/transcript');
var Transcript_data = require('./../model/transcript_data');
var Patient_recomend = require('./../model/patient_recommendation');


var multer = require('multer');
var path = require('path');
var upload = multer({
	dest: 'public/uploads/patient'
});

var user = require("./users");
var User = user.User;


// exports.addPatient = function(req, res, next) {
// 	var pt = new Patient({name : req.body.name, email : req.body.email});
// 	pt.save(function(err,data){
// 		if(err){
// 			res.status(401).jsonp({"msg":err})
// 		} else {
// 			if(data){
// 				res.status(200).jsonp({"data":data,"msg":"User Added"})
// 			}
// 		}
// 	})  
// }


	// Patient({name:"laxman", email:"laxmansingh@gmail.com"}).save();

exports.getAllPatients = function(req,res){

	data1 = [];
	User.find({}).exec(function(err,data){
		if(err){
			res.status(401).jsonp({msg: err})
		}else {
			if(data.length){
				var userArr = [];
				for(var a in data){
					userArr.push(data[a]._id);
				}
				Transcript.find({user_id: {$in : userArr}}).populate('patient_id').populate('user_id').exec(function(error,pData){
					if(!error) {
						for(var i in data){
								var userPatient = {user : {},patientCount : null}
							var countPatient = 0;
							for(var j in pData){
								if(data[i]._id.toString() == pData[j].user_id._id.toString() ){
									
									countPatient = countPatient+1;
								}
							}
							if(countPatient){
								userPatient.user = data[i];
								userPatient.patientCount = countPatient;
								data1.push(userPatient);
							}
						}
						res.status(200).jsonp({data: data1});
					}
				})
			}else {
				res.status(200).jsonp({msg: "No record found"})
			}
		}
	})
}


// exports.userPatient = function(req,res){
// 	Transcript.find({user_id: req.params.userId}).populate('patient_id').exec(function(err,data){
// 		if(err){
// 			res.status(404).jsonp({msg: err})
// 		}else {
// 			if(data.length){
// 				res.status(200).jsonp({data : data});
// 			}else {
// 				res.status(404).jsonp({msg: "No record found"});
// 			}
// 		}
// 	})
// }

exports.userPatient = function(req,res){
	var respArr = [];
	Transcript.find({user_id: req.params.userId}).populate('user_id','name email image').populate('patient_id').sort({created :-1}).exec(function(err,data){
		if(err){
			res.status(404).jsonp({"msg":err});
		}else {
			patientIdArr = [];
			if(data.length){
				data.map(function(resp) {
					patientIdArr.push(resp._id);
				})
				Patient_recomend.find({transcription_id : {$in : patientIdArr }},{transcription_id : true, percent:true}).sort({created :-1}).exec(function(error, prResp){
					if(error) {
						res.status(404).jsonp({msg:error});
					}else {
						var count = 0;
						if(prResp.length){
							for(var i in data) {
									var respdata = {
										transcript_id : '',
										patient_id : '',
										patient_name : '',
										patient_image : '',
										patient_email: '',
										therapist_name : '',
										therapist_image : '',
										therapist_email : '',
										therapist_id : '',
										date : "",
										duration : '',
										risk : ""
									};
								for(var j in prResp){
									if(data[i].user_id  && data[i].patient_id)  {
										if(data[i]._id.toString() === prResp[j].transcription_id.toString()){
											//console.log("asdf",prResp[j].transcription_id);
											respdata.transcript_id = prResp[j].transcription_id;
											respdata.patient_id = data[i].patient_id._id;
											respdata.patient_name = data[i].patient_id.name;
											respdata.patient_image = data[i].patient_id.image;
											respdata.patient_email = data[i].patient_id.email;
											respdata.therapist_id = data[i].user_id._id
											respdata.therapist_name = data[i].user_id.name;
											respdata.therapist_image = data[i].user_id.image;
											respdata.therapist_email = data[i].user_id.email;
											respdata.risk = prResp[j].percent;
											respdata.date = data[i].created;
											respdata.duration = data[i].transcript_duration;
											respArr.push(respdata);
											break;
										}
									}
								}
							}
							console.log("userPatient",respArr.length);
							res.jsonp({data : respArr});

						} else {
							res.status(404).jsonp({msg : "Patient_recomend are not found"})
						}
					}
				})

				
			}else {
				res.status(404).jsonp({ "msg" : "Transcription for past 7 days not available" })
			}
		}
	})
}



// exports.patientUser = function(req,res){
// 	Transcript.find({patient_id: req.params.patientId}).populate('user_id').exec(function(err,data){
// 		if(err){
// 			res.status(404).jsonp({msg: err})
// 		}else {
// 			if(data.length){
// 				res.status(200).jsonp({data : data});
// 			}else {
// 				res.status(404).jsonp({msg: "No record found"});
// 			}
// 		}
// 	})
// }


exports.patientUser  = function(req,res){
	var respArr = [];
	Transcript.find({patient_id: req.params.patientId}).populate('user_id','name email').populate('patient_id').sort({created :-1}).exec(function(err,data){
		if(err){
			res.status(404).jsonp({"msg":err});
		}else {
			patientIdArr = [];
			if(data.length){
				data.map(function(resp) {
					patientIdArr.push(resp._id);
				})
				Patient_recomend.find({transcription_id : {$in : patientIdArr }},{transcription_id : true, percent:true}).sort({created :-1}).exec(function(error, prResp){
					if(error) {
						res.status(404).jsonp({msg:error});
					}else {
						var count = 0;
						if(prResp.length){
							for(var i in data) {
									var respdata = {
										transcript_id : '',
										patient_id : '',
										patient_name : '',
										patient_image : '',
										patient_email : '',
										therapist_name : '',
										therapist_email : '',
										therapist_image : '',
										therapist_id : '',
										date : "",
										duration : '',
										risk : ""
									};
								for(var j in prResp){
									if(data[i].user_id  && data[i].patient_id)  {
										if(data[i]._id.toString() === prResp[j].transcription_id.toString()){
											//console.log("asdf",prResp[j].transcription_id);
											respdata.transcript_id = prResp[j].transcription_id;
											respdata.patient_id = data[i].patient_id._id;
											respdata.patient_name = data[i].patient_id.name;
											respdata.patient_email = data[i].patient_id.email;
											respdata.patient_image = data[i].patient_id.image;
											respdata.therapist_id = data[i].user_id._id
											respdata.therapist_name = data[i].user_id.name;
											respdata.therapist_email = data[i].user_id.email;
											respdata.therapist_image = data[i].user_id.image;
											respdata.risk = prResp[j].percent;
											respdata.date = data[i].created;
											respdata.duration = data[i].transcript_duration;
											respArr.push(respdata);
											break;
										}
									}
								}
							}
							console.log("patientuser",respArr.length);
							res.jsonp({data : respArr});

						} else {
							res.status(404).jsonp({msg : "Patient_recomend are not found"})
						}
					}
				})

				
			}else {
				res.status(404).jsonp({ "msg" : "Transcription for past 7 days not available" })
			}
		}
	})
}


exports.add = function(req, res, next) {

	if(req.body.name && req.body.email){
		Patient.findOne({email:req.body.email}).exec(function(err,patient){
			if(err){
				res.status(401).jsonp({"msg":err});
			}else{
				if(patient){
					res.status(401).jsonp({"msg":"Patient already exists!"});		
				}else{
					Patient({name:req.body.name, email:req.body.email, image : req.body.image}).save(function(err,user){
						if(err){
							res.status(401).jsonp({"msg":err});
						}else{
							res.status(200).jsonp({"data":user,"msg":""});	
						}
					})
				}
			}
		})				
	}else{
		res.status(401).jsonp({"msg":"Name and Email are required"});
	}    
}

exports.get = function(req, res, next) {
	Patient.findOne({_id:req.params.patientId}).exec(function(err,patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(patient){
			res.status(200).jsonp({"data":patient,"msg":""});
		}else{
			res.status(401).jsonp({"msg":"User doesnt exists"});	
		}
	})
}

exports.fetchAll = function(req, res, next) {
	Patient.find({}).exec(function(err,Patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(Patient){
			res.status(200).jsonp({"data":Patient,"msg":""});
		}else{
			res.status(401).jsonp({"msg":"User doesnt exists"});	
		}
	})
}

exports.update = function(req, res, next) {
	console.log("=======================",req.body);
	Patient.findOne({_id:req.params.patientId}).exec(function(err,patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(patient){
			patient.name = req.body.name;
			patient.email = req.body.email;
			patient.image = req.body.image;
			patient.save(function(err, update){
				if(!err){
					if(update){
						res.status(200).jsonp({"data":patient,"msg":""});
					}
				}
			});

		}else{
			res.status(401).jsonp({"msg":"Patient doesnt exists"});	
		}
	})
}

exports.delete = function(req, res, next) {
	Patient.remove({_id:req.params.patientId}).exec(function(err,patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(patient){
			res.status(200).jsonp({"msg":"Patient deleted"});	
		}
	})
}

exports.getTranscription = function(req,res){
	Transcript_data.find({ transcript_id : req.params.patientId}).exec(function(error,tData){
		if(error){
			res.status(404).jsonp({"msg":error});
		}else{
			if(tData) {
				res.status(200).jsonp({data : tData})
			} else {
				res.status(404).jsonp({"msg": "Patient data not available"});
			}
		}			
	})
}

// exports.getAllTranscription = function(req,res){
// 	Transcript.find({patient_id : req.params.patientId}).exec(function(err,data){
// 		if(err){
// 			res.status(404).jsonp({"msg":err});	
// 		}else {
// 			if(data) {
// 				//console.log("data",data.length)
// 				var uArr = [];
// 				for(var a in data){
// 					uArr.push(data[a]._id);
// 				}
// 			Transcript_data.find({ transcript_id : {$in : uArr}}).exec(function(error,tData){
// 				if(error){
// 					res.status(404).jsonp({"msg":error});
// 				}else{
// 					if(tData) {
// 						//console.log(tData.length);
// 						res.status(200).jsonp({data : tData})
// 					} else {
// 						res.status(404).jsonp({"msg": "Patient data not available"});
// 					}
// 				}			
// 			})
// 		}else {
// 			res.status(404).jsonp({"msg": "Patient data not available"});
// 		}
// 		}
// 	})
// }

exports.getAllTranscription = function(req,res){
	Transcript.find({patient_id : req.params.patientId}).exec(function(err,data){
		if(err){
			res.status(404).jsonp({"msg":err});	
		}else {
			if(data) {
				var uArr = [];
				transcriptArr = [];
				for(var a in data){
					uArr.push(data[a]._id);
				}
			Transcript_data.find({ transcript_id : {$in : uArr}}).exec(function(error,tData){
				if(error){
					res.status(404).jsonp({"msg":error});
				}else{
					if(tData) {
						for(var a in uArr){
								var tempArr = [];
							for(var b in tData){
								if( uArr[a].toString() === tData[b].transcript_id.toString() ){
									if(tData[b])
									tempArr.push(tData[b]);
								}
							}
							if(tempArr.length)
							transcriptArr.push(tempArr);
						}
						res.status(200).jsonp({data : transcriptArr})
					} else {
						res.status(404).jsonp({"msg": "Patient data not available"});
					}
				}			
			})
		}else {
			res.status(404).jsonp({"msg": "Patient data not available"});
		}
		}
	})
}

exports.getWeekTranscription = function(req,res){

	var respArr = [];
	Transcript.find({created : { $lte : Date.now() , $gt : (Date.now()- 7*24*60*60*1000) }}).populate('user_id','name email image').populate('patient_id').sort({created :-1}).exec(function(err,data){
		if(err){
			res.status(404).jsonp({"msg":err});
		}else {
			patientIdArr = [];
			if(data.length){
				data.map(function(resp) {
					patientIdArr.push(resp._id);
				})
				Patient_recomend.find({transcription_id : {$in : patientIdArr }},{transcription_id : true, percent:true}).sort({created :-1}).exec(function(error, prResp){
					if(error) {
						res.status(404).jsonp({msg:error});
					}else {
						var count = 0;
						if(prResp.length){
							for(var i in data) {
									var respdata = {
										transcript_id : '',
										patient_id : '',
										patient_image : '',
										patient_name : '',
										therapist_name : '',
										therapist_image : '',
										therapist_id : '',
										date : "",
										duration : '',
										risk : ""
									};
								for(var j in prResp){
									if(data[i].user_id  && data[i].patient_id)  {
										if(data[i]._id.toString() === prResp[j].transcription_id.toString()){
											//console.log("asdf",prResp[j].transcription_id);
											respdata.transcript_id = prResp[j].transcription_id;
											respdata.patient_id = data[i].patient_id._id;
											respdata.patient_name = data[i].patient_id.name;
											respdata.patient_image = data[i].patient_id.image;
											respdata.therapist_id = data[i].user_id._id
											respdata.therapist_name = data[i].user_id.name;
											respdata.therapist_image = data[i].user_id.image;
											respdata.risk = prResp[j].percent;
											respdata.date = data[i].created;
											respdata.duration = data[i].transcript_duration;
											respArr.push(respdata);
											break;
										}
									}
								}
							}
							res.jsonp({data : respArr});

						} else {
							res.status(404).jsonp({msg : "Patient_recomend are not found"})
						}
					}
				})

				
			}else {
				res.status(404).jsonp({ "msg" : "Transcription for past 7 days not available" })
			}
		}
	})
}



exports.uploadFile = function(req, res) {
	var file_path;
	var mime_type;
	var storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, './public/uploads/patient')
		},
		filename: function(req, file, callback) {
			var file_name = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
			callback(null, file_name)
			  res.status(200).jsonp({
					"msg": "success",
					"file_name":file_name
				});
		}
	})
	var upload = multer({
		storage: storage
	}).single('file')
	upload(req, res, function(err) {
	})
}