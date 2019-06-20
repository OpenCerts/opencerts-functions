const supertest = require('supertest');
const ropstenDocument = require('../fixtures/certificate.json');
const mainnetDocument = require('../fixtures/certificateMainnetValid.json');

const API_ENDPOINT = 'https://api-ropsten.opencerts.io';
const request = supertest(API_ENDPOINT);

describe('verify', () => {
  it('should works for valid Ropsten document', async () => {
    await request
      .post('/verify')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        document: ropstenDocument,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          hash: {
            valid: true,
          },
          issued: {
            valid: true,
            issued: {
              '0xc36484efa1544c32ffed2e80a1ea9f0dfc517495': true,
            },
          },
          revoked: {
            valid: true,
            revoked: {
              '0xc36484efa1544c32ffed2e80a1ea9f0dfc517495': false,
            },
          },
          valid: true,
        });
      });
  }, 5000);

  it('should not works for invalid document', async () => {
    await request
      .post('/verify')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({
        document: mainnetDocument,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          hash: {
            valid: true,
          },
          issued: {
            valid: false,
            issued: {
              '0x007d40224f6562461633ccfbaffd359ebb2fc9ba': false,
            },
          },
          revoked: {
            valid: true,
            revoked: {
              '0x007d40224f6562461633ccfbaffd359ebb2fc9ba': false,
            },
          },
          valid: false,
        });
      });
  }, 5000);
});
