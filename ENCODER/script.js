document.addEventListener("DOMContentLoaded", () => {
    const inputText = document.getElementById('inputText');
    const encodedText = document.getElementById('encodedText');
    const decodedText = document.getElementById('decodedText');
    const encodeButton = document.getElementById('encodeButton');
    const decodeButton = document.getElementById('decodeButton');
    const frequencyDisplay = document.getElementById('frequencyDisplay');
    const codeDisplay = document.getElementById('codeDisplay');
    const encodingSteps = document.getElementById('encodingSteps');
    const decodingSteps = document.getElementById('decodingSteps');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const frequencyChart = document.getElementById('frequencyChart');
    const treeContainer = document.getElementById('treeContainer');

    let huffmanTree;
    let encodedString = "";
    let encodingStepsArr = []; // Store encoding steps

    // Function to calculate frequency of characters in the input
    function calculateFrequency(text) {
        const frequencyMap = {};
        for (let char of text) {
            frequencyMap[char] = (frequencyMap[char] || 0) + 1;
        }
        return frequencyMap;
    }

    // Build the Huffman tree
    function buildHuffmanTree(frequencyMap) {
        const pq = Object.entries(frequencyMap).map(([char, freq]) => new Node(char, freq));
        pq.sort((a, b) => a.cost - b.cost);

        while (pq.length > 1) {
            const left = pq.shift();
            const right = pq.shift();
            const newNode = new Node(null, left.cost + right.cost, left, right);
            pq.push(newNode);
            pq.sort((a, b) => a.cost - b.cost);
        }
        return pq[0];
    }

    // Generate Huffman codes
    function generateCodes(node, prefix = "", codeMap = {}) {
        if (!node) return;
        if (node.char !== null) {
            codeMap[node.char] = prefix;
            return codeMap;
        }
        generateCodes(node.left, prefix + "0", codeMap);
        generateCodes(node.right, prefix + "1", codeMap);
        return codeMap;
    }

    // Encode the input text
    function encode(text) {
        const frequencyMap = calculateFrequency(text);
        huffmanTree = buildHuffmanTree(frequencyMap);
        const codeMap = generateCodes(huffmanTree);

        // Display frequency and codes
        frequencyDisplay.innerText = JSON.stringify(frequencyMap, null, 2);
        codeDisplay.innerText = JSON.stringify(codeMap, null, 2);

        // Construct encoded string and encoding steps
        encodingStepsArr = []; // Reset encoding steps
        encodedString = text.split('').map(char => {
            const code = codeMap[char];
            encodingStepsArr.push(`Encoding '${char}' to '${code}'`);
            return code;
        }).join('');
        encodedText.value = encodedString;

        // Display encoding steps
        encodingSteps.innerHTML = encodingStepsArr.join('<br>');

        // Update the frequency chart
        updateChart(frequencyMap);

        // Visualize the Huffman tree
        visualizeHuffmanTree(huffmanTree);
    }

    // Decode the encoded text
    function decode(encodedText) {
        let decodedString = "";
        let node = huffmanTree;
        decodingSteps.innerHTML = ""; // Reset decoding steps

        for (let bit of encodedText) {
            node = bit === "0" ? node.left : node.right;
            if (node.char !== null) {
                decodedString += node.char;
                decodingSteps.innerHTML += `Decoded '${bit}' to '${node.char}'<br>`;
                node = huffmanTree; // Reset to the root for the next character
            }
        }
        return decodedString;
    }

    // Update chart using Chart.js
    function updateChart(frequencyMap) {
        const labels = Object.keys(frequencyMap);
        const data = Object.values(frequencyMap);

        new Chart(frequencyChart, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Character Frequency',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Visualize the Huffman tree
    function visualizeHuffmanTree(node, x = 0, y = 0, level = 0, offset = 50) {
        treeContainer.innerHTML = ""; // Clear previous tree visualization
        const drawNode = (node, x, y) => {
            if (!node) return;

            // Create a new div for the node
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            nodeDiv.innerText = node.char !== null ? node.char : ' ';
            nodeDiv.style.left = `${x}px`;
            nodeDiv.style.top = `${y}px`;
            treeContainer.appendChild(nodeDiv);

            if (node.left) {
                const leftX = x - offset;
                const leftY = y + 40;
                drawLine(x, y, leftX, leftY); // Draw line to the left child
                drawNode(node.left, leftX, leftY);
            }
            if (node.right) {
                const rightX = x + offset;
                const rightY = y + 40;
                drawLine(x, y, rightX, rightY); // Draw line to the right child
                drawNode(node.right, rightX, rightY);
            }
        };

        drawNode(node, x, y);
    }

    // Draw line between nodes
    function drawLine(x1, y1, x2, y2) {
        const line = document.createElement('div');
        line.className = 'tree-line';
        const top = Math.min(y1, y2);
        const left = Math.min(x1, x2);
        const height = Math.abs(y1 - y2);
        const width = Math.abs(x1 - x2);

        line.style.position = 'absolute';
        line.style.top = `${top}px`;
        line.style.left = `${left}px`;
        line.style.width = `${width}px`;
        line.style.height = `${height}px`;
        line.style.borderLeft = '2px solid black';
        line.style.borderTop = '2px solid black';
        line.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)}deg)`;
        treeContainer.appendChild(line);
    }

    // Event listener for encoding
    encodeButton.addEventListener('click', () => {
        const text = inputText.value;
        if (text) {
            encode(text);
        } else {
            alert('Please enter text to encode');
        }
    });

    // Event listener for decoding
    decodeButton.addEventListener('click', () => {
        if (encodedString) {
            decodedText.value = decode(encodedString);
        } else {
            alert('Please encode text first');
        }
    });

    // Event listener for uploading text file
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                inputText.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    // Node class to represent each character and its frequency
    class Node {
        constructor(char, cost, left = null, right = null) {
            this.char = char;
            this.cost = cost;
            this.left = left;
            this.right = right;
        }
    }
});
