import React, { useState } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';

Modal.setAppElement('#root');

const AddUsageModal = ({ isOpen, onClose, estateId, onUpdate }) => {
    const [formData, setFormData] = useState({
        water_usage: '',
        electricity_usage: '',
        gas_usage: '',
        created_at: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Log the data being sent
            console.log('Sending data:', {
                estate_id: estateId,
                water_usage: formData.water_usage,
                electricity_usage: formData.electricity_usage,
                gas_usage: formData.gas_usage,
                created_at: formData.created_at
            });

            const response = await fetch('http://localhost:8081/estate-usage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    estate_id: parseInt(estateId), // Convert to number
                    water_usage: parseFloat(formData.water_usage) || 0,
                    electricity_usage: parseFloat(formData.electricity_usage) || 0,
                    gas_usage: parseFloat(formData.gas_usage) || 0,
                    created_at: formData.created_at
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add usage data');
            }

            const data = await response.json();
            console.log('Success:', data);
            onClose();
            onUpdate && onUpdate();
        } catch (error) {
            console.error('Error details:', error);
            setError(error.message || 'Failed to add usage data');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Usage"
            className="ReactModal__Content"
            overlayClassName="ReactModal__Overlay"
        >
            <h2 className="modal-title">Add Usage Data</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
                <input
                    type="date"
                    name="created_at"
                    value={formData.createcd_at}
                    onChange={handleChange}
                    className="modal-input"
                    required
                />
                <input
                    type="number"
                    name="water_usage"
                    value={formData.water_usage}
                    placeholder="Water Usage (m³)"
                    onChange={handleChange}
                    className="modal-input"
                    step="0.01"
                    min="0"
                    required
                />
                <input
                    type="number"
                    name="electricity_usage"
                    value={formData.electricity_usage}
                    placeholder="Electricity Usage (kWh)"
                    onChange={handleChange}
                    className="modal-input"
                    step="0.01"
                    min="0"
                    required
                />
                <input
                    type="number"
                    name="gas_usage"
                    value={formData.gas_usage}
                    placeholder="Gas Usage (m³)"
                    onChange={handleChange}
                    className="modal-input"
                    step="0.01"
                    min="0"
                    required
                />
                <div className="modal-buttons">
                    <button 
                        type="submit" 
                        className="modal-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Usage'}
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

export default AddUsageModal;