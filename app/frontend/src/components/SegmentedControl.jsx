import React from 'react';
import PropTypes from 'prop-types';

const SegmentedControl = ({ name, legend, options, value, onChange, testId }) => (
  <fieldset className="segmented" data-testid={ testId }>
    <legend className="visually-hidden">{ legend }</legend>
    {
      options.map((option) => (
        <React.Fragment key={ option.value }>
          <input
            type="radio"
            id={ `${name}-${option.value}` }
            name={ name }
            value={ option.value }
            checked={ value === option.value }
            onChange={ () => onChange(option.value) }
          />
          <label htmlFor={ `${name}-${option.value}` }>{ option.label }</label>
        </React.Fragment>
      ))
    }
  </fieldset>
);

SegmentedControl.propTypes = {
  name: PropTypes.string.isRequired,
  legend: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  testId: PropTypes.string,
};

SegmentedControl.defaultProps = {
  testId: undefined,
};

export default SegmentedControl;
