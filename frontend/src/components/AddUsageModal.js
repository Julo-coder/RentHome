import React, { useState } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';



const AddUsageModal = ({ isOpen, onClose, estateId, onUpdate }) => {
    const [formData, setFormData] = useState({
        water_usage: '',
        electricity_usage: '',
        gas_usage: '',
        date_of_measure: new Date().toISOString().split('T')[0]
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
            const response = await fetch('http://localhost:8081/estate-usage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    estate_id: parseInt(estateId),
                    water_usage: parseFloat(formData.water_usage) || 0,
                    electricity_usage: parseFloat(formData.electricity_usage) || 0,
                    gas_usage: parseFloat(formData.gas_usage) || 0,
                    date_of_measure: formData.date_of_measure
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add usage data');
            }

            await response.json();
            setSuccessMessage('Usage data added successfully!');
            
            // Immediately update the parent component
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
            contentLabel="Add Usage"
        >
            <h2 className="modal-title">Add Usage Data</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
                <input
                    type="date"
                    name="date_of_measure"
                    value={formData.date_of_measure}
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