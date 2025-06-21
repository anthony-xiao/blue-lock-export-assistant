// Script to add historical calculation records to Firebase Firestore
// Run this in the browser console on your application page

const historicalRecords = [
    {
        "id": "1750183657792",
        "timestamp": "2025-06-17T18:07:37.792Z",
        "productName": "Yunnan YNH-W-C5-001",
        "category": "Coffee Green Beans",
        "unitPrice": 61,
        "currency": "CNY",
        "unitsPerContainer": 19200,
        "containerType": "20ft",
        "totalCostNZD": 274135.48,
        "costPerUnitNZD": 14.277889583333332,
        "costPerUnitOriginal": 63.45728703703703,
        "formData": {
            "productName": "Yunnan YNH-W-C5-001",
            "category": "Coffee Green Beans",
            "unitPrice": 61,
            "currency": "CNY",
            "unitsPerContainer": 19200,
            "containerType": "20ft",
            "shippingCost": 2400,
            "shippingCurrency": "USD",
            "localTransport": 0,
            "nzTransport": 3500,
            "dutyRate": 0.1,
            "gstRate": 15,
            "gstRegistered": true,
            "customsBrokerage": 0,
            "documentFees": 0,
            "weeklyWarehouseCost": 150,
            "weeksToSellStock": 6,
            "insuranceRate": 0,
            "bankFees": 0,
            "inspectionFees": 0,
            "otherFees": 2240,
            "exchangeMargin": 0,
            "incoterms": "FOB"
        }
    },
    {
        "id": "1750183641831",
        "timestamp": "2025-06-17T18:07:21.831Z",
        "productName": "Yunnan YNH-W-C4-001",
        "category": "Coffee Green Beans",
        "unitPrice": 63,
        "currency": "CNY",
        "unitsPerContainer": 19200,
        "containerType": "20ft",
        "totalCostNZD": 282784.12,
        "costPerUnitNZD": 14.728339583333334,
        "costPerUnitOriginal": 65.45928703703704,
        "formData": {
            "productName": "Yunnan YNH-W-C4-001",
            "category": "Coffee Green Beans",
            "unitPrice": 63,
            "currency": "CNY",
            "unitsPerContainer": 19200,
            "containerType": "20ft",
            "shippingCost": 2400,
            "shippingCurrency": "USD",
            "localTransport": 0,
            "nzTransport": 3500,
            "dutyRate": 0.1,
            "gstRate": 15,
            "gstRegistered": true,
            "customsBrokerage": 0,
            "documentFees": 0,
            "weeklyWarehouseCost": 150,
            "weeksToSellStock": 6,
            "insuranceRate": 0,
            "bankFees": 0,
            "inspectionFees": 0,
            "otherFees": 2240,
            "exchangeMargin": 0,
            "incoterms": "FOB"
        }
    },
    {
        "id": "1750183618961",
        "timestamp": "2025-06-17T18:06:58.961Z",
        "productName": "Yunnan YNH-W-C3-001",
        "category": "Coffee Green Beans",
        "unitPrice": 61,
        "currency": "CNY",
        "unitsPerContainer": 19200,
        "containerType": "20ft",
        "totalCostNZD": 274135.48,
        "costPerUnitNZD": 14.277889583333332,
        "costPerUnitOriginal": 63.45728703703703,
        "formData": {
            "productName": "Yunnan YNH-W-C3-001",
            "category": "Coffee Green Beans",
            "unitPrice": 61,
            "currency": "CNY",
            "unitsPerContainer": 19200,
            "containerType": "20ft",
            "shippingCost": 2400,
            "shippingCurrency": "USD",
            "localTransport": 0,
            "nzTransport": 3500,
            "dutyRate": 0.1,
            "gstRate": 15,
            "gstRegistered": true,
            "customsBrokerage": 0,
            "documentFees": 0,
            "weeklyWarehouseCost": 150,
            "weeksToSellStock": 6,
            "insuranceRate": 0,
            "bankFees": 0,
            "inspectionFees": 0,
            "otherFees": 2240,
            "exchangeMargin": 0,
            "incoterms": "FOB"
        }
    },
    {
        "id": "1750183548511",
        "timestamp": "2025-06-17T18:05:48.511Z",
        "productName": "Yunnan YNH-W-C2-001",
        "category": "Coffee Green Beans",
        "unitPrice": 60,
        "currency": "CNY",
        "unitsPerContainer": 19200,
        "containerType": "20ft",
        "totalCostNZD": 269811.16,
        "costPerUnitNZD": 14.052664583333332,
        "costPerUnitOriginal": 62.45628703703703,
        "formData": {
            "productName": "Yunnan YNH-W-C2-001",
            "category": "Coffee Green Beans",
            "unitPrice": 60,
            "currency": "CNY",
            "unitsPerContainer": 19200,
            "containerType": "20ft",
            "shippingCost": 2400,
            "shippingCurrency": "USD",
            "localTransport": 0,
            "nzTransport": 3500,
            "dutyRate": 0.1,
            "gstRate": 15,
            "gstRegistered": true,
            "customsBrokerage": 0,
            "documentFees": 0,
            "weeklyWarehouseCost": 150,
            "weeksToSellStock": 6,
            "insuranceRate": 0,
            "bankFees": 0,
            "inspectionFees": 0,
            "otherFees": 2240,
            "exchangeMargin": 0,
            "incoterms": "FOB"
        }
    }
];

// Function to upload historical records to Firebase
async function uploadHistoricalRecords() {
    if (!window.db) {
        console.error('Firebase not initialized. Please make sure you are running this on the application page.');
        return;
    }

    console.log('Starting upload of historical records...');
    
    try {
        const batch = firebase.firestore().batch();
        
        for (const record of historicalRecords) {
            // Convert timestamp string to Firestore Timestamp
            const timestampDate = new Date(record.timestamp);
            const firestoreTimestamp = firebase.firestore.Timestamp.fromDate(timestampDate);
            
            // Prepare the record for Firestore
            const firestoreRecord = {
                ...record,
                timestamp: firestoreTimestamp
            };
            
            // Add to batch with the existing ID
            const docRef = window.db.collection('calculations').doc(record.id);
            batch.set(docRef, firestoreRecord);
            
            console.log(`Added ${record.productName} to batch`);
        }
        
        // Commit the batch
        await batch.commit();
        console.log('Successfully uploaded all historical records to Firebase!');
        
        // Refresh the saved calculations display if the calculator exists
        if (window.calculator && typeof window.calculator.displaySavedCalculations === 'function') {
            await window.calculator.displaySavedCalculations();
            console.log('Refreshed saved calculations display');
        }
        
    } catch (error) {
        console.error('Error uploading historical records:', error);
    }
}

// Function to check if records already exist
async function checkExistingRecords() {
    if (!window.db) {
        console.error('Firebase not initialized.');
        return;
    }
    
    try {
        const snapshot = await window.db.collection('calculations').get();
        console.log(`Found ${snapshot.size} existing records in Firebase`);
        
        const existingIds = [];
        snapshot.forEach(doc => {
            existingIds.push(doc.id);
        });
        
        const recordsToUpload = historicalRecords.filter(record => !existingIds.includes(record.id));
        console.log(`${recordsToUpload.length} new records to upload`);
        
        return recordsToUpload;
    } catch (error) {
        console.error('Error checking existing records:', error);
        return historicalRecords;
    }
}

// Main execution function
async function addHistoricalData() {
    console.log('=== Adding Historical Data to Firebase ===');
    
    // Check what records already exist
    const recordsToUpload = await checkExistingRecords();
    
    if (recordsToUpload.length === 0) {
        console.log('All historical records already exist in Firebase!');
        return;
    }
    
    // Upload only new records
    await uploadHistoricalRecords();
}

// Auto-execute when script is loaded
if (typeof window !== 'undefined' && window.db) {
    addHistoricalData();
} else {
    console.log('To run this script:');
    console.log('1. Open your application in the browser');
    console.log('2. Open browser developer console (F12)');
    console.log('3. Copy and paste this entire script');
    console.log('4. Press Enter to execute');
}

// Export functions for manual use
window.addHistoricalData = addHistoricalData;
window.uploadHistoricalRecords = uploadHistoricalRecords;
window.checkExistingRecords = checkExistingRecords;