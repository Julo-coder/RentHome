import React, { useState } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';

Modal.setAppElement('#root');

const AddUsageModal = ({ isOpen, onClose, estateId, onUpdate }) => {
    const [formData, setFormData] = useState({
        water_usage: '',
        electricity_usage: '',
        gas_usage: '',
        create_at: new Date().toISOString().split('T')[0] // Initialize with current date
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8081/estate-usage/${estateId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    water_usage: parseFloat(formData.water_usage) || 0,
                    electricity_usage: parseFloat(formData.electricity_usage) || 0,
                    gas_usage: parseFloat(formData.gas_usage) || 0
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add usage data');
            }

            onClose();
            onUpdate && onUpdate();
        } catch (err) {
            console.error('Error adding usage data:', err);
            setError(err.message || 'Failed to add usage data. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Usage Data"
            className="ReactModal__Content"
            overlayClassName="ReactModal__Overlay"
        >
            <h2 className="modal-title">Add New Usage Data</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="modal-input"
                    required
                />
                <input
                    type="number"
                    name="water_usage"
                    value={formData.water_usage}
                    onChange={handleChange}
                    placeholder="Water Usage (m³)"
                    className="modal-input"
                    step="0.01"
                    min="0"
                    required
                />
                <input
                    type="number"
                    name="electricity_usage"
                    value={formData.electricity_usage}
                    onChange={handleChange}
                    placeholder="Electricity Usage (kWh)"
                    className="modal-input"
                    step="0.01"
                    min="0"
                    required
                />
                <input
                    type="number"
                    name="gas_usage"
                    value={formData.gas_usage}
                    onChange={handleChange}
                    placeholder="Gas Usage (m³)"
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