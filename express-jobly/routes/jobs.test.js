"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

//******************************POST jobs

describe("POST jobs", () => {
test("Works for admin", () => {
    const response = await request(app)
    .post(`/jobs`)
    .send({
        compHandle: "c1",
        title: "J-new",
        salary: 10,
        equity: "0.2",
    })
    .set("authorization", `Bearer ${adminToken}`);
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
        job: {
            id: expect.any(Number),
            title: "J-new",
            salary: 10,
            equity: "0.2",
            compHandle: "c1",
          },
    });

});

test("unauth for users", async () => {
    const response = await request(app)
    .post(`/jobs`)
    .send({
        companyHandle: "c1",
        title: "J-new",
        salary: 10,
        equity: "0.2",
    })
    .set("authorization", `Bearer ${u1Token}`);
    expect(response.statusCode).toEqual(401);
});

test("bad request missing data", async function () {
    const response = await request(app)
        .post(`/jobs`)
        .send({
          compHandle: "c1",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(response.statusCode).toEqual(400);
  });

test("bad request invalid data", async () => {
    const response = await request(app)
    .post(`/jobs`)
    .send({
        compHandle: "c1",
          title: "J-new",
          salary: "not-a-number",
          equity: "0.2",
    })
    .set("authorization", `Bearer ${adminToken}`);
    expect(response.statusCode).toEqual(400);
})
});

//******************************GET jobs

describe("GET /jobs", () => {
    test("ok for anyone", async () =>{
        const response = await request(app)
        .get(`/jobs`);
        expect(response.body).toEqual({
            jobs: [
                {
                  id: expect.any(Number),
                  title: "J1",
                  salary: 1,
                  equity: "0.1",
                  companyHandle: "c1",
                  companyName: "C1",
                },
                {
                  id: expect.any(Number),
                  title: "J2",
                  salary: 2,
                  equity: "0.2",
                  companyHandle: "c1",
                  companyName: "C1",
                },
                {
                  id: expect.any(Number),
                  title: "J3",
                  salary: 3,
                  equity: null,
                  companyHandle: "c1",
                  companyName: "C1",
                },
              ],
        })
    })

    test("works with filtering", async () => {
        const response = await request(app)
        .get(`/jobs`).query({ minSalary: 2, title: "3"});
        expect(response.body).toEqual({
            jobs: [
                {
                  id: expect.any(Number),
                  title: "J3",
                  salary: 3,
                  equity: null,
                  compHandle: "c1",
                  companyName: "C1",
                },
              ],
        })
    })


    test("works with 2 filters", async () => {
        const response = await request(app)
        .get(`/jobs`)
        .query({ minSalary: 2, title: "3"});
        expect(response.body).toEqual({
            jobs: [
                {
                  id: expect.any(Number),
                  title: "J3",
                  salary: 3,
                  equity: null,
                  compHandle: "c1",
                  companyName: "C1",
                },
              ],
        },
        );
    });


    test("bad request invalid filter key", async () => {
        const response = await request(app)
        .get(`/jobs`).query({ minSalary: 2, not: "not"});
        expect(response.statusCode).toEqual(400)
})
});

//******************************GET jobs with id

describe("GET jobs with id", () => {
    test("works for ANYONE", async () => {
        const response = await request(app)
        .get(`/jobs/${testJobIds[0]}`);
        expect(response.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "J1",
                salary: 1,
                equity: "0.1",
                company: {
                  handle: "c1",
                  name: "C1",
                  description: "Desc1",
                  numEmployees: 1,
                  logoUrl: "http://c1.img",
                },
              },
        });
    });
    
    test("No job found", async () => {
        const response = await(app).get(`/jobs/0`);
        expect(response.statusCode).toEqual(404);
    })
});

//******************************PATCH with job id

describe("PATCH jobs with id", () => {
    test("updates for admin", async () => {
        const response = await request(app)
        .patch(`jobs/${testJobIds[0]}`)
        .send({
            title : "New job"
        })
        .set ("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "New job",
                salary: 1,
                equity: "0.1",
                compHandle: "c1",
              },
        });

    });

    test("unauth for users", async () => {
        const response = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
            title : "New job",
        })
        .set ("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });

    test("not found no such job", async () => {
        const response = await request(app)
        .patch(`/jobs/0`)
        .send({
            handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    }); 

    test("bad request on handle change attempt", async  () => {
        const response = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
              handle: "new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
      });
    
      test("bad request with invalid data", async  () => {
        const response = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
              salary: "not-a-number",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
      });
    });
    
////**********Delete with id */

describe("DELETE /jobs/:id", () => {
    test("deletes for admin", async () => {
        const response = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({ deleted: testJobIds[0]})
    });
    test("unauth for users", async () => {
        const response = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
        expect(response.statusCode).toEqual(401);
    });
    test("not found no such job", async () => {
        const response = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${adminToken}`)
        expect(response.statusCode).toEqual(404);
    });


});