const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler', () => {
  test('calls the wrapped function and does not call next on success', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const successFn = jest.fn(async (req, res) => 'ok');
    const wrapped = asyncHandler(successFn);

    await wrapped(req, res, next);

    expect(successFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  test('forwards a thrown/rejected error to next() on failure', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const testError = new Error('Something failed');

    const failingFn = jest.fn(async () => {
      throw testError;
    });
    const wrapped = asyncHandler(failingFn);

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(testError);
  });
});
