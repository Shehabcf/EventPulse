const AppError = require('../../utils/AppError');

describe('AppError', () => {
  test('stores message and statusCode correctly (fail case)', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  test('defaults status to "error" for 5xx codes (server error case)', () => {
    const err = new AppError('Something broke', 500);
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');
  });

  test('defaults statusCode to 500 when not provided', () => {
    const err = new AppError('Unknown failure');
    expect(err.statusCode).toBe(500);
  });
});
