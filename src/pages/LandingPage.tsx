import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './LandingPage.css'; // Import the CSS file

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    // Chart data and options
    const chartData = {
        labels: ['1', '2', '3', '4', '5'],
        datasets: [{
            label: 'Maintenance Predictions',
            data: [65, 59, 80, 81, 76],
            fill: false,
            borderColor: '#28a745',
            tension: 0.2,
            pointBackgroundColor: '#28a745',
            pointRadius: 4,
            pointHoverRadius: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                mode: 'index' as const,
                intersect: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#555'
                }
            },
            y: {
                display: false,
                grid: {
                    display: false
                }
            }
        },
        elements: {
            line: {
                borderWidth: 3
            }
        }
    };

    return (
        <div className="wrapper">
            {/* Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container">
                    <a className="navbar-brand" href="#">ALPHA CMMS</a>
                    {/* Removed navbar-toggler as content is always visible */}
                    <div className="" id="navbarNav"> {/* Removed collapse and navbar-collapse classes */}
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#" onClick={handleLoginClick}><i className="bi bi-box-arrow-in-right"></i> Login</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="content">
                {/* Circular Icon Layout */}
                <div className="circle-container" style={{ backgroundImage: `url('/images/brand-logo.png')` }}>
                    {/* Predictive Chart in the Center */}
                    {/* <div className="chart-container">
                        <Line data={chartData} options={chartOptions} />
                    </div> */}

                    {/* Icon Cards */}
                    <div className="icon-card" style={{ transform: 'rotate(315deg) translate(300px) rotate(-315deg)' }}>
                        <i className="bi bi-people mb-0"></i>
                        <span>Staff Attendance</span>
                        <div className="description-bar">Track and manage staff attendance efficiently.</div>
                    </div>
                    <div className="icon-card" style={{ transform: 'rotate(45deg) translate(300px) rotate(-45deg)' }}>
                        <i className="bi bi-clipboard-check"></i>
                        <span>Facility Inspection</span>
                        <div className="description-bar">Conduct thorough facility inspections with ease.</div>
                    </div>
                    <div className="icon-card" style={{ transform: 'rotate(0deg) translate(300px) rotate(0deg)' }}>
                        <i className="bi bi-tools"></i>
                        <span>CMMS PPM</span>
                        <div className="description-bar">Manage planned preventive maintenance effectively.</div>
                    </div>
                    <div className="icon-card" style={{ transform: 'rotate(90deg) translate(300px) rotate(-90deg)' }}>
                        <i className="bi bi-diagram-3"></i>
                        <span>Request Flow</span>
                        <div className="description-bar">Streamline request and workflow processes.</div>
                    </div>
                    <div className="icon-card" style={{ transform: 'rotate(180deg) translate(300px) rotate(-180deg)' }}>
                        <i className="bi bi-telephone"></i>
                        <span>Call-2-Fix</span>
                        <div className="description-bar">Quickly resolve issues with our call-to-fix system.</div>
                    </div>
                    <div className="icon-card" style={{ transform: 'rotate(225deg) translate(300px) rotate(-225deg)' }}>
                        <i className="bi bi-file-earmark-text mb-0"></i>
                        <span>Contract & Procurement</span>
                        <div className="description-bar">Manage contracts and procurement seamlessly.</div>
                    </div>
                    <div className="icon-card" style={{ transform: 'rotate(135deg) translate(300px) rotate(-135deg)' }}>
                        <i className="bi bi-boxes mb-0"></i>
                        <span>Materials Management</span>
                        <div className="description-bar">Efficiently manage materials and inventory.</div>
                    </div>
                    <div className="icon-card" style={{ transform: 'rotate(270deg) translate(300px) rotate(-270deg)' }}>
                        <i className="bi bi-bar-chart mb-0"></i>
                        <span>Predictive Dashboard</span>
                        <div className="description-bar">Gain insights with our predictive analytics dashboard.</div>
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <footer className="footer navbar-dark">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <a className="footer-brand" href="#">Alpha CMMS</a>
                        <ul className="footer-nav d-flex list-unstyled mb-0">
                            <li className="nav-item">
                                <a className="nav-link" href="#"><i className="bi bi-info-circle"></i> About</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage; 