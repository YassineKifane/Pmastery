import {Button, Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import {Dialog} from "primereact/dialog";
import CreatableSelect from "react-select/creatable";
import PfeDialogDetails from "./PfeDialogDetails";
import MessageBox from "./MessageBox";

export  default function SupervisorItem({allstudents,supervisor,selectedYearSupervisors,years}) {
    const [visible, setVisible] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState({});
    const [selectedYear, setSelectedYear] = useState({
        label: null,
        value: null
    });

    return (
        <tr key={supervisor.userId}>
            <td>{supervisor.lastName}</td>
            <td>{supervisor.firstName}</td>
            <td>
                {
                    supervisor.pfe.filter(p =>
                        p.year === selectedYearSupervisors.value && p.approved === true
                    ).length
                }
            </td>
            <td>{supervisor.email}</td>
            <td>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => setVisible(true)}
                >
                    Sujets encadrés
                </Button>
                <Dialog
                    header={supervisor.lastName + " " + supervisor.firstName}
                    visible={visible}
                    style={{width: '50vw'}}
                    onHide={() => setVisible(false)}
                    draggable={true}
                >
                    <Row>
                        <Form.Group as={Row} controlId="yearSelect">
                            <Form.Label column sm={2}>
                                L'année:
                            </Form.Label>
                            <Col sm={4}>
                                <CreatableSelect
                                    placeholder="Choisir l'année"
                                    options={years.map(year => ({
                                        value: year,
                                        label: year
                                    }))}
                                    isSearchable={false}
                                    value={selectedYear}
                                    onChange={selectedOption => setSelectedYear(selectedOption)}
                                />
                            </Col>
                        </Form.Group>
                    </Row>
                    <Row className="mt-5">
                        {
                            selectedYear.value &&
                            supervisor.pfe.filter(p => (p.year === selectedYear.value && p.approved === true).length>0)
                            ?
                            (supervisor.pfe.filter(p => (p.year === selectedYear.value && p.approved === true))
                                .map(
                                pfe => (
                                    <Row className="mb-3">
                                        <Col>
                                            {pfe.subject}
                                        </Col>

                                        <Col column sm={5} style={{width: "25%"}}>
                                            <Button
                                                onClick={() => setDetailsVisible({...detailsVisible, [pfe.pfeId]: true})}
                                            >
                                                Show details
                                            </Button>
                                            <PfeDialogDetails
                                                visible={detailsVisible[pfe.pfeId] || false}
                                                pfeDetails={allstudents.filter(student => student.pfe[0].pfeId === pfe.pfeId)[0]}
                                                setVisible={setDetailsVisible}
                                            />
                                        </Col>
                                    </Row>
                                )))
                        :(
                                    selectedYear.value &&
                                    <MessageBox>Aucun sujet pour cette année</MessageBox>
                                )}
                    </Row>
                </Dialog>
            </td>
        </tr>
    );
}