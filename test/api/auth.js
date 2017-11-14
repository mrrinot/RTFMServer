"use strict";

require("../../src/tools/confSetup");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index.js");

const { expect } = chai;
chai.use(chaiHttp);

describe("Auth", () => {
  describe("Not logged in", () => {
    it("it should not be able to logout", done => {
      chai
        .request(server)
        .post("/api/auth/logout")
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.text).to.be.a("string");
          expect(() => JSON.parse(res.text)).to.not.throw();
          const data = JSON.parse(res.text);
          expect(data).to.have.deep.property("errors.global", "Please login.");
          done();
        });
    });
  });
});
