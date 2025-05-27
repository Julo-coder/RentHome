import React, { useState } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';

Modal.setAppElement('#root');

const AddEquipmentModal = ({ isOpen, onClose, estateId, onUpdate }) => {
    const [formData, setFormData] = useState({
        estate_equipment: '',
        quantity: '',
        equipment_condition: 'good' // default value
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8081/estate-equipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    estate_id: parseInt(estateId),
                    estate_equipment: formData.estate_equipment,
                    quantity: parseInt(formData.quantity),
                    equipment_condition: formData.equipment_condition
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add equipment');
            }

            await response.json();
            setSuccessMessage('Equipment added successfully!');
            
            // Clear form fields
            setFormData({
                estate_equipment: '',
                quantity: '',
                equipment_condition: 'good' // Reset to default value
            });
            
            if (onUpdate) {
                await onUpdate();
            }


        } catch (error) {
            console.error('Error details:', error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Equipment"
        >
            <h2 className="modal-title">Add Equipment</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
                <input
                    type="text"
                    name="estate_equipment"
                    value={formData.estate_equipment}
                    placeholder="Equipment Name"
                    onChange={handleChange}
                    className="modal-input"
                    required
                />
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    placeholder="Quantity"
                    onChange={handleChange}
                    className="modal-input"
                    min="1"
                    required
                />
                <select
                    name="equipment_condition"
                    value={formData.equipment_condition}
                    onChange={handleChange}
                    className="modal-input"
                    required
                >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                </select>
                <div className="modal-buttons">
                    <button 
                        type="submit" 
                        className="modal-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Equipment'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="modal-close"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEquipmentModal;