import React from 'react';
import { render } from '@testing-library/react-native';
import Reports from '../screens/Reports';

describe('Smoke', ()=>{
  it('renders Reports title', ()=>{
    const { getByText } = render(<Reports/>);
    expect(getByText('Reports')).toBeTruthy();
  });
});
