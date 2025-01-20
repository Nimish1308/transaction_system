import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form, Table, Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import logo from './assets/logo.png'; // Path to the image from your component's location

const Records = () => {
    // State for records and filtered records
    const [record, setRecord] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);

    // Month filter state
    const [selectedMonth, setSelectedMonth] = useState('');

    // States for calculated values
    const [totalSales, setTotalSales] = useState(0);
    const [totalSoldItems, setTotalSoldItems] = useState(0);
    const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);

    // Sales data for the price range chart
    const [priceRanges, setPriceRanges] = useState([]);
    const [priceCounts, setPriceCounts] = useState([]);

    

    // Fetch all records
    const getRecord = async () => {
        const res = await axios.get(`http://localhost:5000/backend/products`,{ withCredentials: true }  );
        const store = res.data;
        setRecord(store);
        setFilteredRecords(store);  // Initially display all records
    };

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(6);

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;

    const currentIndex = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

    const btnPrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const btnNext = () => {
        setCurrentPage((next) => Math.min(next + 1, totalPages));
    };

    const nextProceed = (current) => {
        setCurrentPage(current);
    };

    // Handle month change
    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    // Get the month name from the date (e.g., "2021-11-27T20:29:54+05:30" -> "Nov")
    const getMonthName = (dateString) => {
        const date = new Date(dateString);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[date.getMonth()];  // Get the month name based on index
    };

    // Calculate total sales, sold items, and not sold items for the selected month
    const calculateSalesData = () => {
        let sales = 0;
        let soldItems = 0;
        let notSoldItems = 0;

        filteredRecords.forEach((item) => {
            if (getMonthName(item.dateOfSale) === selectedMonth) {
                if (item.sold) {
                    sales += item.price;
                    soldItems++;
                } else {
                    notSoldItems++;
                }
            }
        });

        setTotalSales(sales);
        setTotalSoldItems(soldItems);
        setTotalNotSoldItems(notSoldItems);
    };

    // Function to calculate price ranges
    const calculatePriceRanges = () => {
        const ranges = [
            { label: 'Price Range 0-50', min: 0, max: 50 },
            { label: 'Price Range 51-100', min: 51, max: 100 },
            { label: 'Price Range 101-150', min: 101, max: 150 },
            { label: 'Price Range 151-200', min: 151, max: 200 },
            { label: 'Price Range 201-250', min: 201, max: 250 },
            { label: 'Price Range 250+', min: 251, max: Infinity },
        ];

        const counts = new Array(ranges.length).fill(0);

        filteredRecords.forEach((item) => {
            if (getMonthName(item.dateOfSale) === selectedMonth) {
                const price = item.price;
                ranges.forEach((range, index) => {
                    if (price >= range.min && price <= range.max) {
                        counts[index]++;
                    }
                });
            }
        });

        setPriceRanges(ranges.map((range) => range.label));
        setPriceCounts(counts);
    };

    // Filter records by selected month and immediately update the sales data and price ranges
    const filterByMonth = () => {
        if (selectedMonth === '') {
            setFilteredRecords(record);  // Show all records if no month is selected
        } else {
            const filtered = record.filter((item) => getMonthName(item.dateOfSale) === selectedMonth);
            setFilteredRecords(filtered);
            setCurrentPage(1);  // Reset to first page after filtering
        }
    };

    // Recalculate sales data and price ranges when selectedMonth or filteredRecords change
    useEffect(() => {
        calculateSalesData();
        calculatePriceRanges();
    }, [selectedMonth, filteredRecords]); // Trigger calculation whenever month or records change

    useEffect(() => {
        getRecord();
    }, []);

    return (
        <>
            <div className="container-logo">
                <img src={logo} alt="My Image"
                    style={{ width: '20%', display: 'block', margin: 'auto' }}
                />
            </div>
            {/* Month Selection Dropdown */}
            <div className="container" style={{ marginBottom: '20px', display: 'flex', margin: '20px', float: 'right' }}>
                <Form.Control as="select" value={selectedMonth} onChange={handleMonthChange} style={{ width: '20%' }}>
                    <option value="">Select Month</option>
                    <option value="Jan">January</option>
                    <option value="Feb">February</option>
                    <option value="Mar">March</option>
                    <option value="Apr">April</option>
                    <option value="May">May</option>
                    <option value="Jun">June</option>
                    <option value="Jul">July</option>
                    <option value="Aug">August</option>
                    <option value="Sep">September</option>
                    <option value="Oct">October</option>
                    <option value="Nov">November</option>
                    <option value="Dec">December</option>


                </Form.Control>

                <Button variant="warning" onClick={filterByMonth} style={{ margin: '10px', color: 'black' }}>
                    Search Transaction
                </Button>
            </div>

            {/* Table to display records */}
            <Table striped bordered hover className="container" style={{ border: '3px solid black', borderRadius: '30px' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Sold</th>
                        <th>Images</th>
                    </tr>
                </thead>
                <tbody>
                    {currentIndex.map((item, i) => (
                        <tr key={item.id}>
                            <td>{indexOfFirstItem + i + 1}</td>
                            <td>{item.title}</td>
                            <td>{item.description}</td>
                            <td>{item.price.toFixed(2)}</td>
                            <td>{item.category}</td>
                            <td>{item.sold ? 'True' : 'False'}</td>
                            <td>
                                <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px' }} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Pagination controls */}
            <div className="container" style={{ margin: 'auto' }}>
                <Button variant="warning" onClick={btnPrev} disabled={currentPage === 1}>
                    Prev
                </Button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <Button
                        key={index}
                        variant="warning"
                        style={{ margin: '2px' }}
                        onClick={() => nextProceed(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </Button>
                ))}
                <Button variant="warning" onClick={btnNext} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </div>

            {/* Display Calculated Sales Data */}
            <div className="container" style={{ margin: '20px', width: '30%', float: 'left' }}>
                <Card>
                    <Card.Body>
                        <Card.Title>Sales Summary for {selectedMonth}</Card.Title>
                        <p><strong>Total Sales Amount: </strong>₹{totalSales.toFixed(2)}</p>
                        <p><strong>Total Sold Items: </strong>{totalSoldItems}</p>
                        <p><strong>Total Not Sold Items: </strong>{totalNotSoldItems}</p>
                    </Card.Body>
                </Card>
            </div>

            {/* Display Price Range Chart */}
            {selectedMonth && (
                <div className="container" style={{ margin: '20px', width: '80%' }}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Price Range Distribution</Card.Title>
                            <Bar
                                data={{
                                    labels: priceRanges,
                                    datasets: [
                                        {
                                            label: 'Number of Items',
                                            data: priceCounts,
                                            backgroundColor: 'rgba(20, 224, 224, 0.97)',
                                            borderColor: 'rgb(20, 130, 130)',
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </Card.Body>
                    </Card>
                </div>
            )}
        </>
    );
};

export default Records;
