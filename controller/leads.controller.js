import Leads from "../models/Leads.js"
import Users from "../models/User.js"
import { convertTimeStampToDate, currentTimeStamp } from "../utils/common.js"
import { findByAggregate, universalUpdate } from "../utils/dbOperation.js"
import { ObjectId } from "mongodb";
export const getAllLeads = async (req, res) => {
    if (req.user.role == "OWNER") {
        let leads = await Leads.find({}).populate({
            path: "assignedTo",
            select: "-password"
        })
        return res.status(200).json({ data: leads })
    }
    return res.send("No lead exist till now!")
}

export const addLead = async (req, res) => {
    let payload = req.body
    payload.createdAt = ""
    payload.createdBy = req.user._id
    payload.phoneNo=normalizePhone(payload.phoneNo).trim()
    let query = [
        {
            '$unionWith': {
                'coll': 'users',
                'pipeline': [
                    {
                        '$match': {
                            'role': 'LEAD_CLOSER'
                        }
                    }, {
                        '$addFields': {
                            'assignedTo': '$_id'
                        }
                    }
                ]
            }
        },
        {
            '$group': {
                '_id': '$assignedTo',
                'totalLeads': {
                    '$sum': 1
                }
            }
        }, {
            '$sort': {
                'totalLeads': 1
            }
        }, {
            '$limit': 1
        }
    ]
    let leadCloser = await findByAggregate("leads", query)
    if (!leadCloser.length) {
        leadCloser = await Users.findOne({ "role": "LEAD_CLOSER" })
        console.log("clwchb kdsnjsfvf===", leadCloser)
        if (Object.keys(leadCloser).length == 0) {
            return res.status(400).json({ "msg": "Please add Lead closer first" })
        }
        else {
            leadCloser = leadCloser["_id"]

        }
    }
    else {
        leadCloser = leadCloser[0]["_id"]
    }
    payload.assignedTo = leadCloser
    payload.status = "new"
    payload.createdAt = currentTimeStamp()
    let record = await Leads(req.body)
    await record.save()
    return res.status(200).json({})
}



export const getLeadInfo = async (req, res) => {
    let { id } = req.params
    let query = [
        {
            '$match': {
                '_id': new ObjectId(id)
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'createdBy',
                'foreignField': '_id',
                'as': 'createdBy'
            }
        }, {
            '$unwind': {
                'path': '$createdBy'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'assignedTo',
                'foreignField': '_id',
                'pipeline': [
                    {
                        '$project': {
                            'password': 0
                        }
                    }
                ],
                'as': 'assignedTo'
            }
        }, {
            '$unwind': {
                'path': '$assignedTo'
            }
        },
        {
            '$addFields': {
                'createdAt': {
                    '$dateToString': {
                        'format': '%d-%m-%Y %H:%M',
                        'date': {
                            '$toDate': '$createdAt'
                        }
                    }
                },
                'updatedAt': {
                    '$dateToString': {
                        'format': '%d-%m-%Y %H:%M',
                        'date': {
                            '$toDate': '$updatedAt'
                        }
                    }
                }
            }
        }
    ]
    let leadInfo = await findByAggregate("leads", query)
    return res.status(200).json({ data: leadInfo[0] })

}

export const leadsStatus = async (req, res) => {
    let { id } = req.params
    let statusFlow = {
        new: "contacted",
        contacted: "qualified",
        qualified: "converted"
    }
    let lead = await Leads.findById(id)
    await universalUpdate("leads", { "_id": new ObjectId(id) },
        {
            $set: { status: statusFlow[lead.status], updatedAt: currentTimeStamp() },
            $push: { history: { status: lead.status, date: convertTimeStampToDate(lead.createdAt) } }
        }
    )
    lead = await Leads.findById(id)
    return res.status(200).json({ data: lead })
}


export const duplicayChecker = async (req, res, next) => {
    const phoneNo = normalizePhone(req.body.phoneNo)
    if (req.body.duplicateIt) {
        return next()
    }
    else {
        const query = [
            {
                '$addFields': {
                    'parts': {
                        '$split': [
                            '$email', '@'
                        ]
                    }
                }
            }, {
                '$addFields': {
                    'local': {
                        '$toLower': {
                            '$arrayElemAt': [
                                '$parts', 0
                            ]
                        }
                    },
                    'domain': {
                        '$toLower': {
                            '$arrayElemAt': [
                                '$parts', 1
                            ]
                        }
                    }
                }
            }, {
                '$addFields': {
                    'localNoDots': {
                        '$replaceAll': {
                            'input': '$local',
                            'find': '.',
                            'replacement': ''
                        }
                    }
                }
            }, {
                '$addFields': {
                    'normalizedEmail': {
                        '$concat': [
                            '$localNoDots', '@', '$domain'
                        ]
                    }
                }
            }, {
                '$match': {
                    '$or': [
                        {
                            'normalizedEmail': req.body.email
                        }, {
                            'name': {
                                '$regex': 'cfdcDew',
                                '$options': 'i'
                            }
                        },
                        {
                            'phoneNo': { '$regex': new RegExp(phoneNo + "$") }
                        }
                    ]
                }
            }
        ]
        const duplicateData = await findByAggregate("leads", query)
        if (duplicateData.length) {
            return res.status(400).json({ msg: "This record duplicate with exist records", data: duplicateData })
        }
        else {
            return next()
        }
    }
}
const normalizePhone = (phone) => phone.replace(/\D/g, "");  

export const markLost=async(req,res)=>{
    let {id}=req.params
    console.log("cemfrkmfioe=",req.user.role)
    const lead=await Leads.findById(id)
    if(!lead.assignedTo.equals(req.user._id) && req.user.role !== "OWNER" ){
        return res.status(403).json({msg:"permission denied"})


    }
    else{
        await universalUpdate("leads", { "_id": new ObjectId(id) },
        {
            $set: { status: "lost", updatedAt: currentTimeStamp() },
           
        }
    )
    return res.status(200).json({})
    }
}