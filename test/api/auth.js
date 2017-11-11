"use strict";

require("../../src/tools/confSetup");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index.js");

const should = chai.should();
chai.use(chaiHttp);

describe("Auth", () => {
  describe("Not logged in", () => {
    it("it should not be able to logout", done => {
      chai
        .request(server)
        .post("/api/auth/logout")
        .end((err, res) => {
          res.should.have.status(401);
          res.text.should.be.a("string");
          should.not.throw(() => JSON.parse(res.text));
          const data = JSON.parse(res.text);
          data.should.have.deep.property("errors.global", "Please login.");
          done();
        });
    });
  });
});
