class ResponseError extends Error {
  constructor(stts, message) {
    super(message);
    this.name = "Response Error Validate";
    this.stts = stts;
  }
}

export default ResponseError;
