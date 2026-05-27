const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Mock the dependencies
jest.mock('better-sqlite3');
jest.mock('fs');
// path.join will be mocked to return predictable paths
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => {
    if (args.includes('data')) {
      return '/test/data';
    }
    if (args.includes('segregation.db')) {
      return '/test/data/segregation.db';
    }
    return args.join('/');
  }),
}));

describe('db module initialization', () => {
  let mockDbInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Setup default mock implementations
    mockDbInstance = {
      pragma: jest.fn(),
      exec: jest.fn(),
    };
    Database.mockImplementation(() => mockDbInstance);

    // Path.join mocks are already set via jest.mock
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create data directory if it does not exist, initialize DB with WAL mode and table', () => {
    // Arrange
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});

    // Act
    const db = require('../db');

    // Assert
    // Check that dataDir was constructed correctly
    expect(path.join).toHaveBeenCalledWith(expect.any(String), '..', 'data');
    // Check that mkdirSync was called with the correct directory and options
    expect(fs.mkdirSync).toHaveBeenCalledWith('/test/data', { recursive: true });
    // Database constructor was called with the expected path
    expect(Database).toHaveBeenCalledWith('/test/data/segregation.db');
    // WAL mode pragma was set
    expect(mockDbInstance.pragma).toHaveBeenCalledWith('journal_mode = WAL');
    // CREATE TABLE SQL was executed
    expect(mockDbInstance.exec).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS objects')
    );
    // The module exports the database instance
    expect(db).toBe(mockDbInstance);
  });

  it('should not create data directory if it already exists', () => {
    // Arrange
    fs.existsSync.mockReturnValue(true);

    // Act
    const db = require('../db');

    // Assert
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    // Ensure DB still gets initialized
    expect(Database).toHaveBeenCalledWith('/test/data/segregation.db');
    expect(mockDbInstance.pragma).toHaveBeenCalledWith('journal_mode = WAL');
    expect(db).toBe(mockDbInstance);
  });

  it('should throw an error if mkdirSync fails', () => {
    // Arrange
    fs.existsSync.mockReturnValue(false);
    const mkdirError = new Error('Permission denied');
    fs.mkdirSync.mockImplementation(() => {
      throw mkdirError;
    });

    // Act & Assert
    expect(() => require('../db')).toThrow('Permission denied');
    // Ensure Database constructor not called because error happened before
    expect(Database).not.toHaveBeenCalled();
  });

  it('should throw an error if Database constructor fails', () => {
    // Arrange
    fs.existsSync.mockReturnValue(true);
    Database.mockImplementation(() => {
      throw new Error('Cannot open database');
    });

    // Act & Assert
    expect(() => require('../db')).toThrow('Cannot open database');
    // mkdirSync should not be called because dir exists, but DB fails after dir check
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('should execute the correct SQL to create the objects table', () => {
    // Arrange
    fs.existsSync.mockReturnValue(true);

    // Act
    require('../db');

    // Assert
    const execCall = mockDbInstance.exec.mock.calls[0][0];
    expect(execCall).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
    expect(execCall).toContain('sides INTEGER');
    expect(execCall).toContain('symmetry_axes INTEGER');
    expect(execCall).toContain('convex_hull_ratio REAL');
    expect(execCall).toContain('category TEXT');
    expect(execCall).toContain('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  });
});