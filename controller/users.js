import Courses from "../models/Course.js"
import Users from "../models/User.js"
import { deleteReocrd, findByAggregate } from "../utils/dbOperation.js"
import { ObjectId } from "mongodb"
export const allUsers = async (req, res) => {
    let { role } = req.query
    let query = [
        {
            "$match": {
                "role": {
                    "$ne": "OWNER"
                }
            }
        },
        {
            "$project": {
                password: 0
            }
        },
        {
            '$lookup': {
                'from': 'assigncourses',
                'localField': '_id',
                'foreignField': 'userId',
                'pipeline': [
                    {
                        '$lookup': {
                            'from': 'courses',
                            'localField': 'courseId',
                            'foreignField': '_id',
                            'as': 'courses'
                        }
                    }, {
                        '$unwind': {
                            'path': '$courses'
                        }
                    }, {
                        '$addFields': {
                            'name': '$courses.name',
                            'img': '$courses.courseImage',
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
                        '$project': {
                            'createdAt': 1,
                            'name': 1,
                            'img': 1,
                            '_id': 0
                        }
                    }
                ],
                'as': 'assigncourses'
            }
        },
        {
            '$addFields': {
                'totalEnrollment': {
                    '$size': '$assigncourses'
                }
            }
        }
    ]

    let users = await findByAggregate("users", query)
    return res.status(200).json({ data: users })
}

export const deleteUser = async (req, res) => {
    try {

        let { id } = req.params
        await deleteReocrd("assigncourses", { "userId": new ObjectId(id) })
        await deleteReocrd("users", { "_id": new ObjectId(id) })
        return res.status(200).json({ msg: "Record deleted" })
    }
    catch (err) {
        return res.status(400).json({ msg: "Please provide correct user id" })
    }

}

export const dashboard = async (req, res) => {
    let role = req.user.role
    if (role == "OWNER") {
        const dashboardStats = await Courses.aggregate([
  {
    '$facet': {
      'activeCourses': [
        {
          '$match': {
            'status': 'active'
          }
        }, {
          '$count': 'count'
        }
      ], 
      'draftCourses': [
        {
          '$match': {
            'status': 'draft'
          }
        }, {
          '$count': 'count'
        }
      ], 
      'topSellingCourse': [
        {
          '$lookup': {
            'from': 'assigncourses', 
            'localField': '_id', 
            'foreignField': 'courseId', 
            'as': 'assignCourse'
          }
        }, {
          '$addFields': {
            'enrollCount': {
              '$size': '$assignCourse'
            }
          }
        }, {
          '$sort': {
            'enrollCount': -1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            'name': 1, 
            'enrollCount': 1
          }
        }
      ], 
      'leastSellingCourse': [
        {
          '$sort': {
            'enrollCount': 1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            'name': 1, 
            'enrollCount': 1
          }
        }
      ]
    }
  }
])

        const userStats = await Users.aggregate([
            {
                '$facet': {
                    'totalUsers': [
                        {
                            "$match":{
                                role:{
                                    $ne:"OWNER"
                                }
                            }
                        },
                        {
                            '$count': 'count'
                        }
                    ],
                    'inactiveUsers': [
                        {
                            '$lookup': {
                                'from': 'courseprogresses',
                                'localField': '_id',
                                'foreignField': 'userId',
                                'as': 'user'
                            }
                        }, {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        {
                                            '$size': '$user'
                                        }, 0
                                    ]
                                }
                            }
                        }, {
                            '$count': 'count'
                        }
                    ]
                }
            }
        ])

        return res.json({
            totalUsers: userStats[0].totalUsers[0]?.count || 0,
            inactiveUsers: userStats[0].inactiveUsers[0]?.count || 0,

            activeCourses: dashboardStats[0].activeCourses[0]?.count || 0,
            draftCourses: dashboardStats[0].draftCourses[0]?.count || 0,

            topSellingCourse: dashboardStats[0].topSellingCourse[0] || null,
            leastSellingCourse: dashboardStats[0].leastSellingCourse[0] || null,
        })
    }
    else {
        return res.status(200).json({})
    }
}