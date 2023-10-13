const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {

    // creates job from data / updates database and returns new job data 

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (
                title,
                salary,
                equity,
                compant_handle) VALUES ($1, $2, $3, $4)
                RETURNING id, title, salary, equity, company_handle AS "companyHandle`,
                [
                    data.title, data.salary, data.equity, data.companyHandle,

                ]);
                let job = result.rows[0];

                return job;
    }

    // find all jobs and filters for searchFilters

    static async findALL( {minSalary, hasEquity, title} = {}){
        let query = `SELECT 
        j.id,
        j.title,
        j.salary,
        j.equity,
        j.company_handle AS "compHandle",
        c.name AS "compName"
        FROM jobs j LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    
    let whereExpressions = {};
    let queryValues = {};
    
  /// add each serch term to whereExpressions
  /// queryValues to generate right sql

  if (minSalary !== undefined){
    queryValues.push(minSalary);
    whereExpressions.push(`salary >=$${queryValues.length}`);

  }

  if (hasEquity === true) {
    whereExpressions.push(`equity > 0`);
    }

  if (title !== undefined) { 
    queryValues.push(`%${title}%`)
    whereExpressions.push(`title ILIKE $${queryValues.length}`);
  } 

  if (whereExpressions.length > 0){
    query += " WHERE" + whereExpressions.join(" AND")
  }
   // Finalize query and return results

   query += " ORDER BY title";
   const jobsRes = await db.query(query, queryValues);
   return jobsRes.rows;

    }


//given a job id returns data about job 
// error handling "NotFoundError"
static async get(id){
 const jobResult = await db.query(`
 SELECT
  id,
 title,
 salary,
 equity,
 company_handle AS "compHandle
 FROM jobs 
 WHERE id = $1`,[id]);

 const job = jobResult.rows[0];

 if (!job) throw new NotFoundError(`${id} Job not found`);

 const compResult = await db.query( 
`SELECT handle,
 name,
 description,
 num_employees AS "numEmployees",
 logo_url AS "logoUrl"
FROM companies
WHERE handle = $1`, [job.compHandle]);

delete job.compHandle;
job.company = compResult.rows[0];

return job;

}

// Update job data with data
// "partial update doesnt update all feilds / includes { title, salary, equity }
// error handling "NotFoundError"


static async update(id, data){
    const { setCols, values} = sqlForPartialUpdate( data,{});
const idIdx = "$" + (values.length + 1);
const updateQuery = `UPDATE jobs 
SET ${setCols} 
WHERE id = ${idIdx} 
RETURNING id, 
          title, 
          salary, 
          equity,
          company_handle AS "compHandle"`;
const result = await db.query(updateQuery, [...values, id]);
const job = result.rows[0];

if(!job) throw new NotFoundError(`${id} job not found`);

return job;


}
// remove a job from database returns undefined
// error handling "NotFoundError"
static async remove(id){
    const result = await db.query(
        `DELETE 
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`${id} job not found`);
}
}

module.exports = Job;