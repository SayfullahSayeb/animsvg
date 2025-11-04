    const svgUpload = document.getElementById("svg-upload");
    const transitionTimeSelect = document.getElementById("transition-time");
    const strokeWidthSelect = document.getElementById("stroke-width");
    const strokeColorInput = document.getElementById("stroke-color");
    const svgContainer = document.getElementById("svg-container");
    const bgColorSelect = document.getElementById("bg-color");

    let currentSvgContent = null;

    window.onload = function() {
        updateBackgroundColor(); 
    }

    function updateFileName() {
        const fileUploadBtn = document.querySelector('.file-upload-btn');
        const fileName = svgUpload.files[0]?.name || 'Choose SVG File';
        fileUploadBtn.textContent = fileName;
    }

    // Event Listeners for Auto-Update on Change
    svgUpload.addEventListener("change", handleFileUpload);
    transitionTimeSelect.addEventListener("change", updateAnimation);
    strokeWidthSelect.addEventListener("change", updateAnimation);
    strokeColorInput.addEventListener("change", updateAnimation);
    bgColorSelect.addEventListener("change", updateBackgroundColor);

    function handleFileUpload(e) {
        const file = e.target.files[0];
        updateFileName();

        if (file && file.type === "image/svg+xml") {
            const reader = new FileReader();
            reader.onload = function () {
                currentSvgContent = reader.result;
                updateAnimation();
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a valid SVG file.");
        }
    }

    function updateAnimation() {
        if (!currentSvgContent) return;

        const duration = parseFloat(transitionTimeSelect.value);
        const strokeWidth = strokeWidthSelect.value;
        const strokeColor = strokeColorInput.value;

        svgContainer.innerHTML = currentSvgContent;
        const svg = svgContainer.querySelector('svg');

        if (!svg) return;

        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        const paths = svg.querySelectorAll('path');
        paths.forEach(path => {
            const length = path.getTotalLength();
            path.style.stroke = strokeColor;
            path.style.strokeWidth = strokeWidth + "px";
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.getBoundingClientRect();
            path.style.transition = `stroke-dashoffset ${duration}s ease-in-out`;
            path.style.strokeDashoffset = '0';
        });
    }

    function updateBackgroundColor() {
        const selectedColor = bgColorSelect.value;
        svgContainer.style.background = selectedColor;
    }

    function replayAnimation() {
        if (currentSvgContent) {
            updateAnimation();
        }
    }

    // Download HTML File functionality
    document.getElementById('download-html-btn').addEventListener('click', function() {
        if (!currentSvgContent) {
            alert('Please upload an SVG file first.');
            return;
        }
        
        // Get current settings
        const duration = transitionTimeSelect.value;
        const strokeWidth = strokeWidthSelect.value;
        const strokeColor = strokeColorInput.value;
        const bgColor = bgColorSelect.value;
        
        // Extract just the SVG element from currentSvgContent
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentSvgContent;
        const svgElement = tempDiv.querySelector('svg');
        const svgCode = svgElement ? svgElement.outerHTML : currentSvgContent;
        
        // Create the HTML template
        const htmlContent = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background: ${bgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }

        svg path {
            stroke: ${strokeColor};
            stroke-width: ${strokeWidth}px;
            fill: none;
        }
    </style>
    <title>animsvg</title>
</head>

<body>
    ${svgCode}

    <script>
        const allPaths = document.querySelectorAll("path");
        allPaths.forEach((path) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.getBoundingClientRect();
            path.style.transition = "stroke-dashoffset ${duration}s ease-in-out";
            path.style.strokeDashoffset = "0";
        });
    <\/script>
</body>

</html>`;
        
        // Create Blob and download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'index.html';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
    });

    updateFileName();
