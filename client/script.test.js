// client/script.test.js
// Tests for the shape classification client script

let submitHandler;
let formMock;
let resultMock;
let sidesMock;
let symmetryMock;
let ratioMock;
let eventMock;

describe('Shape classification form', () => {
  beforeEach(() => {
    // Reset mocks and modules
    jest.resetAllMocks();
    jest.resetModules();

    // Mock DOM elements
    resultMock = { innerHTML: '' };
    sidesMock = { value: '3' };
    symmetryMock = { value: '2' };
    ratioMock = { value: '0.5' };
    formMock = {
      addEventListener: jest.fn((event, handler) => {
        if (event === 'submit') {
          submitHandler = handler;
        }
      }),
      dispatchEvent: jest.fn(),
    };

    document.getElementById = jest.fn((id) => {
      switch (id) {
        case 'shapeForm': return formMock;
        case 'result': return resultMock;
        case 'sides': return sidesMock;
        case 'symmetry': return symmetryMock;
        case 'ratio': return ratioMock;
        default: return null;
      }
    });

    // Trigger DOMContentLoaded immediately
    document.addEventListener = jest.fn((event, cb) => {
      if (event === 'DOMContentLoaded') {
        cb();
      }
    });

    global.fetch = jest.fn();

    // Load the script under test
    require('./script.js');
  });

  test('happy path: displays classification on successful fetch', async () => {
    const mockResponse = { category: 'Circle', extra: true, color: 'red' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    eventMock = { preventDefault: jest.fn() };
    await submitHandler(eventMock);

    expect(eventMock.preventDefault).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/classify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sides: 3,
          symmetry_axes: 2,
          convex_hull_ratio: 0.5,
        }),
      })
    );
    expect(resultMock.innerHTML).toContain('Classification: Circle');
    expect(resultMock.innerHTML).toContain(JSON.stringify(mockResponse, null, 2));
  });

  test('error path: network failure displays error message', async () => {
    const errorMsg = 'Network failure';
    global.fetch.mockRejectedValueOnce(new Error(errorMsg));

    eventMock = { preventDefault: jest.fn() };
    await submitHandler(eventMock);

    expect(resultMock.innerHTML).toContain(`Error: ${errorMsg}`);
    expect(resultMock.innerHTML).toContain('color:red');
  });

  test('error path: HTTP error status displays error message', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    eventMock = { preventDefault: jest.fn() };
    await submitHandler(eventMock);

    expect(resultMock.innerHTML).toContain('Error: HTTP error! status: 500');
  });

  test('payload correctness: sends the correct shape descriptors', async () => {
    // Override input values for this test
    sidesMock.value = '5';
    symmetryMock.value = '5';
    ratioMock.value = '1.2';

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ category: 'Pentagon' }),
    });

    eventMock = { preventDefault: jest.fn() };
    await submitHandler(eventMock);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/classify',
      expect.objectContaining({
        body: JSON.stringify({
          sides: 5,
          symmetry_axes: 5,
          convex_hull_ratio: 1.2,
        }),
      })
    );
  });
});