import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import '../styles/modal.css';

const EstateContractsModal = ({ isOpen, onClose, estateId }) => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteContractId, setDeleteContractId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Use useCallback to memoize the fetchContracts function
    const fetchContracts = useCallback(async () => {
        if (!estateId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/contracts/estate/${estateId}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch contracts');
            const data = await response.json();
            setContracts(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [estateId]); // Include estateId in the dependency array

    useEffect(() => {
        if (isOpen) {
            fetchContracts();
        }
    }, [isOpen, fetchContracts]); // Add fetchContracts to the dependency array

    const handleDeleteClick = (contractId) => {
        setDeleteContractId(contractId);
        setConfirmDelete(true);
    };

    const cancelDelete = () => {
        setDeleteContractId(null);
        setConfirmDelete(false);
    };

    const confirmDeleteContract = async () => {
        if (!deleteContractId) return;
        
        setIsDeleting(true);
        try {
            // Properly encode the contract number for URL safety
            const encodedContractNumber = encodeURIComponent(deleteContractId);
            
            const response = await fetch(`http://localhost:8081/contracts/${encodedContractNumber}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) throw new Error('Failed to delete contract');
            
            // Refresh contracts list
            await fetchContracts();
            setError(null);
        } catch (error) {
            setError(`Error deleting contract: ${error.message}`);
        } finally {
            setIsDeleting(false);
            setConfirmDelete(false);
            setDeleteContractId(null);
        }
    };

    // Function to calculate remaining time on contract
    const calculateRemainingTime = (startDate, durationMonths) => {
        if (!startDate) return 'Date information missing';

        const start = new Date(startDate);
        const today = new Date();
        
        // Calculate end date (start date + duration in months)
        const endDate = new Date(start);
        endDate.setMonth(endDate.getMonth() + durationMonths);
        
        // If contract has ended
        if (today > endDate) {
            return 'Contract expired';
        }
        
        // Calculate difference in milliseconds
        const diffMs = endDate - today;
        
        // Convert milliseconds to days
        const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const months = Math.floor(totalDays / 30);
        const days = totalDays % 30;
        
        return `${months} month${months !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''} remaining`;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Estate Contracts"
            className="modal-container contract-details-modal"
            ariaHideApp={false}
        >
            <h2 className="modal-title">Estate Contracts</h2>
            {error && <div className="error-message">{error}</div>}
            
            {confirmDelete && (
                <div className="delete-confirmation">
                    <p>Are you sure you want to delete this contract? This action cannot be undone.</p>
                    <div className="confirmation-buttons">
                        <button 
                            onClick={confirmDeleteContract} 
                            className="delete-btn"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                        <button 
                            onClick={cancelDelete} 
                            className="cancel-btn"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            
            {loading ? (
                <div className="loading-message">Loading contracts...</div>
            ) : contracts.length === 0 ? (
                <div className="no-contracts">No contracts found for this estate.</div>
            ) : (
                <div className="contracts-list">
                    {contracts.map(contract => (
                        <div key={contract.contract_number} className="contract-item">
                            <div className="contract-header">
                                <h3>Contract #{contract.contract_number}</h3>
                                <div className="contract-actions">
                                    <span className="contract-duration">{contract.rent} months</span>
                                    <button 
                                        onClick={() => handleDeleteClick(contract.contract_number)}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="contract-info">
                                <p><strong>Tenant:</strong> {contract.name} {contract.surname}</p>
                                <p><strong>Phone:</strong> {contract.phone}</p>
                                <p><strong>Rental Price:</strong> {contract.rental_price} zł</p>
                                <p><strong>Charges:</strong> {contract.charges} zł</p>
                                <p><strong>Number of People:</strong> {contract.people_count || 1}</p>
                                <p className="contract-remaining-time">
                                    <strong>Time Remaining:</strong> {calculateRemainingTime(contract.start_date, contract.rent)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="modal-buttons">
                <button onClick={onClose} className="modal-close">Close</button>
            </div>
        </Modal>
    );
};

export default EstateContractsModal;