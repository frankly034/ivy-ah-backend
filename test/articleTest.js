import { expect } from 'chai';
import supertest from 'supertest';
import app from '../src/index';
import models from '../src/models';

const server = supertest.agent(app);

const user = {
  email: 'edosa@gmail.com',
  password: 'this is my password',
  username: 'edosa',
};

let testToken;
before(async () => {
  await models.sequelize.sync({ force: true });
  const result = await server
    .post('/api/v1/users/signup')
    .send(user);
  testToken = result.body.user.token;
});

describe('Article', () => {
  it('SHOULD CREATE AN ARTICLE', async () => {
    const result = await server
      .post('/api/v1/articles')
      .set('authorization', testToken)
      .send({
        description: 'this is the new description',
        title: 'this is the true new title of the article',
        body: 'this is the new body of the body',
        tagList: ['thoisfd'],
        plainText: 'jsjfosdf'
      })
      .expect(201);
    expect(result.status).to.equal(201);
    expect(result.body).to.be.an('object');
    expect(result.body).to.have.property('article');
    expect(result.body.article).to.have.property('slug');
    expect(result.body.article).to.have.property('title');
    expect(result.body.article).to.have.property('author');
    expect(result.body.article).to.have.property('description');
    expect(result.body.article).to.have.property('tagList');
  });

  it('SHOULD THROW AN ERROR IS REQUIRED REQUEST FIELD ARE NOT PROVIDED', async () => {
    const result = await server
      .post('/api/v1/articles')
      .set('authorization', testToken)
      .send({
        tagList: ['thoisfd'],
        plainText: 'jsjfosdf'
      })
      .expect(422);
    expect(result.status).to.equal(422);
    expect(result.body).to.be.an('object');
    expect(result.body).to.have.property('error');
  });
});

describe('artilce search', () => {
  it('return a result after the search', async () => {
    await server
      .post('/api/v1/articles')
      .set('authorization', testToken)
      .send({
        description: 'this is the new description',
        title: 'this is the true new title of the article',
        body: 'this is the new body of the body',
        tagList: ['thoisfd'],
        plainText: 'jsjfosdf',
      })
      .expect(201);

    await server
      .post('/api/v1/articles')
      .set('authorization', testToken)
      .send({
        description: 'this is the new description',
        title: 'this is the true new title of the article',
        body: 'this is the new body of the body',
        tagList: ['thoisfd'],
        plainText: 'jsjfosdf',
      })
      .expect(201);

    const result = await server.get('/api/v1/articles/search').send({
      tags: ['thoisfd']
    }).expect(200);
    expect(result.status).to.equal(200);
    expect(result.body.parameters.tags).to.deep.equal(['thoisfd']);
    expect(result.body.data[0].title).to.deep.equal('this is the true new title of the article');
    expect(result.body.data[0].description).to.equal('this is the new description');
  });

  it('return an error on failed validation', async () => {
    const result = await server.get('/api/v1/articles/search').send({
      keyword: 15
    }).expect(422);
    expect(result.status).to.equal(422);
    expect(result.body.error.keyword).to.deep.equal('keyword must be a string');
  });
});
