// Exchange rate fetching and cost calculation functions

console.log('DEBUG: Script file loaded, defining ExportCostCalculator class');

class ExportCostCalculator {
    constructor() {
        console.log('DEBUG: ExportCostCalculator constructor started');
        
        this.exchangeRates = {
            CNY_TO_NZD: 0.2250,
            USD_TO_NZD: 1.6500
        };
        
        // Track current calculation for save/update functionality
        this.currentCalculationId = null;
        this.currentCalculationData = null;
        
        console.log('DEBUG: About to initialize event listeners');
        this.initializeEventListeners();
        console.log('DEBUG: Event listeners initialized');
        
        console.log('DEBUG: About to load default rates');
        this.loadDefaultRates();
        this.updateCalculationStatus();
        console.log('DEBUG: Constructor completed');
    }

    initializeEventListeners() {
        console.log('DEBUG: initializeEventListeners method started');
        
        // Auto-calculate when exchange rates change
        document.getElementById('cnyToNzd').addEventListener('input', () => {
            this.exchangeRates.CNY_TO_NZD = parseFloat(document.getElementById('cnyToNzd').value) || 0.2250;
        });
        
        document.getElementById('usdToNzd').addEventListener('input', () => {
            this.exchangeRates.USD_TO_NZD = parseFloat(document.getElementById('usdToNzd').value) || 1.6500;
        });
        console.log('DEBUG: Exchange rate listeners added');

        // Auto-update container capacity when type changes
        document.getElementById('containerType').addEventListener('change', this.updateContainerInfo.bind(this));
        console.log('DEBUG: Container type listener added');
        
        // Initialize units per container dual input system
        this.initializeUnitsInputSystem();
        console.log('DEBUG: Units input system initialized');
        
        // Auto-recalculate when incoterms change
        document.querySelectorAll('input[name="incoterms"]').forEach(radio => {
            radio.addEventListener('change', () => {
                // Auto-calculate if we have basic data
                const unitPrice = parseFloat(document.getElementById('unitPrice').value);
                const unitsPerContainer = parseFloat(document.getElementById('unitsPerContainer').value);
                if (unitPrice > 0 && unitsPerContainer > 0) {
                    this.calculateCosts();
                }
            });
        });
        console.log('DEBUG: Incoterms listeners added');
        
        // Margin and pricing calculator event listeners
        console.log('DEBUG: About to initialize margin calculator listeners');
        this.initializeMarginCalculatorListeners();
        console.log('DEBUG: Margin calculator listeners should be initialized');
        
        // Initialize container info
        console.log('DEBUG: About to update container info');
        this.updateContainerInfo();
        console.log('DEBUG: initializeEventListeners method completed');
    }

    loadDefaultRates() {
        document.getElementById('cnyToNzd').value = this.exchangeRates.CNY_TO_NZD;
        document.getElementById('usdToNzd').value = this.exchangeRates.USD_TO_NZD;
    }

    initializeUnitsInputSystem() {
        // Toggle between direct entry and carton calculation
        const directEntryRadio = document.getElementById('directEntry');
        const cartonCalculationRadio = document.getElementById('cartonCalculation');
        const directEntrySection = document.getElementById('directEntrySection');
        const cartonCalculationSection = document.getElementById('cartonCalculationSection');
        
        // Method toggle handlers
        directEntryRadio.addEventListener('change', () => {
            if (directEntryRadio.checked) {
                directEntrySection.style.display = 'block';
                cartonCalculationSection.style.display = 'none';
            }
        });
        
        cartonCalculationRadio.addEventListener('change', () => {
            if (cartonCalculationRadio.checked) {
                directEntrySection.style.display = 'none';
                cartonCalculationSection.style.display = 'block';
                this.calculateCartonCapacity();
            }
        });
        
        // Carton size change handler
        document.getElementById('cartonSize').addEventListener('change', (e) => {
            const customDimensions = document.getElementById('customDimensions');
            if (e.target.value === 'custom') {
                customDimensions.style.display = 'block';
            } else {
                customDimensions.style.display = 'none';
            }
            this.calculateCartonCapacity();
        });
        
        // Input handlers for carton calculation
        ['unitsPerCarton', 'cartonLength', 'cartonWidth', 'cartonHeight'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.calculateCartonCapacity();
                });
            }
        });
        
        // Container type change should also update carton calculations
        document.getElementById('containerType').addEventListener('change', () => {
            this.calculateCartonCapacity();
        });
    }
    
    calculateCartonCapacity() {
        const cartonCalculationRadio = document.getElementById('cartonCalculation');
        if (!cartonCalculationRadio.checked) return;
        
        const containerType = document.getElementById('containerType').value;
        const cartonSize = document.getElementById('cartonSize').value;
        const unitsPerCarton = parseFloat(document.getElementById('unitsPerCarton').value) || 0;
        
        // Container volumes in cubic meters
        const containerVolumes = {
            '20ft': 33,
            '40ft': 67,
            '40ft-hc': 76,
            'lcl': 10 // Assume 10 CBM for LCL calculation
        };
        
        // Predefined carton dimensions in cm (converted to cubic meters)
        const cartonDimensions = {
            'small': { length: 30, width: 20, height: 15 },
            'medium': { length: 40, width: 30, height: 20 },
            'large': { length: 50, width: 40, height: 30 },
            'xlarge': { length: 60, width: 50, height: 40 }
        };
        
        let cartonVolume = 0;
        
        if (cartonSize === 'custom') {
            const length = parseFloat(document.getElementById('cartonLength').value) || 0;
            const width = parseFloat(document.getElementById('cartonWidth').value) || 0;
            const height = parseFloat(document.getElementById('cartonHeight').value) || 0;
            cartonVolume = (length * width * height) / 1000000; // Convert cm³ to m³
        } else if (cartonDimensions[cartonSize]) {
            const dims = cartonDimensions[cartonSize];
            cartonVolume = (dims.length * dims.width * dims.height) / 1000000; // Convert cm³ to m³
        }
        
        const containerVolume = containerVolumes[containerType] || 0;
        
        if (cartonVolume > 0 && containerVolume > 0) {
            // Calculate with 85% efficiency factor for packing
            const packingEfficiency = 0.85;
            const cartonsPerContainer = Math.floor((containerVolume * packingEfficiency) / cartonVolume);
            const totalUnits = cartonsPerContainer * unitsPerCarton;
            
            // Update display
            document.getElementById('cartonsPerContainer').textContent = cartonsPerContainer.toLocaleString();
            document.getElementById('calculatedUnits').textContent = totalUnits.toLocaleString();
            document.getElementById('calculatedUnits').classList.add('calculated');
            
            // Update the main units per container field
            document.getElementById('unitsPerContainer').value = totalUnits;
            
            // Trigger calculation if other required fields are filled
            const unitPrice = parseFloat(document.getElementById('unitPrice').value);
            if (unitPrice > 0 && totalUnits > 0) {
                this.calculateCosts();
            }
        } else {
            // Reset display
            document.getElementById('cartonsPerContainer').textContent = '-';
            document.getElementById('calculatedUnits').textContent = '-';
            document.getElementById('calculatedUnits').classList.remove('calculated');
        }
    }

    updateContainerInfo() {
        const containerType = document.getElementById('containerType').value;
        const containerSpecs = {
            '20ft': {
                capacity: '28-33 CBM',
                maxWeight: '28,000 kg',
                dimensions: '5.9m × 2.35m × 2.39m'
            },
            '40ft': {
                capacity: '56-67 CBM',
                maxWeight: '26,500 kg',
                dimensions: '12.03m × 2.35m × 2.39m'
            },
            '40ft-hc': {
                capacity: '68-76 CBM',
                maxWeight: '26,500 kg',
                dimensions: '12.03m × 2.35m × 2.69m'
            }
        };

        // Update container info display if it exists
        let infoDiv = document.querySelector('.container-info');
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.className = 'container-info';
            const shippingCard = document.querySelector('.card-icon i.fa-shipping-fast');
            if (shippingCard) {
                shippingCard.closest('.magic-card').appendChild(infoDiv);
            }
        }

        const spec = containerSpecs[containerType];
        infoDiv.innerHTML = `
            <h4>Container Specifications</h4>
            <p><strong>Capacity:</strong> ${spec.capacity}</p>
            <p><strong>Max Weight:</strong> ${spec.maxWeight}</p>
            <p><strong>Dimensions:</strong> ${spec.dimensions}</p>
        `;
    }

    convertToNZD(amount, fromCurrency) {
        if (!amount || amount === 0) return 0;
        
        switch(fromCurrency) {
            case 'CNY':
                return amount * this.exchangeRates.CNY_TO_NZD;
            case 'USD':
                return amount * this.exchangeRates.USD_TO_NZD;
            case 'NZD':
                return amount;
            default:
                return amount;
        }
    }

    applyExchangeMargin(amount) {
        const margin = parseFloat(document.getElementById('exchangeMargin').value) || 0;
        return amount * (1 + margin / 100);
    }

    calculateWarehouseCost(weeklyWarehouseCost, weeksToSellStock) {
        if (!weeklyWarehouseCost || !weeksToSellStock || weeklyWarehouseCost <= 0 || weeksToSellStock <= 0) {
            return 0;
        }

        // Calculate the scaling periods
        const firstPeriodWeeks = weeksToSellStock * 0.3; // First 30% of time
        const remainingWeeks = weeksToSellStock * 0.7;   // Remaining 70% of time
        
        // First 30% period: Full warehouse cost (items arriving + starting to sell)
        const firstPeriodCost = firstPeriodWeeks * weeklyWarehouseCost;
        
        // Remaining 70% period: Declining inventory with consistent depletion rate
        // Average inventory during this period is 50% (starts at ~85% ends at ~15%)
        // This accounts for the gradual reduction in warehouse space needed
        const averageInventoryFactor = 0.6; // 60% average space utilization during depletion
        const remainingPeriodCost = remainingWeeks * weeklyWarehouseCost * averageInventoryFactor;
        
        // Total warehouse cost for the entire period
        const totalWarehouseCost = firstPeriodCost + remainingPeriodCost;
        
        return totalWarehouseCost;
    }

    getFormData() {
        return {
            productName: document.getElementById('productName').value || 'Unnamed Product',
            category: document.getElementById('productCategory').value || 'Uncategorized',
            unitPrice: parseFloat(document.getElementById('unitPrice').value) || 0,
            currency: document.getElementById('unitCurrency').value,
            unitsPerContainer: parseInt(document.getElementById('unitsPerContainer').value) || 0,
            containerType: document.getElementById('containerType').value,
            
            // Shipping costs
            shippingCost: parseFloat(document.getElementById('shippingCost').value) || 0,
            shippingCurrency: document.getElementById('shippingCurrency').value,
            localTransport: parseFloat(document.getElementById('localTransport').value) || 0,
            nzTransport: parseFloat(document.getElementById('nzTransport').value) || 0,
            
            // Customs and duties
            dutyRate: parseFloat(document.getElementById('dutyRate').value) || 0,
            gstRate: parseFloat(document.getElementById('gstRate').value) || 15,
            gstRegistered: document.querySelector('input[name="gstStatus"]:checked').value === 'registered',
            customsBrokerage: parseFloat(document.getElementById('customsBrokerage').value) || 0,
            documentFees: parseFloat(document.getElementById('documentationFees').value) || 0,
            
            // Warehouse costs
            weeklyWarehouseCost: parseFloat(document.getElementById('weeklyWarehouseCost').value) || 0,
            weeksToSellStock: parseFloat(document.getElementById('weeksToSell').value) || 0,
            
            // Insurance and other costs
            insuranceRate: parseFloat(document.getElementById('insuranceRate').value) || 0,
            bankFees: parseFloat(document.getElementById('bankFees').value) || 0,
            inspectionFees: parseFloat(document.getElementById('inspectionFees').value) || 0,
            otherFees: parseFloat(document.getElementById('otherFees').value) || 0,
            
            // Exchange rates
            exchangeMargin: parseFloat(document.getElementById('exchangeMargin').value) || 0,
            
            // Incoterms
            incoterms: document.querySelector('input[name="incoterms"]:checked').value
        };
    }

    calculateCosts() {
        const data = this.getFormData();
        
        // Validation
        if (data.unitPrice <= 0 || data.unitsPerContainer <= 0) {
            this.showError('Please enter valid unit price and units per container.');
            return;
        }

        // Calculate base product cost in NZD
        const baseProductCostNZD = this.convertToNZD(data.unitPrice, data.currency);
        const totalProductValueNZD = baseProductCostNZD * data.unitsPerContainer;
        
        // Apply exchange margin to product cost
        let productCostWithMargin = this.applyExchangeMargin(totalProductValueNZD);
        
        // Calculate shipping costs in NZD
        const shippingCostNZD = this.convertToNZD(data.shippingCost, data.shippingCurrency);
        const localTransportNZD = this.convertToNZD(data.localTransport, data.shippingCurrency);
        const nzTransportNZD = data.nzTransport; // Already in NZD
        
        // Handle FOB vs CIF logic
        let freightCostForBuyer = 0;
        let insuranceCostForBuyer = 0;
        let cifValue;
        
        if (data.incoterms === 'FOB') {
            // FOB: Buyer pays freight and insurance separately
            cifValue = productCostWithMargin + localTransportNZD;
            freightCostForBuyer = shippingCostNZD;
            insuranceCostForBuyer = cifValue * (data.insuranceRate / 100);
            // For customs calculation, use CIF value including freight and insurance
            cifValue = productCostWithMargin + shippingCostNZD + localTransportNZD;
        } else {
            // CIF: Freight and insurance included in unit price
            cifValue = productCostWithMargin + shippingCostNZD + localTransportNZD;
            // Add freight and insurance to product cost since they're included in CIF price
            const insuranceAmount = cifValue * (data.insuranceRate / 100);
            productCostWithMargin += shippingCostNZD + insuranceAmount;
            cifValue = productCostWithMargin + localTransportNZD;
        }
        
        // Calculate customs and duties (based on CIF value)
        const dutyAmount = cifValue * (data.dutyRate / 100);
        const gstBase = cifValue + dutyAmount;
        const gstAmount = gstBase * (data.gstRate / 100);
        
        // Calculate insurance amount for display
        const insuranceAmount = data.incoterms === 'FOB' ? insuranceCostForBuyer : cifValue * (data.insuranceRate / 100);
        
        // Calculate warehouse costs with scaling logic
        const warehouseCostNZD = this.calculateWarehouseCost(data.weeklyWarehouseCost, data.weeksToSellStock);
        
        // Other fees in NZD
        const customsBrokerageNZD = data.customsBrokerage;
        const documentFeesNZD = data.documentFees;
        const bankFeesNZD = data.bankFees;
        const inspectionFeesNZD = data.inspectionFees;
        const otherFeesNZD = data.otherFees;
        
        // Calculate total costs
        const totalCosts = {
            productCost: productCostWithMargin,
            shippingCost: data.incoterms === 'FOB' ? freightCostForBuyer : 0, // Only show as separate cost for FOB
            localTransport: localTransportNZD,
            nzTransport: nzTransportNZD,
            duty: dutyAmount,
            gst: gstAmount,
            gstRegistered: data.gstRegistered,
            insurance: insuranceAmount,
            warehouseCost: warehouseCostNZD,
            customsBrokerage: customsBrokerageNZD,
            documentFees: documentFeesNZD,
            bankFees: bankFeesNZD,
            inspectionFees: inspectionFeesNZD,
            otherFees: otherFeesNZD,
            incoterms: data.incoterms,
            originalShippingCost: shippingCostNZD // Keep original for reference
        };
        
        // Calculate total cost excluding metadata fields and GST if registered
        const excludeFromUnitCost = ['incoterms', 'originalShippingCost', 'gstRegistered'];
        if (data.gstRegistered) {
            excludeFromUnitCost.push('gst');
        }
        
        const costValues = Object.entries(totalCosts)
            .filter(([key]) => !excludeFromUnitCost.includes(key))
            .map(([, value]) => value);
        const totalCostNZD = costValues.reduce((sum, cost) => sum + cost, 0);
        const costPerUnitNZD = totalCostNZD / data.unitsPerContainer;
        
        // Calculate total cash flow cost (including GST regardless of registration)
        const cashFlowCostValues = Object.entries(totalCosts)
            .filter(([key]) => !['incoterms', 'originalShippingCost', 'gstRegistered'].includes(key))
            .map(([, value]) => value);
        const totalCashFlowNZD = cashFlowCostValues.reduce((sum, cost) => sum + cost, 0);
        
        // Calculate original currency equivalent
        const costPerUnitOriginal = data.currency === 'CNY' 
            ? costPerUnitNZD / this.exchangeRates.CNY_TO_NZD
            : costPerUnitNZD / this.exchangeRates.USD_TO_NZD;
        
        const results = {
            data,
            totalCosts,
            totalCostNZD,
            totalCashFlowNZD,
            costPerUnitNZD,
            costPerUnitOriginal,
            cifValue
        };
        
        this.displayResults(results);
        
        // Store results for potential saving
        this.lastCalculationResults = results;
    }

    displayResults(results) {
        const { data, totalCosts, totalCostNZD, totalCashFlowNZD, costPerUnitNZD, costPerUnitOriginal, cifValue } = results;
        
        // Update the margin calculator with the calculated cost per unit
        this.updateMarginCalculator(costPerUnitNZD);
        
        const resultsContent = document.getElementById('results-content');
        
        resultsContent.innerHTML = `
            <div class="cost-breakdown show">
                <div class="per-unit-summary">
                    <h3>${data.gstRegistered ? 'Business Cost Per Unit (GST Excluded)' : 'Cost Per Unit'}</h3>
                    <div class="unit-cost">NZ$${costPerUnitNZD.toFixed(2)}</div>
                    <div class="original-currency">${data.currency} ${costPerUnitOriginal.toFixed(2)}</div>
                    ${data.gstRegistered ? `
                    <div class="gst-note">
                        <small><i class="fas fa-info-circle"></i> GST excluded as you're registered and can claim it back</small>
                    </div>` : ''}
                </div>
                
                <div class="currency-display">
                    <div class="currency-card">
                        <h3>${data.gstRegistered ? 'Business Cost (Excl. GST)' : 'Total Container Cost'}</h3>
                        <div class="amount">NZ$${totalCostNZD.toFixed(2)}</div>
                    </div>
                    ${data.gstRegistered ? `
                    <div class="currency-card cash-flow">
                        <h3>Cash Flow Required</h3>
                        <div class="amount">NZ$${totalCashFlowNZD.toFixed(2)}</div>
                        <small>Includes GST you'll claim back</small>
                    </div>` : ''}
                    <div class="currency-card">
                        <h3>Units in Container</h3>
                        <div class="amount">${data.unitsPerContainer.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="incoterms-info">
                    <h3><i class="fas fa-handshake"></i> Trade Terms: ${data.incoterms}</h3>
                    <p class="incoterms-description">
                        ${data.incoterms === 'FOB' ? 
                            'Free On Board - You pay freight & insurance separately' : 
                            'Cost, Insurance, Freight - Freight & insurance included in unit price'}
                    </p>
                </div>
                
                <div class="breakdown-header">
                    <h3><i class="fas fa-list-ul"></i> Detailed Cost Breakdown</h3>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Product Cost (${data.currency}) ${data.incoterms === 'CIF' ? '+ Freight + Insurance' : ''}</span>
                    <span class="cost-value">NZ$${totalCosts.productCost.toFixed(2)}</span>
                </div>
                
                ${totalCosts.shippingCost > 0 ? `
                <div class="cost-item">
                    <span class="cost-label">Container Shipping (FOB - Separate Cost)</span>
                    <span class="cost-value">NZ$${totalCosts.shippingCost.toFixed(2)}</span>
                </div>` : `
                <div class="cost-item included">
                    <span class="cost-label">Container Shipping (CIF - Included Above)</span>
                    <span class="cost-value">NZ$${totalCosts.originalShippingCost.toFixed(2)}</span>
                </div>`}
                
                <div class="cost-item">
                    <span class="cost-label">Local Transport (China)</span>
                    <span class="cost-value">NZ$${totalCosts.localTransport.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">NZ Transport & Delivery</span>
                    <span class="cost-value">NZ$${totalCosts.nzTransport.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Customs Duty (${data.dutyRate}%)</span>
                    <span class="cost-value">NZ$${totalCosts.duty.toFixed(2)}</span>
                </div>
                
                <div class="cost-item ${data.gstRegistered ? 'gst-excluded' : ''}">
                    <span class="cost-label">GST (${data.gstRate}%)${data.gstRegistered ? ' - Reclaimable' : ''}</span>
                    <span class="cost-value">NZ$${totalCosts.gst.toFixed(2)}</span>
                    ${data.gstRegistered ? '<span class="excluded-note">Not counted in unit cost</span>' : ''}
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Insurance (${data.insuranceRate}%)</span>
                    <span class="cost-value">NZ$${totalCosts.insurance.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Warehouse & Storage (${data.weeksToSellStock} weeks)</span>
                    <span class="cost-value">NZ$${totalCosts.warehouseCost.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Customs Brokerage</span>
                    <span class="cost-value">NZ$${totalCosts.customsBrokerage.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Documentation Fees</span>
                    <span class="cost-value">NZ$${totalCosts.documentFees.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Bank/Transfer Fees</span>
                    <span class="cost-value">NZ$${totalCosts.bankFees.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Inspection Fees</span>
                    <span class="cost-value">NZ$${totalCosts.inspectionFees.toFixed(2)}</span>
                </div>
                
                <div class="cost-item">
                    <span class="cost-label">Other Miscellaneous</span>
                    <span class="cost-value">NZ$${totalCosts.otherFees.toFixed(2)}</span>
                </div>
                
                ${data.gstRegistered ? `
                <div class="cost-item">
                    <span class="cost-label"><strong>BUSINESS COST (Excl. GST)</strong></span>
                    <span class="cost-value"><strong>NZ$${totalCostNZD.toFixed(2)}</strong></span>
                </div>
                <div class="cost-item cash-flow-total">
                    <span class="cost-label"><strong>CASH FLOW REQUIRED (Incl. GST)</strong></span>
                    <span class="cost-value"><strong>NZ$${totalCashFlowNZD.toFixed(2)}</strong></span>
                </div>` : `
                <div class="cost-item">
                    <span class="cost-label"><strong>TOTAL COST</strong></span>
                    <span class="cost-value"><strong>NZ$${totalCostNZD.toFixed(2)}</strong></span>
                </div>`}
                
                <div class="key-calculations">
                    <h4><i class="fas fa-info-circle"></i> Key Calculations</h4>
                    <div class="calculation-grid">
                        <div class="calc-item">
                            <span class="calc-label">CIF Value:</span>
                            <span class="calc-value">NZ$${cifValue.toFixed(2)}</span>
                        </div>
                        <div class="calc-item">
                            <span class="calc-label">Exchange Margin:</span>
                            <span class="calc-value">${data.exchangeMargin}%</span>
                        </div>
                        <div class="calc-item">
                            <span class="calc-label">Container Type:</span>
                            <span class="calc-value">${data.containerType}</span>
                        </div>
                        <div class="calc-item">
                            <span class="calc-label">Exchange Rates:</span>
                            <span class="calc-value">CNY ${this.exchangeRates.CNY_TO_NZD}, USD ${this.exchangeRates.USD_TO_NZD}</span>
                        </div>
                        ${data.weeklyWarehouseCost > 0 ? `
                        <div class="calc-item warehouse-details">
                            <span class="calc-label">Warehouse Cost:</span>
                            <span class="calc-value">NZ$${data.weeklyWarehouseCost}/week × ${data.weeksToSellStock} weeks</span>
                        </div>
                        <div class="calc-subitem">
                            <span class="calc-sublabel">• First 30% period:</span>
                            <span class="calc-subvalue">Full cost (${(data.weeksToSellStock * 0.3).toFixed(1)} weeks)</span>
                        </div>
                        <div class="calc-subitem">
                            <span class="calc-sublabel">• Remaining 70%:</span>
                            <span class="calc-subvalue">60% avg cost (declining inventory)</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Hide placeholder
        const placeholder = resultsContent.querySelector('.placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }

    showError(message) {
        const resultsContent = document.getElementById('results-content');
        resultsContent.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
    }

    initializeMarginCalculatorListeners() {
        const marginInput = document.getElementById('marginPercentage');
        const sellingPriceInput = document.getElementById('sellingPrice');
        const profitDisplay = document.getElementById('profitPerUnit');
        const costDisplay = document.getElementById('totalCostPerUnit');
        
        console.log('Margin calculator listeners initialized - v2.0');
        
        // When margin percentage changes, calculate selling price
        marginInput.addEventListener('input', () => {
            console.log('Margin input changed:', marginInput.value);
            const marginPercentage = parseFloat(marginInput.value);
            let costPerUnit = parseFloat(costDisplay.textContent.replace('$', ''));
            
            // If no cost calculation has been done, allow user to enter a manual cost
            if (costPerUnit <= 0) {
                const manualCost = prompt('Please enter the cost per unit (NZD) to calculate pricing:');
                if (manualCost && !isNaN(parseFloat(manualCost))) {
                    costPerUnit = parseFloat(manualCost);
                    costDisplay.textContent = `$${costPerUnit.toFixed(2)}`;
                } else {
                    sellingPriceInput.value = '';
                    profitDisplay.textContent = '$0.00';
                    return;
                }
            }
            
            if (marginPercentage >= 0 && marginPercentage < 100 && costPerUnit > 0) {
                const result = this.calculatePriceFromMargin(marginPercentage, costPerUnit);
                if (result) {
                    sellingPriceInput.value = result.sellingPrice.toFixed(2);
                    profitDisplay.textContent = `$${result.profit.toFixed(2)}`;
                    
                    // Add visual feedback
                    this.updateMarginVisualFeedback(marginPercentage, result.profit, costPerUnit);
                }
            } else {
                if (marginPercentage >= 100) {
                    alert('Margin percentage must be less than 100%');
                }
                sellingPriceInput.value = '';
                profitDisplay.textContent = '$0.00';
            }
        });
        
        // When selling price changes, calculate margin percentage
        sellingPriceInput.addEventListener('input', () => {
            console.log('Selling price input changed:', sellingPriceInput.value);
            const sellingPrice = parseFloat(sellingPriceInput.value);
            let costPerUnit = parseFloat(costDisplay.textContent.replace('$', ''));
            
            // If no cost calculation has been done, allow user to enter a manual cost
            if (costPerUnit <= 0) {
                const manualCost = prompt('Please enter the cost per unit (NZD) to calculate margin:');
                if (manualCost && !isNaN(parseFloat(manualCost))) {
                    costPerUnit = parseFloat(manualCost);
                    costDisplay.textContent = `$${costPerUnit.toFixed(2)}`;
                } else {
                    marginInput.value = '';
                    profitDisplay.textContent = '$0.00';
                    return;
                }
            }
            
            if (sellingPrice > 0 && costPerUnit > 0) {
                const result = this.calculateMarginFromPrice(sellingPrice, costPerUnit);
                if (result) {
                    marginInput.value = result.marginPercentage.toFixed(2);
                    profitDisplay.textContent = `$${result.profit.toFixed(2)}`;
                    
                    // Add visual feedback
                    this.updateMarginVisualFeedback(result.marginPercentage, result.profit, costPerUnit);
                }
            } else {
                marginInput.value = '';
                profitDisplay.textContent = '$0.00';
            }
        });
    }
    
    updateMarginVisualFeedback(marginPercentage, profit, costPerUnit) {
        const profitDisplay = document.getElementById('profitPerUnit');
        
        // Remove existing classes
        profitDisplay.classList.remove('profit-low', 'profit-good', 'profit-excellent');
        
        // Add appropriate class based on margin percentage
        if (marginPercentage < 20) {
            profitDisplay.classList.add('profit-low');
        } else if (marginPercentage < 40) {
            profitDisplay.classList.add('profit-good');
        } else {
            profitDisplay.classList.add('profit-excellent');
        }
    }

    updateMarginCalculator(costPerUnit) {
        const costDisplay = document.getElementById('totalCostPerUnit');
        costDisplay.textContent = `$${costPerUnit.toFixed(2)}`;
        
        // Clear previous calculations
        document.getElementById('marginPercentage').value = '';
        document.getElementById('sellingPrice').value = '';
        document.getElementById('profitPerUnit').textContent = '$0.00';
        
        // Remove visual feedback classes
        document.getElementById('profitPerUnit').classList.remove('profit-low', 'profit-good', 'profit-excellent');
    }

    calculateMarginFromPrice(sellingPrice, costPerUnit) {
        if (sellingPrice <= 0 || costPerUnit <= 0) return null;
        
        const profit = sellingPrice - costPerUnit;
        const marginPercentage = (profit / sellingPrice) * 100;
        const markupPercentage = (profit / costPerUnit) * 100;
        
        return {
            profit,
            marginPercentage,
            markupPercentage
        };
    }

    calculatePriceFromMargin(marginPercentage, costPerUnit) {
        if (marginPercentage <= 0 || marginPercentage >= 100 || costPerUnit <= 0) return null;
        
        const sellingPrice = costPerUnit / (1 - marginPercentage / 100);
        const profit = sellingPrice - costPerUnit;
        const markupPercentage = (profit / costPerUnit) * 100;
        
        return {
            sellingPrice,
            profit,
            markupPercentage
        };
    }

    async saveCalculation(results) {
        const data = results.data;
        const calculation = {
            timestamp: this.currentCalculationId ? this.currentCalculationData.timestamp : new Date().toISOString(),
            lastModified: new Date().toISOString(),
            productName: data.productName,
            category: data.category,
            unitPrice: data.unitPrice,
            currency: data.currency,
            unitsPerContainer: data.unitsPerContainer,
            containerType: data.containerType,
            totalCostNZD: results.totalCostNZD,
            costPerUnitNZD: results.costPerUnitNZD,
            costPerUnitOriginal: results.costPerUnitOriginal,
            formData: data // Store all form data for loading
        };
        
        try {
            let docId;
            
            if (this.currentCalculationId) {
                // Update existing calculation
                await window.firebaseUtils.updateDoc(
                    window.firebaseUtils.doc(window.firebaseDB, 'exportCalculations', this.currentCalculationId),
                    calculation
                );
                docId = this.currentCalculationId;
                console.log('Calculation updated in Firebase with ID:', docId);
                alert('Calculation updated successfully!');
            } else {
                // Create new calculation
                const docRef = await window.firebaseUtils.addDoc(
                    window.firebaseUtils.collection(window.firebaseDB, 'exportCalculations'),
                    calculation
                );
                docId = docRef.id;
                this.currentCalculationId = docId;
                this.currentCalculationData = { ...calculation, id: docId };
                console.log('New calculation saved to Firebase with ID:', docId);
                alert('Calculation saved successfully!');
                this.updateCalculationStatus();
            }
            
            await this.updateCategoryFilter();
            return docId;
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            // Fallback to localStorage if Firebase fails
            let savedCalculations = JSON.parse(localStorage.getItem('exportCalculations') || '[]');
            
            if (this.currentCalculationId) {
                // Update existing in localStorage
                const index = savedCalculations.findIndex(calc => calc.id === this.currentCalculationId);
                if (index !== -1) {
                    savedCalculations[index] = { ...calculation, id: this.currentCalculationId };
                    localStorage.setItem('exportCalculations', JSON.stringify(savedCalculations));
                    alert('Calculation updated locally (Firebase unavailable)');
                }
            } else {
                // Create new in localStorage
                const localCalculation = {
                    id: Date.now().toString(),
                    ...calculation
                };
                
                savedCalculations.unshift(localCalculation);
                
                if (savedCalculations.length > 50) {
                    savedCalculations = savedCalculations.slice(0, 50);
                }
                
                localStorage.setItem('exportCalculations', JSON.stringify(savedCalculations));
                this.currentCalculationId = localCalculation.id;
                this.currentCalculationData = localCalculation;
                alert('Saved locally (Firebase unavailable)');
                this.updateCalculationStatus();
            }
            
            await this.updateCategoryFilter();
            return this.currentCalculationId;
        }
    }

    async loadSavedCalculations() {
        try {
            // Load from Firebase Firestore
            const q = window.firebaseUtils.query(
                window.firebaseUtils.collection(window.firebaseDB, 'exportCalculations'),
                window.firebaseUtils.orderBy('timestamp', 'desc'),
                window.firebaseUtils.limit(50)
            );
            
            const querySnapshot = await window.firebaseUtils.getDocs(q);
            const savedCalculations = [];
            
            querySnapshot.forEach((doc) => {
                savedCalculations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return savedCalculations;
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('exportCalculations') || '[]');
        }
    }

    async deleteCalculation(id) {
        try {
            // Delete from Firebase Firestore
            await window.firebaseUtils.deleteDoc(
                window.firebaseUtils.doc(window.firebaseDB, 'exportCalculations', id)
            );
            
            console.log('Calculation deleted from Firebase:', id);
            await this.displaySavedCalculations();
            await this.updateCategoryFilter();
        } catch (error) {
            console.error('Error deleting from Firebase:', error);
            // Fallback to localStorage
            let savedCalculations = JSON.parse(localStorage.getItem('exportCalculations') || '[]');
            savedCalculations = savedCalculations.filter(calc => calc.id !== id);
            localStorage.setItem('exportCalculations', JSON.stringify(savedCalculations));
            await this.displaySavedCalculations();
            await this.updateCategoryFilter();
            alert('Deleted locally (Firebase unavailable)');
        }
    }

    async loadCalculation(id) {
        const savedCalculations = await this.loadSavedCalculations();
        const calculation = savedCalculations.find(calc => calc.id === id);
        
        if (!calculation) return;
        
        // Set current calculation tracking
        this.currentCalculationId = id;
        this.currentCalculationData = calculation;
        this.updateCalculationStatus();
        
        const data = calculation.formData;
        
        // Load all form fields
        document.getElementById('productName').value = data.productName || '';
        document.getElementById('productCategory').value = data.category || '';
        document.getElementById('unitPrice').value = data.unitPrice || '';
        document.getElementById('unitCurrency').value = data.currency || 'CNY';
        document.getElementById('unitsPerContainer').value = data.unitsPerContainer || '';
        document.getElementById('containerType').value = data.containerType || '20ft';
        
        document.getElementById('shippingCost').value = data.shippingCost || '';
        document.getElementById('shippingCurrency').value = data.shippingCurrency || 'USD';
        document.getElementById('localTransport').value = data.localTransport || '';
        document.getElementById('nzTransport').value = data.nzTransport || '';
        
        document.getElementById('dutyRate').value = data.dutyRate || '';
        document.getElementById('gstRate').value = data.gstRate || 15;
        document.getElementById('customsBrokerage').value = data.customsBrokerage || '';
        document.getElementById('documentationFees').value = data.documentFees || '';
        
        document.getElementById('weeklyWarehouseCost').value = data.weeklyWarehouseCost || '';
        document.getElementById('weeksToSell').value = data.weeksToSellStock || '';
        
        document.getElementById('insuranceRate').value = data.insuranceRate || '';
        document.getElementById('bankFees').value = data.bankFees || '';
        document.getElementById('inspectionFees').value = data.inspectionFees || '';
        document.getElementById('otherFees').value = data.otherFees || '';
        
        document.getElementById('exchangeMargin').value = data.exchangeMargin || '';
        
        // Update exchange rates if they were saved
        if (data.cnyToNzd) document.getElementById('cnyToNzd').value = data.cnyToNzd;
        if (data.usdToNzd) document.getElementById('usdToNzd').value = data.usdToNzd;
        
        // Update container info
        this.updateContainerInfo();
        
        // Hide saved calculations panel
        document.getElementById('savedCalculationsCard').style.display = 'none';
        
        // Recalculate
        this.calculateCosts();
        
        // Show success message
        alert(`Loaded calculation: ${calculation.productName}`);
    }

    async updateCategoryFilter() {
        const savedCalculations = await this.loadSavedCalculations();
        const categories = [...new Set(savedCalculations.map(calc => calc.category))].sort();
        
        const filterSelect = document.getElementById('categoryFilter');
        const currentValue = filterSelect.value;
        
        // Clear existing options except "All Categories"
        filterSelect.innerHTML = '<option value="">All Categories</option>';
        
        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterSelect.appendChild(option);
        });
        
        // Restore previous selection if it still exists
        if (categories.includes(currentValue)) {
            filterSelect.value = currentValue;
        }
    }

    async displaySavedCalculations(filterCategory = '') {
        const savedCalculations = await this.loadSavedCalculations();
        const filteredCalculations = filterCategory 
            ? savedCalculations.filter(calc => calc.category === filterCategory)
            : savedCalculations;
        
        const listContainer = document.getElementById('calculationsList');
        const savedCountElement = document.getElementById('savedCount');
        
        // Update saved count badge
        if (savedCountElement) {
            savedCountElement.textContent = savedCalculations.length;
        }
        
        if (filteredCalculations.length === 0) {
            listContainer.innerHTML = `
                <div class="modern-placeholder">
                    <div class="placeholder-icon floating-icon">
                        <i class="fas fa-${filterCategory ? 'search' : 'info-circle'}"></i>
                        <div class="icon-glow"></div>
                        <div class="icon-particles"></div>
                    </div>
                    <p class="placeholder-text kinetic-text">
                        ${filterCategory ? `No calculations found for category "${filterCategory}"` : 'No saved calculations found'}
                    </p>
                    <div class="placeholder-glow"></div>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = filteredCalculations.map(calc => {
            const date = new Date(calc.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const time = new Date(calc.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="calc-card">
                    <div class="calc-header">
                        <div class="calc-info">
                            <h4 class="calc-title">${calc.productName}</h4>
                            <div class="calc-meta">
                                <span class="calc-category">${calc.category}</span>
                                <span class="calc-date">${date} ${time}</span>
                            </div>
                        </div>
                        <div class="calc-cost">$${calc.totalCostNZD.toFixed(2)}</div>
                    </div>
                    
                    <div class="calc-details">
                        <div class="calc-stat">
                            <span class="stat-label">Per Unit</span>
                            <span class="stat-value">$${calc.costPerUnitNZD.toFixed(2)}</span>
                        </div>
                        <div class="calc-stat">
                            <span class="stat-label">Units</span>
                            <span class="stat-value">${calc.unitsPerContainer}</span>
                        </div>
                        <div class="calc-stat">
                            <span class="stat-label">Price</span>
                            <span class="stat-value">${calc.currency} ${calc.unitPrice}</span>
                        </div>
                        <div class="calc-stat">
                            <span class="stat-label">Container</span>
                            <span class="stat-value">${calc.containerType}</span>
                        </div>
                    </div>
                    
                    <div class="calc-actions">
                        <button class="btn-load" onclick="(async () => { await calculator.loadCalculation('${calc.id}'); document.getElementById('savedCalculationsCard').style.display = 'none'; })();">
                            <i class="fas fa-upload"></i>
                            Load
                        </button>
                        <button class="btn-delete" onclick="(async () => { await calculator.deleteCalculation('${calc.id}'); })();">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearForm() {
        // Clear all form inputs
        document.getElementById('productName').value = '';
        document.getElementById('productCategory').value = '';
        document.getElementById('unitPrice').value = '';
        document.getElementById('unitsPerContainer').value = '';
        
        // Reset shipping costs
        document.getElementById('shippingCost').value = '';
        document.getElementById('localTransport').value = '';
        document.getElementById('nzTransport').value = '';
        
        // Reset customs and duties
        document.getElementById('dutyRate').value = '';
        document.getElementById('gstRate').value = '15';
        document.getElementById('customsBrokerage').value = '';
        document.getElementById('documentationFees').value = '';
        
        // Reset warehouse costs
        document.getElementById('weeklyWarehouseCost').value = '';
        document.getElementById('weeksToSell').value = '';
        
        // Reset insurance and other costs
        document.getElementById('insuranceRate').value = '';
        document.getElementById('bankFees').value = '';
        document.getElementById('inspectionFees').value = '';
        document.getElementById('otherFees').value = '';
        
        // Reset exchange margin
        document.getElementById('exchangeMargin').value = '';
        
        // Reset incoterms to default
        document.querySelector('input[name="incoterms"][value="FOB"]').checked = true;
        
        // Clear results
        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
            resultsContent.innerHTML = '<div class="placeholder">Calculate costs to see results here</div>';
        }
        
        // Clear margin calculator
        document.getElementById('totalCostPerUnit').textContent = '$0.00';
        document.getElementById('marginPercentage').value = '';
        document.getElementById('sellingPrice').value = '';
        document.getElementById('profitPerUnit').textContent = '$0.00';
        
        // Remove visual feedback classes
        document.getElementById('profitPerUnit').classList.remove('profit-low', 'profit-good', 'profit-excellent');
        
        // Clear last calculation results
        this.lastCalculationResults = null;
        
        // Reset calculation tracking
        this.currentCalculationId = null;
        this.currentCalculationData = null;
        this.updateCalculationStatus();
        
        console.log('Form cleared successfully');
    }

    updateCalculationStatus() {
        const statusElement = document.getElementById('statusText');
        const statusIcon = document.querySelector('.status-indicator i');
        const saveBtnText = document.getElementById('saveBtnText');
        const saveAsNewBtn = document.getElementById('saveAsNewBtn');
        
        if (this.currentCalculationId && this.currentCalculationData) {
            // Editing mode
            statusElement.textContent = `Editing: ${this.currentCalculationData.productName}`;
            statusIcon.className = 'fas fa-edit';
            saveBtnText.textContent = 'Update';
            saveAsNewBtn.style.display = 'inline-flex';
        } else {
            // New calculation mode
            statusElement.textContent = 'New Calculation';
            statusIcon.className = 'fas fa-plus-circle';
            saveBtnText.textContent = 'Save';
            saveAsNewBtn.style.display = 'none';
        }
    }

    async saveAsNew(results) {
        // Temporarily clear current calculation tracking
        const tempId = this.currentCalculationId;
        const tempData = this.currentCalculationData;
        
        this.currentCalculationId = null;
        this.currentCalculationData = null;
        
        // Save as new calculation
        const newId = await this.saveCalculation(results);
        
        // Update status to show we're now editing the new calculation
        this.updateCalculationStatus();
        
        return newId;
    }

    exportData() {
        if (!this.lastCalculationResults) {
            alert('Please calculate costs first before exporting.');
            return;
        }
        
        const { data, totalCosts, totalCostNZD, costPerUnitNZD, costPerUnitOriginal } = this.lastCalculationResults;
        
        // Create export data object
        const exportData = {
            productInfo: {
                name: data.productName,
                category: data.category,
                unitPrice: data.unitPrice,
                currency: data.currency,
                unitsPerContainer: data.unitsPerContainer,
                containerType: data.containerType
            },
            costs: {
                productCost: totalCosts.productCost,
                shippingCost: totalCosts.shippingCost,
                localTransport: totalCosts.localTransport,
                nzTransport: totalCosts.nzTransport,
                duty: totalCosts.duty,
                gst: totalCosts.gst,
                insurance: totalCosts.insurance,
                warehouseCost: totalCosts.warehouseCost,
                customsBrokerage: totalCosts.customsBrokerage,
                documentFees: totalCosts.documentFees,
                bankFees: totalCosts.bankFees,
                inspectionFees: totalCosts.inspectionFees,
                otherFees: totalCosts.otherFees
            },
            summary: {
                totalCostNZD: totalCostNZD,
                costPerUnitNZD: costPerUnitNZD,
                costPerUnitOriginal: costPerUnitOriginal,
                incoterms: data.incoterms
            },
            exchangeRates: {
                cnyToNzd: this.exchangeRates.CNY_TO_NZD,
                usdToNzd: this.exchangeRates.USD_TO_NZD
            },
            exportDate: new Date().toISOString(),
            calculatorVersion: '1.0'
        };
        
        // Create and download JSON file
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `export-cost-calculation-${data.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Data exported successfully');
    }
}

// Global functions for saved calculations (defined before calculator initialization)
function showSavedCalculations() {
    console.log('showSavedCalculations called');
    const card = document.getElementById('savedCalculationsCard');
    
    if (!card) {
        console.error('savedCalculationsCard element not found');
        return;
    }
    
    const isVisible = card.style.display !== 'none';
    
    if (isVisible) {
        card.style.display = 'none';
        card.classList.remove('show');
    } else {
        // Ensure calculator is initialized before using it
        if (typeof calculator !== 'undefined') {
            try {
                (async () => {
                    await calculator.updateCategoryFilter();
                    await calculator.displaySavedCalculations();
                    card.style.display = 'block';
                    card.classList.add('show');
                    
                    // Smooth scroll with delay to ensure element is visible
                    setTimeout(() => {
                        card.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                    }, 100);
                })();
            } catch (error) {
                console.error('Error showing saved calculations:', error);
            }
        } else {
            console.error('Calculator not initialized');
        }
    }
}

function filterCalculations() {
    console.log('filterCalculations called');
    // Ensure calculator is initialized before using it
    if (typeof calculator !== 'undefined') {
        try {
            const filterCategory = document.getElementById('categoryFilter').value;
            (async () => {
                await calculator.displaySavedCalculations(filterCategory);
            })();
        } catch (error) {
            console.error('Error filtering calculations:', error);
        }
    } else {
        console.error('Calculator not initialized for filtering');
    }
}

// Initialize the calculator
const calculator = new ExportCostCalculator();

// Global functions for margin calculator
function calculateFromMargin() {
    const costPerUnit = parseFloat(document.getElementById('totalCostPerUnit').value) || 0;
    const marginPercentage = parseFloat(document.getElementById('marginPercentage').value) || 0;
    
    if (costPerUnit > 0 && marginPercentage >= 0 && marginPercentage < 100) {
        const result = calculator.calculatePriceFromMargin(marginPercentage, costPerUnit);
        if (result) {
            document.getElementById('sellingPrice').value = result.sellingPrice.toFixed(2);
            document.getElementById('profitPerUnit').value = result.profit.toFixed(2);
            // document.getElementById('markupPercentage').textContent = `${result.markupPercentage.toFixed(1)}%`;
        }
    }
}

function calculateFromPrice() {
    const costPerUnit = parseFloat(document.getElementById('totalCostPerUnit').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
    
    if (costPerUnit > 0 && sellingPrice > 0) {
        const result = calculator.calculateMarginFromPrice(sellingPrice, costPerUnit);
        if (result) {
            document.getElementById('marginPercentage').value = result.marginPercentage.toFixed(1);
            document.getElementById('profitPerUnit').value = result.profit.toFixed(2);
            // document.getElementById('markupPercentage').textContent = `${result.markupPercentage.toFixed(1)}%`;
        }
    }
}

function calculateCosts() {
    calculator.calculateCosts();
}

// Global functions for save/load functionality
async function saveCalculation() {
    if (!calculator.lastCalculationResults) {
        alert('Please calculate costs first before saving.');
        return;
    }
    
    const productName = calculator.lastCalculationResults.data.productName;
    const category = calculator.lastCalculationResults.data.category;
    
    if (!productName || productName === 'Unnamed Product') {
        alert('Please enter a product name before saving.');
        return;
    }
    
    try {
        const calculationId = await calculator.saveCalculation(calculator.lastCalculationResults);
    } catch (error) {
        console.error('Error saving calculation:', error);
        alert('Error saving calculation. Please try again.');
    }
}

// Auto-fetch exchange rates on page load (optional enhancement)
document.addEventListener('DOMContentLoaded', function() {
    // Set up action button event listeners
    const calculateBtn = document.getElementById('calculateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const saveAsNewBtn = document.getElementById('saveAsNewBtn');
    const loadBtn = document.getElementById('loadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            calculator.calculateCosts();
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveCalculation();
        });
    }
    
    if (saveAsNewBtn) {
        saveAsNewBtn.addEventListener('click', async () => {
            if (!calculator.lastCalculationResults) {
                alert('Please calculate costs first before saving.');
                return;
            }
            
            const productName = calculator.lastCalculationResults.data.productName;
            const category = calculator.lastCalculationResults.data.category;
            
            if (!productName || productName === 'Unnamed Product') {
                alert('Please enter a product name before saving.');
                return;
            }
            
            try {
                const calculationId = await calculator.saveAsNew(calculator.lastCalculationResults);
                alert(`New calculation saved successfully for "${productName}" in category "${category}"!`);
            } catch (error) {
                console.error('Error saving new calculation:', error);
                alert('Error saving new calculation. Please try again.');
            }
        });
    }
    
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            showSavedCalculations();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            calculator.clearForm();
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            calculator.exportData();
        });
    }
    
    console.log('Export Cost Estimator loaded successfully');
    initializeFooterFeatures();
});

// Footer Features Initialization
function initializeFooterFeatures() {
    initializeScrollProgress();
    initializeBackToTop();
    initializeFooterAnimations();
}

// Scroll Progress Bar
function initializeScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    if (!scrollProgress) return;
    
    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        
        scrollProgress.style.width = `${Math.min(scrollPercentage, 100)}%`;
    }
    
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial call
}

// Back to Top Button
function initializeBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top-btn');
    if (!backToTopBtn) return;
    
    function toggleBackToTopVisibility() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    window.addEventListener('scroll', toggleBackToTopVisibility);
    backToTopBtn.addEventListener('click', scrollToTop);
    
    toggleBackToTopVisibility(); // Initial call
}

// Footer Animations and Effects
function initializeFooterAnimations() {
    // Animate footer stats on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !stat.classList.contains('animated')) {
                stat.classList.add('animated');
                const finalValue = parseInt(stat.textContent);
                animateCounter(stat, 0, finalValue, 2000);
            }
        });
    }
    
    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = end.toLocaleString();
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Intersection Observer for footer animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe footer sections
    const footerSections = document.querySelectorAll('.footer-section');
    footerSections.forEach(section => {
        observer.observe(section);
    });
    
    // Initial stats animation check
    window.addEventListener('scroll', animateStats);
    animateStats(); // Initial call
}

// Enhanced scroll indicator
function updateScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    
    if (scrollPercentage > 95) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
}

// Add scroll listener for enhanced features
window.addEventListener('scroll', () => {
    updateScrollIndicator();
});

// Initialize the calculator when DOM is loaded
console.log('DEBUG: About to initialize ExportCostCalculator');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOM loaded, creating ExportCostCalculator instance');
    const calculator = new ExportCostCalculator();
    console.log('DEBUG: ExportCostCalculator instance created successfully');
    console.log('Export Cost Estimator loaded successfully');
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    console.log('DEBUG: Document still loading, waiting for DOMContentLoaded');
} else {
    console.log('DEBUG: Document already loaded, initializing immediately');
    const calculator = new ExportCostCalculator();
    console.log('Export Cost Estimator loaded successfully');
}