document.addEventListener("DOMContentLoaded", function() {
    // Kontrollera om jsPDF-biblioteket har laddats
    if (typeof window.jspdf === 'undefined') {
        console.error("jsPDF library not loaded. PDF functionality will be disabled.");
        return; // Avbryt om biblioteket saknas
    }
    const { jsPDF } = window.jspdf;

    const imageUpload = document.getElementById('imageUpload');
    const uploadContainer = document.getElementById('upload-container');
    const uploadStep = document.getElementById('uploadStep');
    const editStep = document.getElementById('editStep');
    const originalImage = document.getElementById('originalImage');
    const resultImage = document.getElementById('resultImage');
    const loader = document.getElementById('loader');
    const placeholder = document.getElementById('placeholder');
    const repaintButton = document.getElementById('repaintButton');
    const changeImageButton = document.getElementById('changeImageButton');
    const colorInput = document.getElementById('colorInput');
    const colorPreview = document.getElementById('colorPreview');
    const fluggerDatalist = document.getElementById('flugger-colors');
    const downloadButtons = document.getElementById('downloadButtons');
    const downloadButton = document.getElementById('downloadButton');
    const downloadPdfButton = document.getElementById('downloadPdfButton');
    const uploadError = document.getElementById('uploadError');

    let originalImageData = null;
    let debounceTimer;

    const fluggerColors = [
        { name: "White", ncs: "S 0500-N", hex: "#F8F8F7" }, { name: "Calm", ncs: "S 1002-Y", hex: "#EAE6DA" }, { name: "Pale Beach", ncs: "S 1005-Y20R", hex: "#EAE1D5" }, { name: "Space", ncs: "S 1500-N", hex: "#DCDDDE" }, { name: "Cloudy", ncs: "S 1502-Y", hex: "#DBD7CA" }, { name: "Silver Grey", ncs: "S 2000-N", hex: "#CACFD1" }, { name: "Dusty Grey", ncs: "S 2502-Y", hex: "#C2BEB4" }, { name: "Warm Grey", ncs: "S 3502-Y", hex: "#A8A59C" }, { name: "Dark Grey", ncs: "S 6502-Y", hex: "#636361" }, { name: "Sea Mist", ncs: "S 1005-B20G", hex: "#DAE2E1" }, { name: "Ocean", ncs: "S 2010-B10G", hex: "#BFCED1" }, { name: "Deep Sea", ncs: "S 4020-B10G", hex: "#83989D" }, { name: "Forest", ncs: "S 6010-B70G", hex: "#526760" }, { name: "Moss Green", ncs: "S 4010-G70Y", hex: "#8F917B" }, { name: "Soft Green", ncs: "S 2005-G70Y", hex: "#D0D1C6" }, { name: "Antique Green", ncs: "S 3010-G50Y", hex: "#AEB3A3" }, { name: "Khaki", ncs: "S 4010-G90Y", hex: "#95927A" }, { name: "Golden Sand", ncs: "S 1010-Y10R", hex: "#E5DBCB" }, { name: "Sahara", ncs: "S 2020-Y10R", hex: "#D2C2A8" }, { name: "Terracotta", ncs: "S 3040-Y50R", hex: "#B88365" }, { name: "Vintage Rose", ncs: "S 2010-Y80R", hex: "#D1BDB4" }, { name: "Soft Rose", ncs: "S 1010-Y70R", hex: "#E6D1CA" }, { name: "IN-791 Antikvit", ncs: "S 0502-Y", hex: "#f0ede3" }, { name: "IN-792 Råvit", ncs: "S 0603-Y", hex: "#ebe6d8" }, { name: "IN-793 Ljusgrå", ncs: "S 1000-N", hex: "#e5e6e6" }, { name: "IN-794 Grå", ncs: "S 1500-N", hex: "#d9dada" }, { name: "IN-795 Betonggrå", ncs: "S 2500-N", hex: "#c2c4c5" }, { name: "IN-796 Varmgrå", ncs: "S 2002-Y", hex: "#ccc9bf" }, { name: "IN-797 Sand", ncs: "S 1005-Y20R", hex: "#e9e1d5" }, { name: "IN-798 Ljus Toffee", ncs: "S 1010-Y30R", hex: "#e6d8c8" }, { name: "IN-799 Dimrosa", ncs: "S 1010-Y70R", hex: "#e5d1c9" }, { name: "IN-800 Mistel", ncs: "S 1010-G10Y", hex: "#dce2d7" }, { name: "IN-801 Mint", ncs: "S 1010-B90G", hex: "#d9e4e0" }, { name: "IN-802 Ljusblå", ncs: "S 1010-R90B", hex: "#d8dfe5" }, { name: "IN-803 Ljus Jeansblå", ncs: "S 1510-B", hex: "#d1d9df" }, { name: "IN-804 Jeansblå", ncs: "S 2010-B", hex: "#c2cdd3" }, { name: "IN-805 Petrol", ncs: "S 3010-B", hex: "#a4b2b9" }, { name: "IN-806 Salvia", ncs: "S 2010-G30Y", hex: "#c2c9bc" }, { name: "IN-807 Oliv", ncs: "S 3010-G70Y", hex: "#b4b7a7" }, { name: "IN-808 Curry", ncs: "S 2020-Y", hex: "#d6cca9" }, { name: "IN-809 Ockra", ncs: "S 2030-Y10R", hex: "#d2c0a1" }, { name: "IN-810 Toffee", ncs: "S 2010-Y40R", hex: "#d1c4b3" }, { name: "IN-811 Puderrosa", ncs: "S 1510-Y80R", hex: "#d9c3ba" }, { name: "IN-812 Bordeaux", ncs: "S 4030-Y90R", hex: "#a17873" }, { name: "U-042 Ljusgrå", ncs: "S 0500-N", hex: "#f2f2f1" }, { name: "U-043 Grå", ncs: "S 1000-N", hex: "#e5e6e6" }, { name: "U-456 Skiffergrå", ncs: "S 4500-N", hex: "#8c8f91" }, { name: "U-457 Antracitgrå", ncs: "S 7500-N", hex: "#4c5053" }, { name: "U-458 Svart", ncs: "S 9000-N", hex: "#2b2e31" }, { name: "U-459 Havsblå", ncs: "S 5030-B", hex: "#638099" }, { name: "U-460 Mörkblå", ncs: "S 7020-R90B", hex: "#3e475c" }, { name: "U-461 Mörkgrön", ncs: "S 7020-B90G", hex: "#39514c" }, { name: "U-462 Röd", ncs: "S 1580-Y90R", hex: "#d32f27" }
    ];

    function populateDatalist() {
        if (!fluggerDatalist) return;
        fluggerColors.forEach(color => {
            const option = document.createElement('option');
            option.value = `${color.name} (${color.ncs})`;
            fluggerDatalist.appendChild(option);
        });
    }

    function findColor(query) {
         const lowerCaseQuery = query.toLowerCase();
         let color = fluggerColors.find(c => `${c.name.toLowerCase()} (${c.ncs.toLowerCase()})` === lowerCaseQuery);
         if (color) return color;
         color = fluggerColors.find(c => c.ncs.toLowerCase() === lowerCaseQuery);
         if (color) return color;
         color = fluggerColors.find(c => c.name.toLowerCase() === lowerCaseQuery);
         if (color) return color;
         return null;
    }

    async function updateColorPreview(colorQuery) {
        if (!colorPreview) return;
        const foundColor = findColor(colorQuery);
        if(foundColor) {
            colorPreview.style.backgroundColor = foundColor.hex;
            return;
        }
        try {
            const response = await fetch(`https://www.thecolorapi.com/id?ncs=${encodeURIComponent(colorQuery)}`);
            if (!response.ok) { 
                colorPreview.style.backgroundColor = 'transparent';
                return;
            }
            const data = await response.json();
            if (data.hex && data.hex.value) {
                colorPreview.style.backgroundColor = data.hex.value;
            } else {
                colorPreview.style.backgroundColor = 'transparent';
            }
        } catch (error) {
             colorPreview.style.backgroundColor = 'transparent';
             console.error("Kunde inte hämta färg för NCS:", error);
        }
    }
    
    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value;
            debounceTimer = setTimeout(() => {
                updateColorPreview(query);
            }, 200);
        });
    }
    
    populateDatalist();

    if (uploadContainer) {
        uploadContainer.addEventListener('click', () => imageUpload.click());
    }
    if (imageUpload) {
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) handleFile(file);
        });
    }
    if (uploadContainer) {
        uploadContainer.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); uploadContainer.classList.add('dragover'); });
        uploadContainer.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); uploadContainer.classList.remove('dragover'); });
        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadContainer.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        });
    }
    
    function handleFile(file) {
        if (!uploadError || !originalImage || !uploadStep || !editStep) return;
        uploadError.classList.add('hidden');
         if (file.size > 5 * 1024 * 1024) {
            uploadError.textContent = 'Bilden är för stor. Maxstorlek är 5MB.';
            uploadError.classList.remove('hidden');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImageData = e.target.result;
            originalImage.src = originalImageData;
            uploadStep.classList.add('hidden');
            editStep.classList.remove('hidden');
            resetResult();
        };
        reader.readAsDataURL(file);
    }

    function resetResult() {
        if (!resultImage || !placeholder || !downloadButtons) return;
        resultImage.classList.add('hidden');
        resultImage.src = '';
        placeholder.classList.remove('hidden');
        downloadButtons.classList.add('hidden');
    }
    
    if (changeImageButton) {
        changeImageButton.addEventListener('click', () => {
            if (!editStep || !uploadStep || !imageUpload) return;
            editStep.classList.add('hidden');
            uploadStep.classList.remove('hidden');
            imageUpload.value = '';
            originalImageData = null;
        });
    }
    
    if (repaintButton) {
        repaintButton.addEventListener('click', () => {
            if (!originalImageData) {
                alert('Du måste ladda upp en bild först.');
                return;
            }
            const query = colorInput.value.trim();
            if (!query) {
                alert('Ange en giltig färg eller NCS-kod.');
                return;
            }
            
            const foundColor = findColor(query);
            const ncsCode = foundColor ? foundColor.ncs : query;
            
            const colorInfo = { name: ncsCode, ncs: ncsCode };
            generateImage(originalImageData, colorInfo);
        });
    }
    
    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', async () => {
           try {
                const beforeImg = originalImage;
                const afterImg = resultImage;
                const query = colorInput.value.trim();

                if (!beforeImg.src || !afterImg.src || !query) {
                    alert("Kunde inte skapa PDF. Se till att en bild har genererats och en färg är vald.");
                    return;
                }
                
                let hexCode = '';
                const foundColor = findColor(query);
                if (foundColor) {
                    hexCode = foundColor.hex;
                } else {
                    try {
                        const response = await fetch(`https://www.thecolorapi.com/id?ncs=${encodeURIComponent(query)}`);
                        const data = await response.json();
                        if (data.hex && data.hex.value) {
                            hexCode = data.hex.value;
                        } else { throw new Error(); }
                    } catch (e) {
                         alert("Kunde inte verifiera den egna NCS-koden för PDF-generering. Kontrollera koden och försök igen.");
                         return;
                    }
                }

                const colorName = foundColor ? foundColor.name : 'Egen NCS-kod';
                const ncsCode = foundColor ? foundColor.ncs : query;
                
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 15;
                
                doc.setFontSize(22);
                doc.setFont("helvetica", "bold");
                doc.text("Råneå Bygghandel", pageWidth / 2, margin, { align: 'center' });
                doc.setFontSize(14);
                doc.setFont("helvetica", "normal");
                doc.text("Digitalt Färgförslag", pageWidth / 2, margin + 8, { align: 'center' });

                const imgContainerY = margin + 20;
                const availableHeight = pageHeight - imgContainerY - margin - 5;
                const aspectRatio = beforeImg.naturalWidth / beforeImg.naturalHeight;
                let imgWidth = (pageWidth - (margin * 2) - margin) / 2;
                let imgHeight = imgWidth / aspectRatio;
                if (imgHeight > (availableHeight - 25)) {
                    imgHeight = availableHeight - 25;
                    imgWidth = imgHeight * aspectRatio;
                }
                const imgContainerWidth = (imgWidth * 2) + margin;
                const xOffset = (pageWidth - imgContainerWidth) / 2;
                const yOffset = imgContainerY;
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("Före", xOffset, yOffset, { align: 'left' });
                doc.addImage(beforeImg.src, 'PNG', xOffset, yOffset + 3, imgWidth, imgHeight);
                const xAfter = xOffset + imgWidth + margin;
                doc.text("Efter", xAfter, yOffset, { align: 'left' });
                doc.addImage(afterImg.src, 'PNG', xAfter, yOffset + 3, imgWidth, imgHeight);
                
                const infoY = yOffset + 3 + imgHeight + 12;
                const swatchSize = 10;
                doc.setFillColor(hexCode.toUpperCase());
                doc.rect(xOffset, infoY, swatchSize, swatchSize, 'F'); 
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text("Vald Färg:", xOffset + swatchSize + 4, infoY + (swatchSize/2) + 3);
                doc.setFont("helvetica", "normal");
                const infoText = `${colorName}  |  NCS: ${ncsCode}  |  HEX: ${hexCode.toUpperCase()}`;
                doc.text(infoText, xOffset + swatchSize + 4 + 25, infoY + (swatchSize/2) + 3);
                
                doc.setFontSize(8);
                doc.setTextColor(150);
                const footerText = "Notera: Digitala färger kan skilja sig från verkligheten. Vi rekommenderar alltid att provmåla. | Genererad: " + new Date().toLocaleDateString('sv-SE');
                doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });

                const pdfFileName = `fargforslag_Ranea_Bygghandel_${ncsCode.replace(/\s/g, '_')}.pdf`;
                doc.save(pdfFileName);
           } catch(error) {
               console.error("Ett fel inträffade vid PDF-generering:", error);
               alert("Ett oväntat fel inträffade när PDF-filen skulle skapas. Kontrollera webbläsarens konsol för mer information.");
           }
        });
    }

    async function generateImage(base64ImageData, colorInfo) {
        if (!loader || !repaintButton || !placeholder || !resultImage || !downloadButton || !downloadButtons) return;
        loader.classList.remove('hidden');
        repaintButton.disabled = true;
        repaintButton.classList.add('opacity-50', 'cursor-not-allowed');
        placeholder.classList.add('hidden');
        resultImage.classList.add('hidden');

        const base64Data = base64ImageData.split(',')[1];
        
        try {
            const response = await fetch('/api/generateImage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData: base64Data,
                    colorName: colorInfo.name
                })
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Okänt fel från servern');
            }

            const result = await response.json();
            const newBase64Data = result.imageData;

            if (newBase64Data) {
                const imageUrl = `data:image/png;base64,${newBase64Data}`;
                resultImage.src = imageUrl;
                resultImage.classList.remove('hidden');
                downloadButton.href = imageUrl;
                downloadButton.download = `ommalat_rum_${colorInfo.ncs.replace(/\s/g, '_')}.png`;
                downloadButtons.classList.remove('hidden');
            } else {
                throw new Error("Kunde inte generera bilden. Svaret från servern var tomt.");
            }

        } catch (error) {
            console.error('Error:', error);
            placeholder.classList.remove('hidden');
            placeholder.innerHTML = `<p class="text-red-500 p-4">Ett fel uppstod: ${error.message}</p>`;
        } finally {
            loader.classList.add('hidden');
            repaintButton.disabled = false;
            repaintButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
});
