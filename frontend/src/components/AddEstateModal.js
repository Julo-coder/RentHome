import React, { useState } from 'react';
import Modal from 'react-modal';



const AddEstateModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        postal_code: '',
        max_person: '',
        area: ''
    });

    const handleChange = (e) => {
        if (e.target.name === 'postal_code') {
            const value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length <= 5) {
                const formattedValue = value.length > 2 
                    ? `${value.slice(0,2)}-${value.slice(2)}` 
                    : value;
                setFormData({ ...formData, postal_code: formattedValue });
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            address: '',
            city: '',
            postal_code: '',
            max_person: '',
            area: ''
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Estate"
        >
            <h2 className="modal-title">Add New Estate</h2>
            <form onSubmit={handleSubmit} className="modal-form">
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    placeholder="Address"
                    onChange={handleChange}
                    className="modal-input"
                    required
                />
                <input
                    type="text"
                    name="city"
                    value={formData.city}
                    placeholder="City"
                    onChange={handleChange}
                    className="modal-input"
                    required
                />
                <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    placeholder="Postal code (XX-XXX)"
                    onChange={handleChange}
                    className="modal-input"
                    pattern="[0-9]{2}-[0-9]{3}"
                    maxLength="6"
                    required
                />
                <input
                    type="number"
                    name="max_person"
                    value={formData.max_person}
                    placeholder="Maximum people"
                    onChange={handleChange}
                    className="modal-input"
                    required
                />
                <input
                    type="number"
                    name="area"
                    value={formData.area}
                    placeholder="Area (m²)"
                    onChange={handleChange}
                    className="modal-input"
                    required
                />
                <div className="modal-buttons">
                    <button type="submit" className="modal-submit">Add Estate</button>
                    <button type="button" onClick={onClose} className="modal-close">Cancel</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEstateModal;