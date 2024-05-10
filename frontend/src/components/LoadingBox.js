import { Spinner } from 'react-bootstrap';

export default function LoadingBox() {
  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <Spinner animation="border" role="status" style={{color: "#67b7aa"}}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}
