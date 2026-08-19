const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let app;
let Category;
let Event;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_secret';
  process.env.NODE_ENV = 'test';

  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // require app AFTER setting env vars and connecting, so config picks them up
  app = require('../../app');
  Category = require('../../models/Category');
  Event = require('../../models/Event');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await Event.deleteMany({});
  await Category.deleteMany({});
});

describe('Events API', () => {
  test('GET /api/events returns an empty list when there are no events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.events).toEqual([]);
    expect(res.body.totalCount).toBe(0);
  });

  test('creating and listing events works, including category filter', async () => {
    const music = await Category.create({ name: 'Music' });
    const tech = await Category.create({ name: 'Tech' });

    await Event.create({
      name: 'Concert Night',
      description: 'Live music event',
      date: new Date(Date.now() + 86400000),
      city: 'Cairo',
      capacity: 100,
      category: music._id,
    });

    await Event.create({
      name: 'Dev Conference',
      description: 'Talks about backend development',
      date: new Date(Date.now() + 172800000),
      city: 'Cairo',
      capacity: 50,
      category: tech._id,
    });

    const allRes = await request(app).get('/api/events');
    expect(allRes.statusCode).toBe(200);
    expect(allRes.body.results).toBe(2);

    const filteredRes = await request(app).get(`/api/events?category=${music._id}`);
    expect(filteredRes.statusCode).toBe(200);
    expect(filteredRes.body.results).toBe(1);
    expect(filteredRes.body.data.events[0].name).toBe('Concert Night');
  });

  test('GET /api/events/:id returns 404 for a non-existent event', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/events/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});
