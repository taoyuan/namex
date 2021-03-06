import {assert} from "chai";
import * as sinon from "sinon";
import * as s from "./support";
import {execute, Executor} from "../src";
import {FooProvider} from "./mocks/foo-provider";
import {BarProvider} from "./mocks/bar-provider";
import {MockProvider} from "./mocks/mock-provider";

describe('executor', () => {

  let stub;
  let cache: MockProvider[];

  before(() => {
    stub = sinon.stub(Executor, 'createProvider');
  });

  after(() => {
    stub.reset();
  });

  beforeEach(() => {
    stub.callsFake(s.buildProviderCreator({
      foo: FooProvider,
      bar: BarProvider
    }, cache = []));
  });

  describe('#createWithProvider', () => {
    it('should create single name for one full domain', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['create', {
          name: 'n1.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]
      ];
      await execute('create', {provider: 'foo', domains: 'n1.example.com', content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });

    it('should create single name for one relative domain', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['create', {
          name: 'n1',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]
      ];
      await execute('create', {provider: 'foo', domains: 'example.com', name: 'n1', content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });
  });

  describe('#createWithEntries', () => {
    it('should create with entries', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['create', {
          name: 'n1.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }],
        ['create', {
          name: 'n2.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]
      ];
      const entries = {
        foo: ['n1.example.com', 'n2.example.com']
      };
      await execute('create', {entries, content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });
  });

  describe('#updyn', () => {
    it('should update with entries', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['update', ['', {
          name: 'n1.example.com',
          type: 'A',
          ttl: 300,
          content: '1.1.1.1'
        }]],
        ['update', ['', {
          name: 'n2.example.com',
          type: 'A',
          ttl: 300,
          content: '1.1.1.1'
        }]]
      ];
      const entries = {
        foo: ['n1.example.com', 'n2.example.com']
      };
      await execute('updyn', {entries, content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });
  });
});
