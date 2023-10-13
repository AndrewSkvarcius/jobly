const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { checkForAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const { request } = require("../app");

const router = express.Router({ mergeParams: true });

// POST  { job } => { job }
// job = { title, salary, equity, compHandle}
// Returns { id, title, salary, equity, compHandle}
// Middleware auth "checkForAdmin"


router.post("/", checkForAdmin, async(req,res, next)=>{
    try {
        const validation = jsonschema.validate(req.body, jobNewSchema);
        if(!validation.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    }
    catch(e){
        return next(e);
    }
});

// GET => {jobs: [{id, title, salary, equity, compHandle, companyName}] }
// Query search filters for minSalary, hasEquity "jobs with equity > 0", title 
// Middleware auth "checkForAdmin"

router.get("/", checkForAdmin, async(req, res, next)=>{
        const jobQuery =  req.query;

        if (jobQuery.minSalary !== undefined) jobQuery.minSalary = +jobQuery.minSalary;
        jobQuery.hasEquity = jobQuery.hasEquity === "true";
        try{

        }

    
        catch(e){
        return next(e);
    }
})