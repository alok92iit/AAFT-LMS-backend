import { addLead, duplicayChecker, getAllLeads, getLeadInfo, leadsStatus, markLost } from "../controller/leads.controller.js"

import  express from "express";
const leads=express.Router()


leads.route("/")
        .get(getAllLeads)
        .post(duplicayChecker, addLead)

leads.route("/:id")
        .get(getLeadInfo)
        
leads.route("/:id/status")
        // .get(getLeadInfo)
        .get(leadsStatus)
leads.route("/:id/mark-lost")
        // .get(getLeadInfo)
        .get(markLost)
export default leads