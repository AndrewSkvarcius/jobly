const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");
const { findAll } = require("./user");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//create

describe("create", () => {
    let exammple = {
        compHandle: "c1",
        title: "Test",
        salary: 100,
        equity:"0.2",
    };

    test("creates new job", () => {
        let job = Job.create(exammple);
        expect(job).toEqual({
            ...exammple,
            id: expect.any(Number),
        });
    });
});


//findAll

describe("findAll", () => {
    testJobIds("Shows all jobs without filter" , ()=> {
        let jobs = Job.findAll();
        expect(jobs).toEqual([
            {
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            companyHandle: "c1",
            companyName: "C1",
          },
          {
            id: testJobIds[1],
            title: "Job2",
            salary: 200,
            equity: "0.2",
            companyHandle: "c1",
            companyName: "C1",
          },
          {
            id: testJobIds[2],
            title: "Job3",
            salary: 300,
            equity: "0",
            companyHandle: "c1",
            companyName: "C1",
          },
          {
            id: testJobIds[3],
            title: "Job4",
            salary: null,
            equity: null,
            companyHandle: "c1",
            companyName: "C1", 
        },
    ]);
    });

    test("minSalary filter", async () => {
        let jobs = await Job.findAll({ minSalary: 300});
        expect(jobs).toEqual([
            {
            id: testJobIds[2],
            title: "Job3",
            salary: 300,
            equity: "0",
            companyHandle: "c1",
            companyName: "C1",
        }
    ]);    
    });

    test("hasEquity filter", async () => {
        let jobs = await Jobs.findAll({ hasEquity: true});
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
              },
              {
                id: testJobIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",  
            },
        ]);
    });
    
    test("both minSalary and hasEquity filter", async () => {
        let jobs = await Jobs.findAll({ minSalary: 150, hasEquity: true});
        expect(jobs).toEqual([
            {
                id: testJobIds[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
              },
        ])
});
    test(" name/title filter", async () => {
        let jobs = await Job.findAll|({ title: "ob1"});
        expect(jobs).toEqual([
            {
                id: testJobIds[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",

            },
        ]);
    });

});

///get

describe("get", () => {
    test("works", async () => {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            id: testJobIds[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            company: {
              handle: "c1",
              name: "C1",
              description: "Desc1",
              numEmployees: 1,
              logoUrl: "http://c1.img",
            },
          });
        });
    
    
        test("no such job not found", async () => {
        try {
            await Job.get(0);
            fail();
        }
        catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    })
 });

    /// update

    describe("update", () => {
        let updated = {
            title: "New",
            salary: 500,
            equity: "0.5",
        };
        test("updates", async () => {
            let job = Job.update(testJobIds[0], updated);
            expect(job).toEqual({
                id: testJobIds[0],
                compHandle: "c1",
                ...updated,
            });
        });

        test("no such job not found", async () => {
            try{
                await Job.update(0, {
                    title: "test"
                });
                fail();
            }
            catch(e){
                expect(e instanceof NotFoundError).toBeTruthy();
            }
                        
        })
    })

// remove

describe("remove", () => {
    test("removes a job", async () => {
        await Job.remove(testJobIds[0]);
        const result = await db.query(
            `SELECT id FROM jobs WHERE id = $1`, [testJobIds[0]]);
            expect(result.rows.length).toEqual(0);
    });

    test("no such job not found", async () => {
        try{
            await Job.remove(0);
            fail();
        }
        catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});