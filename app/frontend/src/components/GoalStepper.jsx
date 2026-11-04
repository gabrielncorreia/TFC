import React from 'react';
import PropTypes from 'prop-types';

// Goals only go up from the last saved score, as in the original form.
const GoalStepper = ({
  id, label, value, min, onChange, testId, disabled, removeLabel, addLabel,
}) => {
  const set = (next) => onChange(Math.max(min, Number.isNaN(next) ? min : next));

  return (
    <div className="goal-stepper">
      <label htmlFor={ id }>{ label }</label>
      <div className="goal-stepper-controls">
        <button
          type="button"
          className="goal-stepper-button"
          onClick={ () => set(value - 1) }
          disabled={ disabled || value <= min }
          aria-label={ removeLabel }
        >
          −
        </button>
        <input
          id={ id }
          type="number"
          inputMode="numeric"
          min={ min }
          value={ value }
          disabled={ disabled }
          onChange={ ({ target }) => set(parseInt(target.value, 10)) }
          data-testid={ testId }
        />
        <button
          type="button"
          className="goal-stepper-button"
          onClick={ () => set(value + 1) }
          disabled={ disabled }
          aria-label={ addLabel }
        >
          +
        </button>
      </div>
    </div>
  );
};

GoalStepper.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  testId: PropTypes.string.isRequired,
  removeLabel: PropTypes.string.isRequired,
  addLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

GoalStepper.defaultProps = {
  disabled: false,
};

export default GoalStepper;
