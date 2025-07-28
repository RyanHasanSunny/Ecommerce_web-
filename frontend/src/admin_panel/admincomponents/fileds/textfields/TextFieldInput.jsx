import React from 'react';
import { TextField } from '@mui/material';

const TextFieldInput = ({ label, value, onChange, type = 'text', fullWidth = true }) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      fullWidth={fullWidth}
    />
  );
};

export default TextFieldInput;
