/* eslint-disable import/no-named-as-default */
import { expect } from 'chai';
import redisClient from '../../utils/redis';

describe('+ RedisClient utility', () => {
  before(function (done) {
    this.timeout(10000);
    setTimeout(done, 4000);
  });

  it('+ Client: is alive', () => {
    expect(redisClient.isAlive()).to.equal(true);
  });

  it('+ Set & get: value', async function () {
    await redisClient.set('test_key', 378, 50);
    expect(await redisClient.get('test_key')).to.equal('378');
  });

  it('+ Set & get: expired value', async function () {
    await redisClient.set('test_key', 394, 7);
    setTimeout(async () => {
      expect(await redisClient.get('test_key')).to.not.equal('394');
    }, 2000);
  });

  it('+ Set & get: deleted value', async function () {
    await redisClient.set('test_key', 378, 50);
    await redisClient.del('test_key');
    setTimeout(async () => {
      console.log('del: test_key ->', await redisClient.get('test_key'));
      expect(await redisClient.get('test_key')).to.be.null;
    }, 2000);
  });
});

