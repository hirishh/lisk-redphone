export class NodeApiNotReachable extends Error {
  constructor(url, statusCode, statusMessage) {
    super('This Lisk Node is not Reachable');
    this.name = "NodeApiNotReachable";
    this.url = url;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    Error.captureStackTrace(this, NodeApiNotReachable);
  }
};