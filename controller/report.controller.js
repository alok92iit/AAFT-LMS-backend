import AssignCourse from "../models/AssignCourse.js"
import Courses from "../models/Course.js"



export const courseController = async (req, res) => {
    let query = [
        {
            '$addFields': {
                'status': 'active'
            }
        }, {
            '$lookup': {
                'from': 'assigncourses',
                'localField': '_id',
                'foreignField': 'courseId',
                'pipeline': [
                    {
                        '$group': {
                            '_id': null,
                            'users': {
                                '$addToSet': '$userId'
                            }
                        }
                    }
                ],
                'as': 'enrolled'
            }
        }, {
            '$lookup': {
                'from': 'completedCourse',
                'localField': '_id',
                'foreignField': 'courseId',
                'pipeline': [
                    {
                        '$group': {
                            '_id': null,
                            'users': {
                                '$addToSet': '$userId'
                            }
                        }
                    }
                ],
                'as': 'completedCourse'
            }
        }, {
            '$addFields': {
                'enrolled': {
                    '$ifNull': [
                        {
                            '$arrayElemAt': [
                                '$enrolled.users', 0
                            ]
                        }, []
                    ]
                },
                'completedCourse': {
                    '$ifNull': [
                        {
                            '$arrayElemAt': [
                                '$completedCourse.users', 0
                            ]
                        }, []
                    ]
                }
            }
        }, {
            '$addFields': {
                'inprogessUser': {
                    '$setDifference': [
                        '$enrolled', '$completedCourse'
                    ]
                }
            }
        }, {
            '$lookup': {
                'from': 'courseprogresses',
                'localField': 'inprogessUser',
                'foreignField': 'userId',
                'let': {
                    'cId': '$_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$$cId', '$courseId'
                                ]
                            }
                        }
                    }, {
                        '$group': {
                            '_id': null,
                            'iprogressLearner': {
                                '$addToSet': '$userId'
                            }
                        }
                    }
                ],
                'as': 'inProgress'
            }
        }, {
            '$addFields': {
                'inProgressLearner': {
                    '$size': '$inProgress'
                }
            }
        }, {
            $addFields: {
                completed: { $size: "$completedCourse" },
                enrolled: { $size: "$enrolled" },
                notStarted: {
                    $subtract: [
                        { $size: "$inprogessUser" },
                        "$inProgressLearner"
                    ]
                },
                completionPercent: {
                    $cond: {
                        if: { $eq: [{ $size: "$enrolled" }, 0] },
                        then: 0,
                        else: {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $size: "$completedCourse" },
                                                { $size: "$enrolled" }
                                            ]
                                        },
                                        100
                                    ]
                                },
                                0
                            ]
                        }
                    }
                }
            }
        }


    ]
    let courseReport = await Courses.aggregate(query)
    return res.status(200).json({ data: courseReport })
}

export const studentReport = async (req, res) => {
    let query = [
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
            '$lookup': {
                'from': 'courses',
                'localField': 'courseId',
                'foreignField': '_id',
                'as': 'course'
            }
        }, {
            '$unwind': {
                'path': '$course'
            }
        }, {
            '$addFields': {
                'name': '$user.name',
                'email': '$user.email',
                'courseName': '$course.name'
            }
        }, {
            '$lookup': {
                'from': 'chapters',
                'localField': 'courseId',
                'foreignField': 'courseId',
                'as': 'totalChapter'
            }
        }, {
            '$lookup': {
                'from': 'courseprogresses',
                'localField': 'userId',
                'foreignField': 'userId',
                'let': {
                    'cId': '$courseId'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$$cId', '$courseId'
                                ]
                            }
                        }
                    }, {
                        '$group': {
                            '_id': '',
                             watchTime:{
          $sum:"$totalWatchTime"
        },
                            'completedChapter': {
                                '$sum': {
                                    '$cond': [
                                        {
                                            '$eq': [
                                                '$isWatched', true
                                            ]
                                        }, 1, 0
                                    ]
                                }
                            },
                            'inProgressChapter': {
                                '$sum': {
                                    '$cond': [
                                        {
                                            '$eq': [
                                                '$isWatched', false
                                            ]
                                        }, 1, 0
                                    ]
                                }
                            }
                        }
                    }
                ],
                'as': 'progress'
            }
        }, {
            '$addFields': {
                'totalChapter': {
                    '$size': '$totalChapter'
                },
                'completedChapter': {
                    '$ifNull': [
                        {
                            '$arrayElemAt': [
                                '$progress.completedChapter', 0
                            ]
                        }, 0
                    ]
                },
                watchTime: {
      $ifNull: [
        { $arrayElemAt: ["$progress.watchTime", 0] },
        0
      ]
    },
                'inProgressChapter': {
                    '$ifNull': [
                        {
                            '$arrayElemAt': [
                                '$progress.inProgressChapter', 0
                            ]
                        }, 0
                    ]
                }
            }
        }, {
            '$addFields': {
                'status': {
                    '$switch': {
                        'branches': [
                             {
                                'case': {
                                    '$eq': [
                                        '$completedChapter', '$totalChapter'
                                    ]
                                },
                                'then': 'Completed'
                            },
                            {
                                'case': {
                                    '$eq': [
                                        '$inProgressChapter', 0
                                    ]
                                },
                                'then': 'Not Started'
                            }
                        ],
                        'default': 'In Progress'
                    }
                }
            }
        }
    ]
    let studentReport=await AssignCourse.aggregate(query)
    return res.status(200).json({data:studentReport})
}