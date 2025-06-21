import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.MONGODB_API_KEY;
const ENDPOINT = process.env.MONGODB_ENDPOINT;
const DB = process.env.MONGODB_DATABASE_NAME;
const dataSource=process.env.MONGODB_DATA_SOURCE;
const APIS_COLLECTION = 'apis';
const USAGE_LOGS_COLLECTION = 'usage_logs';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'api-key': API_KEY,
  };
}

export async function listApis() {
  const res = await fetch(`${ENDPOINT}/action/find`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      collection: APIS_COLLECTION,
      database: DB,
      dataSource: dataSource,
      sort: { createdAt: -1 },
    }),
  });
  const json = await res.json();
  return json.documents || [];
}

export async function storeApi({ cid, ownerId, earning = 0 }) {
  const res = await fetch(`${ENDPOINT}/action/insertOne`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      collection: APIS_COLLECTION,
      database: DB,
      dataSource: dataSource,
      document: {
        cid,
        ownerId,
        earning,
        createdAt: new Date(),
      },
    }),
  });
  const json = await res.json();
  return json.insertedId;
}

export async function getApiByCid(cid) {
  const res = await fetch(`${ENDPOINT}/action/findOne`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      collection: APIS_COLLECTION,
      database: DB,
      dataSource: dataSource,
      filter: { cid },
    }),
  });
  const json = await res.json();
  return json.document;
}

export async function getApiById(_id) {
  const res = await fetch(`${ENDPOINT}/action/findOne`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      collection: APIS_COLLECTION,
      database: DB,
      dataSource: dataSource,
      filter: { _id: { '$oid': _id } },
    }),
  });
  const json = await res.json();
  return json.document;
}

export async function logUsage(apiId, responseStatus, responseTimeMs) {
  const res = await fetch(`${ENDPOINT}/action/insertOne`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      collection: USAGE_LOGS_COLLECTION,
      database: DB,
      dataSource: dataSource,
      document: {
        apiId: apiId,
        timestamp: new Date(),
        responseStatus,
        responseTimeMs,
      },
    }),
  });
  incrementCostPerRequest(apiId);
  const json = await res.json();
  return json.insertedId;
}

// Increment the costPerRequest for a given API by 1
export async function incrementCostPerRequest(apiId) {
  const res = await fetch(`${ENDPOINT}/action/updateOne`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      collection: APIS_COLLECTION,
      database: DB,
      dataSource: dataSource,
      filter: { _id: { '$oid': apiId } },
      update: { "$inc": { costPerRequest: 1 } },
    }),
  });
  const json = await res.json();
  return json;
}

// Fetch usage logs for a given API ID, sorted by timestamp ascending
export async function getUsageLogsByApiId(apiId, limit = 1000) {
  const res = await fetch(`${ENDPOINT}/action/find`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      collection: USAGE_LOGS_COLLECTION,
      database: DB,
      dataSource: dataSource,
      filter: { apiId: apiId },
      sort: { timestamp: 1 },
    }),
  });
  const json = await res.json();
  return json.documents || [];
}

