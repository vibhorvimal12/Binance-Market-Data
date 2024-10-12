// app.js
const coinSelect = document.getElementById('coin-select');
const intervalSelect = document.getElementById('interval-select');
const chartCanvas = document.getElementById('candlestick-chart');
let chart;
let socket;
let chartData = {};

// Function to initialize the chart
function initializeChart() {
    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'Candlestick Data',
                data: chartData[coinSelect.value] || [],
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Function to update chart data
function updateChart(data) {
    const coin = coinSelect.value;
    if (!chartData[coin]) chartData[coin] = [];
    chartData[coin].push(data);
    localStorage.setItem('chartData', JSON.stringify(chartData));
    chart.data.datasets[0].data = chartData[coin];
    chart.update();
}

// Connect to the Binance WebSocket for the selected coin and interval
function connectWebSocket() {
    if (socket) socket.close();
    const symbol = coinSelect.value;
    const interval = intervalSelect.value;
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    
    socket = new WebSocket(wsUrl);
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const candlestick = message.k;
        if (candlestick.x) { // Check if the candlestick is closed
            updateChart({
                x: new Date(candlestick.t),
                o: parseFloat(candlestick.o),
                h: parseFloat(candlestick.h),
                l: parseFloat(candlestick.l),
                c: parseFloat(candlestick.c)
            });
        }
    };
}

// Restore data from local storage on load
window.onload = () => {
    const storedData = JSON.parse(localStorage.getItem('chartData'));
    if (storedData) chartData = storedData;
    initializeChart();
    connectWebSocket();
};

// Event listeners for dropdown changes
coinSelect.addEventListener('change', () => {
    initializeChart();
    connectWebSocket();
});

intervalSelect.addEventListener('change', connectWebSocket);
