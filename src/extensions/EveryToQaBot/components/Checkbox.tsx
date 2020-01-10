import * as React from 'react';

const Checkbox = ({ label, isSelected, onCheckboxChange, key }) => (
  <div className="form-check">
    <label>
      <input
        type="checkbox"
        name={label}
        checked={isSelected}
        onChange={onCheckboxChange}
        className="form-check-input"
        key={key}
      />
      {label}
    </label>
  </div>
);

export default Checkbox;