"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index.js");

chai.should();
chai.use(chaiHttp);

describe("Books", () => {
  beforeEach(done => {
    Book.remove({}, err => {
      done();
    });
  });

  describe("/GET book", () => {
    it("it should GET all the books", done => {
      chai
        .request(server)
        .get("/book")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});
