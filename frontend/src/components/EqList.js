import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import EditEquipmentModal from './EditEquipmentModal';
import '../styles/modal.css';

const EqList = ({ isOpen, onClose, estateId }) => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEquipment, setCurrentEquipment] = useState(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            if (!isOpen || !estateId) return;
            
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8081/equipment/${estateId}`, {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch equipment');
                }
                
                const data = await response.json();
                setEquipment(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching equipment:', err);
                setError('Error loading equipment: ' + (err.message || 'Connection problem'));
                setEquipment([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [estateId, isOpen]);

    const handleDelete = async (item) => {
        try {
            const response = await fetch(`http://localhost:8081/equipment/${estateId}/${encodeURIComponent(item.estate_equipment)}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) throw new Error('Failed to delete equipment');
            
            setEquipment(equipment.filter(eq => eq.estate_equipment !== item.estate_equipment));
            setDeleteStatus('Equipment deleted successfully!');
            setTimeout(() => setDeleteStatus(''), 3000);
        } catch (err) {
            setError('Error deleting equipment: ' + err.message);
        }
    };

    const handleEdit = (item) => {
        setCurrentEquipment(item);
        setIsEditModalOpen(true);
    };

    const handleUpdateEquipment = (updatedItem) => {
        setEquipment(equipment.map(item => 
            item.estate_equipment === updatedItem.original_equipment 
                ? { ...updatedItem, estate_equipment: updatedItem.estate_equipment } 
                : item
        ));
        setIsEditModalOpen(false);
    };

    const renderConditionTag = (condition) => {
        let conditionClass = 'condition-tag ';
        
        switch(condition.toLowerCase()) {
            case 'excellent':
                conditionClass += 'condition-excellent';
                break;
            case 'good':
                conditionClass += 'condition-good';
                break;
            case 'fair':
                conditionClass += 'condition-fair';
                break;
            default:
                conditionClass += 'condition-fair';
        }
        
        return <span className={conditionClass}>{condition}</span>;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Equipment List"
            className="modal-container contract-details-modal"
            ariaHideApp={false}
        >
            <div className="equipment-list-container">
                <h2 className="equipment-list-title">Equipment List</h2>
                
                {error && <div className="error-message">{error}</div>}
                {deleteStatus && <div className="success-message">{deleteStatus}</div>}
                
                {loading ? (
                    <div className="loading-message">Loading equipment...</div>
                ) : equipment.length === 0 ? (
                    <div className="no-equipment">No equipment found for this estate.</div>
                ) : (
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
                            {equipment.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.estate_equipment}</td>
                                    <td>{item.quantity}</td>
                                    <td>{renderConditionTag(item.equipment_condition)}</td>
                                    <td>
                                        <div className="equipment-actions-cell">
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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