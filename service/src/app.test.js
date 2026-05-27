const cors = require('cors');
const express = require('express');

// Mock cors module
jest.mock('cors', () => {
  const mockCorsMiddleware = () => 'mockCorsMiddleware';
  return jest.fn().mockImplementation(mockCorsMiddleware);
});

// Mock classify router
jest.mock('./routes/classify', () => 'mockedClassifyRouter');

// Prepare express mock with a stored instance for assertions
let mockAppInstance;
const mockListen = jest.fn((port, cb) => {
  if (cb) cb();
  return { close: jest.fn() };
});

jest.mock('express', () => {
  const mockApp = () => ({
    use: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    listen: mockListen,
  });
  const expressMock = jest.fn(() => {
    mockAppInstance = mockApp();
    return mockAppInstance;
  });
  expressMock.json = jest.fn(() => 'mockJsonParser');
  return expressMock;
});

describe('app', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockAppInstance = null;
    delete process.env.PORT;
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  // Helper to load the app and return the captured app instance
  const loadApp = () => {
    require('./app');
    expect(express).toHaveBeenCalledTimes(1);
    return mockAppInstance;
  };

  test('should set up middleware in correct order', () => {
    const app = loadApp();

    expect(express.json).toHaveBeenCalledTimes(1);
    expect(cors).toHaveBeenCalledTimes(1);

    expect(app.use).toHaveBeenNthCalledWith(1, 'mockCorsMiddleware');
    expect(app.use).toHaveBeenNthCalledWith(2, 'mockJsonParser');
    expect(app.use).toHaveBeenNthCalledWith(3, '/classify', 'mockedClassifyRouter');

    expect(app.use).toHaveBeenCalledTimes(3);
  });

  test('should mount classify router at /classify', () => {
    const app = loadApp();
    expect(app.use).toHaveBeenCalledWith('/classify', 'mockedClassifyRouter');
  });

  test('should define health check route at GET /', () => {
    const app = loadApp();
    expect(app.get).toHaveBeenCalledTimes(1);
    expect(app.get).toHaveBeenCalledWith('/', expect.any(Function));
  });

  test('should start server on default port 3000 and log message when callback is invoked', () => {
    const app = loadApp();

    expect(mockListen).toHaveBeenCalledTimes(1);
    expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('Service listening on port 3000');
  });

  test('should start server on custom port from environment variable', () => {
    process.env.PORT = '4000';
    const app = loadApp();

    expect(mockListen).toHaveBeenCalledTimes(1);
    expect(mockListen).toHaveBeenCalledWith('4000', expect.any(Function));

    expect(console.log).toHaveBeenCalledWith('Service listening on port 4000');
  });
});