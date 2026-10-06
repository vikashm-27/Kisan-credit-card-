import { render } from '@testing-library/react';
import React from 'react';
import Admin from './src/components/Pages/Admin/Admin';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key })
}));

test('renders Admin without crashing', () => {
  render(<Admin />);
});
