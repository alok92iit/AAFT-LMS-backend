import AssignCourse from "../models/AssignCourse.js"
import Chapter from "../models/Chapter.js";
import Courses from "../models/Course.js"
import { currentTimeStamp } from "../utils/common.js"
import { ObjectId } from "mongodb";
import { deleteReocrd, findByAggregate, singleInsert, universalUpdate } from "../utils/dbOperation.js";
import CourseProgress from "../models/CourseProgress.js";

export const allcourses = async (req, res) => {
    if (req.user.role != "OWNER") {

    } else {
        let query = [
            
            {
                '$addFields': {
                    'createdAt': {
                        '$dateToString': {
                            'format': '%d-%m-%Y',
                            'date': {
                                '$toDate': '$createdAt'
                            }
                        }
                    }
                }
            }, {
                '$lookup': {
                    'from': 'assigncourses',
                    'localField': '_id',
                    'foreignField': 'courseId',
                    'pipeline': [
                        {
                            '$lookup': {
                                'from': 'users',
                                'localField': 'userId',
                                'foreignField': '_id',
                                'as': 'user'
                            }
                        }, {
                            '$unwind': {
                                'path': '$user'
                            }
                        }, {
                            '$addFields': {
                                'name': '$user.name',
                                'email': '$user.email'
                            }
                        }, {
                            '$project': {
                                'name': 1,
                                'email': 1,
                                '_id': 0
                            }
                        }
                    ],
                    'as': 'enrollments'
                }
            },
            {
                '$addFields': {
                    'totalEnrollment': {
                        '$size': '$enrollments'
                    }
                }
            }
        ]
        let courses = await Courses.aggregate(query)
        return res.status(200).json({ data: courses })
    }
}

export const addCourse = async (req, res) => {
    if (req.user.role != "OWNER") res.status(403).json({ msg: "Permission denied" })
    else {
        try {
            console.log("clkenvkenvpevpe===", req?.files)
            if (req?.files?.courseImage?.length) {
                req.body.courseImage = `/uploads/courseImage/${req.files.courseImage[0].filename}`
            }
            else {
                return res.status(400).json({ msg: "Please provide course image" })
            }
            req.body.createdAt = currentTimeStamp()
            let courseDetail = await Courses(req.body)
            await courseDetail.save()
            return res.status(201).json({ msg: "Course created" })
        }
        catch (err) {
            if (err.name === "ValidationError") {
                const errors = Object.values(err.errors).map(e => e.message);
                return res.status(400).json({

                    msg: `this are required field ${errors}`,

                });
            }
        }
    }
}

export const getLearnerToAssignCourse = async (req, res) => {
    let { id } = req.params

    let query = [
        {
            '$match': {
                '_id': new ObjectId(id)
            }
        }, {
            '$lookup': {
                'from': 'assigncourses',
                'localField': '_id',
                'foreignField': 'courseId',
                'pipeline': [
                    {
                        '$group': {
                            '_id': '$courseId',
                            'learners': {
                                '$addToSet': '$userId'
                            }
                        }
                    }
                ],
                'as': 'alreadyEnrolledLearner'
            }
        }, {
            '$addFields': {
                'alreadyEnrolledLearner': {
                    '$ifNull': [
                        {
                            '$arrayElemAt': [
                                '$alreadyEnrolledLearner.learners', 0
                            ]
                        }, []
                    ]
                }
            }
        }, {
            '$lookup': {
                'from': 'users',
                'let': {
                    'learners': '$alreadyEnrolledLearner'
                },
                'pipeline': [
                    {
                        '$match': {
                            'role': 'STUDENT'
                        }
                    }, {
                        '$match': {
                            '$expr': {
                                '$not': {
                                    '$in': [
                                        '$_id', '$$learners'
                                    ]
                                }
                            }
                        }
                    }
                ],
                'as': 'learnes'
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'alreadyEnrolledLearner',
                'foreignField': '_id',
                'pipeline': [
                    {
                        "$project": {
                            name: 1,
                            email: 1
                        }
                    }
                ],
                'as': 'alreadyEnrolledLearner'
            }
        }, {
            '$addFields': {
                'totalEnrollments': {
                    '$size': '$alreadyEnrolledLearner'
                }
            }
        }

    ]
    let courseDetail = await Courses.aggregate(query)
    if (!courseDetail.length) {

        return res.status(200).json({ "msg": "", data: {} })
    }
    return res.status(200).json({ "msg": "", data: courseDetail[0] })
}

export const assignCourse = async (req, res) => {
    let { courseId, users } = req.body
    let currentTime = currentTimeStamp()
    let AssignedUsers = users.map((student) => {
        return {
            userId: student,
            courseId,
            createdAt: currentTime
        }
    })
    AssignCourse.insertMany(AssignedUsers)
    return res.status(201).json({ "msg": "Reacord added" })

}

export const getCourseDetail = async (req, res) => {
    let { id } = req.params

    let query = [
        {
            '$match': {
                '_id': new ObjectId(id)
            }
        }, {
            '$lookup': {
                'from': 'chapters',
                'localField': '_id',
                'foreignField': 'courseId',
                'as': 'chapters'
            }
        }, {
            '$addFields': {
                'createdAt': {
                    '$dateToString': {
                        'format': '%d-%m-%Y',
                        'date': {
                            '$toDate': '$createdAt'
                        }
                    }
                }
            }
        }
    ]
    if (req.user.role == "STUDENT") {
        let userId = req.user._id
        let isCourseAssigned = await AssignCourse.find({ courseId: new ObjectId(id), userId })
        if (!isCourseAssigned.length) res.status(400).json({ msg: "You are not enrolled in this course" })
        else {
            query = [
                {
                    '$match': {
                        '_id': new ObjectId(id)
                    }
                }, {
                    '$lookup': {
                        'from': 'chapters',
                        'localField': '_id',
                        'foreignField': 'courseId',
                        'pipeline': [
                            {
                                '$lookup': {
                                    'from': 'courseprogresses',
                                    'localField': '_id',
                                    'foreignField': 'chapterId',
                                    'pipeline': [
                                        {
                                            '$match': {
                                                'userId': new ObjectId(userId)
                                            }
                                        }
                                    ],
                                    'as': 'watchedChapters'
                                }
                            }, {
                                '$addFields': {
                                    'isWatched': {
                                        "$arrayElemAt": ["$watchedChapters.isWatched", 0]
                                    },
                                    'lastWatched': {
                                        "$arrayElemAt": ["$watchedChapters.lastWatched", 0]
                                    },

                                }
                            }, {
                                '$project': {
                                    'courseId': 0,
                                    'watchedChapters': 0
                                }
                            }
                        ],
                        'as': 'chapters'
                    }
                }, {
                    '$addFields': {
                        'createdAt': {
                            '$dateToString': {
                                'format': '%d-%m-%Y',
                                'date': {
                                    '$toDate': '$createdAt'
                                }
                            }
                        }
                    }
                }
            ]
        }
    }
    let detail = await Courses.aggregate(query)
    if (!detail.length) res.status(400).json({ msg: "Please provide correct course id" })
    else {
        return res.status(200).json({ data: detail[0] })
    }
}

export const addChapter = async (req, res) => {

    req.createdAt = currentTimeStamp()
    try {
        let query = [
            {
                "$match": {
                    courseId: new ObjectId(req.body.courseId)
                }
            },
            {
                $sort: {
                    index: -1
                }
            }
        ]
        const lastChapter = await Chapter.aggregate(query)
        console.log("jwenfoewroif===", lastChapter)
        req.body.index = lastChapter?.length ? lastChapter[0].index + 1 : 1;
        if( lastChapter?.length){
            
            universalUpdate("chapters", { "_id": lastChapter[0]["_id"] }, { "$set": { isLast: false } })
        }
        req.body.isLast = true
        let chapter = await Chapter(req.body)
        chapter.save();
        return res.status(200).json({ msg: "Chapter added" })
    }
    catch (err) {
        if (err.name === "ValidationError") {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({

                msg: `this are required field ${errors}`,

            });
        }
    }

}

export const editCourse = async (req, res) => {
    let { id } = req.params

    await universalUpdate("courses", { "_id": new ObjectId(id) }, { "$set": { ...req.body, liveAt: currentTimeStamp() } })
    return res.status(200).json({ msg: "Record Updated" })
}
export const deleteChapter = async (req, res) => {
    let { courseId, chapterId } = req.params
    await deleteReocrd("chapters", { "_id": new ObjectId(chapterId), courseId: new ObjectId(courseId) })
    return res.status(200).json({ msg: "Record Deleted" })
}
export const deleteCourse = async (req, res) => {
    let { id } = req.params
    await deleteReocrd("chapters", { courseId: new ObjectId(id) })
    await deleteReocrd("courses", { "_id": new ObjectId(id) })
    return res.status(200).json({ msg: "Record Deleted" })
}


export const trackCourseProgress = async (req, res) => {
    if (req.user.role == "OWNER") return res.status(200).json({})
    else {
        let { courseId, chapterId } = req.params
        let { lastWatched, watchPercentage, watchTime } = req.body
        let payload = {
            courseId: new ObjectId(courseId),
            chapterId: new ObjectId(chapterId),
            userId: new ObjectId(req.user._id),
            createdAt: currentTimeStamp(),
            lastWatched,
            isWatched: watchPercentage >= 90 ? true : false,
            watchPercentage
        }
        let filter = {
            courseId: new ObjectId(courseId),
            chapterId: new ObjectId(chapterId),
            userId: new ObjectId(req.user._id),

        }
        await CourseProgress.findOneAndUpdate(
            filter,
            {
                $inc: {
                    totalWatchTime: watchTime
                },
                $set: payload
            },
            {
                new: true,
                upsert: true
            }
        )
        if (watchPercentage >= 90) {
            let query = [
                {
                    "$match": {
                        courseId: new ObjectId(courseId),
                        
                        userId: new ObjectId(req.user._id),
                    }
                }
            ]
            let courseComplete = await findByAggregate("completedCourse", query)
            if (!courseComplete.length) {

                const isLastChapter = await Chapter.find({ _id: new ObjectId(chapterId) })
                if (isLastChapter[0].isLast) {
                    const courseCompletePayload = {
                        courseId: new ObjectId(courseId),
                        createdAt: currentTimeStamp(),
                        userId: new ObjectId(req.user._id),
                    }
                    singleInsert("completedCourse", courseCompletePayload)
                }
            }
        }


        return res.status(200).json({})
    }
}

export const enrolledCourse = async (req, res) => {
    let userId = req.user._id
    let query = [
{
                "$match":{
                    status:"active"
                }
            },
        {
            '$lookup': {
                'from': 'assigncourses',
                'localField': '_id',
                'foreignField': 'courseId',
                'pipeline': [
                    {
                        '$match': {
                            'userId': new ObjectId(userId)
                        }
                    }
                ],
                'as': 'assigned'
            }
        },{
            "$unwind":{
                path:"$assigned"
            }
        },  {
            '$lookup': {
                'from': 'courseprogresses',
                'localField': '_id',
                'foreignField': 'courseId',
                'pipeline': [
                    {
                        '$match': {
                            'userId': new ObjectId(userId)
                        }
                    }
                ],
                'as': 'courseProgress'
            }
        }, {
            '$lookup': {
                'from': 'chapters',
                'localField': '_id',
                'foreignField': 'courseId',
                'as': 'chapters'
            }
        }, {
            $addFields: {
                totalChapters: { $size: "$chapters" },
                completedChapters: { $size: "$courseProgress" },

                remainingChapters: {
                    $subtract: [
                        { $size: "$chapters" },
                        { $size: "$courseProgress" }
                    ]
                },

                progress: {
                    $cond: [
                        { $eq: [{ $size: "$chapters" }, 0] }, // avoid divide by zero
                        0,
                        {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $size: "$courseProgress" },
                                                { $size: "$chapters" }
                                            ]
                                        },
                                        100
                                    ]
                                },
                                0
                            ]
                        }
                    ]
                }
            }
        }

    ]
    let enrolledCourses = await Courses.aggregate(query)
    return res.status(200).json({ data: enrolledCourses })
}

