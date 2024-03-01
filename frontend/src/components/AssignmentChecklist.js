import React, { useState } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

export default function AssignmentChecklist(props) {
  const { users, dispatch, pfeId, userInfo } = props;
  const [value, setValue] = useState([]);
  const handleChange = (val) => setValue(val);
  const submitHandler = async () => {
    if (value.length === 0) {
      toast.error('Aucun encadrant sélectionnée');
      return;
    }
    try {
      dispatch({ type: 'ASSIGNMENT_REQUEST' });
      await axios.put(
        `http://localhost:8082/pfe/approve/${pfeId}`,
        { userId: userInfo.userId },
        {
          headers: { Authorization: `${userInfo.token}` },
          params: {
            pfeId: pfeId,
            userIds: value,
          },
          paramsSerializer: { indexes: null },
        }
      );
      dispatch({ type: 'ASSIGNMENT_SUCCESS' });
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'ASSIGNMENT_FAIL' });
    }
  };
  return (
    <>
      <div className="supervisorsList mt-2">
        <ToggleButtonGroup
          className="w-100"
          vertical
          type="checkbox"
          value={value}
          onChange={handleChange}
        >
          {users
            .filter((e) => e.role !== 'STUDENT')
            .map((e) => (
              <ToggleButton
                variant="light"
                className="text-start"
                key={e.userId}
                id={e.userId}
                value={e.userId}
              >
                {`${e.firstName} ${e.lastName}`}
              </ToggleButton>
            ))}
        </ToggleButtonGroup>
      </div>
      <div className="pt-2">
        <Button onClick={submitHandler}>Affecter</Button>
      </div>
    </>
  );
}
