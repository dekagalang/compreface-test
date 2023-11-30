import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

const DisplayCropedImage = ({ personsImage, imageElement, canvasElement }) => {
    return (
        <Container>
            <Row>
                <Col>
                    <canvas ref={canvasElement}></canvas>
                </Col>
                <Col>
                    <Image style={{ width: 700 }} alt="Exadel" rounded src={personsImage} ref={imageElement} />
                    <div></div>
                </Col>
            </Row>
        </Container>
    )
}

export default DisplayCropedImage;