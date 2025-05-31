import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';
import EditEquipmentModal from './EditEquipmentModal';

const EqList = ({ isOpen, onClose, estateId }) => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEquipment, setCurrentEquipment] = useState(null);

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
            // Reset delete status when modal opens
            setDeleteStatus('');
        }
    }, [estateId, isOpen]);

    const handleDelete = async (item) => {
        try {
            setDeleteStatus('Deleting...');
            // Create a composite identifier using estate_id and equipment name
            const equipmentId = `${item.estate_id}_${encodeURIComponent(item.estate_equipment)}`;
            
            const response = await fetch(`http://localhost:8081/estate-equipment/${equipmentId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete equipment');
            }

            // Remove the deleted item from the equipment list
            setEquipment(equipment.filter(eq => 
                eq.estate_id !== item.estate_id || eq.estate_equipment !== item.estate_equipment
            ));
            setDeleteStatus('Equipment deleted successfully');
            
            // Clear the success message after 3 seconds
            setTimeout(() => {
                setDeleteStatus('');
            }, 3000);
        } catch (error) {
            setError(error.message);
            setDeleteStatus('Error deleting equipment');
        }
    };

    const handleEdit = (item) => {
        setCurrentEquipment(item);
        setIsEditModalOpen(true);
    };

    const handleUpdateEquipment = (updatedItem) => {
        setEquipment(equipment.map(item => 
            (item.estate_id === updatedItem.estate_id && item.estate_equipment === updatedItem.original_equipment) 
                ? {...updatedItem, estate_equipment: updatedItem.estate_equipment} 
                : item
        ));
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Equipment List"
        >
            <h2 className="modal-title">Equipment List</h2>
            {error && <div className="error-message">{error}</div>}
            {deleteStatus && <div className={deleteStatus.includes('Error') ? "error-message" : "success-message"}>{deleteStatus}</div>}
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipment.map((item) => (
                                <tr key={`${item.estate_id}-${item.estate_equipment}`}>
                                    <td>{item.estate_equipment}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.equipment_condition}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="edit-btn"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </td>
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

            {isEditModalOpen && currentEquipment && (
                <EditEquipmentModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    equipment={currentEquipment}
                    onUpdateEquipment={handleUpdateEquipment}
                />
            )}
        </Modal>
    );
};

export default EqList;