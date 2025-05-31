import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';


const EqList = ({ isOpen, onClose, estateId }) => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const response = await fetch(`http://localhost:8081/estate-equipment/${estateId}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch equipment');
                }

                const data = await response.json();
                setEquipment(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchEquipment();
        }
    }, [estateId, isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Equipment List"
        >
            <h2 className="modal-title">Equipment List</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-content">
                {loading ? (
                    <div>Loading...</div>
                ) : equipment.length > 0 ? (
                    <table className="equipment-table">
                        <thead>
                            <tr>
                                <th>Equipment</th>
                                <th>Quantity</th>
                                <th>Condition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipment.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.estate_equipment}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.equipment_condition}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No equipment found for this estate.</p>
                )}
            </div>
            <div className="modal-buttons">
                <button onClick={onClose} className="modal-close">Close</button>
            </div>
        </Modal>
    );
};

export default EqList;