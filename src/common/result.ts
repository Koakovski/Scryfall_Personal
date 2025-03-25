export class ResultFail {
  success: false;
  message: string;

  constructor(message: string) {
    this.success = false;
    this.message = message;
  }
}

export class ResultSuccess<D = undefined> {
  success: true;
  data: D;

  constructor(data: D) {
    this.success = true;
    this.data = data;
  }
}

export type Result<D = undefined> = ResultSuccess<D> | ResultFail;

// HELPERS

function success<D extends undefined>(data?: D): ResultSuccess<D>;
function success<D>(data: D): ResultSuccess<D>;
function success<D>(data?: D) {
  return new ResultSuccess(data);
}

function fail(message: string): ResultFail {
  return new ResultFail(message);
}

export const Result = {
  fail,
  success,
};
