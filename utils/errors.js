export class NodeApiNotReachable extends Error {
  constructor(url, message) {
    super('This Lisk Node is not Reachable');
    this.name = "NodeApiNotReachable";
    this.url = url;
    this.errorMessage = message;
    Error.captureStackTrace(this, NodeApiNotReachable);
  }
};