import React from 'react';
import { TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const SpecificationInput = ({ specTitle, specDetails, setSpecTitle, setSpecDetails, handleAddSpecification }) => {
  return (
    <div>
      <TextField
        label="Specification Title"
        value={specTitle}
        onChange={(e) => setSpecTitle(e.target.value)}
        fullWidth
      />
      <TextField
        label="Specification Details"
        value={specDetails}
        onChange={(e) => setSpecDetails(e.target.value)}
        fullWidth
      />
      <IconButton color="primary" onClick={handleAddSpecification}>
        <AddIcon />
      </IconButton>
    </div>
  );
};

export default SpecificationInput;
