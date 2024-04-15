/* eslint-disable import/no-named-as-default */
import request from 'supertest';
import { expect } from 'chai';
import dbClient from '../../utils/db';

describe('appController', () => {
  before(function setup(done) {
    this.timeout(10000);
    Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
      .then(([usersCollection, filesCollection]) => {
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => done())
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  });

  describe('GET: /status', () => {
    it('services: online', () => new Promise((done) => {
      request.get('/status')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ redis: true, db: true });
          done();
        });
    }));
  });

  describe('GET: /stats', () => {
    it('correct statistics: db collections', () => new Promise((done) => { // Named the function and added 'done' parameter
      request.get('/stats')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ users: 0, files: 0 });
          done();
        });
    }));

    it('correct statistics: db collections [alt]', function () { // Removed 'done' parameter as the test uses Promise
      return new Promise((done) => {
        this.timeout(10000);
        Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
          .then(([usersCollection, filesCollection]) => {
            Promise.all([
              usersCollection.insertMany([{ email: 'john@mail.com' }]),
              filesCollection.insertMany([
                { name: 'foo.txt', type: 'file' },
                { name: 'pic.png', type: 'image' },
              ]),
            ])
              .then(() => {
                request.get('/stats')
                  .expect(200)
                  .end((err, res) => {
                    if (err) {
                      return done(err);
                    }
                    expect(res.body).to.deep.eql({ users: 1, files: 2 });
                    done();
                  });
              })
              .catch((deleteErr) => done(deleteErr));
          }).catch((connectErr) => done(connectErr));
      });
    });
  });
});

