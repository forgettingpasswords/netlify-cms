import { resolveBackend } from '../backend';
import registry from 'Lib/registry';

jest.mock('Lib/registry');

const configWrapper = inputObject => ({
  get: prop => inputObject[prop],
});

describe('Backend', () => {
  describe('filterEntries', () => {
    let backend;

    beforeEach(() => {
      registry.getBackend.mockReturnValue({
        init: jest.fn(),
      });
      backend = resolveBackend({
        getIn: jest.fn().mockReturnValue('git-gateway'),
      });
    });

    it('filters string values', () => {
      const result = backend.filterEntries(
        {
          entries: [
            {
              data: {
                testField: 'testValue',
              },
            },
            {
              data: {
                testField: 'testValue2',
              },
            },
          ],
        },
        configWrapper({ field: 'testField', value: 'testValue' }),
      );

      expect(result.length).toBe(1);
    });

    it('filters number values', () => {
      const result = backend.filterEntries(
        {
          entries: [
            {
              data: {
                testField: 42,
              },
            },
            {
              data: {
                testField: 5,
              },
            },
          ],
        },
        configWrapper({ field: 'testField', value: 42 }),
      );

      expect(result.length).toBe(1);
    });

    it('filters boolean values', () => {
      const result = backend.filterEntries(
        {
          entries: [
            {
              data: {
                testField: false,
              },
            },
            {
              data: {
                testField: true,
              },
            },
          ],
        },
        configWrapper({ field: 'testField', value: false }),
      );

      expect(result.length).toBe(1);
    });

    it('filters list values', () => {
      const result = backend.filterEntries(
        {
          entries: [
            {
              data: {
                testField: ['valueOne', 'valueTwo', 'testValue'],
              },
            },
            {
              data: {
                testField: ['valueThree'],
              },
            },
          ],
        },
        configWrapper({ field: 'testField', value: 'testValue' }),
      );

      expect(result.length).toBe(1);
    });
  });

  describe('supportsFileVersioning', () => {
    it('returns true for a backend supporting file versioning', () => {
      registry.getBackend.mockReturnValue({
        init: jest.fn(() => ({
          getFileVersions: jest.fn()
        })),
      });
      const backend = resolveBackend({
        getIn: jest.fn().mockReturnValue('gitlab'),
      });

      expect(backend.supportsFileVersioning()).toEqual(true);
    });

    it('returns false for a backend not supporting file versioning', () => {
      registry.getBackend.mockReturnValue({
        init: jest.fn(() => ({
          getFileVersions: undefined
        })),
      });
      const backend = resolveBackend({
        getIn: jest.fn().mockReturnValue('git-gateway'),
      });

      expect(backend.supportsFileVersioning()).toEqual(false);
    });
  });
});
