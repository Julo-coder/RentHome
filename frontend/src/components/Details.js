import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import EditEstateModal from './EditEstateModal';
import AddUsageModal from './AddUsageModal';

export default function Details() {
    const [estate, setEstate] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { estateId } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddUsageModalOpen, setIsAddUsageModalOpen] = useState(false);

    const fetchEstateDetails = useCallback(async () => {
        try {
            const [estateResponse, usageResponse] = await Promise.all([
                fetch(`http://localhost:8081/estates/${estateId}`, {
                    credentials: 'include'
                }),
                fetch(`http://localhost:8081/estate-usage/${estateId}`, {
                    credentials: 'include'
                })
            ]);

            if (!estateResponse.ok) {
                if (estateResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch estate details');
            }

            const estateData = await estateResponse.json();
            setEstate(estateData);

            if (usageResponse.ok) {
                const usageData = await usageResponse.json();
                setUsage(usageData);
            } else if (usageResponse.status !== 404) {
                // Only throw error if it's not a "not found" response
                console.error('Usage fetch error:', await usageResponse.json());
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [estateId, navigate]);

    useEffect(() => {
        fetchEstateDetails();
    }, [fetchEstateDetails]);

    const handleEditEstate = () => {
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = useCallback(() => {
        fetchEstateDetails(); // Odśwież dane po udanej aktualizacji
    }, [fetchEstateDetails]);

    if (loading) return <div className="loading-div">Loading...</div>;
    if (error) return <div className="error-div">Error: {error}</div>;
    if (!estate) return <div className="not-found-div">Estate not found</div>;

    const detailsNav = [
        { label: "Back to Estates", to: "/estate" },
        { label: "Edit Estate", to: "#", onClick: handleEditEstate },
        { label: "Add Usage", to: "#", onClick: () => setIsAddUsageModalOpen(true) }
    ];

    return (
        <div className="details-container">
            <Header navItems={detailsNav} />
            
            <div className="estate-details-card">
                <h2>Estate Details</h2>
                <div className="details-grid">
                    <div className="info-section">
                        <h3>Basic Information</h3>
                        <p><strong>Address:</strong> {estate.address}</p>
                        <p><strong>City:</strong> {estate.city}</p>
                        <p><strong>Postal Code:</strong> {estate.postal_code}</p>
                        <p><strong>Area:</strong> {estate.area} m²</p>
                        <p><strong>Occupancy:</strong> {estate.people}/{estate.max_person}</p>
                    </div>

                    {usage && (
                        <div className="usage-section">
                            <h3>Utility Usage</h3>
                            <div className="usage-grid">
                                <div className="usage-card">
                                    <h4>Water</h4>
                                    <p>{usage.water_usage} m³</p>
                                </div>
                                <div className="usage-card">
                                    <h4>Electricity</h4>
                                    <p>{usage.electricity_usage} kWh</p>
                                </div>
                                <div className="usage-card">
                                    <h4>Gas</h4>
                                    <p>{usage.gas_usage} m³</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EditEstateModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateSuccess}
                estateId={estateId}
            />

            <AddUsageModal
                isOpen={isAddUsageModalOpen}
                onClose={() => setIsAddUsageModalOpen(false)}
                onUpdate={fetchEstateDetails}
                estateId={estateId}
            />
        </div>
    );
}