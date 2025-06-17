# Export Cost Estimator - China to New Zealand

A comprehensive web-based cost calculator for exporters sourcing products from China and selling in New Zealand. This tool helps you understand your true per-unit cost by accounting for all components of the export process.

## Features

### 🎯 **Complete Cost Analysis**
- Product costs in CNY or USD with automatic NZD conversion
- Shipping costs for 20ft, 40ft, and 40ft High Cube containers
- Customs duties and GST calculations
- Insurance, brokerage, and handling fees
- Currency exchange with configurable margins

### 💱 **Multi-Currency Support**
- Source currencies: Chinese Yuan (CNY) and US Dollar (USD)
- Target currency: New Zealand Dollar (NZD)
- Real-time exchange rate input with margin calculations
- Displays costs in both original and converted currencies

### 📦 **Container Specifications**
- **20ft Container**: 28-33 CBM capacity, 28,000 kg max weight
- **40ft Container**: 56-67 CBM capacity, 26,500 kg max weight
- **40ft High Cube**: 68-76 CBM capacity, 26,500 kg max weight

### 🧮 **Comprehensive Cost Components**

#### Product Costs
- Unit price in CNY or USD
- Automatic currency conversion to NZD
- Exchange rate margin application

#### Shipping & Logistics
- Container shipping costs
- Local transport in China
- New Zealand transport and delivery
- Port handling fees

#### Customs & Duties
- Customs duty calculation (percentage-based)
- GST calculation (default 15% for NZ)
- Customs brokerage fees
- Documentation and processing fees

#### Insurance & Other Costs
- Marine insurance (percentage of CIF value)
- Bank transfer fees
- Inspection fees
- Miscellaneous costs

## How to Use

### 1. **Product Information**
- Enter your product name
- Input unit price and select currency (CNY/USD)
- Specify units per container
- Choose container type

### 2. **Shipping & Logistics**
- Enter container shipping cost
- Add local transport costs in China
- Include NZ transport and delivery costs

### 3. **Customs & Duties**
- Set duty rate percentage (varies by product classification)
- Confirm GST rate (15% standard for NZ)
- Add customs brokerage and documentation fees

### 4. **Insurance & Other Costs**
- Set insurance rate (typically 0.3-0.5% of CIF value)
- Include bank fees and other miscellaneous costs

### 5. **Exchange Rates**
- Update current CNY to NZD rate
- Update current USD to NZD rate
- Set exchange margin for risk management (typically 1-3%)

### 6. **Calculate**
- Click "Calculate Total Cost" to see detailed breakdown
- Review per-unit cost in both NZD and original currency

## Cost Calculation Method

### CIF Value Calculation
```
CIF = Product Cost + Shipping + Local Transport (China)
```

### Duty Calculation
```
Duty = CIF Value × Duty Rate (%)
```

### GST Calculation
```
GST = (CIF Value + Duty) × GST Rate (%)
```

### Insurance Calculation
```
Insurance = CIF Value × Insurance Rate (%)
```

### Total Cost
```
Total = Product Cost + Shipping + Transport + Duty + GST + Insurance + All Fees
```

### Per Unit Cost
```
Per Unit Cost = Total Cost ÷ Units per Container
```

## Key Benefits

✅ **Accurate Costing**: Includes all hidden costs often overlooked

✅ **Currency Risk Management**: Built-in exchange rate margins

✅ **Container Optimization**: Compare costs across different container types

✅ **Compliance Ready**: Proper duty and GST calculations for NZ customs

✅ **Professional Interface**: Modern, responsive design based on 2024 UI trends

✅ **Real-time Calculations**: Instant updates as you modify inputs

## Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean interface with gradient backgrounds and smooth animations
- **Input Validation**: Prevents calculation errors with proper validation
- **Detailed Breakdown**: Comprehensive cost analysis with explanations
- **Container Specifications**: Built-in container capacity and weight limits

## Getting Started

1. Open `index.html` in your web browser
2. Fill in your product and shipping details
3. Update exchange rates to current market rates
4. Click calculate to see your true per-unit cost

## Example Calculation

**Product**: Electronics Components
- Unit Price: ¥50 CNY
- Units per Container: 2,000
- Container: 40ft
- CNY to NZD Rate: 0.2250

**Result**: Complete breakdown showing total container cost and per-unit cost in both CNY and NZD

## Notes

- Exchange rates should be updated regularly for accuracy
- Duty rates vary by product classification (check NZ Customs)
- Insurance rates typically range from 0.3% to 0.5% of CIF value
- Consider adding 1-3% exchange margin for currency fluctuation protection

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

---

**Built for exporters who need accurate, comprehensive cost analysis for China to New Zealand trade.**