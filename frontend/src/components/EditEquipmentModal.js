import React, { useState } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';

const EditEquipmentModal = ({ isOpen, onClose, equipment, onUpdateEquipment }) => {
    const [formData, setFormData] = useState({
        estate_id: equipment.estate_id,
        estate_equipment: equipment.estate_equipment,
        quantity: equipment.quantity,
        equipment_condition: equipment.equipment_condition,
        original_equipment: equipment.estate_equipment // Keep the original name for API call
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'quantity' ? parseInt(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create a composite identifier using estate_id and original equipment name
            const equipmentId = `${formData.estate_id}_${encodeURIComponent(formData.original_equipment)}`;
            
            const response = await fetch(`http://localhost:8081/estate-equipment/${equipmentId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estate_equipment: formData.estate_equipment,
                    quantity: formData.quantity,
                    equipment_condition: formData.equipment_condition
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update equipment');
            }

            // Remove the unused variable assignment and use the response directly
            await response.json();
            onUpdateEquipment({...formData, estate_equipment: formData.estate_equipment});
            setSuccessMessage('Equipment updated successfully!');
            
            // Close modal after delay
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Equipment"
            className="modal-container edit-equipment-modal"
            ariaHideApp={false}
        >
            <h2 className="modal-title">Edit Equipment</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                    <label htmlFor="estate_equipment">Equipment Name</label>
                    <input
                        type="text"
                        id="estate_equipment"
                        name="estate_equipment"
                        value={formData.estate_equipment}
                        onChange={handleChange}
                        className="modal-input"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="modal-input"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="equipment_condition">Condition</label>
                    <select
                        id="equipment_condition"
                        name="equipment_condition"
                        value={formData.equipment_condition}
                        onChange={handleChange}
                        className="modal-input"
                        required
                    >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                    </select>
                </div>
                
                <div className="modal-buttons">
                    <button 
                        type="submit" 
                        className="modal-submit"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Equipment'}
                    </button>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="modal-close"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditEquipmentModal;