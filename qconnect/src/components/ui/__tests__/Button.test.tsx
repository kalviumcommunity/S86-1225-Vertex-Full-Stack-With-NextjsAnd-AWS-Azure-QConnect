import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

test('renders button and responds to click', () => {
  const handleClick = jest.fn();
  render(<Button label="Click Me" onClick={handleClick} />);

  const button = screen.getByRole('button', { name: 'Click Me' });
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
